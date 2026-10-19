/**
 * The inference providers a wiki pass can run on.
 *
 * A provider is a small, named bundle of everything a pass needs to exist on it: the
 * value fx selects it by, the environment variable its key is read from, the
 * OpenAI-compatible base URL, the model a pass uses when none is pinned, and whether a
 * pass is billed at all.
 *
 * Two are supported, and the difference that matters is how a run is bounded:
 *
 * - `gateway` (the Vercel AI Gateway) bills tokens at the provider's list price against
 *   the team's credits, so a run has to ask what is left before it starts and divide that
 *   between the venues still to run. `tools/discord/budget.ts` is that arithmetic.
 * - `gemini` (Google's free tier, through the OpenAI-compatible endpoint) is not billed,
 *   so there is no balance to read and nothing to divide: a run is bounded by the
 *   provider's own rate limit, which fx retries through and the connector reports when it
 *   gives up.
 *
 * The Gemini path is reached through `tools/discord/gemini_proxy.ts`, a local shim: the
 * endpoint is OpenAI-compatible but not consistently so (streamed tool calls arrive
 * without an `index`, `arguments` arrives as a JSON string, and a usage total counts
 * thinking tokens the other fields exclude), and fx, being a pinned binary, cannot be
 * taught to tolerate that. The shim repairs the four defects in flight. That is why
 * `baseUrl` for this provider is a loopback address rather than Google's: a pass on
 * `gemini` requires the shim to be listening.
 */

/** The providers a pass can run on. */
export type ProviderName = "gateway" | "gemini";

export interface ProviderSpec {
  name: ProviderName;
  /**
   * Which SDK client the one-shot (`api`) editor builds for this provider.
   *
   * `gateway` uses `@ai-sdk/gateway`, `openai-compatible` uses
   * `@ai-sdk/openai-compatible` against `baseUrl`. The `fx` editor ignores this: fx is
   * pointed at the provider by `fxProvider` and reads `baseUrl` and the key variable from
   * its own `~/.fx/settings.json`.
   */
  protocol: "gateway" | "openai-compatible";
  /** The provider id fx selects, through `FX_PROVIDER` and settings `provider`. */
  fxProvider: string;
  /** The environment variable this provider's key is read from, by default. */
  keyEnv: string;
  /** The OpenAI-compatible base URL a client talks to. */
  baseUrl: string;
  /** The model a pass runs when `--model` names none. */
  defaultModel: string;
  /**
   * The models a pass may move on to, in order, when the one it started on cannot answer.
   * Empty for a provider with nowhere to go: Gemini's free tier is one model family behind
   * one rate limit, so a fallback there would only restate the limit.
   */
  fallbacks: string[];
  /** Whether a pass is billed, so the Gateway credit probe and its share apply. */
  metered: boolean;
}

/**
 * The default model on the Gateway is free, and it is free deliberately: a pass spends
 * about a million input tokens, so a model with a price would make the daily run a
 * monthly bill.
 *
 * Which free model is not a matter of taste. Measured 2026-10-19 against this repo's own
 * prompt, capture, and schema, `nvidia/nemotron-3.5-lightning-free` was the worst of the
 * three reachable free models: it returned content that used `page` where the schema
 * requires `path`, mangled a page's frontmatter into `---@type schema:TechArticle`, and
 * twice spent the whole 32,000-token budget on reasoning and returned nothing. That is
 * the 2026-10-18 no-op pass on record, where a nemotron fold spent 174,449 input tokens,
 * wrote no page, and still reported `OK`. `minimax/minimax-m3.1-flash` answered in 87
 * seconds with valid JSON, frontmatter copied verbatim, claims attributed to handles, and
 * no fence text, so it is the default. Price plus a live call is the only trustworthy
 * test here: the catalogue's `free` tag is not one, because three zero-priced models
 * return 403 on this account and one priced zero with the tag returns 503 when streamed.
 */
export const GATEWAY_DEFAULT_MODEL = "minimax/minimax-m3.1-flash";

/**
 * The free models a Gateway pass falls back to, in order, when the one it started on is
 * rate-limited or withdrawn.
 *
 * A free model is what makes this automation affordable, and a free model is also what
 * makes it fragile: the tier is bounded by rate rather than by credits, and a launch price
 * of zero can end without notice. `stealth/cat-jam` is here because it was measured clean
 * on the same pass and five times faster than the default, which is what a fallback wants.
 * `nvidia/nemotron-3.5-lightning-free` is deliberately absent: it is reachable and it is
 * free, but a fallback that cannot honour the schema turns a rate limit into a failed pass,
 * which is worse than reporting the rate limit.
 */
export const GATEWAY_FALLBACK_MODELS = ["stealth/cat-jam"];

/**
 * The default model on Gemini is a flash model: the pass is long, tool-driven, and read
 * mostly from disk, so the cheap tier is the right one to spend on it.
 */
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";

export const DEFAULT_SHIM_PORT = 8787;

export const PROVIDERS: Record<ProviderName, ProviderSpec> = {
  gateway: {
    name: "gateway",
    protocol: "gateway",
    fxProvider: "gateway",
    keyEnv: "AI_GATEWAY_API_KEY",
    baseUrl: "https://ai-gateway.vercel.sh/v1",
    defaultModel: GATEWAY_DEFAULT_MODEL,
    fallbacks: GATEWAY_FALLBACK_MODELS,
    metered: true,
  },
  gemini: {
    name: "gemini",
    protocol: "openai-compatible",
    fxProvider: "gemini",
    keyEnv: "GEMINI_API_KEY",
    baseUrl: `http://127.0.0.1:${DEFAULT_SHIM_PORT}/v1`,
    defaultModel: GEMINI_DEFAULT_MODEL,
    fallbacks: [],
    metered: false,
  },
};

