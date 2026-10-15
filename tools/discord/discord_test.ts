/**
 * Pagination and rate-limit behaviour, against a synthetic Discord API.
 *
 * The API model here is the part that matters: Discord returns, per page, the 100
 * messages *adjacent* to the anchor (the ones nearest it, not the furthest), and
 * sorts the body newest-first. A test that models this wrongly passes while the
 * connector silently drops messages, which is the failure this file exists to catch.
 */

import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  apiGet,
  CHANNEL_FORUM,
  CHANNEL_MEDIA,
  CHANNEL_TEXT,
  DiscordError,
  fetchMessages,
  fetchVenueThreads,
  isForum,
  snowflakeFromIso,
  threadTitle,
} from "./discord.ts";
import type { DiscordMessage } from "./discord.ts";

const IDS = Array.from({ length: 350 }, (_, i) => 1000 + i);

function msg(id: number): DiscordMessage {
  return {
    id: String(id),
    content: `m${id}`,
    timestamp: "2026-08-01T00:00:00Z",
    author: { id: "1", username: "u" },
    type: 0,
  };
}

const ALL = IDS.map(msg);

interface Call {
  path: string;
}

/** Install a fetch stub that models Discord's real paging semantics. */
function stubApi(calls: Call[], opts: { rateLimitFirst?: boolean } = {}) {
  let limited = false;
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    const path = url.pathname + url.search;
    calls.push({ path });
    if (opts.rateLimitFirst && !limited) {
      limited = true;
      return Promise.resolve(
        new Response(JSON.stringify({ message: "You are being rate limited.", code: 0 }), {
          status: 429,
          headers: { "Retry-After": "0.5" },
        }),
      );
    }

    const limit = Number(url.searchParams.get("limit") ?? "50");
    const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");

    let page: DiscordMessage[];
    if (after) {
      // The 100 messages immediately after the anchor.
      const rest = ALL.filter((m) => BigInt(m.id) > BigInt(after)).sort((a, b) =>
        BigInt(a.id) < BigInt(b.id) ? -1 : 1
      );
      page = rest.slice(0, limit);
    } else if (before) {
      const rest = ALL.filter((m) => BigInt(m.id) < BigInt(before)).sort((a, b) =>
        BigInt(a.id) < BigInt(b.id) ? -1 : 1
      );
      page = rest.slice(-limit);
    } else {
      // No anchor: the newest page in the channel.
      page = ALL.slice(-limit);
    }
    // Discord sorts the body newest-first.
    page = [...page].reverse();
    return Promise.resolve(new Response(JSON.stringify(page), { status: 200 }));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

const noSleep = () => Promise.resolve();

Deno.test("backward paging (no anchor) walks the whole channel with no gaps", async () => {
  const calls: Call[] = [];
  const restore = stubApi(calls);
  try {
    const out = await fetchMessages("c", "t", { limit: 0, sleep: noSleep });
    assertEquals(out.map((m) => m.id), IDS.map(String));
    assertEquals(calls.length, 4);
  } finally {
    restore();
  }
});

Deno.test("forward paging (after anchor) resumes from the cursor with no gaps", async () => {
  const calls: Call[] = [];
  const restore = stubApi(calls);
  try {
    const out = await fetchMessages("c", "t", { after: "999", limit: 0, sleep: noSleep });
    assertEquals(out.map((m) => m.id), IDS.map(String));
  } finally {
    restore();
  }
});

Deno.test("a capped forward run then a resume loses nothing and repeats nothing", async () => {
  const calls: Call[] = [];
  const restore = stubApi(calls);
  try {
    const first = await fetchMessages("c", "t", { after: "999", limit: 120, sleep: noSleep });
    assertEquals(first.length, 120);
    const cursor = first[first.length - 1].id;

    const second = await fetchMessages("c", "t", { after: cursor, limit: 0, sleep: noSleep });
    assertEquals(second[0].id, String(BigInt(cursor) + 1n));

    const union = [...first, ...second].map((m) => m.id);
    assertEquals(new Set(union).size, union.length, "overlap between runs");
    assertEquals(union, IDS.map(String), "gap between runs");
  } finally {
    restore();
  }
});

Deno.test("a capped backward run returns the newest slice, not the oldest", async () => {
  const calls: Call[] = [];
  const restore = stubApi(calls);
  try {
    const out = await fetchMessages("c", "t", { limit: 50, sleep: noSleep });
    assertEquals(out.length, 50);
    assertEquals(out[out.length - 1].id, "1349");
    assertEquals(out[0].id, "1300");
  } finally {
    restore();
  }
});

Deno.test("a 429 is waited out and retried, not fatal", async () => {
  const calls: Call[] = [];
  const restore = stubApi(calls, { rateLimitFirst: true });
  try {
    const out = await apiGet<DiscordMessage[]>(
      "/channels/c/messages?limit=100",
      "t",
      6,
      noSleep,
    );
    assertEquals(out.length, 100);
    assertEquals(calls.length, 2, "should have retried exactly once");
  } finally {
    restore();
  }
});

Deno.test("a missing-access error surfaces as DiscordError with its code", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(JSON.stringify({ message: "Missing Access", code: 50001 }), { status: 403 }),
    )) as typeof fetch;
  try {
    const err = await assertRejects(() => apiGet("/channels/c", "t", 1, noSleep), DiscordError);
    assertEquals(err.code, 50001);
  } finally {
    globalThis.fetch = original;
  }
});

