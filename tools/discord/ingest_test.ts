/**
 * End-to-end tests for the connector's write path, with the API stubbed.
 *
 * These cover the contract the automation actually depends on: one run writes a
 * new capture, advances the cursor, keeps SUMMARY.json inside the hub's contract,
 * omits bot noise, and — on a second run the same day — adds a suffixed capture
 * rather than rewriting the one that already exists. No token, no network.
 */

import { assert, assertEquals } from "@std/assert";
import { main } from "./ingest.ts";
import { validateSummary } from "./guard.ts";
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

function stubFetch(): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
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

const BASE = ["--channel", CHANNEL, "--venue", "dcwg-talk", "--skip-wiki", "--all"];

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
      capture.includes("source: \"Discord REST API, channel " + CHANNEL),
      "frontmatter records the channel id",
    );
    assert(capture.includes("first message") && capture.includes("second message"), "verbatim text");
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
    assertEquals(await Deno.readTextFile(firstPath), before, "the earlier capture is byte-identical");
  });
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
