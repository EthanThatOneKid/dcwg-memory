/**
 * The inference pass, minus the inference.
 *
 * The model call itself needs a key and a network, so what is tested here is
 * everything around it: the proposal guard, the snapshot/restore pair that makes
 * a failing gate undoable, the prompt's contents, and the refusal to run at all
 * without a key.
 */

import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  buildPrompt,
  CAPTURE_CHAR_CAP,
  guardProposal,
  readPages,
  restorePages,
  runWikiPass,
  snapshotPages,
} from "./wiki.ts";
import { MAX_PAGE_BYTES } from "./guard.ts";
import type { PageEdit, WikiPassInput } from "./wiki.ts";

function input(over: Partial<WikiPassInput> = {}): WikiPassInput {
  return {
    root: ".",
    messages: [],
    channelName: "talk",
    capturePath: "raw/discord/2026-08-01_talk.md",
    ...over,
  };
}

Deno.test("guardProposal accepts a conforming edit", () => {
  assertEquals(guardProposal([{ path: "wiki/Talk.md", content: "body\n", reason: "new claim" }]), []);
});

Deno.test("guardProposal refuses the ways a proposal can go wrong", () => {
  const edits: PageEdit[] = [
    { path: "raw/discord/2026-08-01_talk.md", content: "x", reason: "the record is append-only" },
    { path: "wiki.yml", content: "x", reason: "config" },
    { path: "wiki/Ok.md", content: "   \n  ", reason: "empty page" },
    { path: "wiki/Ok.md", content: "body", reason: "same page twice" },
    { path: "wiki/Big.md", content: "x".repeat(MAX_PAGE_BYTES + 1), reason: "too big" },
  ];
  const problems = guardProposal(edits);
  assert(problems.some((p) => p.includes("raw/discord/2026-08-01_talk.md")), problems.join("; "));
  assert(problems.some((p) => p.includes("wiki.yml")), problems.join("; "));
  assert(problems.some((p) => p.includes("refusing to write an empty page")), problems.join("; "));
  assert(problems.some((p) => p.includes("proposed twice")), problems.join("; "));
  assert(problems.some((p) => p.includes("exceeds")), problems.join("; "));
});

Deno.test("guardProposal protects a page's frontmatter", () => {
  const prior = new Map<string, string | null>([
    ["wiki/Typed.md", "---\n'@type': schema:TechArticle\n---\n\n# Typed\n"],
    ["wiki/Plain.md", "# Plain\n"],
    ["wiki/New.md", null],
  ]);

  // Rewriting the block into body text is what actually happened once: the wiki
  // gates do not require frontmatter, so they all passed on the flattened page.
  const stripped = guardProposal(
    [{ path: "wiki/Typed.md", content: "'@type': schema:TechArticle\n\n# Typed\n", reason: "edit" }],
    prior,
  );
  assert(stripped.some((p) => p.includes("strips the page's YAML frontmatter")), stripped.join("; "));

  // Keeping the block is the normal case and must stay clean.
  assertEquals(
    guardProposal(
      [{ path: "wiki/Typed.md", content: "---\n'@type': schema:TechArticle\n---\n\n# Typed\n\nMore.\n", reason: "edit" }],
      prior,
    ),
    [],
  );

  // A page that never had frontmatter is not suddenly required to have some,
  // and a page this pass creates has nothing to preserve.
  assertEquals(guardProposal([{ path: "wiki/Plain.md", content: "# Plain\n\nMore.\n", reason: "edit" }], prior), []);
  assertEquals(guardProposal([{ path: "wiki/New.md", content: "# New\n", reason: "create" }], prior), []);
});

Deno.test("snapshot then restore returns the tree to its prior state", async () => {
  const root = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${root}/wiki`, { recursive: true });
    await Deno.writeTextFile(`${root}/wiki/Existing.md`, "original\n");

    const prior = await snapshotPages(root, ["wiki/Existing.md", "wiki/Created.md"]);
    assertEquals(prior.get("wiki/Existing.md"), "original\n");
    assertEquals(prior.get("wiki/Created.md"), null);

    // The pass writes over one page and creates another.
    await Deno.writeTextFile(`${root}/wiki/Existing.md`, "rewritten\n");
    await Deno.writeTextFile(`${root}/wiki/Created.md`, "new\n");
    await restorePages(root, prior);

    assertEquals(await Deno.readTextFile(`${root}/wiki/Existing.md`), "original\n");
    // A page the pass invented is deleted, not left as an orphan.
    await assertRejects(() => Deno.readTextFile(`${root}/wiki/Created.md`));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("readPages lists wiki pages and nothing else", async () => {
  const root = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${root}/wiki`, { recursive: true });
    await Deno.writeTextFile(`${root}/wiki/One.md`, "1\n");
    await Deno.writeTextFile(`${root}/wiki/Two.md`, "2\n");
    await Deno.writeTextFile(`${root}/wiki.yml`, "not a page\n");
    const pages = await readPages(root);
    assertEquals(pages.map((p) => p.path).sort(), ["wiki/One.md", "wiki/Two.md"]);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("buildPrompt carries the captures, the pages, and the last-run stamp", () => {
  const prompt = buildPrompt(
    input({ lastUpdated: "2026-07-31T00:00:00Z" }),
    [{ path: "wiki/Talk.md", text: "existing claim\n" }],
    "NEW MESSAGE TEXT",
  );
  assert(prompt.includes("2026-07-31T00:00:00Z"), prompt);
  assert(prompt.includes("NEW MESSAGE TEXT"), prompt);
  assert(prompt.includes("wiki/Talk.md"), prompt);
  assert(prompt.includes("existing claim"), prompt);
});
Deno.test("buildPrompt keeps the newest messages when a capture exceeds the cap", () => {
  const oldest = "OLDEST MESSAGE, already folded into the wiki";
  const newest = "NEWEST MESSAGE, the reason the run started";
  const capture = `${oldest}\n${"x".repeat(CAPTURE_CHAR_CAP)}\n${newest}`;
  assert(capture.length > CAPTURE_CHAR_CAP, "fixture must exceed the cap");
  const prompt = buildPrompt(input(), [], capture);
  assert(prompt.includes(newest), "the newest message must survive the cap");
  assert(!prompt.includes(oldest), "the oldest content is the part to drop");
  assert(prompt.includes("elided by the connector"), "the elision must be announced");
});

Deno.test("runWikiPass refuses to run without a key instead of guessing", async () => {
  // An explicit empty key is falsy, so this is deterministic even where
  // ANTHROPIC_API_KEY happens to be set in the environment.
  await assertRejects(
    () => runWikiPass(input({ apiKey: "", captureText: "x", pages: [] })),
    Error,
    "needs an API key",
  );
});
