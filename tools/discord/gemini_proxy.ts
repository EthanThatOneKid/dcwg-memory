/**
 * A loopback shim that makes Gemini's OpenAI-compatible stream readable by `fx`.
 *
 * `fx` speaks one protocol on a custom connection: OpenAI Chat Completions, streamed.
 * Gemini serves that protocol from `…/v1beta/openai`, and it is close, but not close
 * enough. Measured 2026-10-18 against `gemini-2.5-flash` and `gemini-3.1-flash-lite`, a
 * streamed tool call arrives as one chunk holding the whole call:
 *
 *   data: {"choices":[{"delta":{"role":"assistant","tool_calls":[
 *     {"function":{"arguments":"{\"path\":\"wiki/A.md\"}","name":"read"},
 *      "id":"function-call-1613420070644286763","type":"function"}]},
 *     "finish_reason":"tool_calls","index":0}], ...}
 *
 * with no `index` on the tool call. OpenAI's own stream puts `index` on every tool-call
 * delta, and fx's reducer requires it: `accept_tools` in
 * `src/gateway/chat_completions_protocol.zig` reads
 * `delta.get("index") orelse return error.InvalidChunk`, so the first tool call ends the
 * pass with `InvalidChunk` before any page is written. Measured 2026-10-18 on fx 0.0.14,
 * which is the newest release: a plain `fx ask` on this connection answers normally, and
 * the same connection dies the moment the model reaches for a tool.
 *
 * A second deviation appears on `gemini-3.1-flash-lite`, and it is the one that decides
 * which model a pass can afford, because the lite models are the ones with a usable
 * request rate. The lite stream separates the call from its verdict: one chunk carries the
 * tool call with no `finish_reason`, and the next carries `"finish_reason":"stop"` on an
 * otherwise empty delta. `stop`, with a tool call already on the wire. fx enforces the
 * equivalence (`if ((reason == .tool_calls) != (self.tools.items.len != 0)) return
 * error.InconsistentFinishReason`), so the pass dies a second way on the same call.
 *
 * A third deviation is in the usage block rather than the deltas, and it bites on
 * `gemini-2.5-flash`: `total_tokens` counts the tokens the model spent thinking while
 * `completion_tokens` counts only what it emitted, so `total == prompt + completion` does
 * not hold, and fx's `accept_usage` rejects the response with `InvalidChunk` after a tool
 * call has already succeeded.
 *
 * So the shim restores three invariants and nothing else: every tool-call delta carries the
 * `index` OpenAI puts there and Gemini omits, a stream's `finish_reason` says `tool_calls`
 * exactly when that stream carried a tool call, and a response's token counts add up to its
 * total. Every other byte passes through untouched, and a line the shim cannot parse is
 * forwarded exactly as it arrived rather than dropped. A shim that rewrote more would be a
 * second place for a provider's behavior to be described, and the next Gemini release
 * would have more of them to invalidate. When Gemini emits a conformant stream every
 * repair becomes a no-op and the pass is unaffected.
 *
 * It binds loopback because fx refuses a non-HTTPS base URL except for a loopback address,
 * and because a local socket is the narrowest thing that can sit in the path: no host, no
 * port to open, no listener anyone else can reach.
 *
 * The key never touches this process. fx holds it (from the connection's `auth.env`) and
 * sends it as the `Authorization` header of the request it makes; the shim forwards that
 * header upstream and refuses a request without one. So a shim that leaked its own
 * configuration would still have no credential in it, and nothing here is ever logged
 * beyond a request line, a status, and how many indexes were restored.
 *
 * Usage (the workflow starts this before the ingest, and stops it after):
 *
 *   deno run -A tools/discord/gemini_proxy.ts --port 8787
 *
 * Then point an fx connection at `http://127.0.0.1:8787/v1`. `--upstream` overrides the
 * Gemini endpoint, which is what the tests use.
 */

/** Gemini's OpenAI-compatible base. `fx` appends `/chat/completions` to the base URL. */
export const GEMINI_OPENAI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";

