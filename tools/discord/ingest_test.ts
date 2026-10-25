/**
 * End-to-end tests for the connector's write path, with the API stubbed.
 *
 * These cover the contract the automation actually depends on: one run writes a
 * new capture, advances the cursor, keeps SUMMARY.json inside the hub's contract,
 * omits bot noise, and — on a second run the same day — adds a suffixed capture
 * rather than rewriting the one that already exists. No token, no network.
 */

import { assert, assertEquals } from "@std/assert";
import { fromFileUrl } from "@std/path";
import { main } from "./ingest.ts";
import { validateSummary } from "./guard.ts";
import type { DiscordMessage } from "./discord.ts";

const CHANNEL = "1558888938842624093";
const TOKEN_ENV = "DCWG_DISCORD_BOT_TOKEN";
const KEY_ENV = "ANTHROPIC_API_KEY";

/** Three messages, one of them a bot's, newest-first as Discord returns them. */
function apiMessages(): DiscordMessage[] {
  return [
    {
      id: "1000",
      content: "first message",
      timestamp: "2026-08-01T10:00:00.000Z",
      author: { id: "1", username: "andy" },
      type: 0,
    },
    {
      id: "1001",
      content: "second message",
      timestamp: "2026-08-01T10:05:00.000Z",
      author: { id: "2", username: "ethan" },
      type: 0,
    },
    {
      id: "1002",
      content: "bot noise",
      timestamp: "2026-08-01T10:06:00.000Z",
      author: { id: "3", username: "helper", bot: true },
      type: 0,
    },
  ];
}

/** How the stubbed Anthropic API answers a pass. */
type ModelStub =
  /** A refused request, which is what a dead provider looks like from the connector. */
  | "down"
  /** A well-formed plan that changes no page. */
  | "empty-plan";

/** A Messages API reply carrying `text` as the model's whole answer. */
function messageReply(text: string): Response {
  return Response.json({
    id: "msg_stub",
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    content: [{ type: "text", text }],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: { input_tokens: 1200, output_tokens: 40 },
  });
}

/**
 * The APIs, stubbed: Discord answers, and the Anthropic Messages API answers the way the
 * caller wants a pass to see it.
 */
function stubFetch(model: ModelStub = "down"): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(typeof input === "object" && "url" in input ? input.url : String(input));
    if (url.hostname === "generativelanguage.googleapis.com") {
      if (model === "empty-plan") {
        const answer = JSON.stringify({ summary: "nothing durable", pages: [] });
        return Promise.resolve(Response.json({
          candidates: [{ finishReason: "STOP", content: { parts: [{ text: answer }] } }],
          usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: 40 },
        }));
      }
      return Promise.resolve(
        Response.json({ error: { code: 400, status: "INVALID_ARGUMENT", message: "stubbed provider is down" } }, {
          status: 400,
        }),
      );
    }
    if (url.hostname === "api.anthropic.com") {
      if (model === "empty-plan") {
        return Promise.resolve(
          messageReply(JSON.stringify({ summary: "nothing durable", pages: [] })),
        );
      }
      return Promise.resolve(
        Response.json({
          type: "error",
          error: { type: "invalid_request_error", message: "stubbed provider is down" },
        }, { status: 400 }),
      );
    }
    if (url.pathname === `/api/v10/channels/${CHANNEL}`) {
      return Promise.resolve(
        new Response(JSON.stringify({ id: CHANNEL, name: "talk" }), { status: 200 }),
      );
    }
    if (url.pathname === `/api/v10/channels/${CHANNEL}/messages`) {
      return Promise.resolve(
        new Response(JSON.stringify([...apiMessages()].reverse()), { status: 200 }),
      );
    }
    return Promise.resolve(new Response(JSON.stringify({ code: 10003 }), { status: 404 }));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

/** Run one CLI invocation, capturing stdout, with the fetch stub and token in place. */
async function runCli(argv: string[]): Promise<{ code: number; out: string[] }> {
  const out: string[] = [];
  const originalLog = console.log;
  console.log = (...parts: unknown[]) => out.push(parts.join(" "));
  try {
    return { code: await main(argv), out };
  } finally {
    console.log = originalLog;
  }
}

/** Run one invocation that is expected to fail, capturing stderr instead. */
async function runCliErrors(argv: string[]): Promise<{ code: number; errors: string[] }> {
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...parts: unknown[]) => errors.push(parts.join(" "));
  try {
    return { code: await main(argv), errors };
  } finally {
    console.error = originalError;
  }
}

