/**
 * The shim exists because of two measured differences between Gemini's stream and OpenAI's,
 * so the tests are mostly about those differences and about not touching anything else.
 *
 * Both fixtures are chunks Gemini actually sent on 2026-10-18, kept verbatim so a provider
 * change that reintroduces or removes either deviation shows up here rather than in a run
 * that dies at `InvalidChunk` or `InconsistentFinishReason`. `GEMINI_TOOL_CALL_CHUNK` is
 * `gemini-2.5-flash`, which sends the call and its verdict in one chunk and omits the
 * `index`; the two `_LITE_` chunks are `gemini-3.1-flash-lite`, which sends the call with
 * no verdict and then says `stop` on an empty delta.
 */

import { assertEquals, assertStringIncludes } from "@std/assert";
import {
  createProxyHandler,
  GEMINI_OPENAI_BASE,
  hasToolCalls,
  injectToolCallIndexes,
  normalizeFinishReason,
  normalizeUsage,
  PROXY_PREFIX,
  rewriteEventLine,
  SseRewriter,
} from "./gemini_proxy.ts";

/** Measured 2026-10-18 against gemini-2.5-flash: a tool call with no `index`. */
const GEMINI_TOOL_CALL_CHUNK =
  `data: {"choices":[{"delta":{"role":"assistant","tool_calls":[{"function":{"arguments":"{\\"path\\":\\"wiki/A.md\\"}","name":"read"},"id":"function-call-1613420070644286763","type":"function"}]},"finish_reason":"tool_calls","index":0}],"created":1792360358,"id":"pT_VaqWHJ9DjkdUP_veM4QU","model":"gemini-2.5-flash","object":"chat.completion.chunk","usage":{"completion_tokens":17,"prompt_tokens":49,"total_tokens":132}}`;

/**
 * Measured 2026-10-18 against gemini-3.1-flash-lite, part 1 of 2: the call carries no
 * `index` and, unlike the flash chunk above, no verdict either. The provider's
 * `extra_content` thought signature is omitted; fx ignores it, and `gemini-2.5-flash-lite`
 * does not require it back.
 */
const GEMINI_LITE_TOOL_CALL_CHUNK =
  `data: {\"choices\":[{\"delta\":{\"role\":\"assistant\",\"tool_calls\":[{\"function\":{\"arguments\":\"{\\\"path\\\":\\\"wiki/Alpha.md\\\"}\",\"name\":\"read\"},\"id\":\"call_4442204\",\"type\":\"function\"}]},\"index\":0}],\"created\":1792361313,\"id\":\"YEPVauTLJaWu28oPvs7i0AU\",\"model\":\"gemini-3.1-flash-lite\",\"object\":\"chat.completion.chunk\",\"usage\":{\"completion_tokens\":18,\"prompt_tokens\":48,\"total_tokens\":66}}`;

/**
 * Part 2 of 2, verbatim: the same generation's terminal chunk. The model called a tool and
 * Gemini reports `stop`, which fx refuses as an inconsistent finish reason.
 */
const GEMINI_LITE_FINISH_CHUNK =
  `data: {\"choices\":[{\"delta\":{\"role\":\"assistant\"},\"finish_reason\":\"stop\",\"index\":0}],\"created\":1792361313,\"id\":\"YEPVauTLJaWu28oPvs7i0AU\",\"model\":\"gemini-3.1-flash-lite\",\"object\":\"chat.completion.chunk\",\"usage\":{\"completion_tokens\":18,\"prompt_tokens\":48,\"total_tokens\":66}}`;

Deno.test("a tool-call delta with no index gets the position in the array", () => {
  const payload = {
    choices: [{ delta: { tool_calls: [{ id: "a", function: { name: "read" } }] } }],
  };
  assertEquals(injectToolCallIndexes(payload), 1);
  assertEquals(
    (payload.choices[0].delta.tool_calls[0] as Record<string, unknown>)["index"],
    0,
  );
});

Deno.test("a delta that already carries an index is left alone", () => {
  const payload = {
    choices: [{ delta: { tool_calls: [{ index: 7, id: "a" }] } }],
  };
  assertEquals(injectToolCallIndexes(payload), 0);
  assertEquals((payload.choices[0].delta.tool_calls[0] as Record<string, unknown>)["index"], 7);
});

Deno.test("parallel calls in one chunk are numbered by position", () => {
  const payload = {
    choices: [{
      delta: { tool_calls: [{ id: "a" }, { index: 5, id: "b" }, { id: "c" }] },
    }],
  };
  assertEquals(injectToolCallIndexes(payload), 2);
  const calls = payload.choices[0].delta.tool_calls as Array<Record<string, unknown>>;
  assertEquals(calls[0]["index"], 0);
  assertEquals(calls[1]["index"], 5);
  assertEquals(calls[2]["index"], 2);
});

