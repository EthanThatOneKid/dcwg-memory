/**
 * The Gemini seam on its own, against a stubbed `fetch`.
 *
 * What is pinned here is the wire contract this module owns: the request it builds (key in a
 * header, schema in `responseJsonSchema`, capture before task), and what each kind of answer
 * becomes. Nothing has called the real API, so these are the claims the first live run
 * confirms or breaks.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { z } from "zod";
import { geminiComplete, geminiUsage, MAX_WAIT_MS, responseSchema, retryDelayMs } from "./gemini.ts";
import type { CallRequest } from "./model.ts";

const Answer = z.object({ summary: z.string(), pages: z.array(z.string().nullable()) });

function request(overrides: Partial<CallRequest<z.infer<typeof Answer>>> = {}): CallRequest<z.infer<typeof Answer>> {
  return {
    system: "SYSTEM RULES",
    prefix: "THE CAPTURE",
    task: "THE TASK",
    schema: Answer,
    maxTokens: 500,
    effort: "medium",
    ...overrides,
  };
}

function ok(text: string, usageMetadata: Record<string, number> = {}, finishReason = "STOP"): Response {
  return Response.json({
    candidates: [{ finishReason, content: { parts: [{ text }] } }],
    usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 50, ...usageMetadata },
  });
}

function stub(...responses: Response[]) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const waits: number[] = [];
  let next = 0;
  return {
    calls,
    waits,
    options: {
      fetch: ((input: string | URL | Request, init?: RequestInit) => {
        calls.push({ url: String(input), init: init ?? {} });
        return Promise.resolve(responses[Math.min(next++, responses.length - 1)]);
      }) as typeof fetch,
      sleep: (ms: number) => {
        waits.push(ms);
        return Promise.resolve();
      },
    },
  };
}

Deno.test("a request carries the key in a header, never the URL, and the capture before the task", async () => {
  const s = stub(ok('{"summary":"s","pages":["wiki/A.md",null]}'));
  const reply = await geminiComplete("secret-key", "gemini-2.5-flash", s.options)(request());

  assertEquals(reply.ok, true);
  const [call] = s.calls;
  assertStringIncludes(call.url, "/models/gemini-2.5-flash:generateContent");
  assert(!call.url.includes("secret-key"), "a logged URL must not carry the credential");
  assertEquals((call.init.headers as Record<string, string>)["x-goog-api-key"], "secret-key");

  const body = JSON.parse(String(call.init.body));
  assertEquals(body.systemInstruction.parts[0].text, "SYSTEM RULES");
  assertEquals(body.contents[0].parts.map((p: { text: string }) => p.text), ["THE CAPTURE", "THE TASK"]);
  assertEquals(body.generationConfig.responseMimeType, "application/json");
  assertEquals(body.generationConfig.maxOutputTokens, 500);
  assertEquals(body.generationConfig.responseJsonSchema.type, "object");
  assert(!("$schema" in body.generationConfig.responseJsonSchema), "Gemini takes the schema without $schema");
});

Deno.test("a nullable field survives as JSON Schema, which is what the plan's thread_id needs", () => {
  const schema = responseSchema(Answer) as { properties: { pages: { items: Record<string, unknown> } } };
  const items = JSON.stringify(schema.properties.pages.items);
  assertStringIncludes(items, "null");
});

Deno.test("usage books cached tokens as cache reads and thinking tokens as output", () => {
  assertEquals(
    geminiUsage({
      promptTokenCount: 10_000,
      cachedContentTokenCount: 9_000,
      candidatesTokenCount: 200,
      thoughtsTokenCount: 800,
    }),
    { inputTokens: 1_000, outputTokens: 1_000, cacheReadTokens: 9_000, cacheWriteTokens: 0, calls: 1 },
  );
  assertEquals(geminiUsage(undefined).calls, 1);
});

Deno.test("an answer that is not JSON, or not the schema, is invalid and still reports its spend", async () => {
  const notJson = await geminiComplete("k", "m", stub(ok("here you go")).options)(request());
  assert(!notJson.ok && notJson.kind === "invalid");
  assertEquals(notJson.usage.inputTokens, 1000, "the tokens were spent whatever the answer was");

  const wrongShape = await geminiComplete("k", "m", stub(ok('{"summary":1}')).options)(request());
  assert(!wrongShape.ok && wrongShape.kind === "invalid");
});

Deno.test("thought parts are not part of the answer", async () => {
  const response = Response.json({
    candidates: [{
      finishReason: "STOP",
      content: { parts: [{ text: "thinking out loud", thought: true }, { text: '{"summary":"s","pages":[]}' }] },
    }],
    usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 },
  });
  const reply = await geminiComplete("k", "m", stub(response).options)(request());
  assertEquals(reply.ok, true);
});

Deno.test("stop reasons: a cut-off answer is truncated and a safety stop is a refusal", async () => {
  const cut = await geminiComplete("k", "m", stub(ok('{"summary":', {}, "MAX_TOKENS")).options)(request());
  assert(!cut.ok && cut.kind === "truncated");

  const safety = await geminiComplete("k", "m", stub(ok("", {}, "SAFETY")).options)(request());
  assert(!safety.ok && safety.kind === "refusal");

  const blocked = await geminiComplete(
    "k",
    "m",
    stub(Response.json({ promptFeedback: { blockReason: "PROHIBITED_CONTENT" } })).options,
  )(request());
  assert(!blocked.ok && blocked.kind === "refusal");
});

Deno.test("a 429 is retried after the delay the API names, then succeeds", async () => {
  const limited = Response.json({
    error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "quota", details: [{ retryDelay: "12s" }] },
  }, { status: 429 });
  const s = stub(limited, ok('{"summary":"s","pages":[]}'));
  const reply = await geminiComplete("k", "m", s.options)(request());
  assertEquals(reply.ok, true);
  assertEquals(s.waits, [12_000], "it waited exactly what the API asked");
  assertEquals(s.calls.length, 2);
});

Deno.test("a wait longer than a job can hold is a rate limit at once, not a sleep", async () => {
  const daily = Response.json({
    error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "daily quota", details: [{ retryDelay: "3600s" }] },
  }, { status: 429 });
  const s = stub(daily);
  const reply = await geminiComplete("k", "m", s.options)(request());
  assert(!reply.ok && reply.kind === "rate_limit");
  assertEquals(s.waits, [], "the runner is not held for an hour");
  assertEquals(s.calls.length, 1);
  assert(3_600_000 > MAX_WAIT_MS);
});

Deno.test("retries are bounded, and a server error that persists is an error", async () => {
  const s = stub(new Response("{}", { status: 503 }));
  const reply = await geminiComplete("k", "m", { ...s.options, maxRetries: 2 })(request());
  assert(!reply.ok && reply.kind === "error");
  assertEquals(s.calls.length, 3, "the first try and two retries");
});

Deno.test("auth and billing failures are named, and are not retried", async () => {
  const badKey = Response.json({
    error: {
      code: 400,
      status: "INVALID_ARGUMENT",
      message: "API key not valid",
      details: [{ reason: "API_KEY_INVALID" }],
    },
  }, { status: 400 });
  const s = stub(badKey);
  const auth = await geminiComplete("k", "m", s.options)(request());
  assert(!auth.ok && auth.kind === "auth");
  assertEquals(s.calls.length, 1);

  const forbidden = await geminiComplete("k", "m", stub(Response.json({}, { status: 403 })).options)(request());
  assert(!forbidden.ok && forbidden.kind === "auth");

  const billing = Response.json({
    error: { code: 400, status: "FAILED_PRECONDITION", message: "free tier is not available in your country" },
  }, { status: 400 });
  const unavailable = await geminiComplete("k", "m", stub(billing).options)(request());
  assert(!unavailable.ok && unavailable.kind === "billing");
});

Deno.test("Retry-After is honoured when the body names no delay", () => {
  const response = new Response("{}", { status: 429, headers: { "retry-after": "7" } });
  assertEquals(retryDelayMs(response, undefined), 7000);
  assertEquals(retryDelayMs(new Response("{}"), undefined), undefined);
});

Deno.test("a network failure is an error reply, not an exception", async () => {
  const reply = await geminiComplete("k", "m", {
    fetch: (() => Promise.reject(new TypeError("connection reset"))) as typeof fetch,
  })(request());
  assert(!reply.ok && reply.kind === "error");
  assertStringIncludes(reply.message, "connection reset");
});