/** Set environment variables for the length of `fn`, then put them back. */
async function withVars(
  vars: Record<string, string | undefined>,
  fn: () => Promise<void>,
): Promise<void> {
  const prior = Object.keys(vars).map((name) => [name, Deno.env.get(name)] as const);
  for (const [name, value] of Object.entries(vars)) {
    if (value === undefined) Deno.env.delete(name);
    else Deno.env.set(name, value);
  }
  try {
    await fn();
  } finally {
    for (const [name, value] of prior) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
}

/** A capture-only run: Discord stubbed, a token in place, no model key. */
async function withEnv(fn: () => Promise<void>): Promise<void> {
  const restoreFetch = stubFetch();
  try {
    await withVars({ [TOKEN_ENV]: "test-token-not-real" }, fn);
  } finally {
    restoreFetch();
  }
}

/**
 * A run whose page pass is attempted, against a stubbed model.
 *
 * A run whose page pass cannot succeed must still commit the archive. This is the whole
 * point of the queue: `raw/` and `wiki/` fail differently, and a model call, a gate, or a
 * rate limit must not be able to hold the record hostage.
 */
async function withFoldEnv(fn: () => Promise<void>, model: ModelStub = "down"): Promise<void> {
  const restoreFetch = stubFetch(model);
  try {
    await withVars({ [TOKEN_ENV]: "test-token-not-real", [KEY_ENV]: "test-key-not-real" }, fn);
  } finally {
    restoreFetch();
  }
}

/** Whether a path exists, without throwing. */
function exists(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch {
    return false;
  }
}

const BASE = ["--channel", CHANNEL, "--venue", "dcwg-talk", "--skip-wiki", "--all"];
/** The same run, but with the page pass left on, so the fold is attempted. */
const FOLDING = ["--channel", CHANNEL, "--venue", "dcwg-talk", "--all", "--attempts", "1"];

/**
 * The minimum a fold needs to find.
 *
 * The page pass reads `wiki/` before it calls a model, so a temp root with no wiki
 * would fail on a missing directory instead of on the inference under test. One page
 * is enough: this test is about what the run does when the model call dies, not about
 * what it would write if it succeeded.
 */
async function seedWiki(root: string): Promise<void> {
  await seedPrompt(root);
  await Deno.mkdir(`${root}/wiki`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/wiki/Talk_History.md`,
    "---\n'@type': schema:TechArticle\nname: Talk History\n---\n\n# Talk History\n\n" +
      "What the channel has talked about so far.\n",
  );
}

/** The repository root, so a fixture can copy the real wiki into a temp checkout. */
const REPO_ROOT = fromFileUrl(new URL("../..", import.meta.url));
/**
 * The standing instructions the pass is handed.
 *
 * The connector reads them out of the checkout rather than shipping a copy of its own,
 * so a fixture checkout has to carry them or the pass cannot start at all.
 */
async function seedPrompt(root: string): Promise<void> {
  const target = `${root}/tools/discord/prompt`;
  await Deno.mkdir(target, { recursive: true });
  await Deno.copyFile(`${REPO_ROOT}/tools/discord/prompt/dcwg-pass.md`, `${target}/dcwg-pass.md`);
}

async function copyTree(from: string, to: string): Promise<void> {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    const source = `${from}/${entry.name}`;
    const target = `${to}/${entry.name}`;
    if (entry.isDirectory) await copyTree(source, target);
    else await Deno.copyFile(source, target);
  }
}

/**
 * A checkout whose wiki already passes every gate, copied from this repository.
 *
 * A test that needs a pass to be recorded has to reach the point where the connector
 * decides a fold happened, and that only happens when the gates pass. A synthetic seed
 * cannot get there: a page with no inbound link fails the orphan gate, so a fixture pass
 * fails on its own structure and never exercises the behaviour under test. Copying the
 * real `wiki/` (plus `wiki.yml`, `layouts/`, and `assets/`, which the gates read) reuses
 * what CI already proves gate-clean on `main`.
 */
async function seedGateCleanWiki(root: string): Promise<void> {
  for (const dir of ["wiki", "layouts", "assets"]) {
    await copyTree(`${REPO_ROOT}/${dir}`, `${root}/${dir}`);
  }
  await Deno.copyFile(`${REPO_ROOT}/wiki.yml`, `${root}/wiki.yml`);
  await Deno.mkdir(`${root}/raw/discord`, { recursive: true });
  await seedPrompt(root);
}

Deno.test("one run writes an append-only capture, a cursor, and a contract-valid summary", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    const { code, out } = await runCli([...BASE, "--root", root]);
    assertEquals(code, 0);

    const files = [...Deno.readDirSync(`${root}/raw/discord`)].map((e) => e.name).sort();
    assertEquals(files, [".cursor", "2026-08-01_dcwg-talk.md", "SUMMARY.json"]);

    const capture = await Deno.readTextFile(`${root}/raw/discord/2026-08-01_dcwg-talk.md`);
    assert(capture.includes('title: "Discord #talk — 2026-08-01"'), "frontmatter title");
    assert(
      capture.includes('source: "Discord REST API, channel ' + CHANNEL),
      "frontmatter records the channel id",
    );
    assert(
      capture.includes("first message") && capture.includes("second message"),
      "verbatim text",
    );
    assert(!capture.includes("bot noise"), "bot messages must be omitted from the record");
    assert(capture.includes("(`1001`)"), "each message carries its snowflake id");

    const summary = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/SUMMARY.json`));
    assertEquals(validateSummary(summary), [], "SUMMARY.json must satisfy the hub contract");
    assertEquals(summary.status, "OK");
    assertEquals(summary.connector, "discord");
    assertEquals(summary.fetched, 2, "the bot message is not counted as fetched");
    assertEquals(summary.captures, 1);

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(cursor[CHANNEL], "1001", "the cursor advances to the newest non-bot message");

    const result = out.find((line) => line.startsWith("RESULT "));
    assert(result, "the CLI prints a machine-readable RESULT line");
    assertEquals(JSON.parse(result.slice("RESULT ".length)).status, "OK");
  });
});

