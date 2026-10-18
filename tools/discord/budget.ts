/**
 * What the inference provider says is left to spend.
 *
 * On the Vercel AI Gateway the unit is money, not requests. The Gateway bills tokens at
 * the provider's list price and every team gets $5 of credits a month, so the question a
 * run has to answer is not "how many requests do I have" but "can these credits pay for
 * a pass". Measured 2026-10-18 against the connector's own key:
 *
 *   GET /v1/credits -> { "balance": "4.513395538", "total_used": "1.692157662" }
 *
 * which is read here and nowhere else. The previous provider metered free-model requests
 * (50 a day, 1,000 after $10 of credits), and that is a ceiling an agentic pass can spend
 * in two runs; credits are not, because a free model costs nothing and a paid one costs
 * what it costs.
 *
 * So a run asks two things and multiplies them: what is left of the balance, and what one
 * pass costs at the model this run was pointed at. The second comes from the Gateway's own
 * catalogue price for that model and this connector's own measurement of what a pass
 * spends, which is why it is an estimate rather than a quote.
 */

/** The Gateway's credit ledger for the team the key belongs to. */
export interface GatewayCredits {
  /** Remaining balance, in USD. */
  balanceUsd: number;
  /** Lifetime spend, in USD. */
  totalUsedUsd: number;
}

/** Where the Gateway reports the team's balance. */
export const GATEWAY_CREDITS_URL = "https://ai-gateway.vercel.sh/v1/credits";

/** Where the Gateway publishes every model it serves, with prices. */
export const GATEWAY_MODELS_URL = "https://ai-gateway.vercel.sh/v1/models";

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

/** A money or price field, which the Gateway publishes as a string. */
function amount(value: unknown): number | undefined {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Read the balance out of a `/v1/credits` body.
 *
 * Pure, so the shape can be pinned by a test without a network call. The endpoint returns
 * both fields as decimal strings; a number is accepted too, so a shape change degrades to
 * the right answer instead of to "no budget was reported". Anything missing either field
 * is `undefined`.
 */
export function parseGatewayCredits(payload: unknown): GatewayCredits | undefined {
  const root = record(payload);
  if (!root) return undefined;
  const balanceUsd = amount(root["balance"]);
  const totalUsedUsd = amount(root["total_used"]);
  if (balanceUsd === undefined || totalUsedUsd === undefined) return undefined;
  return { balanceUsd, totalUsedUsd };
}

export interface CreditsProbeOptions {
  /** The key to ask about. Never logged, never returned. */
  apiKey: string;
  /** Overridden in tests. */
  fetchImpl?: typeof fetch;
  /** Overridden in tests. */
  url?: string;
}

/**
 * Ask the Gateway what is left of the balance.
 *
 * Best-effort by construction: it answers `undefined` rather than throwing when the
 * endpoint is unreachable, the key is rejected, the body is not JSON, or the shape is one
 * `parseGatewayCredits` does not know. A run must not fail because its budget could not be
 * read, so "no answer" is the only outcome a caller has to handle, and it is the same
 * outcome as "no budget applies here".
 *
 * This call is free: reading a balance spends nothing.
 */
export async function probeGatewayCredits(
  options: CreditsProbeOptions,
): Promise<GatewayCredits | undefined> {
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(options.url ?? GATEWAY_CREDITS_URL, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
    });
    if (!response.ok) return undefined;
    return parseGatewayCredits(await response.json());
  } catch {
    return undefined;
  }
}

/** One line for the run log, and the phrase the deferred-fold message is built from. */
export function describeGatewayCredits(credits: GatewayCredits | undefined): string {
  return credits === undefined
    ? "gateway credits: not reported by the provider"
    : `gateway credits: $${credits.balanceUsd.toFixed(2)} left, ${
      credits.totalUsedUsd.toFixed(2)
    } spent`;
}

/** What the Gateway charges for a model, per token, in USD. */
export interface ModelPrice {
  inputUsdPerToken: number;
  outputUsdPerToken: number;
}

/**
 * Read one model's price out of a `/v1/models` body.
 *
 * Prices are per token, as decimal strings. Tiered models publish their dearest tier on
 * the top-level `input`/`output` fields, which is the right direction to be wrong in: a
 * pass that reads a long capture is exactly the pass that would reach a higher tier.
 *
 * `undefined` when the model is not in the catalogue, which the caller has to treat as
 * "this pass cannot be priced" rather than as "this pass is free".
 */
export function parseModelPrice(payload: unknown, modelId: string): ModelPrice | undefined {
  const models = record(payload)?.["data"];
  if (!Array.isArray(models)) return undefined;
  for (const entry of models) {
    const model = record(entry);
    if (model?.["id"] !== modelId) continue;
    const pricing = record(model["pricing"]);
    const inputUsdPerToken = amount(pricing?.["input"]);
    const outputUsdPerToken = amount(pricing?.["output"]);
    if (inputUsdPerToken === undefined || outputUsdPerToken === undefined) return undefined;
    return { inputUsdPerToken, outputUsdPerToken };
  }
  return undefined;
}

