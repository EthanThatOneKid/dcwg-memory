import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import {
  agentSteps,
  DEFAULT_AGENT_STEPS,
  diffTree,
  outsideWiki,
  parseRateLimit,
  parseUsage,
  readAgentSteps,
  renderBrief,
  restoreTree,
  snapshotTree,
} from "./opencode.ts";

async function withTempTree(
  files: Record<string, string>,
  fn: (root: string) => Promise<void>,
): Promise<void> {
  const root = await Deno.makeTempDir();
  try {
    for (const [path, text] of Object.entries(files)) {
      const full = `${root}/${path}`;
      await Deno.mkdir(full.slice(0, full.lastIndexOf("/")), { recursive: true });
      await Deno.writeTextFile(full, text);
    }
    await fn(root);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
}

Deno.test("diffTree reports added, removed, and modified paths", async () => {
  await withTempTree({ "wiki/A.md": "one", "wiki/Keep.md": "same" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.writeTextFile(`${root}/wiki/A.md`, "two");
    await Deno.writeTextFile(`${root}/wiki/New.md`, "new");
    await Deno.remove(`${root}/wiki/Keep.md`);
    const after = await snapshotTree(root);
    assertEquals(diffTree(before, after), ["wiki/A.md", "wiki/Keep.md", "wiki/New.md"]);
  });
});

Deno.test("diffTree is empty when nothing changed", async () => {
  await withTempTree({ "wiki/A.md": "one", "raw/x.md": "y" }, async (root) => {
    assertEquals(diffTree(await snapshotTree(root), await snapshotTree(root)), []);
  });
});

Deno.test("the scratch directories are outside the snapshot", async () => {
  await withTempTree({ "wiki/A.md": "one" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.mkdir(`${root}/.dcwg`, { recursive: true });
    await Deno.writeTextFile(`${root}/.dcwg/brief.md`, "the brief");
    await Deno.mkdir(`${root}/.opencode/node_modules`, { recursive: true });
    await Deno.writeTextFile(`${root}/.opencode/node_modules/x.js`, "state");
    assertEquals(diffTree(before, await snapshotTree(root)), []);
  });
});

Deno.test("restoreTree returns the tree exactly as snapshotted", async () => {
  await withTempTree({ "wiki/A.md": "one", "raw/capture.md": "evidence" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.writeTextFile(`${root}/wiki/A.md`, "clobbered");
    await Deno.writeTextFile(`${root}/raw/capture.md`, "rewritten");
    await Deno.writeTextFile(`${root}/wiki/Stray.md`, "new page");
    await Deno.remove(`${root}/wiki`, { recursive: true }); // as if a whole directory went
    await restoreTree(root, before);
    assertEquals(await Deno.readTextFile(`${root}/wiki/A.md`), "one");
    assertEquals(await Deno.readTextFile(`${root}/raw/capture.md`), "evidence");
    assertEquals(diffTree(before, await snapshotTree(root)), []);
  });
});

Deno.test("outsideWiki keeps only what may not be written", () => {
  assertEquals(
    outsideWiki(["wiki/A.md", "raw/c.md", "wiki.yml", "tools/x.ts", "wiki/B.md"]),
    ["raw/c.md", "wiki.yml", "tools/x.ts"],
  );
  assertEquals(outsideWiki(["wiki/Captures.md"]), []);
});

Deno.test("renderBrief points at the capture instead of inlining it", () => {
  const brief = renderBrief({
    capturePath: "raw/discord/2026-10-16_dcwg-brainstorm.md",
    channelName: "brainstorm",
    messageCount: 554,
    lastUpdated: "2026-10-15T17:47:35Z",
    forum: false,
  });
  assertStringIncludes(brief, "`raw/discord/2026-10-16_dcwg-brainstorm.md`");
  assertStringIncludes(brief, "Read that file in full before you write anything.");
  assertStringIncludes(brief, "CHANNEL: #brainstorm");
  assertStringIncludes(brief, "NEW MESSAGES: 554");
  assertStringIncludes(brief, "LAST UPDATED: 2026-10-15T17:47:35Z");
  assertStringIncludes(brief, "Change only files under `wiki/`");
  assert(!brief.includes("VENUE TYPE: forum"));
  assert(!brief.includes("PREVIOUS ATTEMPT WAS REJECTED"));
});

Deno.test("renderBrief names every forum post, because each needs its own page", () => {
  const brief = renderBrief({
    capturePath: "raw/discord/2026-10-16_dcwg-propose.md",
    channelName: "propose",
    messageCount: 142,
    forum: true,
    threads: [
      { id: "1559218400000000001", title: "Deno fork options and naming" },
      { id: "1559218400000000002", title: "Stewardship model" },
    ],
  });
  assertStringIncludes(brief, "VENUE TYPE: forum");
  assertStringIncludes(brief, 'wazoo:thread: "<thread id>"');
  assertStringIncludes(brief, "thread 1559218400000000001: Deno fork options and naming");
  assertStringIncludes(brief, "thread 1559218400000000002: Stewardship model");
});

Deno.test("renderBrief carries a rejection forward so a retry can fix it", () => {
  const brief = renderBrief({
    capturePath: "raw/discord/2026-10-16_dcwg-talk.md",
    channelName: "talk",
    messageCount: 3,
    forum: false,
    feedback: "FAIL  orphans\nno inbound link from another page:\n  - wiki/New_Claim.md",
  });
  assertStringIncludes(brief, "YOUR PREVIOUS ATTEMPT WAS REJECTED");
  assertStringIncludes(brief, "Nothing from it was kept");
  assertStringIncludes(brief, "wiki/New_Claim.md");
});

Deno.test("parseUsage sums every step, because a step is one model request", () => {
  const stream = [
    JSON.stringify({
      type: "step_finish",
      sessionID: "ses_1",
      part: { tokens: { input: 6870, output: 34, reasoning: 54 }, cost: 0 },
    }),
    "not json at all",
    "",
    JSON.stringify({ type: "text", part: { text: "hello" } }),
    JSON.stringify({
      type: "step_finish",
      sessionID: "ses_1",
      part: { tokens: { input: 900, output: 200 }, cost: 0.001 },
    }),
  ].join("\n");
  assertEquals(parseUsage(stream), {
    steps: 2,
    inputTokens: 7770,
    outputTokens: 234,
    reasoningTokens: 54,
    cost: 0.001,
    sessionId: "ses_1",
  });
});

Deno.test("parseUsage on a stream with no steps is a clean zero", () => {
  assertEquals(parseUsage(""), {
    steps: 0,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    cost: 0,
  });
});

Deno.test("parseRateLimit lifts the provider's own message out of an error event", () => {
  // The real event, measured 2026-10-17 (run 39052618604), on a day whose free-model
  // cap was already spent. This message is the whole difference between "the material
  // could not be folded" and "nothing was ever asked of the material".
  const stream = [
    JSON.stringify({ type: "step_start", part: { id: "prt_1" } }),
    JSON.stringify({
      type: "error",
      error: {
        name: "APIError",
        data: {
          message: "Rate limit exceeded: free-models-per-day. " +
            "Add 10 credits to unlock 1000 free model requests per day",
          statusCode: 429,
          responseHeaders: { "x-ratelimit-limit": "50", "x-ratelimit-remaining": "0" },
        },
      },
    }),
  ].join("\n");
  assertEquals(
    parseRateLimit(stream),
    "Rate limit exceeded: free-models-per-day. " +
      "Add 10 credits to unlock 1000 free model requests per day",
  );
});

Deno.test("parseRateLimit keeps the last one, which is the failure the run ended on", () => {
  const stream = [
    JSON.stringify({
      type: "error",
      error: { data: { message: "Rate limit exceeded: first", statusCode: 429 } },
    }),
    JSON.stringify({
      type: "error",
      error: { data: { message: "Rate limit exceeded: second", statusCode: 429 } },
    }),
  ].join("\n");
  assertEquals(parseRateLimit(stream), "Rate limit exceeded: second");
});

Deno.test("parseRateLimit recognises a 429 that does not spell it out", () => {
  const stream = JSON.stringify({ type: "error", error: { data: { statusCode: 429 } } });
  assertEquals(parseRateLimit(stream), "HTTP 429 from the model provider");
});

Deno.test("parseRateLimit is undefined for a pass that failed on its own work", () => {
  // A gate rejection, a crash, a timeout: none of them is a provider cap, and every
  // one of them must keep counting as a stall.
  const stream = [
    "not json at all",
    JSON.stringify({ type: "text", part: { text: "orphans FAILED" } }),
    JSON.stringify({
      type: "error",
      error: { name: "APIError", data: { message: "Invalid tool call", statusCode: 400 } },
    }),
  ].join("\n");
  assertEquals(parseRateLimit(stream), undefined);
  assertEquals(parseRateLimit(""), undefined);
});

Deno.test("agentSteps reads the agent's own ceiling, and falls back when it cannot", () => {
  assertEquals(agentSteps({ agent: { dcwg: { steps: 24 } } }, "dcwg"), 24);
  assertEquals(agentSteps({ agent: { dcwg: { steps: 8 } } }, "dcwg"), 8);
  // A config that names another agent, or names no ceiling, does not bound this one.
  assertEquals(agentSteps({ agent: { other: { steps: 5 } } }, "dcwg"), DEFAULT_AGENT_STEPS);
  assertEquals(agentSteps({ agent: { dcwg: {} } }, "dcwg"), DEFAULT_AGENT_STEPS);
  // A ceiling that is not a usable count is not a ceiling: zero would defer every fold,
  // and a non-integer is not a number of requests.
  assertEquals(agentSteps({ agent: { dcwg: { steps: 0 } } }, "dcwg"), DEFAULT_AGENT_STEPS);
  assertEquals(agentSteps({ agent: { dcwg: { steps: 2.5 } } }, "dcwg"), DEFAULT_AGENT_STEPS);
  assertEquals(agentSteps({ agent: { dcwg: { steps: "24" } } }, "dcwg"), DEFAULT_AGENT_STEPS);
  assertEquals(agentSteps(undefined, "dcwg"), DEFAULT_AGENT_STEPS);
  assertEquals(agentSteps("not a config", "dcwg"), DEFAULT_AGENT_STEPS);
});

Deno.test("readAgentSteps reads the repo's own opencode.json", async () => {
  await withTempTree(
    { "opencode.json": JSON.stringify({ agent: { dcwg: { steps: 12 } } }) },
    async (root) => {
      assertEquals(await readAgentSteps(root, "dcwg"), 12);
    },
  );
  // A missing or unparsable config answers the fallback rather than failing the run:
  // a budget decision must not be the thing that stops a capture.
  await withTempTree({ "opencode.json": "{ not json" }, async (root) => {
    assertEquals(await readAgentSteps(root, "dcwg"), DEFAULT_AGENT_STEPS);
  });
  await withTempTree({}, async (root) => {
    assertEquals(await readAgentSteps(root, "dcwg"), DEFAULT_AGENT_STEPS);
  });
});
