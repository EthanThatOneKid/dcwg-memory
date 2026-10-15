/**
 * A venue is a channel plus its threads, end to end against a stubbed API.
 *
 * Two shapes matter here and neither is covered by the channel-level tests: a
 * forum, whose entire content is its threads, and a text channel whose threads
 * hold messages newer than anything at the top level.
 *
 * The second is the case that makes one cursor per channel wrong. Snowflakes are
 * ordered by time across the whole venue, so a thread reply is newer than every
 * top-level message that preceded it. Advancing the channel's own cursor to that
 * reply would skip the channel's messages that arrived in between, and nothing
 * would ever go back for them.
 */

import { assert, assertEquals } from "@std/assert";
import { main } from "./ingest.ts";
import type { DiscordMessage, DiscordThread } from "./discord.ts";

const GUILD = "900";
const FORUM = "800";
const TEXT = "700";
const FORUM_POST_1 = "2100";
const FORUM_POST_2 = "2200";
const TEXT_THREAD = "1700";
const TOKEN_ENV = "DCWG_DISCORD_BOT_TOKEN";

function msg(id: string, content: string, minute: number): DiscordMessage {
  return {
    id,
    content,
    timestamp: `2026-08-01T10:${String(minute).padStart(2, "0")}:00.000Z`,
    author: { id: "1", username: "andy" },
    type: 0,
  };
}

function thread(id: string, name: string, parent: string): DiscordThread {
  return {
    id,
    name,
    parent_id: parent,
    thread_metadata: { archived: false, archive_timestamp: "2026-07-01T00:00:00Z" },
  };
}

/** Channel and thread id -> its messages, oldest first, as the API would store them. */
const MESSAGES: Record<string, DiscordMessage[]> = {
  [TEXT]: [msg("1000", "top level one", 0), msg("1001", "top level two", 1)],
  [TEXT_THREAD]: [msg("1500", "thread starter", 2), msg("4000", "newer thread reply", 5)],
  [FORUM_POST_1]: [msg("2000", "post body", 1), msg("2001", "first reply", 2)],
  [FORUM_POST_2]: [msg("3000", "older post body", 3)],
};

/** A mutable API surface, so a test can add a message between two runs. */
interface Api {
  messages: Record<string, DiscordMessage[]>;
}

function stubFetch(api: Api): () => void {
  const original = globalThis.fetch;
  const json = (body: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));

  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    const path = url.pathname;

    const meta = path.match(/^\/api\/v10\/channels\/([^/]+)$/);
    if (meta) {
      const id = meta[1];
      if (id === FORUM) return json({ id, name: "idea", type: 15, guild_id: GUILD });
      if (id === TEXT) return json({ id, name: "plan", type: 0, guild_id: GUILD });
      return json({ message: "Unknown Channel", code: 10003 }, 404);
    }

    // A forum's second post is archived, so the capture has to read both endpoints.
    const archived = path.match(/^\/api\/v10\/channels\/([^/]+)\/threads\/archived\/public$/);
    if (archived) {
      const threads = archived[1] === FORUM
        ? [{ ...thread(FORUM_POST_2, "Sustainability", FORUM), thread_metadata: { archived: true } }]
        : [];
      return json({ threads, has_more: false });
    }

    if (path === `/api/v10/guilds/${GUILD}/threads/active`) {
      return json({
        threads: [
          thread(FORUM_POST_1, "Rust Academy?", FORUM),
          thread(TEXT_THREAD, "LLM Notetaking", TEXT),
        ],
      });
    }

    const messages = path.match(/^\/api\/v10\/channels\/([^/]+)\/messages$/);
    if (messages) {
      const after = url.searchParams.get("after");
      let list = api.messages[messages[1]] ?? [];
      if (after) list = list.filter((m) => BigInt(m.id) > BigInt(after));
      // Discord returns the body newest-first.
      return json([...list].reverse());
    }

    return json({ message: "Not Found", code: 10003 }, 404);
  }) as typeof fetch;

  return () => {
    globalThis.fetch = original;
  };
}

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