Deno.test("snowflakeFromIso matches Discord's epoch shift", () => {
  // 2026-08-01T00:00:00Z -> ((ms - 1420070400000) << 22)
  // BigInt, not `<<`: JS bitwise operators coerce to int32 and this shift overflows.
  const expected = String((BigInt(Date.parse("2026-08-01T00:00:00Z")) - 1420070400000n) << 22n);
  assertEquals(snowflakeFromIso("2026-08-01T00:00:00Z"), expected);
  assertEquals(snowflakeFromIso("2026-08-01T00:00:00.000Z"), expected);
});

Deno.test("isForum tells a forum from a text channel", () => {
  assertEquals(isForum(CHANNEL_FORUM), true);
  assertEquals(isForum(CHANNEL_MEDIA), true);
  assertEquals(isForum(CHANNEL_TEXT), false);
  assertEquals(isForum(undefined), false);
});

Deno.test("threadTitle names a thread, and still names a nameless one", () => {
  assertEquals(threadTitle({ id: "77", name: "Rust Academy?" }), "Rust Academy? (thread 77)");
  assertEquals(threadTitle({ id: "77", name: "   " }), "(untitled thread) (thread 77)");
  assertEquals(threadTitle({ id: "77" }), "(untitled thread) (thread 77)");
});

interface ThreadStub {
  calls: string[];
  /** Pages of `threads/archived/public`, served in order. */
  archived?: Array<{ threads: unknown[]; has_more: boolean }>;
  active?: unknown[];
  /** Status to answer `threads/archived/public` with, instead of a page. */
  archivedStatus?: number;
  guild?: boolean;
}

const VENUE = "C";

function stubThreads(opts: ThreadStub): () => void {
  let page = 0;
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    opts.calls.push(url.pathname + url.search);
    if (url.pathname === "/api/v10/guilds/G/threads/active") {
      return Promise.resolve(
        new Response(JSON.stringify({ threads: opts.active ?? [] }), { status: 200 }),
      );
    }
    if (url.pathname === `/api/v10/channels/${VENUE}/threads/archived/public`) {
      if (opts.archivedStatus) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: "Missing Access", code: 50001 }), {
            status: opts.archivedStatus,
          }),
        );
      }
      const next = opts.archived?.[page++] ?? { threads: [], has_more: false };
      return Promise.resolve(new Response(JSON.stringify(next), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ code: 10003 }), { status: 404 }));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

const thread = (id: string, name: string, parent: string, archivedTs?: string) => ({
  id,
  name,
  parent_id: parent,
  ...(archivedTs ? { thread_metadata: { archived: true, archive_timestamp: archivedTs } } : {}),
});

Deno.test("a venue's threads are its own parent's, active and archived, oldest first", async () => {
  const calls: string[] = [];
  const restore = stubThreads({
    calls,
    active: [thread("300", "ours, active", VENUE), thread("999", "someone else's", "OTHER")],
    archived: [{ threads: [thread("100", "ours, archived", VENUE, "2026-08-01T00:00:00Z")], has_more: false }],
  });
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "idea", guild_id: "G" }, "t", noSleep);
    assertEquals(out.map((t) => t.id), ["100", "300"], "another channel's thread must not leak in");
  } finally {
    restore();
  }
});