export interface PriceProbeOptions extends CreditsProbeOptions {
  /** The Gateway model id to price, e.g. `nvidia/nemotron-3.5-lightning-free`. */
  modelId: string;
}

/** Ask the Gateway what a model costs. `undefined` for anything it cannot answer. */
export async function probeModelPrice(
  options: PriceProbeOptions,
): Promise<ModelPrice | undefined> {
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(options.url ?? GATEWAY_MODELS_URL, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
    });
    if (!response.ok) return undefined;
    return parseModelPrice(await response.json(), options.modelId);
  } catch {
    return undefined;
  }
}

/**
 * What one pass spends, measured rather than assumed.
 *
 * The 594-message `#brainstorm` capture folded on 2026-10-18 on
 * `nvidia/nemotron-3.5-lightning-free`: 966,946 input and 19,488 output tokens over 39
 * tool calls. A day's capture is usually far smaller, so this is the shape of a backlog
 * pass, and pricing it against the catalogue is what turns a balance into an attempt
 * count. It is an estimate of a whole pass, not a ceiling on one.
 */
export const MEASURED_PASS_TOKENS = { input: 966_946, output: 19_488 } as const;

/**
 * Price one pass at a model.
 *
 * `undefined` when the model could not be priced, `0` when the model is free. The two are
 * different and the caller must not conflate them: a free model is genuinely unlimited
 * apart from the provider's own rate limits, while an unpriced model is a model whose
 * spend nothing is bounding.
 */
export function estimatePassCostUsd(price: ModelPrice | undefined): number | undefined {
  if (price === undefined) return undefined;
  return MEASURED_PASS_TOKENS.input * price.inputUsdPerToken +
    MEASURED_PASS_TOKENS.output * price.outputUsdPerToken;
}

/** One line for the run log, saying what a pass is expected to cost and why. */
export function describePassCost(passCostUsd: number | undefined): string {
  if (passCostUsd === undefined) return "one pass costs: not priced by the Gateway catalogue";
  if (passCostUsd === 0) return "one pass costs: nothing, the model is free";
  return `one pass costs about $${passCostUsd.toFixed(4)}`;
}

/**
 * This run's place in the day's schedule of runs.
 *
 * The balance is shared by everything that runs that day, and the workflow serves its
 * venues one process at a time, so a run that spends the whole remainder starves every run
 * after it. `--budget-share <i>/<n>` says which of the day's n runs this is, which is what
 * keeps a later venue's small daily delta affordable while an earlier venue still owes the
 * wiki a backlog.
 */
export interface BudgetShare {
  /** 1-based position in the day's schedule. */
  index: number;
  /** How many runs share the day. */
  count: number;
}

/** Parse `--budget-share <i>/<n>`. Throws on anything that is not a share. */
export function parseBudgetShare(value: string): BudgetShare {
  const match = /^(\d+)\/(\d+)$/.exec(value.trim());
  if (!match) throw new Error(`--budget-share must look like <i>/<n>, not '${value}'`);
  const index = Number(match[1]);
  const count = Number(match[2]);
  if (index < 1 || count < 1 || index > count) {
    throw new Error(`--budget-share must satisfy 1 <= i <= n, not '${value}'`);
  }
  return { index, count };
}

/**
 * What this run may spend, in USD, out of what the Gateway reports left.
 *
 * Divided by the runs still to come, this one included, so an early venue cannot spend a
 * later venue's share. The last run of the day sees the remainder and takes all of it.
 * An exhausted balance answers 0, which is the same answer as a share too small to be
 * worth spending.
 */
export function creditAllowance(credits: GatewayCredits, share: BudgetShare): number {
  const stillToCome = share.count - share.index + 1;
  return Math.max(0, credits.balanceUsd / stillToCome);
}

/**
 * How many attempts an allowance can pay for.
 *
 * A free model costs nothing per pass, so the allowance buys every attempt the caller
 * asked for; what bounds it is the provider's own rate limit, which fx retries through and
 * the connector reports when it gives up. A priced model buys `allowanceUsd / passCostUsd`
 * attempts, and zero means the allowance cannot pay for one pass: the caller defers the
 * fold rather than starting a pass that will stop halfway.
 */
export function affordableAttempts(
  allowanceUsd: number,
  passCostUsd: number,
  wanted: number,
): number {
  if (!(passCostUsd > 0)) return wanted;
  return Math.max(0, Math.min(wanted, Math.floor(allowanceUsd / passCostUsd)));
}
