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
import { GATEWAY_DEFAULT_MODEL, GATEWAY_FALLBACK_MODELS } from "./providers.ts";
import type { DiscordMessage } from "./discord.ts";

const CHANNEL = "1558888938842624093";
const TOKEN_ENV = "DCWG_DISCORD_BOT_TOKEN";

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

/**
 * The API, stubbed: Discord answers, and the Gateway answers whatever balance and
 * catalogue the caller wants a run to see.
 *
 * The balance body is part of the stub because the connector's governance reads it
 * before every fold, so a test of what a run does with a spent balance has to be able
 * to tell it the balance is spent.
 */
function stubFetch(keyBody?: unknown, modelsBody?: unknown): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.hostname === "ai-gateway.vercel.sh") {
      if (url.pathname === "/v1/models") {
        return Promise.resolve(Response.json(modelsBody ?? MODEL_CATALOGUE));
      }
      return Promise.resolve(Response.json(keyBody ?? {}));
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

async function withEnv(fn: () => Promise<void>): Promise<void> {
  const restoreFetch = stubFetch();
  const prior = Deno.env.get(TOKEN_ENV);
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  try {
    await fn();
  } finally {
    restoreFetch();
    if (prior === undefined) Deno.env.delete(TOKEN_ENV);
    else Deno.env.set(TOKEN_ENV, prior);
  }
}
/**
 * Run a test with a stubbed API that reports a free-model budget, and a stand-in for
 * the page-pass CLI that records being started.
 *
 * Both halves matter. The budget decides whether the connector starts a pass at all,
 * and the stand-in is how "it did not start one" becomes an observation instead of an
 * assumption: a run that never spawns it never writes the marker.
 */
async function withBudgetEnv(
  keyBody: unknown,
  fn: (bin: string, marker: string) => Promise<void>,
  /** What the stand-in pass exits with. 0 is a pass that ran and wrote nothing. */
  exitCode = 1,
) {
  const restoreFetch = stubFetch(keyBody);
  const dir = await Deno.makeTempDir();
  const bin = `${dir}/fx-stand-in`;
  const marker = `${dir}/started`;
  await Deno.writeTextFile(bin, `#!/bin/sh\ntouch '${marker}'\nexit ${exitCode}\n`);
  await Deno.chmod(bin, 0o755);
  const priorToken = Deno.env.get(TOKEN_ENV);
  const priorKey = Deno.env.get("AI_GATEWAY_API_KEY");
  const priorBin = Deno.env.get("DCWG_FX_BIN");
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  Deno.env.set("AI_GATEWAY_API_KEY", "test-key-not-real");
  Deno.env.set("DCWG_FX_BIN", bin);
  try {
    await fn(bin, marker);
  } finally {
    restoreFetch();
    const prior: Array<[string, string | undefined]> = [
      [TOKEN_ENV, priorToken],
      ["AI_GATEWAY_API_KEY", priorKey],
      ["DCWG_FX_BIN", priorBin],
    ];
    for (const [name, value] of prior) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
    await Deno.remove(dir, { recursive: true });
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

/** The balance body the Gateway returned on 2026-10-18, spent. */
const SPENT_KEY_BODY = { balance: "0.00", total_used: "5.000000000" };

const BASE = ["--channel", CHANNEL, "--venue", "dcwg-talk", "--skip-wiki", "--all"];
/** The same run, but with the page pass left on, so the fold is attempted. */
const FOLDING = [
  "--channel",
  CHANNEL,
  "--venue",
  "dcwg-talk",
  "--all",
  "--attempts",
  "1",
  "--editor",
  "api",
];

/**
 * A run whose page pass cannot succeed must still commit the archive.
 *
 * This is the whole point of the queue: `raw/` and `wiki/` fail differently, and a
 * model call, a gate, or a rate limit must not be able to hold the record hostage.
 * The stub answers Discord and fails everything else, which is what a dead
 * provider looks like from the connector's side.
 */
async function withFoldEnv(fn: () => Promise<void>): Promise<void> {
  const restoreFetch = stubFetch();
  const priorToken = Deno.env.get(TOKEN_ENV);
  const priorKey = Deno.env.get("AI_GATEWAY_API_KEY");
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  Deno.env.set("AI_GATEWAY_API_KEY", "test-key-not-real");
  try {
    await fn();
  } finally {
    restoreFetch();
    const prior: Array<[string, string | undefined]> = [
      [TOKEN_ENV, priorToken],
      ["AI_GATEWAY_API_KEY", priorKey],
    ];
    for (const [name, value] of prior) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
}

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
 * The standing instructions the fx pass is handed.
 *
 * The connector reads them out of the checkout rather than shipping a copy of its own,
 * so a fixture checkout has to carry them or the pass cannot start at all.
 */
async function seedPrompt(root: string): Promise<void> {
  const target = `${root}/tools/discord/prompt`;
  await Deno.mkdir(target, { recursive: true });
  await Deno.copyFile(`${REPO_ROOT}/tools/discord/prompt/dcwg.md`, `${target}/dcwg.md`);
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
  await withBudgetEnv(FRESH_KEY_BODY, async (_bin, marker) => {
    const root = await Deno.makeTempDir();
    await seedGateCleanWiki(root);
    const { code, out } = await runCli([...AGENTIC, "--budget-share", "1/1", "--root", root]);

    assertEquals(code, 1, "material the wiki did not absorb is a run that needs attention");
    assertEquals(exists(marker), true, "the pass ran; it wrote nothing");

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
  }, 0);
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

/** A balance with room in it, as the Gateway reports one. */
const FRESH_KEY_BODY = { balance: "0.04", total_used: "1.69" };

/**
 * A model the Gateway charges for, and the catalogue entry that prices it.
 *
 * A free model is not governed by the balance at all: it costs nothing, so its share buys
 * every attempt the caller asked for. These tests are about the arithmetic that does
 * apply, which needs a pass that costs something, so they pin this model.
 */
const PAID_MODEL = "alibaba/qwen3.7-flash";
const MODEL_CATALOGUE = {
  data: [{ id: PAID_MODEL, pricing: { input: "0.00000003", output: "0.00000013" } }],
};

/**
 * The folding invocation on the agentic editor, which is the one the budget governs.
 *
 * `--attempts 2` is deliberate: it is the configuration whose worst case the balance
 * cannot pay for at a priced model, so the assertions below are about the run cutting
 * that ceiling down to what the balance actually buys.
 */
const AGENTIC = [
  "--channel",
  CHANNEL,
  "--venue",
  "dcwg-talk",
  "--all",
  "--editor",
  "fx",
  "--model",
  PAID_MODEL,
  "--attempts",
  "2",
];

Deno.test("a spent day defers the fold without starting a pass", async () => {
  await withBudgetEnv(SPENT_KEY_BODY, async (_bin, marker) => {
    const root = await Deno.makeTempDir();
    await seedWiki(root);
    const { code, out } = await runCli([...AGENTIC, "--budget-share", "1/2", "--root", root]);

    assertEquals(code, 1, "the wiki is still behind, so the run needs attention");
    assertEquals(exists(marker), false, "a pass the day cannot pay for is never started");
    assert(
      out.some((line) => line.includes("fold deferred")),
      "the run names the deferral rather than reporting a fold failure",
    );

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(
      cursor._pending[0].stalls,
      0,
      "a budget condition is not a stall: no attempt judged the material",
    );

    const result = out.find((line) => line.startsWith("RESULT "));
    assert(result, "the CLI still prints a machine-readable RESULT line");
    const payload = JSON.parse(result.slice("RESULT ".length));
    assertEquals(payload.status, "NEEDS_ATTENTION");
    assertEquals(payload.attempts, 0, "the report says no attempt ran");
    assert(
      String(payload.budget).includes("cannot pay for one pass"),
      "the payload says which constraint was hit",
    );
    assertEquals(payload.stalled, undefined, "a deferred fold is not reported as a stall");
  });
});

Deno.test("a share that can pay for one pass starts it, and its failure is a stall", async () => {
  await withBudgetEnv(FRESH_KEY_BODY, async (_bin, marker) => {
    const root = await Deno.makeTempDir();
    await seedWiki(root);
    const { code, out } = await runCli([...AGENTIC, "--budget-share", "1/1", "--root", root]);

    assertEquals(code, 1, "the stand-in pass fails, so the run needs attention");
    assertEquals(exists(marker), true, "a pass the day can pay for is started");

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(
      cursor._pending[0].stalls,
      1,
      "this pass reached the model and failed, which is what a stall counts",
    );

    const result = out.find((line) => line.startsWith("RESULT "));
    const payload = JSON.parse(result!.slice("RESULT ".length));
    assertEquals(
      payload.attempts,
      1,
      "a $0.04 share buys one $0.03 pass, not the two --attempts asked for",
    );
    assertEquals(payload.budget, undefined, "this run was not budget-blocked");
    assertEquals(payload.stalled, "raw/discord/2026-08-01_dcwg-talk.md");
  });
});

/**
 * The provider is a precondition rather than a hope.
 *
 * A run that reached a model on a provider this machine cannot serve would spend its
 * whole time budget to learn what one line of checking says first, so the connector
 * resolves the provider, its key, and fx's own settings before it fetches anything.
 */
async function withProviderEnv(
  provider: string,
  fn: () => Promise<void>,
  options: { settings?: unknown; key?: string | undefined; gatewayKey?: string | undefined } = {},
): Promise<void> {
  const prior: Array<[string, string | undefined]> = [];
  const remember = (name: string) => prior.push([name, Deno.env.get(name)]);
  const settingsPath = `${await Deno.makeTempDir()}/settings.json`;
  if (options.settings !== undefined) {
    await Deno.writeTextFile(settingsPath, JSON.stringify(options.settings));
  }
  for (
    const name of [
      TOKEN_ENV,
      "GEMINI_API_KEY",
      "DCWG_GEMINI_API_KEY",
      "AI_GATEWAY_API_KEY",
      "DCWG_FX_SETTINGS",
    ]
  ) remember(name);
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  Deno.env.set("DCWG_FX_SETTINGS", settingsPath);
  for (
    const [name, value] of [
      ["GEMINI_API_KEY", options.key],
      ["AI_GATEWAY_API_KEY", options.gatewayKey],
    ] as const
  ) {
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

Deno.test("a provider the connector does not have is refused by name", async () => {
  const root = await Deno.makeTempDir();
  const { code, errors } = await runCliErrors([
    ...AGENTIC,
    "--provider",
    "openrouter",
    "--root",
    root,
  ]);

  assertEquals(code, 2);
  assert(errors[0].includes("--provider must be one of gateway, gemini"));
});

Deno.test("a gemini run with no gemini key names the variable instead of borrowing the Gateway's", async () => {
  await withProviderEnv("gemini", async () => {
    const root = await Deno.makeTempDir();
    const { code, errors } = await runCliErrors([
      ...AGENTIC,
      "--provider",
      "gemini",
      "--root",
      root,
    ]);

    assertEquals(code, 2, "a missing key is configuration, not a fold to retry");
    assert(errors[0].includes("GEMINI_API_KEY"));
    assert(errors[0].includes("DCWG_GEMINI_API_KEY"), "the host's prefixed name is the other fix");
    assertEquals(exists(`${root}/raw`), false, "nothing was fetched: the check runs first");
  }, { gatewayKey: "test-key-not-real" });
});

Deno.test("a gemini run whose fx settings name no such provider names the file and the block", async () => {
  await withProviderEnv("gemini", async () => {
    const root = await Deno.makeTempDir();
    const { code, errors } = await runCliErrors([
      ...AGENTIC,
      "--provider",
      "gemini",
      "--root",
      root,
    ]);

    assertEquals(code, 2);
    assert(errors[0].includes("providers.gemini"), "the fix names the block to add");
    assertEquals(exists(`${root}/raw`), false);
  }, { key: "test-key-not-real", settings: { provider: "gateway" } });
});

Deno.test("an unmetered provider is never asked what it has left", async () => {
  const hits: string[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    hits.push(url.href);
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
    return Promise.resolve(new Response(JSON.stringify({}), { status: 404 }));
  }) as typeof fetch;
  try {
    await withProviderEnv("gemini", async () => {
      const root = await Deno.makeTempDir();
      await seedWiki(root);
      const { code, out } = await runCli([
        "--channel",
        CHANNEL,
        "--venue",
        "dcwg-talk",
        "--all",
        "--provider",
        "gemini",
        "--editor",
        "api",
        "--root",
        root,
      ]);

      assertEquals(code, 1, "the shim is not listening here, so the fold stalls");
      assertEquals(
        hits.filter((hit) => hit.includes("/credits")).length,
        0,
        "a free tier is bounded by its own rate limit, not by credits a share could divide",
      );
      assert(
        out.some((line) => line === "provider: gemini (gemini-2.5-flash), unmetered"),
        `the run report names who paid: ${out.join(" | ")}`,
      );
    }, { key: "test-key-not-real" });
  } finally {
    globalThis.fetch = original;
  }
});

/**
 * The models one run was handed, in the order it was handed them.
 *
 * The rotation is only observable through what the pass was spawned with, so the stand-in
 * records `--model` on every call rather than answering anything: a test that asserted the
 * run's own log line would be reading the connector's intent back to itself.
 */
async function withModelLogEnv(
  stderrLine: string,
  fn: (modelsLog: string) => Promise<void>,
  exitCode = 1,
): Promise<void> {
  const restoreFetch = stubFetch(FRESH_KEY_BODY);
  const dir = await Deno.makeTempDir();
  const bin = `${dir}/fx-stand-in`;
  const modelsLog = `${dir}/models`;
  await Deno.writeTextFile(
    bin,
    "#!/bin/sh\n" +
      'prev=""\n' +
      'for arg in "$@"; do\n' +
      `  if [ "$prev" = "--model" ]; then echo "$arg" >> '${modelsLog}'; fi\n` +
      '  prev="$arg"\n' +
      "done\n" +
      `echo "${stderrLine}" 1>&2\n` +
      `exit ${exitCode}\n`,
  );
  await Deno.chmod(bin, 0o755);
  const priorToken = Deno.env.get(TOKEN_ENV);
  const priorKey = Deno.env.get("AI_GATEWAY_API_KEY");
  const priorBin = Deno.env.get("DCWG_FX_BIN");
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  Deno.env.set("AI_GATEWAY_API_KEY", "test-key-not-real");
  Deno.env.set("DCWG_FX_BIN", bin);
  try {
    await fn(modelsLog);
  } finally {
    restoreFetch();
    const prior: Array<[string, string | undefined]> = [
      [TOKEN_ENV, priorToken],
      ["AI_GATEWAY_API_KEY", priorKey],
      ["DCWG_FX_BIN", priorBin],
    ];
    for (const [name, value] of prior) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
    await Deno.remove(dir, { recursive: true });
  }
}

/**
 * The folding invocation that leaves the model to the connector, so the rotation is what
 * decides it: `--attempts 2` against a rotation of two is exactly the two models.
 */
const ROTATING = [
  "--channel",
  CHANNEL,
  "--venue",
  "dcwg-talk",
  "--all",
  "--editor",
  "fx",
  "--attempts",
  "2",
];

Deno.test("a rate-limited pass moves to the next model in the rotation", async () => {
  await withModelLogEnv(
    "fx: error: AI Gateway: rate limit exceeded for the free model",
    async (modelsLog) => {
      const root = await Deno.makeTempDir();
      await seedGateCleanWiki(root);
      const { code, out } = await runCli([...ROTATING, "--root", root]);

      assertEquals(code, 1, "a cap is not a verdict on the material, so the fold is not done");
      const models = (await Deno.readTextFile(modelsLog)).trim().split("\n");
      assertEquals(models, [GATEWAY_DEFAULT_MODEL, GATEWAY_FALLBACK_MODELS[0]]);
      assert(
        out.some((line) => line.startsWith("fallback: ")),
        `the run names the rotation before the first attempt: ${out.join(" | ")}`,
      );
      assert(
        out.some((line) => line.includes(`moving to ${GATEWAY_FALLBACK_MODELS[0]}`)),
        `the run says which model it moved to: ${out.join(" | ")}`,
      );
    },
  );
});

Deno.test("a pass that failed on its own work stays on the model it started with", async () => {
  await withModelLogEnv("fx: error: the agent gave up after 24 steps", async (modelsLog) => {
    const root = await Deno.makeTempDir();
    await seedGateCleanWiki(root);
    const { code } = await runCli([...ROTATING, "--root", root]);

    assertEquals(code, 1);
    const models = (await Deno.readTextFile(modelsLog)).trim().split("\n");
    assertEquals(
      models,
      [GATEWAY_DEFAULT_MODEL, GATEWAY_DEFAULT_MODEL],
      "a different model is a different experiment, not a retry of this one",
    );
  });
});
