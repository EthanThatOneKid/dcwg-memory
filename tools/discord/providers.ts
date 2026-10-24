/**
 * Who answers the wiki pass's model calls.
 *
 * Two providers, one pipeline. The staged pass (`anthropic.ts`) asks for structured data
 * through a `Complete` function and does not care who is behind it, so a provider here is
 * only what a run needs to reach one: the variable its key is read from, the model it uses
 * when none is pinned, and a line saying what a pass costs.
 *
 * - `anthropic` is the Anthropic Messages API, billed per token against a Console API key. A
 *   Claude chat subscription does not pay for it.
 * - `gemini` is Google's Gemini API (`gemini.ts`). A key from a project without billing is on
 *   the free tier, which is rate-limited and has its prompts used to improve Google's
 *   products; this repo is public, so that costs nothing here.
 *
 * What bounds a run on either is `--max-usd`, checked against the usage the API reports.
 * This module needs no SDK, so the CLI can read it before it loads either client.
 */

export type ProviderName = "anthropic" | "gemini";

export interface ProviderSpec {
  name: ProviderName;
  /** The environment variable this provider's key is read from by default. */
  keyEnv: string;
  /** The model a pass runs when `--model` names none. */
  defaultModel: string;
  /** What a pass costs, for the run report. */
  billing: string;
}

/** Claude Opus 5.5, the strongest model the pass can plan and write with. */
export const ANTHROPIC_DEFAULT_MODEL = "claude-opus-5-5";

/**
 * A flash model: the pass is two kinds of structured call over one capture, and the cheap
 * tier with a 1M-token window and a free tier is the right one to spend on it.
 */
export const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash";

export const PROVIDERS: Record<ProviderName, ProviderSpec> = {
  anthropic: {
    name: "anthropic",
    keyEnv: "ANTHROPIC_API_KEY",
    defaultModel: ANTHROPIC_DEFAULT_MODEL,
    billing: "billed per token",
  },
  gemini: {
    name: "gemini",
    keyEnv: "GEMINI_API_KEY",
    defaultModel: GEMINI_DEFAULT_MODEL,
    billing: "free tier unless the key's project is billed",
  },
};

export const PROVIDER_NAMES: ProviderName[] = ["anthropic", "gemini"];

/**
 * Read a provider name from a flag, refusing anything else by name.
 *
 * A run that silently fell back to the default here would spend the wrong account without
 * saying so, which is the failure this exists to prevent.
 */
export function parseProviderName(value: string): ProviderName {
  const name = value.trim() as ProviderName;
  if (!PROVIDER_NAMES.includes(name)) {
    throw new Error(`--provider must be one of ${PROVIDER_NAMES.join(", ")}, not '${value}'`);
  }
  return name;
}

/** The spec for a provider name, or the default when the name is `undefined`. */
export function resolveProvider(name: ProviderName | undefined): ProviderSpec {
  return PROVIDERS[name ?? "anthropic"];
}

/**
 * Find a provider's key in the environment, and say which variable answered.
 *
 * The canonical name is tried first and the host's account-wide `DCWG_`-prefixed name
 * second, mirroring how the capture bot's token resolves: Zo secrets are account-wide, so a
 * bare `ANTHROPIC_API_KEY` on this host may belong to another project, and the workflow
 * uses the bare name because repository secrets are already scoped.
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

/** The message a run gives when the key is absent, naming the fix. */
export function missingKeyMessage(spec: ProviderSpec): string {
  return `the wiki pass on ${spec.name} needs an API key: set ${spec.keyEnv} ` +
    `(or DCWG_${spec.keyEnv} on this host), or pass --skip-wiki`;
}

/** One line for the run report, so a log says who answered and what it costs. */
export function describeModel(spec: ProviderSpec, modelId: string): string {
  return `${spec.name} (${modelId}), ${spec.billing}`;
}