async function withEnv(fn: () => Promise<void>, api: Api = { messages: MESSAGES }): Promise<void> {
  const restoreFetch = stubFetch(api);
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

function names(dir: string): string[] {
  return [...Deno.readDirSync(dir)].map((entry) => entry.name).sort();
}

Deno.test("a forum run captures every post under its own heading", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    const { code } = await runCli([
      "--channel",
      FORUM,
      "--venue",
      "dcwg-propose",
      "--root",
      root,
      "--skip-wiki",
    ]);
    assertEquals(code, 0);

    const capture = await Deno.readTextFile(`${root}/raw/discord/2026-08-01_dcwg-propose.md`);
    assert(capture.includes(`## Rust Academy? (thread ${FORUM_POST_1})`), "post heading");
    assert(capture.includes(`## Sustainability (thread ${FORUM_POST_2})`), "archived post heading");
    assert(capture.includes("post body") && capture.includes("first reply"), "post and its replies");
    assert(capture.includes("across 2 threads"), "the frontmatter counts the posts");
    assert(!capture.includes("top level one"), "another venue's messages must not leak in");

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(cursor[FORUM_POST_1], "2001");
    assertEquals(cursor[FORUM_POST_2], "3000");
    // A forum's own id is not a resume point, so it is never a cursor key.
    assertEquals(FORUM in cursor, false, "the forum channel id must not be a cursor key");
  });
});

Deno.test("a text channel's thread is captured without dragging its own cursor past itself", async () => {
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    const { code } = await runCli([
      "--channel",
      TEXT,
      "--venue",
      "dcwg-brainstorm",
      "--root",
      root,
      "--skip-wiki",
    ]);
    assertEquals(code, 0);

    const capture = await Deno.readTextFile(`${root}/raw/discord/2026-08-01_dcwg-brainstorm.md`);
    assert(capture.includes("top level one"), "the channel's own history is captured");
    assert(capture.includes(`## LLM Notetaking (thread ${TEXT_THREAD})`), "the thread is captured");
    assert(capture.includes("newer thread reply"), "a thread reply is captured");
    // The untitled block is the channel's own history and comes first.
    assert(
      capture.indexOf("top level one") < capture.indexOf("## LLM Notetaking"),
      "the channel's history precedes its threads",
    );

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(cursor[TEXT], "1001", "the channel cursor is its own newest, not the thread's 4000");
    assertEquals(cursor[TEXT_THREAD], "4000");
  });
});

Deno.test("a resumed run reads each thread from its own cursor and re-reads nothing", async () => {
  const api: Api = { messages: { ...MESSAGES, [TEXT_THREAD]: [...MESSAGES[TEXT_THREAD]] } };
  await withEnv(async () => {
    const root = await Deno.makeTempDir();
    const argv = ["--channel", TEXT, "--venue", "dcwg-brainstorm", "--root", root, "--skip-wiki"];

    assertEquals((await runCli(argv)).code, 0);

    // Nothing new anywhere: no capture, and the run says so.
    const idle = await runCli(argv);
    assertEquals(idle.code, 0);
    assert(idle.out.join("\n").includes("no new messages"), "an idle run captures nothing");
    assertEquals(names(`${root}/raw/discord`).filter((n) => n.endsWith(".md")).length, 1);

    // One new reply, in the thread only. Only that reply is captured: the channel's
    // own history is behind its own cursor and is not re-read.
    api.messages[TEXT_THREAD].push(msg("5000", "another reply", 9));
    const third = await runCli(argv);
    assertEquals(third.code, 0);

    const second = await Deno.readTextFile(`${root}/raw/discord/2026-08-01_dcwg-brainstorm-2.md`);
    assert(second.includes("another reply"), "the new reply is captured");
    assert(!second.includes("top level one"), "the channel's history is not re-captured");
    assert(!second.includes("thread starter"), "the thread's older messages are not re-captured");
    assert(second.includes(`## LLM Notetaking (thread ${TEXT_THREAD})`), "the reply keeps its thread heading");

    const cursor = JSON.parse(await Deno.readTextFile(`${root}/raw/discord/.cursor`));
    assertEquals(cursor[TEXT_THREAD], "5000");
    assertEquals(cursor[TEXT], "1001", "an untouched channel cursor stays where it was");
  }, api);
});
