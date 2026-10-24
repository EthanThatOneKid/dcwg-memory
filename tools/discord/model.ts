/**
 * The seam between the staged pass and whoever answers it.
 *
 * `anthropic.ts` plans and writes pages through a `Complete` function, and each provider
 * (`anthropicComplete`, `geminiComplete`) is one implementation of it. The types live here,
 * with no SDK behind them, so a provider module imports only what it needs.
 */

import type { z } from "zod";

export interface Usage {
  /** Fresh input tokens, billed at the full input rate. */
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  calls: number;
}

export function emptyUsage(): Usage {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, calls: 0 };
}

export type Effort = "low" | "medium" | "high";

export interface CallRequest<T> {
  /** The standing instructions. Identical on every call, so it sits inside the cache prefix. */
  system: string;
  /** The capture, the first user block, and the cache breakpoint. Identical across calls. */
  prefix: string;
  /** What this call asks for. Differs per call and is never cached. */
  task: string;
  schema: z.ZodType<T>;
  maxTokens: number;
  effort: Effort;
  signal?: AbortSignal;
}

export type FailureKind =
  | "refusal"
  | "truncated"
  | "invalid"
  | "rate_limit"
  | "billing"
  | "auth"
  | "error";

export type Reply<T> =
  | { ok: true; value: T; usage: Usage }
  | { ok: false; kind: FailureKind; message: string; usage: Usage };

export type Complete = <T>(request: CallRequest<T>) => Promise<Reply<T>>;