/** The path prefix this proxy serves, which is what the fx connection's base URL carries. */
export const PROXY_PREFIX = "/v1";

export const USAGE = `Serve Gemini's OpenAI-compatible API on loopback, with the tool-call
index that fx requires restored to each streamed chunk.

Options:
  --port <n>            port to listen on (default 8787)
  --upstream <url>      upstream base URL (default: Gemini's OpenAI-compatible base)
  -h, --help            show this help

Exit codes: 0 stopped, 2 usage error.
`;

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

/**
 * Add the `index` OpenAI puts on every streamed tool-call delta and Gemini omits.
 *
 * Returns how many indexes were added, which is what a run reports. A delta that already
 * carries an index is left exactly as it arrived, so a provider that fixes this is not
 * double-numbered, and a chunk with no tool calls is not touched at all.
 *
 * The position in the array is the right index because that is what the field means: an
 * OpenAI stream numbers the calls it is sending in this chunk, and fx uses it to tell
 * fragments of one call from fragments of another.
 */
export function injectToolCallIndexes(payload: unknown): number {
  const choices = record(payload)?.["choices"];
  if (!Array.isArray(choices)) return 0;
  let injected = 0;
  for (const choice of choices) {
    const calls = record(record(choice)?.["delta"])?.["tool_calls"];
    if (!Array.isArray(calls)) continue;
    calls.forEach((call, position) => {
      const entry = record(call);
      if (entry === undefined || entry["index"] !== undefined) return;
      entry["index"] = position;
      injected++;
    });
  }
  return injected;
}

/** Whether this chunk put a tool call on the wire, which is what the finish reason must agree with. */
export function hasToolCalls(payload: unknown): boolean {
  const choices = record(payload)?.["choices"];
  if (!Array.isArray(choices)) return false;
  return choices.some((choice) => {
    const calls = record(record(choice)?.["delta"])?.["tool_calls"];
    return Array.isArray(calls) && calls.length > 0;
  });
}

/**
 * Make the finish reason agree with what the stream carried, and report whether it had to.
 *
 * Only `stop` and `tool_calls` are candidates, because they are the two the equivalence
 * covers: fx requires `tool_calls` when the stream carried a tool call and `stop` when it
 * did not, and raises `InconsistentFinishReason` on either mismatch. `length` and
 * `content_filter` are left exactly as they arrived. A truncated stream is a real failure
 * and should surface as one, rather than being relabelled into a shape the pass would
 * accept.
 */
export function normalizeFinishReason(payload: unknown, sawToolCalls: boolean): number {
  const choices = record(payload)?.["choices"];
  if (!Array.isArray(choices)) return 0;
  const wanted = sawToolCalls ? "tool_calls" : "stop";
  let repaired = 0;
  for (const choice of choices) {
    const entry = record(choice);
    if (entry === undefined) continue;
    const reason = entry["finish_reason"];
    if (reason !== "stop" && reason !== "tool_calls") continue;
    if (reason === wanted) continue;
    entry["finish_reason"] = wanted;
    repaired++;
  }
  return repaired;
}

/**
 * Make the token counts add up the way the protocol says they do.
 *
 * Gemini reports `total_tokens` including the tokens it spent thinking, while
 * `completion_tokens` counts only what it emitted, so a response that thought before
 * answering breaks `total == prompt + completion`. Measured 2026-10-18 on
 * `gemini-2.5-flash`: one tool call reported 1609 prompt, 43 completion, 1824 total, the
 * 172-token difference being thinking. fx enforces the identity in `accept_usage`
 * (`if (tokens < sum or (exact and tokens != sum)) return error.InvalidChunk`) and ends the
 * pass with `InvalidChunk`, which is how the first 2.5-flash pass through this shim died
 * after a tool call had already succeeded.
 *
 * The repair restates `total_tokens` as the sum, rather than folding the difference into
 * `completion_tokens`, because `total` is the field the protocol defines as derived and the
 * two counts are the provider's own. The consequence is worth stating plainly: a pass's
 * reported output tokens do not include the model's thinking tokens. Nothing here is billed
 * by that number — the connector reports a pass's input and output spend, and the budget it
 * governs is the Gateway's money, which Gemini does not spend — so the visible effect is a
 * smaller output figure, not a wrong one.
 */
