/**
 * The pass's failure paths, exercised without a live key: the output budget it
 * sends, and the difference between a model call that dies and a proposal the
 * write guard refuses. The distinction matters because the connector reports
 * them differently and the first one looked like the second on 2026-10-15.
 */
import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import type { PassCallArgs, PassGenerate } from "./wiki.ts";
import { MAX_OUTPUT_TOKENS, runWikiPass } from "./wiki.ts";

const PAGE = `---
type: concept
name: Deno Runtime
---
The runtime is a single binary.
`;

function stubPass(
  result: unknown,
): { generate: PassGenerate; calls: PassCallArgs[] } {
  const calls: PassCallArgs[] = [];
  const generate: PassGenerate = (args) => {
    calls.push(args);
    return Promise.resolve(result as never);
  };
  return { generate, calls };
}

function passInput(root: string, generate: PassGenerate) {
  return {
    root,
    messages: [],
    channelName: "talk",
    capturePath: "raw/discord/2026-10-15_talk.md",
    cursorBefore: null,
    provider: "openrouter" as const,
    apiKey: "test-key",
    pages: [{ path: "wiki/Deno_Runtime.md", text: PAGE }],
    captureText: "# talk\n",
    generate,
  };
}

Deno.test("the pass sends an output budget and owns its own retries", async () => {
  const root = await Deno.makeTempDir({ prefix: "dcwg-pass-" });
  const { generate, calls } = stubPass({
    output: { edits: [{ path: "wiki/Deno_Runtime.md", content: PAGE }], notes: "" },
    usage: { inputTokens: 10, outputTokens: 5 },
  });

  const wiki = await runWikiPass(passInput(root, generate));

  assertEquals(calls.length, 1);
  assertEquals(calls[0].maxOutputTokens, MAX_OUTPUT_TOKENS);
  // The connector's attempt loop is the retry, so the SDK must not retry too.
  assertEquals(calls[0].maxRetries, 0);
  assert("edits" in wiki);
});

Deno.test("a dead model call is a model failure, not a guard rejection", async () => {
  const root = await Deno.makeTempDir({ prefix: "dcwg-pass-" });
  const generate: PassGenerate = () =>
    Promise.reject(new Error("AI_NoOutputGeneratedError: No output generated"));

  const wiki = await runWikiPass(passInput(root, generate));

  assert("problems" in wiki);
  assertEquals(wiki.failure, "model");
  assertStringIncludes(wiki.problems[0], "the model call failed");
  assertStringIncludes(wiki.problems[0], "AI_NoOutputGeneratedError");
});

Deno.test("a proposal that breaks a rule is labelled as the guard", async () => {
  const root = await Deno.makeTempDir({ prefix: "dcwg-pass-" });
  // raw/ is append-only evidence, so a pass may never write there.
  const { generate } = stubPass({
    output: {
      edits: [{ path: "raw/discord/2026-10-15_talk.md", content: "rewritten\n" }],
      notes: "",
    },
  });

  const wiki = await runWikiPass(passInput(root, generate));

  assert("problems" in wiki);
  assertEquals(wiki.failure, "guard");
});
