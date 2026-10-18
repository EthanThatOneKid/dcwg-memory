/**
 * The capture index is generated from the tree, not maintained by the model, so
 * these tests pin the two things that makes true: the rendering is a pure
 * function of the files, and writing it is idempotent.
 */
import { assert, assertEquals } from "@std/assert";
import {
  frontmatter,
  INDEX_PAGE,
  renderCapturesIndex,
  writeCapturesIndex,
} from "./index_page.ts";

Deno.test("frontmatter reads quoted strings, colon keys, and lists", () => {
  const fm = frontmatter(
    `---\ntitle: "Discord #talk — 2026-10-11"\nschema:name: Captures\ncreated: 2026-10-11\ntags:\n  - deno\n  - fresh\n---\n\n# Body\n`,
  );
  assertEquals(fm["title"], "Discord #talk — 2026-10-11");
  assertEquals(fm["schema:name"], "Captures");
  // An unquoted date is a YAML timestamp, so it arrives as a Date, not a
  // string; callers coerce through asString rather than assuming a string.
  assert(fm["created"] instanceof Date);
  assertEquals((fm["created"] as Date).toISOString().slice(0, 10), "2026-10-11");
  assertEquals(fm["tags"], ["deno", "fresh"]);
});

Deno.test("frontmatter returns nothing when there is no block", () => {
  assertEquals(frontmatter("# Just a heading\n"), {});
});

Deno.test("the rendered index is a pure function of the captures and pages", () => {
  const input = {
    siteOrigin: "https://example.test/memory",
    captures: [
      {
        path: "raw/discord/2026-10-11_a.md",
        title: "First",
        description: "The first one.",
        source: "Discord",
      },
      { path: "raw/briefs/2026-10-11_b.md", title: "Second", description: "", source: "A brief" },
    ],
    pages: [
      { file: "Ende_Runtime.md", name: "Ende", description: "A fork." },
      { file: "Dodo.md", name: "Dodo", description: "" },
    ],
  };
  const once = renderCapturesIndex(input);
  const twice = renderCapturesIndex(input);
  assertEquals(once, twice);

  // Captures are absolute URLs because `wiki lint` treats a relative .md target
  // as a wiki page and fails on a capture that is not one.
  assert(once.includes("https://example.test/memory/raw/discord/2026-10-11_a.md"));
  // Derived pages are wiki pages, so they are linked relatively.
  assert(once.includes("(Ende_Runtime.md)"));
  assert(once.includes("(Dodo.md)"));
  // The count is derived, not hand-written.
  assert(once.includes("derived from the 2 captures below"));
  // A capture with no description falls back to its recorded source.
  assert(once.includes("A brief"));
  // A page with no description still gets a line.
  assert(once.includes("A page derived from the captures above."));
});

Deno.test("the index never links a capture with a relative .md target", () => {
  const out = renderCapturesIndex({
    siteOrigin: "https://example.test/memory",
    captures: [{ path: "raw/discord/x.md", title: "X", description: "d", source: "s" }],
    pages: [],
  });
  const captureLinks = out.split("\n").filter((l) => l.includes("raw/discord/x.md"));
  assertEquals(captureLinks.length, 1);
  assert(!/\]\(raw\//.test(out), "a capture must not be linked relatively");
});

Deno.test("writing the index is idempotent", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${dir}/wiki`, { recursive: true });
    await Deno.mkdir(`${dir}/raw/discord`, { recursive: true });
    await Deno.writeTextFile(
      `${dir}/raw/discord/2026-10-11_a.md`,
      `---\ntitle: "A"\ndescription: "First capture."\nsource: "Discord"\n---\n\nbody\n`,
    );
    await Deno.writeTextFile(
      `${dir}/wiki/Ende.md`,
      `---\nschema:name: Ende\nschema:description: A fork.\n---\n\nbody\n`,
    );
    await Deno.writeTextFile(
      `${dir}/wiki.yml`,
      `graph:\n  context:\n    wiki: https://example.test/memory/\n`,
    );

    assertEquals(await writeCapturesIndex(dir), true, "first write should change the tree");
    assertEquals(await writeCapturesIndex(dir), false, "second write should be a no-op");

    const written = await Deno.readTextFile(`${dir}/${INDEX_PAGE}`);
    assert(written.includes("(Ende.md)"));
    assert(written.includes("https://example.test/memory/raw/discord/2026-10-11_a.md"));
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
