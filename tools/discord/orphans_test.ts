/**
 * Orphan detection. The property that matters: an index link is not a
 * connection, so a page reachable only from the index is still an orphan.
 */
import { assertEquals } from "@std/assert";
import { findOrphans, inboundCounts, orphansIn, ROOT_PAGES } from "./orphans.ts";

function pagesOf(entries: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(entries));
}

Deno.test("a page linked from another page is not an orphan", () => {
  const counts = inboundCounts(
    pagesOf({
      "wiki/A.md": "See [B](B.md).",
      "wiki/B.md": "See [A](A.md).",
    }),
  );
  assertEquals(counts.get("wiki/A.md"), 1);
  assertEquals(counts.get("wiki/B.md"), 1);
});

Deno.test("a self-link does not count as an inbound link", () => {
  const counts = inboundCounts(pagesOf({ "wiki/A.md": "See [itself](A.md)." }));
  assertEquals(counts.get("wiki/A.md"), 0);
});

Deno.test("an absolute URL is not an internal link", () => {
  const counts = inboundCounts(
    pagesOf({
      "wiki/A.md": "See [B](https://example.com/B.md) and [x](mailto:a@b.c).",
      "wiki/B.md": "leaf",
    }),
  );
  assertEquals(counts.get("wiki/B.md"), 0);
});

Deno.test("a link with a fragment resolves to the page", () => {
  const counts = inboundCounts(
    pagesOf({
      "wiki/A.md": "See [B](B.md#section).",
      "wiki/B.md": "leaf",
    }),
  );
  assertEquals(counts.get("wiki/B.md"), 1);
});

Deno.test("the index is exempt, but a link from the index does not rescue a page", () => {
  const pages = pagesOf({
    "wiki/Captures.md": "See [Only](Only.md).",
    "wiki/Only.md": "leaf",
  });
  assertEquals(ROOT_PAGES.includes("wiki/Captures.md"), true);
  // The index counts as a source, so the raw count is 1...
  assertEquals(inboundCounts(pages).get("wiki/Only.md"), 1);
  // ...but the orphan check ignores links that come from an entry point.
  assertEquals(orphansIn(pages), ["wiki/Only.md"]);
});

Deno.test("a page linked only from the index is still an orphan", () => {
  // The index links A, and A links B, so B is connected but A is not: its only
  // inbound link is the index itself.
  const pages = pagesOf({
    "wiki/Captures.md": "See [A](A.md) and [B](B.md).",
    "wiki/A.md": "See [B](B.md).",
    "wiki/B.md": "leaf",
  });
  assertEquals(orphansIn(pages), ["wiki/A.md"]);
});

Deno.test("a page linked from a real page is not an orphan", () => {
  // With the index excluded, a chain that merely starts at the index leaves its
  // head orphaned, so connectedness has to come from the pages themselves.
  const pages = pagesOf({
    "wiki/Captures.md": "See [A](A.md).",
    "wiki/A.md": "See [B](B.md).",
    "wiki/B.md": "See [C](C.md).",
    "wiki/C.md": "See [A](A.md).",
  });
  assertEquals(orphansIn(pages), []);
});

Deno.test("findOrphans reads a real directory and reports the unlinked page", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${dir}/wiki`);
    await Deno.writeTextFile(`${dir}/wiki/Captures.md`, "See [A](A.md).");
    await Deno.writeTextFile(`${dir}/wiki/A.md`, "See [B](B.md).");
    await Deno.writeTextFile(`${dir}/wiki/B.md`, "leaf");
    await Deno.writeTextFile(`${dir}/wiki/Lonely.md`, "nobody links here");
    // A is linked only from the index, so it is orphaned too.
    assertEquals(await findOrphans(dir), ["wiki/A.md", "wiki/Lonely.md"]);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
