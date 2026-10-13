/**
 * Pagination and rate-limit behaviour, against a synthetic Discord API.
 *
 * The API model here is the part that matters: Discord returns, per page, the 100
 * messages *adjacent* to the anchor (the ones nearest it, not the furthest), and
 * sorts the body newest-first. A test that models this wrongly passes while the
 * connector silently drops messages, which is the failure this file exists to catch.
 */

import { assertEquals, assertRejects } from "@std/assert";
import { apiGet, DiscordError, fetchMessages, snowflakeFromIso } from "./discord.ts";
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