Deno.test("a chunk with no tool calls, or no choices, is not touched", () => {
  assertEquals(injectToolCallIndexes({ choices: [{ delta: { content: "hi" } }] }), 0);
  assertEquals(injectToolCallIndexes({ choices: [] }), 0);
  assertEquals(injectToolCallIndexes({ usage: { prompt_tokens: 1 } }), 0);
  assertEquals(injectToolCallIndexes(null), 0);
  assertEquals(injectToolCallIndexes("not an object"), 0);
});

Deno.test("the measured Gemini chunk gains an index and keeps every other field", () => {
  const rewritten = rewriteEventLine(GEMINI_TOOL_CALL_CHUNK, { sawToolCalls: false });
  assertEquals(rewritten.injected, 1);
  const body = JSON.parse(rewritten.text.slice("data: ".length));
  assertEquals(body.choices[0].delta.tool_calls[0].index, 0);
  assertEquals(
    body.choices[0].delta.tool_calls[0].id,
    "function-call-1613420070644286763",
  );
  assertEquals(body.choices[0].delta.tool_calls[0].function.name, "read");
  assertEquals(body.choices[0].delta.tool_calls[0].function.arguments, '{"path":"wiki/A.md"}');
  assertEquals(body.choices[0].finish_reason, "tool_calls");
  // This chunk's usage block is inconsistent too (49 + 17 against a 132 total), so the
  // test pins the third repair as well: the total is restated as the sum of its counts.
  assertEquals(body.usage.total_tokens, 66);
  assertEquals(body.usage.prompt_tokens, 49);
  assertEquals(body.usage.completion_tokens, 17);
  assertEquals(body.model, "gemini-2.5-flash");
});

Deno.test("a line the shim does not understand is returned byte for byte", () => {
  for (
    const line of [
      "data: [DONE]",
      "data:",
      "data: {not json",
      "event: message",
      ": comment",
      "",
      '{"choices":[]}',
    ]
  ) {
    assertEquals(rewriteEventLine(line, { sawToolCalls: false }), {
      text: line,
      injected: 0,
      repaired: 0,
    });
  }
});

Deno.test("a content chunk is passed through without being re-serialized", () => {
  const line = `data: {"choices":[{"delta":{"content":"Hi!","role":"assistant"}}]}`;
  assertEquals(rewriteEventLine(line, { sawToolCalls: false }), {
    text: line,
    injected: 0,
    repaired: 0,
  });
});

Deno.test("a line split across two chunks is held until its newline arrives", () => {
  const rewriter = new SseRewriter();
  const half = GEMINI_TOOL_CALL_CHUNK.slice(0, 80);
  assertEquals(rewriter.push(half), "");
  const rest = rewriter.push(`${GEMINI_TOOL_CALL_CHUNK.slice(80)}\n`);
  assertEquals(rewriter.injected, 1);
  assertStringIncludes(rest, '"index":0');
  assertEquals(rest.endsWith("\n"), true);
});

Deno.test("a stream with no trailing newline is flushed rather than dropped", () => {
  const rewriter = new SseRewriter();
  const out = rewriter.push(GEMINI_TOOL_CALL_CHUNK);
  assertEquals(out, "");
  assertStringIncludes(rewriter.flush(), '"index":0');
  assertEquals(rewriter.injected, 1);
});

Deno.test("an untouched stream comes back identical", () => {
  const stream = [
    `data: {"choices":[{"delta":{"content":"He"}}]}`,
    "",
    `data: {"choices":[{"delta":{"content":"llo"}}]}`,
    "",
    "data: [DONE]",
    "",
  ].join("\n");
  const rewriter = new SseRewriter();
  const out = rewriter.push(stream) + rewriter.flush();
  assertEquals(out, stream);
  assertEquals(rewriter.injected, 0);
});

Deno.test("a tool call followed by `stop` is corrected, which is the lite models' shape", () => {
  const rewriter = new SseRewriter();
  const out = rewriter.push(`${GEMINI_LITE_TOOL_CALL_CHUNK}\n${GEMINI_LITE_FINISH_CHUNK}\n`) +
    rewriter.flush();
  assertEquals(rewriter.injected, 1);
  assertEquals(rewriter.repaired, 1);
  const lines = out.trimEnd().split("\n");
  // The call chunk carried no verdict and is left without one; the verdict arrives in the
  // next chunk, and that is the one that has to change.
  assertEquals(JSON.parse(lines[0].slice("data: ".length)).choices[0].finish_reason, undefined);
  assertEquals(
    JSON.parse(lines[1].slice("data: ".length)).choices[0].finish_reason,
    "tool_calls",
  );
});