export function normalizeUsage(payload: unknown): number {
  const usage = record(record(payload)?.["usage"]);
  if (usage === undefined) return 0;
  const prompt = usage["prompt_tokens"];
  const completion = usage["completion_tokens"];
  const total = usage["total_tokens"];
  if (
    typeof prompt !== "number" || typeof completion !== "number" || typeof total !== "number"
  ) return 0;
  const sum = prompt + completion;
  if (total === sum) return 0;
  usage["total_tokens"] = sum;
  return 1;
}
/** What a stream has to remember between chunks to repair the second invariant. */ export interface RewriteState {
  /** Set once any chunk in this stream has carried a tool call. Never cleared. */
  sawToolCalls: boolean;
}

/**
 * Rewrite one server-sent-events line.
 *
 * Only a `data:` line carrying JSON is a candidate; `[DONE]`, an empty payload, a comment,
 * and a line that is not JSON at all are returned byte-for-byte, because a shim that
 * reformatted a line it did not understand would turn a provider's error message into a
 * parse failure of its own.
 */
export function rewriteEventLine(
  line: string,
  state: RewriteState,
): { text: string; injected: number; repaired: number } {
  const untouched = { text: line, injected: 0, repaired: 0 };
  if (!line.startsWith("data:")) return untouched;
  const payload = line.slice("data:".length).trim();
  if (!payload || payload === "[DONE]") return untouched;
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return untouched;
  }
  // Order matters: a chunk can carry the call and the verdict together, which is what
  // `gemini-2.5-flash` does, so the call is seen before the reason is judged.
  if (hasToolCalls(parsed)) state.sawToolCalls = true;
  const injected = injectToolCallIndexes(parsed);
  const repaired = normalizeFinishReason(parsed, state.sawToolCalls) + normalizeUsage(parsed);
  if (injected === 0 && repaired === 0) return untouched;
  return { text: `data: ${JSON.stringify(parsed)}`, injected, repaired };
}

/**
 * Rewrite an SSE byte stream line by line.
 *
 * A chunk boundary falls wherever the network put it, so a partial line has to be held
 * until its newline arrives; `flush` releases the last one, which is a line only if the
 * upstream omitted the trailing newline. Nothing is decoded across a chunk boundary
 * either: the decoder is handed `{ stream: true }` so a multi-byte character split between
 * two chunks is not mangled into replacement characters.
 */
export class SseRewriter {
  #pending = "";
  #injected = 0;
  #repaired = 0;
  #state: RewriteState = { sawToolCalls: false };

  /** How many tool-call indexes this stream has restored. */
  get injected(): number {
    return this.#injected;
  }

  /** How many other fields this stream had to correct: a finish reason, or a token total. */
  get repaired(): number {
    return this.#repaired;
  }

  /** Feed a decoded chunk, returning whatever is now complete. */
  push(text: string): string {
    this.#pending += text;
    let out = "";
    let newline = this.#pending.indexOf("\n");
    while (newline !== -1) {
      const line = this.#pending.slice(0, newline);
      this.#pending = this.#pending.slice(newline + 1);
      out += `${this.#rewrite(line)}\n`;
      newline = this.#pending.indexOf("\n");
    }
    return out;
  }

  /** Release the last line, which arrives without a newline only if the stream was cut. */
  flush(): string {
    const rest = this.#pending;
    this.#pending = "";
    return rest ? this.#rewrite(rest) : "";
  }

  #rewrite(line: string): string {
    const rewritten = rewriteEventLine(line, this.#state);
    this.#injected += rewritten.injected;
    this.#repaired += rewritten.repaired;
    return rewritten.text;
  }
}

export interface ProxyOptions {
  /** Upstream base URL, e.g. `https://generativelanguage.googleapis.com/v1beta/openai`. */
  upstreamBase: string;
  /** Overridden in tests. */
  fetchImpl?: typeof fetch;
  /** One line per request. Never given a credential or a body. */
  log?: (line: string) => void;
}