Deno.test("a thread in both lists is captured once", async () => {
  const calls: string[] = [];
  const shared = thread("100", "ours", VENUE);
  const restore = stubThreads({
    calls,
    active: [shared],
    archived: [{
      threads: [{ ...shared, name: "ours (archived copy)" }],
      has_more: false,
    }],
  });
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "idea", guild_id: "G" }, "t", noSleep);
    assertEquals(out.length, 1);
    assertEquals(out[0].name, "ours", "the active copy is the one kept");
  } finally {
    restore();
  }
});

Deno.test("archived threads page backwards on the oldest archive timestamp", async () => {
  const calls: string[] = [];
  const restore = stubThreads({
    calls,
    archived: [
      {
        threads: [
          thread("1", "a", VENUE, "2026-08-05T00:00:00Z"),
          thread("2", "b", VENUE, "2026-08-03T00:00:00Z"),
        ],
        has_more: true,
      },
      { threads: [thread("3", "c", VENUE, "2026-08-01T00:00:00Z")], has_more: false },
    ],
  });
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "talk", guild_id: "G" }, "t", noSleep);
    assertEquals(out.map((t) => t.id), ["1", "2", "3"]);
    assertEquals(calls.length, 3, "one active call and two archived pages");
    assert(
      calls[2].includes("before=2026-08-03T00%3A00%3A01.000Z"),
      "the next page is anchored one second past the oldest timestamp seen",
    );
  } finally {
    restore();
  }
});

Deno.test("a channel whose archived threads are unreadable is not a capture failure", async () => {
  const calls: string[] = [];
  const restore = stubThreads({ calls, archivedStatus: 403, active: [thread("300", "ours", VENUE)] });
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "plan", guild_id: "G" }, "t", noSleep);
    assertEquals(out.map((t) => t.id), ["300"], "active threads are still captured");
  } finally {
    restore();
  }
});

Deno.test("a channel with no guild id skips the guild-wide active call", async () => {
  const calls: string[] = [];
  const restore = stubThreads({ calls, active: [thread("300", "ours", VENUE)] });
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "plan" }, "t", noSleep);
    assertEquals(out, []);
    assert(!calls.some((c) => c.includes("/threads/active")), "no guild id, no guild-wide call");
  } finally {
    restore();
  }
});
/**
 * A faithful `threads/archived/public`: descending by `archive_timestamp`, 100
 * per page, `before` exclusive. The page-based stub above cannot express the
 * exclusive cursor, which is the entire point of the tie test.
 */
function stubArchivedByContract(threads: unknown[]): () => void {
  const stamp = (t: unknown) =>
    (t as { thread_metadata?: { archive_timestamp?: string } }).thread_metadata?.archive_timestamp ?? "";
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname === "/api/v10/guilds/G/threads/active") {
      return Promise.resolve(new Response(JSON.stringify({ threads: [] }), { status: 200 }));
    }
    if (url.pathname === `/api/v10/channels/${VENUE}/threads/archived/public`) {
      const before = url.searchParams.get("before");
      const matching = threads
        .filter((t) => !before || Date.parse(stamp(t)) < Date.parse(before))
        .sort((a, b) => Date.parse(stamp(b)) - Date.parse(stamp(a)));
      const body = { threads: matching.slice(0, 100), has_more: matching.length > 100 };
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ code: 10003 }), { status: 404 }));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

Deno.test("a thread sharing the boundary second survives pagination", async () => {
  // 101 archived threads, so the endpoint pages, with the two ties made the
  // oldest pair rather than a pair in the middle: that parks the first page's
  // oldest timestamp exactly on the second both of them share, which is where an
  // exclusive cursor drops the second one.
  const iso = (ms: number) => new Date(ms).toISOString();
  const base = Date.parse("2026-09-01T00:00:00Z");
  const tie = iso(Date.parse("2026-08-01T00:00:00Z"));
  const all = [
    ...Array.from({ length: 99 }, (_, i) =>
      thread(`2${String(i).padStart(2, "0")}`, `t${i}`, VENUE, iso(base + i * 86_400_000))),
    thread("100", "tie a", VENUE, tie),
    thread("101", "tie b", VENUE, tie),
  ];
  const restore = stubArchivedByContract(all);
  try {
    const out = await fetchVenueThreads({ id: VENUE, name: "idea", guild_id: "G" }, "t", noSleep);
    assertEquals(out.length, 101, "both ties are held; nothing past the boundary is lost");
    assertEquals(out.filter((t) => t.name?.startsWith("tie")).map((t) => t.id), ["100", "101"]);
  } finally {
    restore();
  }
});
