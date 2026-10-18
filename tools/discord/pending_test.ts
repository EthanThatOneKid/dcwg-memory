/**
 * The fold queue, on its own.
 *
 * The queue is what lets the archive run ahead of the wiki, so its guarantees are
 * the ones the automation leans on: an entry is remembered by capture path, a
 * venue only drains its own, an offset never moves backwards, and a queue that
 * empties leaves no key behind claiming work is owed.
 */

import { assert, assertEquals } from "@std/assert";
import {
  advance,
  drop,
  enqueue,
  PENDING_KEY,
  pendingFor,
  readPending,
  setPending,
  stall,
} from "./pending.ts";
import type { PendingFold } from "./pending.ts";

const CAPTURE = "raw/discord/2026-10-11_dcwg-brainstorm.md";

function fold(over: Partial<PendingFold> = {}): PendingFold {
  return { capture: CAPTURE, venue: "dcwg-brainstorm", messages: 3, offset: 0, stalls: 0, ...over };
}

Deno.test("readPending survives whatever the cursor file holds", () => {
  assertEquals(readPending({}), [], "a cursor file with no queue owes nothing");
  assertEquals(readPending({ [PENDING_KEY]: "not an array" }), []);
  assertEquals(
    readPending({ [PENDING_KEY]: [null, 7, { capture: "" }, { capture: CAPTURE, venue: "" }] }),
    [],
  );
});

Deno.test("readPending keeps a well-formed entry and defaults its numbers", () => {
  const folds = readPending({
    [PENDING_KEY]: [{ capture: CAPTURE, venue: "dcwg-brainstorm" }, {
      capture: "raw/discord/2026-10-12_dcwg-propose.md",
      venue: "dcwg-propose",
      messages: -4,
      offset: 1.5,
      stalls: -2,
    }],
  });
  assertEquals(folds, [
    { capture: CAPTURE, venue: "dcwg-brainstorm", messages: 0, offset: 0, stalls: 0 },
    {
      capture: "raw/discord/2026-10-12_dcwg-propose.md",
      venue: "dcwg-propose",
      messages: 0,
      offset: 0,
      stalls: 0,
    },
  ], "a negative count and a fractional offset are both malformed, and both fall back to zero");
});

Deno.test("enqueue appends once and never duplicates a capture", () => {
  const request = { capture: CAPTURE, venue: "dcwg-brainstorm", messages: 3 };
  const once = enqueue([], request);
  assertEquals(once, [fold()]);
  assertEquals(
    enqueue(once, request),
    once,
    "a capture is queued once no matter how often a run sees it",
  );
});

Deno.test("a venue drains only its own captures, oldest first", () => {
  const other = fold({ capture: "raw/discord/2026-10-12_dcwg-propose.md", venue: "dcwg-propose" });
  const folds = enqueue(
    enqueue([other], { capture: CAPTURE, venue: "dcwg-brainstorm", messages: 3 }),
    {
      capture: "raw/discord/2026-10-13_dcwg-brainstorm.md",
      venue: "dcwg-brainstorm",
      messages: 5,
    },
  );
  assertEquals(
    pendingFor(folds, "dcwg-brainstorm").map((f) => f.capture),
    [CAPTURE, "raw/discord/2026-10-13_dcwg-brainstorm.md"],
    "a venue removed from the workflow leaves its entries for that venue, not for whichever runs next",
  );
  assertEquals(pendingFor(folds, "dcwg-propose").length, 1);
  assertEquals(pendingFor(folds, "dcwg-talk").length, 0);
});

Deno.test("advance moves an offset forward and never backwards", () => {
  const started = [fold({ offset: 400 })];
  assertEquals(advance(started, CAPTURE, 900, 5_000), [fold({ offset: 900 })]);
  assertEquals(
    advance(started, CAPTURE, 100, 5_000),
    started,
    "a smaller offset would claim the wiki carries less than this run already folded in",
  );
});

Deno.test("advance retires an entry once the capture is fully absorbed", () => {
  assertEquals(advance([fold({ offset: 900 })], CAPTURE, 5_000, 5_000), []);
  assertEquals(
    advance([fold()], CAPTURE, 5_000, 5_000),
    [],
    "a capture that fits in one prompt leaves the queue behind it",
  );
  assertEquals(
    advance([fold()], "raw/discord/2026-10-12_dcwg-propose.md", 5_000, 5_000).length,
    1,
    "advancing one capture leaves the others alone",
  );
});

Deno.test("stall counts a run that could not fold a capture, and moves nothing else", () => {
  const started = [
    fold({ offset: 900 }),
    fold({ capture: "raw/discord/2026-10-12_dcwg-propose.md" }),
  ];
  const stalled = stall(started, CAPTURE);
  assertEquals(stalled, [
    fold({ offset: 900, stalls: 1 }),
    fold({ capture: "raw/discord/2026-10-12_dcwg-propose.md" }),
  ], "the entry keeps its offset and its place; only the count moves");
  assertEquals(stall(stalled, CAPTURE)[0].stalls, 2, "consecutive runs accumulate");
  assertEquals(
    stall(stalled, "raw/discord/2026-10-13_dcwg-brainstorm.md"),
    stalled,
    "a capture the queue does not hold is not invented by counting it",
  );
});

Deno.test("a fold that reached the gates clears the stall count", () => {
  const stalled = [fold({ offset: 900, stalls: 3 })];
  assertEquals(
    advance(stalled, CAPTURE, 1_200, 5_000),
    [fold({ offset: 1_200 })],
    "the count measures consecutive runs that moved nothing, not runs that have not finished",
  );
});

Deno.test("drop forgets a capture that is no longer on disk", () => {
  const folds = [fold(), fold({ capture: "raw/discord/2026-10-12_dcwg-brainstorm.md" })];
  assertEquals(drop(folds, CAPTURE).map((f) => f.capture), [
    "raw/discord/2026-10-12_dcwg-brainstorm.md",
  ]);
  assertEquals(drop(folds, "raw/discord/2026-10-13_dcwg-brainstorm.md"), folds);
});

Deno.test("setPending leaves no empty queue key behind", () => {
  const store: Record<string, unknown> = {};
  setPending(store, [fold()]);
  assert(Array.isArray(store[PENDING_KEY]));

  const drained: Record<string, unknown> = { [PENDING_KEY]: [fold()], "1234": "cursor" };
  setPending(drained, []);
  assert(!(PENDING_KEY in drained), "a drained queue deletes the key rather than writing []");
  assertEquals(drained["1234"], "cursor", "and leaves the fetch cursors alone");
});

Deno.test("the queue round-trips through the cursor file's JSON", () => {
  const queue = [
    fold({ offset: 2_100 }),
    fold({ capture: "raw/discord/2026-10-12_dcwg-brainstorm.md" }),
  ];
  const store: Record<string, unknown> = { "1234": "9999" };
  setPending(store, queue);
  const reparsed = JSON.parse(JSON.stringify(store));
  assertEquals(readPending(reparsed), queue);
  assertEquals(reparsed["1234"], "9999", "the queue shares the file with the fetch cursors");
});