/**
 * The request handler, as a function of its options so a test can drive it without a
 * socket and without a network.
 *
 * `GET /health` answers `ok` so a caller can wait for readiness rather than sleep and
 * hope. Every other request must be a `POST` carrying an `Authorization` header, and the
 * upstream is reached at the same path with this proxy's prefix removed, so the base URL
 * in the fx connection and the URL here cannot drift apart.
 *
 * A streamed response is rewritten; anything else, including an error body from the
 * provider, is passed through with its status and content type intact, because the caller
 * needs to see what the provider actually said.
 */
export function createProxyHandler(
  options: ProxyOptions,
): (request: Request) => Promise<Response> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const log = options.log ?? (() => {});
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response("ok\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    if (request.method !== "POST") {
      return new Response("method not allowed\n", { status: 405 });
    }
    const authorization = request.headers.get("authorization");
    if (!authorization) {
      log(`POST ${url.pathname} -> 401 (no authorization header)`);
      return new Response("missing authorization header\n", { status: 401 });
    }
    const path = url.pathname.startsWith(PROXY_PREFIX)
      ? url.pathname.slice(PROXY_PREFIX.length)
      : url.pathname;
    const target = `${options.upstreamBase}${path}`;

    let upstream: Response;
    try {
      upstream = await fetchImpl(target, {
        method: "POST",
        headers: {
          "authorization": authorization,
          "content-type": request.headers.get("content-type") ?? "application/json",
          "accept": request.headers.get("accept") ?? "text/event-stream",
        },
        body: request.body,
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      log(`POST ${url.pathname} -> 502 (upstream unreachable: ${reason})`);
      return new Response(`upstream unreachable: ${reason}\n`, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("text/event-stream") || upstream.body === null) {
      log(`POST ${url.pathname} -> ${upstream.status} (passed through, not a stream)`);
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { "content-type": contentType },
      });
    }

    const rewriter = new SseRewriter();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const body = upstream.body.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          const text = rewriter.push(decoder.decode(chunk, { stream: true }));
          if (text) controller.enqueue(encoder.encode(text));
        },
        flush(controller) {
          const tail = rewriter.flush();
          if (tail) controller.enqueue(encoder.encode(tail));
          log(
            `POST ${url.pathname} -> ${upstream.status}, ` +
              `${rewriter.injected} tool-call index(es) restored, ` +
              `${rewriter.repaired} other field(s) repaired`,
          );
        },
      }),
    );
    return new Response(body, {
      status: upstream.status,
      headers: { "content-type": contentType },
    });
  };
}

/** Start the proxy. Returns the server, so a caller can close it. */
export function serveProxy(options: ProxyOptions & { port: number }): Deno.HttpServer {
  const handler = createProxyHandler(options);
  return Deno.serve({ port: options.port, hostname: "127.0.0.1" }, handler);
}

if (import.meta.main) {
  const { parseArgs } = await import("@std/cli/parse-args");
  const parsed = parseArgs(Deno.args, {
    string: ["port", "upstream"],
    boolean: ["help"],
    alias: { h: "help" },
    unknown: (arg: string) => {
      throw new Error(`unknown flag: ${arg}`);
    },
  });
  if (parsed.help === true) {
    console.log(USAGE);
    Deno.exit(0);
  }
  const port = parsed.port === undefined ? 8787 : Number(parsed.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`error: --port must be a port number, not '${parsed.port}'\n\n${USAGE}`);
    Deno.exit(2);
  }
  const upstreamBase = parsed.upstream ?? GEMINI_OPENAI_BASE;
  const server = serveProxy({
    port,
    upstreamBase,
    log: (line: string) => console.log(`gemini-proxy: ${line}`),
  });
  console.log(
    `gemini-proxy: listening on http://127.0.0.1:${port}${PROXY_PREFIX} -> ${upstreamBase}`,
  );
  await server.finished;
}
