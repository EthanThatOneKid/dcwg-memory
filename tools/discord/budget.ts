/**
 * What the inference provider says is left of the day's free budget.
 *
 * The reason this exists at all: the OpenRouter free tier is capped by
 * **requests**, not tokens. Measured 2026-10-17 against the connector's own key,
 * `GET /api/v1/auth/key` answers
 *
 *   "is_free_tier": true,
 *   "usage": 0,
 *   "free_model_daily_requests": { "used": 51, "limit": 50, "remaining": 0 }
 *
 * and the failing call carried `x-ratelimit-limit: 50`,
 * `x-ratelimit-remaining: 0`. Capping tokens would therefore bound nothing on this
 * path: one agentic step is one request whatever it carries, so a 594-message
 * backfill and a three-message day cost the same until the agent runs out of
 * steps. `steps` in `opencode.json` is the number that decides the spend, and this
 * module is how a run learns whether it can afford to start.
 *
 * Two tiers, per OpenRouter's published limits: 50 free-model requests per day
 * until $10 of credits have been bought at any point, then 1,000 per day,
 * permanently. The 20-requests-per-minute limit is unchanged by credits.
 */

/** The free-model counters an OpenRouter key publishes. */
export interface ModelBudget {
  /** Requests per day this account is allowed on free models. */
  limit: number;
  /** Requests already spent today. */
  used: number;
  /** What is left of `limit`. */
  remaining: number;
}

/** Where OpenRouter reports the limits and usage of the key that was presented. */
export const OPENROUTER_KEY_URL = "https://openrouter.ai/api/v1/auth/key";

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function count(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Read the free-model counters out of an `/api/v1/auth/key` body.
 *
 * Pure, so the shapes can be pinned by a test without a network call. Accepts both
 * the wrapped body the endpoint returns today (`{ "data": { ... } }`) and the
 * counters at the top level, because a shape change there should degrade to "no
 * budget was reported" rather than to a throw. Anything else, including a paid key
 * with no free-model counters, is `undefined`.
 */
export function parseModelBudget(payload: unknown): ModelBudget | undefined {
  const unwrap = (source: Record<string, unknown> | undefined): ModelBudget | undefined => {
    const counters = record(source?.["free_model_daily_requests"]);
    const limit = count(counters?.["limit"]);
    const used = count(counters?.["used"]);
    const remaining = count(counters?.["remaining"]);
    if (limit === undefined || used === undefined || remaining === undefined) return undefined;
    return { limit, used, remaining };
  };
  const root = record(payload);
  return unwrap(record(root?.["data"])) ?? unwrap(root);
}

export interface BudgetProbeOptions {
  /** The key to ask about. Never logged, never returned. */
  apiKey: string;
  /** Overridden in tests. */
  fetchImpl?: typeof fetch;
  /** Overridden in tests. */
  url?: string;
}

/**
 * Ask the provider what is left of today's free requests.
 *
 * Best-effort by construction: it answers `undefined` rather than throwing when the
 * endpoint is unreachable, the key is rejected, the body is not JSON, or the shape
 * is one `parseModelBudget` does not know. A run must not fail because its budget
 * could not be read, so "no answer" is the only outcome a caller has to handle, and
 * it is the same outcome as "no budget applies here".
 *
 * This call is free: reading a key's limits does not spend a free-model request.
 */
export async function probeModelBudget(
  options: BudgetProbeOptions,
): Promise<ModelBudget | undefined> {
  const fetchImpl = options.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(options.url ?? OPENROUTER_KEY_URL, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
    });
    if (!response.ok) return undefined;
    return parseModelBudget(await response.json());
  } catch {
    return undefined;
  }
}

/** One line for the run log, and the phrase the deferred-fold message is built from. */
export function describeModelBudget(budget: ModelBudget | undefined): string {
  return budget === undefined
    ? "free-model budget: not reported by the provider"
    : `free-model budget: ${budget.remaining} of ${budget.limit} request(s) left today (${budget.used} used)`;
}
/**
 * This run's place in the day's schedule of runs.
 *
 * The free allowance is shared by everything that runs that day, and the workflow
 * serves its venues one process at a time, so a run that spends the whole remainder
 * starves every run after it. `--budget-share <i>/<n>` says which of the day's n runs
 * this is, which is what keeps a later venue's small daily delta affordable while an
 * earlier venue still owes the wiki a backlog.
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
 * What this run may spend, in model requests, out of what the provider reports left.
 *
 * Divided by the runs still to come, this one included, so an early venue cannot spend
 * a later venue's share. The last run of the day sees the remainder and takes all of
 * it. A spent budget answers 0, which is the same answer as a share too small to be
 * worth spending.
 */
export function budgetAllowance(budget: ModelBudget, share: BudgetShare): number {
  const stillToCome = share.count - share.index + 1;
  return Math.max(0, Math.floor(budget.remaining / stillToCome));
}

/**
 * How many attempts an allowance can pay for.
 *
 * One agentic attempt spends one request per step, so an attempt costs its agent's step
 * ceiling whatever it carries: 24 steps is 24 requests, whether the capture holds 594
 * messages or three. Zero means the allowance cannot pay for a single pass, and the
 * caller defers the fold rather than spending the day on 429s.
 */
export function affordableAttempts(
  allowance: number,
  stepsPerAttempt: number,
  wanted: number,
): number {
  if (stepsPerAttempt <= 0) return wanted;
  return Math.max(0, Math.min(wanted, Math.floor(allowance / stepsPerAttempt)));
}