Deno.test("a turn with no tool call keeps `stop`, so the correction is not one-way", () => {
  const rewriter = new SseRewriter();
  rewriter.push(`data: {"choices":[{"delta":{"content":"hi"}}]}\n`);
  const out = rewriter.push(`data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n`);
  assertEquals(rewriter.repaired, 0);
  assertStringIncludes(out, '"finish_reason":"stop"');
});

Deno.test("a verdict of `length` is left alone, because truncation is a real failure", () => {
  const rewriter = new SseRewriter();
  rewriter.push(`${GEMINI_LITE_TOOL_CALL_CHUNK}\n`);
  const out = rewriter.push(`data: {"choices":[{"delta":{},"finish_reason":"length"}]}\n`);
  assertEquals(rewriter.repaired, 0);
  assertStringIncludes(out, '"finish_reason":"length"');
});

Deno.test("the tool-call state a stream remembers does not leak into the next stream", () => {
  const first = new SseRewriter();
  first.push(`${GEMINI_LITE_TOOL_CALL_CHUNK}\n${GEMINI_LITE_FINISH_CHUNK}\n`);
  assertEquals(first.repaired, 1);
  // A fresh stream that makes no tool call must still be judged on its own contents.
  const second = new SseRewriter();
  const out = second.push(`data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n`);
  assertEquals(second.repaired, 0);
  assertStringIncludes(out, '"finish_reason":"stop"');
});

Deno.test("hasToolCalls reads the delta, and ignores an empty list", () => {
  assertEquals(hasToolCalls({ choices: [{ delta: { tool_calls: [{ id: "a" }] } }] }), true);
  assertEquals(hasToolCalls({ choices: [{ delta: { tool_calls: [] } }] }), false);
  assertEquals(hasToolCalls({ choices: [{ delta: { content: "hi" } }] }), false);
  assertEquals(hasToolCalls({ choices: [] }), false);
  assertEquals(hasToolCalls(null), false);
});

Deno.test("normalizeFinishReason does nothing to a chunk with no verdict", () => {
  assertEquals(normalizeFinishReason({ choices: [{ delta: {} }] }, true), 0);
  assertEquals(normalizeFinishReason({ choices: [] }, true), 0);
  assertEquals(normalizeFinishReason(undefined, false), 0);
});
Deno.test("normalizeUsage restates a total that counted thinking tokens", () => {
  // Measured 2026-10-18 against gemini-2.5-flash: 172 tokens of thinking, so the total
  // exceeded the sum of the two counts and fx rejected the response with `InvalidChunk`.
  const payload = {
    usage: { prompt_tokens: 1609, completion_tokens: 43, total_tokens: 1824 },
  };
  assertEquals(normalizeUsage(payload), 1);
  assertEquals(payload.usage.total_tokens, 1652);
  // The provider's own two counts are left exactly as it reported them.
  assertEquals(payload.usage.prompt_tokens, 1609);
  assertEquals(payload.usage.completion_tokens, 43);
});

Deno.test("normalizeUsage leaves a consistent total, and an unreadable one, alone", () => {
  const consistent = { usage: { prompt_tokens: 48, completion_tokens: 18, total_tokens: 66 } };
  assertEquals(normalizeUsage(consistent), 0);
  assertEquals(consistent.usage.total_tokens, 66);
  assertEquals(normalizeUsage({ usage: { prompt_tokens: 5 } }), 0);
  assertEquals(normalizeUsage({ usage: { total_tokens: 9 } }), 0);
  const quoted = { usage: { prompt_tokens: "5", completion_tokens: 1, total_tokens: 9 } };
  assertEquals(normalizeUsage(quoted), 0);
  assertEquals(normalizeUsage({ choices: [] }), 0);
  assertEquals(normalizeUsage(null), 0);
});

Deno.test("the lite stream keeps its consistent totals and still repairs the verdict", () => {
  const rewriter = new SseRewriter();
  const out = rewriter.push(
    `${GEMINI_LITE_TOOL_CALL_CHUNK}\n${GEMINI_LITE_FINISH_CHUNK}\n`,
  ) + rewriter.flush();
  assertEquals(rewriter.injected, 1);
  assertEquals(rewriter.repaired, 1);
  assertStringIncludes(out, '"total_tokens":66');
});