Deno.test("a second run the same day adds a capture instead of rewriting the first", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    await runCli([...BASE, "--root", root]);
    const firstPath = `${root}/raw/discord/2026-08-01_dcwg-talk.md`;
    const before = await Deno.readTextFile(firstPath);

    const { code } = await runCli([...BASE, "--root", root]);
    assertEquals(code, 0);

    const files = [...Deno.readDirSync(`${root}/raw/discord`)].map((e) => e.name).sort();
    assertEquals(
      files,
      [".cursor", "2026-08-01_dcwg-talk-2.md", "2026-08-01_dcwg-talk.md", "SUMMARY.json"],
      "the second capture takes a suffix; the first is left alone",
    );
    assertEquals(
      await Deno.readTextFile(firstPath),
      before,
      "the earlier capture is byte-identical",
    );
  });
});

Deno.test("a capture the wiki has not folded is queued in the committed cursor file", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    await runCli([...BASE, "--root", root]);
    await runCli([...BASE, "--root", root]);

    // --skip-wiki folds nothing, so both captures are still owed to the wiki. The queue
    // is the record of that, and it lives in the cursor file the workflow commits, which
    // is what makes the lag survive the job that created it.
    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    const queued = cursor._pending;
    assertEquals(queued.length, 2, "one entry per capture committed");
    assertEquals(
      queued.map((fold: { capture: string }) => fold.capture),
      ["raw/discord/2026-08-01_dcwg-talk.md", "raw/discord/2026-08-01_dcwg-talk-2.md"],
      "oldest first, in the order the captures were written",
    );
    assertEquals(queued[0].venue, "dcwg-talk");
    assertEquals(queued[0].messages, 2, "the entry carries the capture's message count");
    assertEquals(queued[0].offset, 0, "nothing of it has been folded in yet");
  });
});