export const PROVIDER_NAMES: ProviderName[] = ["gateway", "gemini"];

/**
 * Read a provider name from a flag, refusing anything else by name.
 *
 * A run that silently fell back to the default here would spend the wrong balance
 * without saying so, which is the failure this exists to prevent.
 */
export function parseProviderName(value: string): ProviderName {
  const name = value.trim() as ProviderName;
  if (!PROVIDER_NAMES.includes(name)) {
    throw new Error(
      `--provider must be one of ${PROVIDER_NAMES.join(", ")}, not '${value}'`,
    );
  }
  return name;
}

/** The spec for a provider name, or the default when the name is `undefined`. */
export function resolveProvider(name: ProviderName | undefined): ProviderSpec {
  return PROVIDERS[name ?? "gateway"];
}

/**
 * Find this provider's key in the environment, and say which variable answered.
 *
 * The canonical name is tried first and the host's account-wide `DCWG_`-prefixed name
 * second, mirroring how the capture bot's token resolves: Zo secrets are account-wide, so
 * a bare `GEMINI_API_KEY` on this host may belong to another project, and the workflow
 * uses the bare name because repository secrets are already scoped.
 *
 * The name is returned alongside the value because fx reads the key from the variable its
 * own settings name, and a run has to be able to say which variable that was rather than
 * export a key nothing reads.
 */
export function resolveApiKey(
  spec: ProviderSpec,
  env: (name: string) => string | undefined,
): { name: string; value: string } | undefined {
  for (const name of [spec.keyEnv, `DCWG_${spec.keyEnv}`]) {
    const value = env(name);
    if (value) return { name, value };
  }
  return undefined;
}

/** The message a run gives when its provider's key is absent, naming the fix. */
export function missingKeyMessage(spec: ProviderSpec): string {
  return `the wiki pass on ${spec.name} needs an API key: set ${spec.keyEnv} ` +
    `(or DCWG_${spec.keyEnv} on this host), or pass --skip-wiki`;
}

/**
 * Problems with `~/.fx/settings.json` that would make an fx pass fail opaquely.
 *
 * fx resolves `FX_PROVIDER` against its own settings file, which is per-machine and
 * cannot be committed, so a run has to check that the provider it selected actually
 * exists there and reads the key from the variable the connector is about to export.
 * Checked rather than written: the connector does not edit a user's global fx settings,
 * and a mismatch here is a misconfiguration worth naming precisely instead of leaving to
 * a failed pass.
 *
 * Only the non-default provider is checked. `gateway` is fx's own built-in, so a machine
 * without a settings file still runs it.
 */
export function fxProviderProblems(
  settings: unknown,
  spec: ProviderSpec,
  keyEnvName: string,
): string[] {
  if (spec.fxProvider === "gateway") return [];
  const problems: string[] = [];
  const file = settings as {
    provider?: unknown;
    providers?: Record<string, unknown>;
  } | undefined;
  const block = file?.providers?.[spec.fxProvider] as
    | { base_url?: unknown; auth?: { env?: unknown } }
    | undefined;
  if (!block) {
    problems.push(
      `~/.fx/settings.json names no '${spec.fxProvider}' provider, so fx cannot run the ` +
        `pass on it. Add providers.${spec.fxProvider} with protocol ` +
        `"openai-chat-completions", base_url "${spec.baseUrl}", and auth.env ` +
        `"${keyEnvName}".`,
    );
    return problems;
  }
  if (block.base_url !== spec.baseUrl) {
    problems.push(
      `~/.fx/settings.json points providers.${spec.fxProvider}.base_url at ` +
        `${JSON.stringify(block.base_url)}, but a ${spec.name} pass expects ` +
        `${spec.baseUrl}`,
    );
  }
  const authEnv = block.auth?.env;
  if (authEnv !== keyEnvName) {
    problems.push(
      `~/.fx/settings.json reads providers.${spec.fxProvider} from ` +
        `${JSON.stringify(authEnv)}, but this run exports the key as ${keyEnvName}. A ` +
        `pass that exported the key under a name fx does not read would fail as an ` +
        `unauthenticated request.`,
    );
  }
  return problems;
}

/** One line for the run report, so a log says which provider paid for the pass. */
export function describeProvider(spec: ProviderSpec, modelId: string): string {
  return `${spec.name} (${modelId}), ${spec.metered ? "metered" : "unmetered"}`;
}
/**
 * The models a pass will try, in order: the one it was pointed at, then that provider's
 * fallbacks.
 *
 * Two editors need this list for two different reasons, which is why it is built here
 * rather than inside either of them. The `api` editor hands the whole tail to the Gateway
 * as `providerOptions.gateway.models`, and the Gateway itself fails over inside the one
 * request. The `fx` editor cannot: fx takes a single `--model` and is a pinned binary, so
 * the connector moves down the list between attempts. Both read the same order, so a run's
 * report names the same sequence whichever editor it used.
 *
 * A duplicate is dropped rather than repeated, because a rotation that named the primary
 * twice would spend an attempt re-asking the model that just refused.
 */
export function modelRotation(spec: ProviderSpec, primary: string): string[] {
  return [primary, ...spec.fallbacks.filter((model) => model !== primary)];
}

/** The rotation as the run report prints it, so a log names every model a pass may reach. */
export function describeRotation(rotation: string[]): string {
  return rotation.length === 1
    ? rotation[0]
    : `${rotation[0]}, then ${rotation.slice(1).join(", ")}`;
}