/** A fetch stub that records what it was asked for and answers with a canned body. */
function stubFetch(
  response: Response | (() => Response),
): { fetchImpl: typeof fetch; calls: Array<{ url: string; headers: Headers; body: unknown }> } {
  const calls: Array<{ url: string; headers: Headers; body: unknown }> = [];
  const fetchImpl = ((input: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(input),
      headers: new Headers(init?.headers),
      body: init?.body,
    });
    return Promise.resolve(typeof response === "function" ? response() : response.clone());
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

function sseResponse(text: string): Response {
  return new Response(text, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

Deno.test("health answers without an upstream call", async () => {
  const { fetchImpl, calls } = stubFetch(sseResponse(""));
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(new Request("http://127.0.0.1:8787/health"));
  assertEquals(response.status, 200);
  assertEquals(await response.text(), "ok\n");
  assertEquals(calls.length, 0);
});

Deno.test("a request with no authorization is refused before the upstream sees it", async () => {
  const { fetchImpl, calls } = stubFetch(sseResponse(""));
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, { method: "POST" }),
  );
  assertEquals(response.status, 401);
  assertEquals(calls.length, 0);
});

Deno.test("only POST is proxied", async () => {
  const { fetchImpl, calls } = stubFetch(sseResponse(""));
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, { method: "GET" }),
  );
  assertEquals(response.status, 405);
  assertEquals(calls.length, 0);
});

Deno.test("the prefix is stripped and the caller's key is forwarded, not held", async () => {
  const { fetchImpl, calls } = stubFetch(sseResponse("data: [DONE]\n\n"));
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, {
      method: "POST",
      headers: { authorization: "Bearer caller-key", "content-type": "application/json" },
      body: "{}",
    }),
  );
  assertEquals(calls.length, 1);
  assertEquals(calls[0].url, `${GEMINI_OPENAI_BASE}/chat/completions`);
  assertEquals(calls[0].headers.get("authorization"), "Bearer caller-key");
});

Deno.test("a streamed response reaches the caller with the index restored", async () => {
  const { fetchImpl } = stubFetch(sseResponse(`${GEMINI_TOOL_CALL_CHUNK}\n\ndata: [DONE]\n\n`));
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, {
      method: "POST",
      headers: { authorization: "Bearer caller-key" },
      body: "{}",
    }),
  );
  assertEquals(response.status, 200);
  const body = await response.text();
  assertStringIncludes(body, '"index":0');
  assertStringIncludes(body, "data: [DONE]");
  assertStringIncludes(body, "function-call-1613420070644286763");
});

Deno.test("an error body from the provider is passed through with its status", async () => {
  const { fetchImpl } = stubFetch(
    new Response(`{"error":{"message":"quota exceeded"}}`, {
      status: 429,
      headers: { "content-type": "application/json" },
    }),
  );
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, {
      method: "POST",
      headers: { authorization: "Bearer caller-key" },
      body: "{}",
    }),
  );
  assertEquals(response.status, 429);
  assertStringIncludes(await response.text(), "quota exceeded");
});

Deno.test("an unreachable upstream is a 502, not a thrown run", async () => {
  const fetchImpl =
    (() => Promise.reject(new Error("connection refused"))) as unknown as typeof fetch;
  const handler = createProxyHandler({ upstreamBase: GEMINI_OPENAI_BASE, fetchImpl });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, {
      method: "POST",
      headers: { authorization: "Bearer caller-key" },
      body: "{}",
    }),
  );
  assertEquals(response.status, 502);
  assertStringIncludes(await response.text(), "connection refused");
});

Deno.test("the log never carries the credential or the body", async () => {
  const lines: string[] = [];
  const { fetchImpl } = stubFetch(sseResponse(`${GEMINI_TOOL_CALL_CHUNK}\n\n`));
  const handler = createProxyHandler({
    upstreamBase: GEMINI_OPENAI_BASE,
    fetchImpl,
    log: (line) => lines.push(line),
  });
  const response = await handler(
    new Request(`http://127.0.0.1:8787${PROXY_PREFIX}/chat/completions`, {
      method: "POST",
      headers: { authorization: "Bearer super-secret-key" },
      body: '{"messages":[{"role":"user","content":"private capture text"}]}',
    }),
  );
  await response.text();
  assertEquals(lines.length, 1);
  assertStringIncludes(lines[0], "1 tool-call index(es) restored");
  for (const line of lines) {
    assertEquals(line.includes("super-secret-key"), false);
    assertEquals(line.includes("private capture text"), false);
  }
});
