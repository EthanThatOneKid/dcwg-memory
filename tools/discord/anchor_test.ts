/**
 * The fetch anchor, pinned.
 *
 * A run with no cursor has to start at the channel's first message and walk
 * forward. Anchoring on "now" instead, with a cap, keeps the newest N and then
 * advances the cursor past everything older: measured 2026-10-15, that left the
 * 395 messages between the last capture and the newest 200 unreachable. This
 * asserts the anchor rather than the count, because the anchor is what makes the
 * cap harmless. No token, no network.
 */

import { assert } from "@std/assert";
import { main } from "./ingest.ts";
import type { DiscordMessage } from "./discord.ts";

const CHANNEL = "1558888938842624093";
const TOKEN_ENV = "DCWG_DISCORD_BOT_TOKEN";

function message(id: string, timestamp: string): DiscordMessage {
  return {
    id,
    content: `message ${id}`,
    timestamp,
    author: { id: "1", username: "andy" },
    type: 0,
  };
}

/** Stub the API and record every request path with its query, so the anchor shows. */
function stubFetch(requests: string[]): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = new URL(String(input));
    requests.push(`${url.pathname}${url.search}`);
    if (url.pathname === `/api/v10/channels/${CHANNEL}`) {
      return Promise.resolve(
        new Response(JSON.stringify({ id: CHANNEL, name: "talk" }), { status: 200 }),
      );
    }
    if (url.pathname === `/api/v10/channels/${CHANNEL}/messages`) {
      // One short page answers the anchor and ends the walk.
      const page = url.searchParams.get("after") === "0"
        ? [message("1000", "2026-08-01T10:00:00.000Z")]
        : [];
      return Promise.resolve(new Response(JSON.stringify(page), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({ code: 10003 }), { status: 404 }));
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

Deno.test("a run with no cursor starts at the channel's first message", async () => {
  const requests: string[] = [];
  const restore = stubFetch(requests);
  const prior = Deno.env.get(TOKEN_ENV);
  Deno.env.set(TOKEN_ENV, "test-token-not-real");
  const root = await Deno.makeTempDir();
  const originalLog = console.log;
  console.log = () => {};
  try {
    await main(["--channel", CHANNEL, "--venue", "dcwg-talk", "--skip-wiki", "--root", root]);
  } finally {
    console.log = originalLog;
    restore();
    if (prior === undefined) Deno.env.delete(TOKEN_ENV);
    else Deno.env.set(TOKEN_ENV, prior);
  }

  const messageRequests = requests.filter((request) => request.includes("/messages"));
  assert(messageRequests.length > 0, "expected a history request");
  assert(
    messageRequests[0].includes("after=0"),
    `expected the first history request to anchor on the first message, got ${messageRequests[0]}`,
  );
  assert(
    !messageRequests.some((request) => request.includes("before=")),
    "a run with no cursor must not walk backward from now",
  );
});