Deno.test("a failed page pass still commits the capture, the cursor, and a queue entry", async () => {
  await withFoldEnv(async () => {
    const root = await Deno.makeTempDir();
    await seedWiki(root);
    const { code, out } = await runCli([...FOLDING, "--root", root]);
    assertEquals(code, 1, "a stalled fold is a run that needs attention, not a silent success");

    const capture = `${root}/raw/discord/2026-08-01_dcwg-talk.md`;
    assert(
      (await Deno.readTextFile(capture)).includes("first message"),
      "the capture is on disk even though the fold failed",
    );

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(
      cursor[CHANNEL],
      "1001",
      "the fetch cursor advances with the capture, never with the wiki",
    );
    assertEquals(
      cursor._pending,
      [{
        capture: "raw/discord/2026-08-01_dcwg-talk.md",
        venue: "dcwg-talk",
        messages: 2,
        offset: 0,
        stalls: 1,
      }],
      "the fold this run owes is remembered, so the next run retries it instead of skipping material",
    );

    const summary = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/SUMMARY.json`));
    assertEquals(validateSummary(summary), [], "the summary is written on this path too");
    assertEquals(summary.status, "NEEDS_ATTENTION");

    const result = out.find((line) => line.startsWith("RESULT "));
    assert(result, "the CLI still prints a machine-readable RESULT line");
    const payload = JSON.parse(result.slice("RESULT ".length));
    assertEquals(payload.status, "NEEDS_ATTENTION");
    assertEquals(payload.captured, 2, "the run reports what it archived, not only what it folded");
    assertEquals(payload.folded, 0);
    assertEquals(payload.pending, 1);
    assertEquals(payload.stalled, "raw/discord/2026-08-01_dcwg-talk.md");
  });
});

Deno.test("a queued capture is retried before anything newer, and stays queued", async () => {
  await withFoldEnv(async () => {
    const root = await Deno.makeTempDir();
    await seedWiki(root);
    const first = await runCli([...FOLDING, "--root", root]);
    assertEquals(first.code, 1);

    // A second run the same day archives another capture, and the fold it attempts
    // is the older queued one: material this venue still owes the wiki is absorbed
    // before anything newer, and the run stops rather than folding over it.
    const second = await runCli([...FOLDING, "--root", root]);
    assertEquals(second.code, 1);

    const result = second.out.find((line) => line.startsWith("RESULT "))!;
    const payload = JSON.parse(result.slice("RESULT ".length));
    assertEquals(payload.stalled, "raw/discord/2026-08-01_dcwg-talk.md");
    assertEquals(payload.pending, 2, "both captures are still owed");

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(cursor._pending.length, 2);
    assertEquals(cursor._pending[0].capture, "raw/discord/2026-08-01_dcwg-talk.md");
    assertEquals(cursor._pending[1].capture, "raw/discord/2026-08-01_dcwg-talk-2.md");
  });
});

/**
 * A pass that runs to completion and writes nothing is not a fold.
 *
 * This is the failure that loses material in silence, and it happened: on 2026-10-18 the
 * `#brainstorm` pass over the 594-message backfill spent all 24 of its steps and 174,449
 * input tokens, changed no page, passed every gate because an untouched tree has nothing
 * to fail, advanced the queue past the capture, and reported `OK` with `pages: []`. The
 * capture stayed on disk and the wiki never carried it.
 */
Deno.test("a pass that changes no page keeps the capture queued instead of folding it", async () => {
  await withFoldEnv(async () => {
    const root = await Deno.makeTempDir();
    await seedGateCleanWiki(root);
    const { code, out } = await runCli([...FOLDING, "--root", root]);

    assertEquals(code, 1, "material the wiki did not absorb is a run that needs attention");

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(
      cursor._pending[0].offset,
      0,
      "the queue does not advance past a capture no page absorbed",
    );
    assertEquals(cursor._pending[0].stalls, 1, "a no-op pass is a run that failed to fold it");

    const summary = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/SUMMARY.json`));
    assertEquals(summary.status, "NEEDS_ATTENTION", "an unchanged tree must not report OK");

    const result = out.find((line) => line.startsWith("RESULT "));
    assert(result, "the CLI still prints a machine-readable RESULT line");
    const payload = JSON.parse(result.slice("RESULT ".length));
    assertEquals(payload.status, "NEEDS_ATTENTION");
    assertEquals(payload.folded, 0, "nothing was folded");
    assertEquals(
      payload.noop,
      "raw/discord/2026-08-01_dcwg-talk.md",
      "the report names the capture the pass wrote nothing for",
    );
    assert(
      out.some((line) => line.includes("the pass changed no page")),
      "the log says the pass ran and wrote nothing, not that the model failed",
    );
    assertEquals(payload.budget, undefined, "this was not a budget condition");
  }, "empty-plan");
});

Deno.test("a pass reports which model it runs, so a log says what it spent", async () => {
  await withFoldEnv(async () => {
    const root = await Deno.makeTempDir();
    await seedWiki(root);
    const { out } = await runCli([...FOLDING, "--model", "claude-haiku-5-5", "--root", root]);
    assert(
      out.includes("provider: anthropic (claude-haiku-5-5), billed per token"),
      `the run report names the model: ${out.join(" | ")}`,
    );
  });
});

Deno.test("a pass with no API key names both variables instead of fetching anything", async () => {
  const restoreFetch = stubFetch();
  try {
    await withVars(
      {
        [TOKEN_ENV]: "test-token-not-real",
        [KEY_ENV]: undefined,
        DCWG_ANTHROPIC_API_KEY: undefined,
      },
      async () => {
        const root = await Deno.makeTempDir();
        const { code, errors } = await runCliErrors([...FOLDING, "--root", root]);
        assertEquals(code, 2, "a missing key is configuration, not a fold to retry");
        assert(errors[0].includes("ANTHROPIC_API_KEY"));
        assert(
          errors[0].includes("DCWG_ANTHROPIC_API_KEY"),
          "the host's prefixed name is the other fix",
        );
        assertEquals(exists(`${root}/raw`), false, "nothing was fetched: the check runs first");
      },
    );
  } finally {
    restoreFetch();
  }
});

Deno.test("a flag for a removed editor or provider is refused by name", async () => {
  for (const flag of ["--editor", "--budget-share"]) {
    const { code, errors } = await runCliErrors([...BASE, flag, "x"]);
    assertEquals(code, 2, `${flag} is gone`);
    assert(errors.join("\n").includes(`unknown flag: ${flag}`), `the message names ${flag}`);
  }
});

Deno.test("a provider the connector does not have is refused by name", async () => {
  const { code, errors } = await runCliErrors([...BASE, "--provider", "openrouter"]);
  assertEquals(code, 2);
  assert(errors.join("\n").includes("--provider must be one of anthropic, gemini"));
});

Deno.test("a gemini pass with no gemini key names that variable, not the Anthropic one", async () => {
  const restoreFetch = stubFetch();
  try {
    await withVars(
      {
        [TOKEN_ENV]: "test-token-not-real",
        GEMINI_API_KEY: undefined,
        DCWG_GEMINI_API_KEY: undefined,
        [KEY_ENV]: "an-anthropic-key-is-not-a-gemini-key",
      },
      async () => {
        const root = await Deno.makeTempDir();
        const { code, errors } = await runCliErrors([...FOLDING, "--provider", "gemini", "--root", root]);
        assertEquals(code, 2);
        assert(errors[0].includes("GEMINI_API_KEY"));
        assertEquals(exists(`${root}/raw`), false, "nothing was fetched: the check runs first");
      },
    );
  } finally {
    restoreFetch();
  }
});

Deno.test("a gemini pass reaches the Gemini API, and an empty plan is a no-op fold like any other", async () => {
  const restoreFetch = stubFetch("empty-plan");
  try {
    await withVars(
      { [TOKEN_ENV]: "test-token-not-real", GEMINI_API_KEY: "test-key-not-real", [KEY_ENV]: undefined },
      async () => {
        const root = await Deno.makeTempDir();
        await seedGateCleanWiki(root);
        const { code, out } = await runCli([...FOLDING, "--provider", "gemini", "--root", root]);
        assertEquals(code, 1, "a plan that changes no page did not fold the capture");
        assert(
          out.includes("provider: gemini (gemini-2.5-flash), free tier unless the key's project is billed"),
          `the report names who answered: ${out.join(" | ")}`,
        );
        const payload = JSON.parse(out.find((line) => line.startsWith("RESULT "))!.slice("RESULT ".length));
        assertEquals(payload.noop, "raw/discord/2026-08-01_dcwg-talk.md");
      },
    );
  } finally {
    restoreFetch();
  }
});

Deno.test("--max-usd must be a positive number", async () => {
  const { code, errors } = await runCliErrors([...BASE, "--max-usd", "0"]);
  assertEquals(code, 2);
  assert(errors.join("\n").includes("--max-usd must be a positive number"));
});

Deno.test("a missing token fails loudly instead of half-running", async () => {
  const restoreFetch = stubFetch();
  const prior = Deno.env.get(TOKEN_ENV);
  Deno.env.delete(TOKEN_ENV);
  try {
    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...parts: unknown[]) => errors.push(parts.join(" "));
    let code: number;
    try {
      code = await main([...BASE, "--root", await Deno.makeTempDir()]);
    } finally {
      console.error = originalError;
    }
    assertEquals(code, 2);
    assert(
      errors.join("\n").includes(TOKEN_ENV),
      "the message names the variable to set",
    );
  } finally {
    restoreFetch();
    if (prior !== undefined) Deno.env.set(TOKEN_ENV, prior);
  }
});

/**
 * The parser refuses what it does not recognise. `@std/cli/parse-args` ignores an
 * unknown flag by default and reports a value-less string flag as `""`, so both
 * refusals are the connector's own: without them a misspelled `--drain-max` would
 * run on the default and a typo would pass review as a green run.
 */
Deno.test("the CLI refuses a flag it cannot honour instead of ignoring it", async () => {
  const cases: Array<[string[], string]> = [
    [["--bogus"], "unknown flag: --bogus"],
    [["--channel"], "--channel needs a value"],
    [["--channel", CHANNEL, "--venue", "dcwg-talk", "--tag"], "--tag needs a value"],
  ];
  for (const [argv, expected] of cases) {
    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...parts: unknown[]) => errors.push(parts.join(" "));
    let code: number;
    try {
      code = await main(argv);
    } finally {
      console.error = originalError;
    }
    assertEquals(code, 2, `exit 2 for ${JSON.stringify(argv)}`);
    assert(
      errors.join("\n").includes(expected),
      `${JSON.stringify(argv)} should report '${expected}', got '${errors.join(" ")}'`,
    );
  }
});

Deno.test("an unrecognized token fails the run instead of being ignored", async () => {
  // The parser's own default is to ignore an unknown flag, which would let a
  // workflow run on a default nobody asked for and report success.
  const unknownFlag = await runCliErrors([...BASE, "--drain-mx", "3"]);
  assertEquals(unknownFlag.code, 2);
  assert(
    unknownFlag.errors.join("\n").includes("unknown flag: --drain-mx"),
    "the message names the flag",
  );

  const afterSeparator = await runCliErrors([...BASE, "--", "stray"]);
  assertEquals(afterSeparator.code, 2);
  assert(
    afterSeparator.errors.join("\n").includes("unknown flag: stray"),
    "a token after -- is refused too",
  );
});

Deno.test("a flag passed with no value fails the run", async () => {
  const { code, errors } = await runCliErrors([...BASE, "--model"]);
  assertEquals(code, 2);
  assert(errors.join("\n").includes("--model needs a value"), "the message names the flag");
});

Deno.test("--tag replaces the default tags instead of adding to them", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    const { code } = await runCli([...BASE, "--root", root, "--tag", "fork"]);
    assertEquals(code, 0);

    const capture = await Deno.readTextFile(`${root}/raw/discord/2026-08-01_dcwg-talk.md`);
    assert(capture.includes('- "fork"'), "the explicit tag is recorded");
    assert(
      !capture.includes('- "dcwg"'),
      "the first explicit --tag replaces the defaults rather than adding to them",
    );
  });
});

Deno.test("small queued captures are folded in one pass, and --batch-chars 0 folds them one at a time", async () => {
  await withFoldEnv(async () => {
    const root = await Deno.makeTempDir();
    await seedGateCleanWiki(root);
    await runCli([...BASE, "--root", root]);
    await runCli([...BASE, "--root", root]);

    const batched = await runCli([...FOLDING, "--root", root]);
    const line = batched.out.find((entry) => entry.startsWith("batching "));
    assert(line, "two fresh small captures share a fold");
    assert(line.includes("2026-08-01_dcwg-talk.md") && line.includes("2026-08-01_dcwg-talk-2.md"), line);

    const alone = await runCli([...FOLDING, "--batch-chars", "0", "--root", root]);
    assert(!alone.out.some((entry) => entry.startsWith("batching ")), "0 turns batching off");
  }, "empty-plan");
});

Deno.test("--batch-chars must be a non-negative integer", async () => {
  const errors: string[] = [];
  const originalError = console.error;
  console.error = (...parts: unknown[]) => errors.push(parts.join(" "));
  try {
    assertEquals(await main(["--channel", CHANNEL, "--venue", "dcwg-talk", "--batch-chars", "1.5"]), 2);
  } finally {
    console.error = originalError;
  }
  assert(errors.join("\n").includes("--batch-chars must be a non-negative integer"));
});
