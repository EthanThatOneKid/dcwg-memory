/**
 * The Gemini implementation of the staged pass's model seam.
 *
 * `geminiComplete` answers a `Complete` with one structured-output request to the Gemini
 * API, so the pass that plans and writes pages (`anthropic.ts`) runs unchanged on Google's
 * free tier. It speaks the native `generateContent` API rather than the OpenAI-compatible
 * endpoint: that endpoint was measured on 2026-10-18 to be inconsistently compatible
 * (tool calls without an `index`, `arguments` as a JSON string), and a native request with a
 * response schema has no tool calls to get wrong.
 *
 * The request carries the capture as the first part and the task second, so Gemini's
 * implicit caching can bill the repeated prefix at the cached rate; the cached count comes
 * back in `usageMetadata` and is booked as cache-read tokens. Nothing here is a write
 * boundary: the caller validates every answer.
 *
 * Retries are this module's, because there is no SDK to do them. A 429 or 5xx is retried with
 * the delay the API names (`retryDelay`, or `Retry-After`), but a wait longer than
 * `MAX_WAIT_MS` is a quota that will not clear inside a job, so it is reported as a rate
 * limit at once instead of holding the runner.
 */

import { z } from "zod";
import { emptyUsage } from "./model.ts";
import type { CallRequest, Complete, FailureKind, Reply, Usage } from "./model.ts";

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/** How many times one call is retried after a 429 or a 5xx. */
export const MAX_RETRIES = 5;
/** The longest single wait worth taking inside a job. */
export const MAX_WAIT_MS = 60_000;

export interface GeminiOptions {
  baseUrl?: string;
  /** Injected so a test needs no network. */
  fetch?: typeof fetch;
  /** Injected so a test needs no wait. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  maxRetries?: number;
}

interface GeminiResponse {
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
    cachedContentTokenCount?: number;
  };
}

interface GeminiError {
  error?: {
    code?: number;
    status?: string;
    message?: string;
    details?: Array<{ "@type"?: string; retryDelay?: string; reason?: string }>;
  };
}

function sleepFor(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("aborted", "AbortError"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    }, { once: true });
  });
}

/** The usage a response reports. Thinking tokens are billed as output, so they are counted as output. */
export function geminiUsage(meta: GeminiResponse["usageMetadata"]): Usage {
  const cached = meta?.cachedContentTokenCount ?? 0;
  return {
    inputTokens: Math.max(0, (meta?.promptTokenCount ?? 0) - cached),
    outputTokens: (meta?.candidatesTokenCount ?? 0) + (meta?.thoughtsTokenCount ?? 0),
    cacheReadTokens: cached,
    cacheWriteTokens: 0,
    calls: 1,
  };
}

/** The schema in the form Gemini's `responseJsonSchema` takes: plain JSON Schema, no `$schema`. */
export function responseSchema(schema: z.ZodType): Record<string, unknown> {
  const { $schema: _dropped, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  return rest;
}

/** How long the API asked us to wait, in ms, from `Retry-After` or the error's `retryDelay`. */
export function retryDelayMs(response: Response, body: GeminiError | undefined): number | undefined {
  const header = Number(response.headers.get("retry-after"));
  if (Number.isFinite(header) && header > 0) return header * 1000;
  const detail = body?.error?.details?.find((d) => d.retryDelay)?.retryDelay;
  const seconds = detail === undefined ? NaN : Number.parseFloat(detail);
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) : undefined;
}

function failure(kind: FailureKind, message: string, usage: Usage = emptyUsage()): Reply<never> {
  return { ok: false, kind, message, usage };
}

/** An error response to a `Reply`. Only a 400 is read for its text: Google reports a bad key there. */
function classifyHttp(status: number, body: GeminiError | undefined): Reply<never> {
  const text = body?.error?.message ?? `HTTP ${status}`;
  const reason = body?.error?.details?.find((d) => d.reason)?.reason;
  if (status === 429) return failure("rate_limit", `rate limited: ${text}`);
  if (status === 401 || status === 403 || reason === "API_KEY_INVALID") {
    return failure("auth", `the API key was rejected: ${text}`);
  }
  if (status === 400 && body?.error?.status === "FAILED_PRECONDITION") {
    return failure("billing", `the Gemini API is not usable for this key's project: ${text}`);
  }
  return failure("error", `API error ${status}: ${text}`);
}

/**
 * The real model call: one structured-output request on the Gemini API.
 *
 * The key travels in `x-goog-api-key`, never in the URL, so a logged request line names no
 * credential.
 */
export function geminiComplete(apiKey: string, model: string, options: GeminiOptions = {}): Complete {
  const doFetch = options.fetch ?? fetch;
  const sleep = options.sleep ?? sleepFor;
  const baseUrl = options.baseUrl ?? GEMINI_BASE_URL;
  const maxRetries = options.maxRetries ?? MAX_RETRIES;

  return async <T>(request: CallRequest<T>): Promise<Reply<T>> => {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: request.system }] },
      contents: [{ role: "user", parts: [{ text: request.prefix }, { text: request.task }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: responseSchema(request.schema),
        maxOutputTokens: request.maxTokens,
      },
    });

    for (let attempt = 0;; attempt++) {
      let response: Response;
      try {
        response = await doFetch(`${baseUrl}/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
          body,
          ...(request.signal ? { signal: request.signal } : {}),
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return failure("error", "the call was aborted");
        return failure("error", `the request failed: ${(error as Error).message}`);
      }

      if (response.ok) return interpret(await response.json() as GeminiResponse, request);

      const errorBody = await response.json().catch(() => undefined) as GeminiError | undefined;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt >= maxRetries) return classifyHttp(response.status, errorBody);

      const asked = retryDelayMs(response, errorBody);
      const wait = asked ?? Math.min(MAX_WAIT_MS, 1000 * 2 ** attempt);
      // A wait this long is a quota (the free tier's daily one, usually), not a blip.
      if (wait > MAX_WAIT_MS) return classifyHttp(response.status, errorBody);
      try {
        await sleep(wait, request.signal);
      } catch {
        return failure("error", "the call was aborted");
      }
    }
  };
}

/** A successful response to a `Reply`: stop reasons first, then the schema. */
function interpret<T>(response: GeminiResponse, request: CallRequest<T>): Reply<T> {
  const usage = geminiUsage(response.usageMetadata);
  const blocked = response.promptFeedback?.blockReason;
  if (blocked) return failure("refusal", `the prompt was blocked (${blocked})`, usage);

  const candidate = response.candidates?.[0];
  const finish = candidate?.finishReason;
  if (finish === "MAX_TOKENS") {
    return failure("truncated", `the answer hit maxOutputTokens (${request.maxTokens}) before it finished`, usage);
  }
  if (finish && finish !== "STOP") {
    return failure("refusal", `the model declined the request (${finish})`, usage);
  }

  const text = (candidate?.content?.parts ?? []).filter((part) => !part.thought).map((part) => part.text ?? "")
    .join("");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return failure("invalid", "the answer was not JSON", usage);
  }
  const parsed = request.schema.safeParse(json);
  if (!parsed.success) {
    return failure("invalid", `the answer did not parse against the schema: ${parsed.error.message}`, usage);
  }
  return { ok: true, value: parsed.data, usage };
}
