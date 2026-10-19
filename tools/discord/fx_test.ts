/**
 * The agent module on its own: what a pass may change, what it spent, and what the
 * envelope fx actually returns looks like.
 *
 * The spend figures matter more here than they did on opencode. The Gateway bills tokens,
 * so a pass's own `usage` is what the credits arithmetic is built from, and the envelope
 * is parsed from a single JSON object rather than accumulated from an event stream. The
 * envelope pinned below is the real one a 594-message `#brainstorm` pass returned on
 * 2026-10-18: 39 tool calls, 966,946 input and 19,488 output tokens, and a `recovery`
 * block from retrying through a rate limit.
 */
import { assert, assertEquals, assertRejects, assertStringIncludes } from "@std/assert";
import {
  DEFAULT_AGENT_STEPS,
  diffTree,
  FX_CONFIG_PATH,
  fxSteps,
  fxUsage,
  outsideWiki,
  parseProviderRefusal,
  parseFxResult,
  readFxSteps,
  readStandingInstructions,
  renderBrief,
  restoreTree,
  snapshotTree,
  STANDING_INSTRUCTIONS_PATH,
} from "./fx.ts";

/** The measured envelope, trimmed to the keys this module reads. */
const MEASURED_ENVELOPE = {
  output: "## Deno fork options\n\n- The naming question is unresolved.",
  final_output: "## Deno fork options",
  exit_code: 0,
  model: "nvidia/nemotron-3.5-lightning-free",
  resolved_provider: "nvidia",
  session_id: "",
  steps: 39,
  tool_calls: [
    { name: "glob_files", status: "success" },
    { name: "read_file", status: "success" },
    { name: "edit_file", status: "success" },
  ],
  usage: { input_tokens: 966946, output_tokens: 19488 },
  recovery: {
    state: "recovered",
    kind: "auto_recovered",
    attempt: 13,
    message: "\u2713 recovered \u00b7 succeeded on attempt 13",
  },
};

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
  // `.fx` is fx's own state and `.dcwg` is the connector's brief and marker. Both are
  // written inside the repo root during a pass, so both have to be invisible to the
  // tree compare, or every pass would report them as files written outside wiki/.
  await withTempTree({ "wiki/A.md": "one" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.mkdir(`${root}/.dcwg`, { recursive: true });
    await Deno.writeTextFile(`${root}/.dcwg/brief.md`, "the brief");
    await Deno.mkdir(`${root}/.fx`, { recursive: true });
    await Deno.writeTextFile(`${root}/.fx/sessions.json`, "state");
    await Deno.mkdir(`${root}/_site/dcwg-memory`, { recursive: true });
    await Deno.writeTextFile(`${root}/_site/dcwg-memory/index.html`, "built");
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

Deno.test("parseFxResult reads the envelope the CLI actually emits", () => {
  const result = parseFxResult(JSON.stringify(MEASURED_ENVELOPE));
  assertEquals(result?.exit_code, 0);
  assertEquals(result?.steps, 39);
  assertEquals(result?.model, "nvidia/nemotron-3.5-lightning-free");
  assertEquals(result?.usage, { input_tokens: 966946, output_tokens: 19488 });
});

Deno.test("parseFxResult survives a stray line around the envelope", () => {
  // The JSON is stdout's whole content today. A diagnostic that leaked onto stdout
  // should cost the run nothing, so the last line that parses is accepted too.
  const noisy = `warning: something\n${JSON.stringify(MEASURED_ENVELOPE)}\n`;
  assertEquals(parseFxResult(noisy)?.steps, 39);
});

Deno.test("parseFxResult is undefined when there is no envelope at all", () => {
  // A crash before the first request, an empty run, or output that is not JSON: the
  // caller reads this as "nothing was spent and nothing was written".
  for (const stdout of ["", "   ", "not json", "{ broken", "<html>nope</html>", '"a string"']) {
    assertEquals(parseFxResult(stdout), undefined, `for ${JSON.stringify(stdout)}`);
  }
});

Deno.test("fxUsage reports the spend and the model, and zero when there is no envelope", () => {
  assertEquals(fxUsage(parseFxResult(JSON.stringify(MEASURED_ENVELOPE))), {
    steps: 39,
    inputTokens: 966946,
    outputTokens: 19488,
    model: "nvidia/nemotron-3.5-lightning-free",
    recovery: "recovered (auto_recovered) after 13 attempt(s)",
  });
  assertEquals(fxUsage(undefined), { steps: 0, inputTokens: 0, outputTokens: 0 });
  // fx reports null for a count it could not observe, which must not become NaN.
  assertEquals(fxUsage({ steps: 3, usage: { input_tokens: null, output_tokens: null } }), {
    steps: 3,
    inputTokens: 0,
    outputTokens: 0,
  });
});

Deno.test("parseProviderRefusal lifts a rate limit out of the recovery block", () => {
  const envelope = {
    ...MEASURED_ENVELOPE,
    exit_code: 1,
    recovery: {
      state: "failed",
      kind: "rate_limited",
      attempt: 10,
      message: "429 Too Many Requests from the AI Gateway",
    },
  };
  assertStringIncludes(
    String(parseProviderRefusal(envelope, "")),
    "429 Too Many Requests from the AI Gateway",
  );
});

Deno.test("parseProviderRefusal reads stderr, which is where a failure before any request lands", () => {
  // fx writes diagnostics to stderr, so a pass rejected at the gateway has no envelope
  // to read and only this to go on.
  const stderr =
    "fx: error: AI Gateway: rate limit exceeded for minimax/minimax-m3.1-flash";
  assertStringIncludes(String(parseProviderRefusal(undefined, stderr)), "rate limit exceeded");
});

Deno.test("parseProviderRefusal counts a model this account cannot reach as a refusal", () => {
  // The refusal that actually happened on 2026-10-19 named no rate limit at all: the
  // Gateway answered 403 no_providers_available, and a detector that knew only 429 read
  // it as material the model could not fold, so both attempts went to a model the
  // account cannot use and the fold was reported as a stall.
  const stderr =
    'fx: error: API access denied · HTTP 403 · {"error":{"type":"no_providers_available",' +
    '"message":"Free tier users do not have access to this model"}}';
  const refusal = String(parseProviderRefusal(undefined, stderr));
  assertStringIncludes(refusal, "403");
  assertStringIncludes(refusal, "no_providers_available");
});

Deno.test("parseProviderRefusal is undefined for a pass that failed on its own work", () => {
  // A gate rejection, a timeout, a refused edit: none of them is a provider refusal, and
  // every one of them must keep counting as a stall rather than as an availability
  // condition.
  assertEquals(parseProviderRefusal(undefined, ""), undefined);
  assertEquals(parseProviderRefusal({ exit_code: 1, steps: 6 }, ""), undefined);
  assertEquals(parseProviderRefusal(undefined, "error: no wiki page was written"), undefined);
  assertEquals(
    parseProviderRefusal(MEASURED_ENVELOPE, "info: recovered after 13 attempts"),
    undefined,
  );
  // A count is not a refusal. `403` and `429` are read as words, so a token count or a
  // step number that happens to contain those digits must not move the rotation.
  assertEquals(parseProviderRefusal({ steps: 429 }, ""), undefined);
  assertEquals(parseProviderRefusal(undefined, "wrote 4032 bytes to wiki/Thing.md"), undefined);
});

Deno.test("fxSteps reads the ceiling, and refuses a value that is not one", () => {
  assertEquals(fxSteps({ max_agent_steps: 24 }), 24);
  assertEquals(fxSteps({ max_agent_steps: 6 }), 6);
  // Zero would defer every fold, a fraction is not a number of steps, and a string is
  // not a number at all.
  assertEquals(fxSteps({ max_agent_steps: 0 }), DEFAULT_AGENT_STEPS);
  assertEquals(fxSteps({ max_agent_steps: 2.5 }), DEFAULT_AGENT_STEPS);
  assertEquals(fxSteps({ max_agent_steps: "24" }), DEFAULT_AGENT_STEPS);
  assertEquals(fxSteps({}), DEFAULT_AGENT_STEPS);
  assertEquals(fxSteps(undefined), DEFAULT_AGENT_STEPS);
  assertEquals(fxSteps("not a config"), DEFAULT_AGENT_STEPS);
});

Deno.test("readFxSteps reads the repo's own .fx.json and falls back when it cannot", async () => {
  await withTempTree(
    { [FX_CONFIG_PATH]: JSON.stringify({ max_agent_steps: 12 }) },
    async (root) => {
      assertEquals(await readFxSteps(root), 12);
    },
  );
  await withTempTree({ [FX_CONFIG_PATH]: "{ not json" }, async (root) => {
    assertEquals(await readFxSteps(root), DEFAULT_AGENT_STEPS);
  });
  await withTempTree({}, async (root) => {
    assertEquals(await readFxSteps(root), DEFAULT_AGENT_STEPS);
  });
});

Deno.test("readStandingInstructions reads the prompt file and refuses to run without it", async () => {
  // A pass with no standing instructions is a pass that writes whatever it likes, so a
  // missing prompt file fails the run instead of running the model ungoverned.
  await withTempTree(
    { [STANDING_INSTRUCTIONS_PATH]: "You maintain the wiki.\n" },
    async (root) => {
      assertEquals(await readStandingInstructions(root), "You maintain the wiki.\n");
    },
  );
  await withTempTree({}, async (root) => {
    await assertRejects(() => readStandingInstructions(root), Deno.errors.NotFound);
  });
});
