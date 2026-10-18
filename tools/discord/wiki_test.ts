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
  captureSlice,
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
    channelName: "talk",
    capturePath: "raw/discord/2026-08-01_talk.md",
    ...over,
  };
}

Deno.test("guardProposal accepts a conforming edit", () => {
  assertEquals(
    guardProposal([{ path: "wiki/Talk.md", content: "body\n", reason: "new claim" }]),
    [],
  );
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
    [{
      path: "wiki/Typed.md",
      content: "'@type': schema:TechArticle\n\n# Typed\n",
      reason: "edit",
    }],
    prior,
  );
  assert(
    stripped.some((p) => p.includes("strips the page's YAML frontmatter")),
    stripped.join("; "),
  );

  // Keeping the block is the normal case and must stay clean.
  assertEquals(
    guardProposal(
      [{
        path: "wiki/Typed.md",
        content: "---\n'@type': schema:TechArticle\n---\n\n# Typed\n\nMore.\n",
        reason: "edit",
      }],
      prior,
    ),
    [],
  );

  // A page that never had frontmatter is not suddenly required to have some,
  // and a page this pass creates has nothing to preserve.
  assertEquals(
    guardProposal(
      [{ path: "wiki/Plain.md", content: "# Plain\n\nMore.\n", reason: "edit" }],
      prior,
    ),
    [],
  );
  assertEquals(
    guardProposal([{ path: "wiki/New.md", content: "# New\n", reason: "create" }], prior),
    [],
  );
});
/**
 * The prompt's own framing must never commit as page text.
 *
 * Measured 2026-10-18 on the free tier: `buildPrompt` fences the capture and every page it
 * hands the model, and the pass echoed the page fence into the body it returned, along with
 * a copy of the page's frontmatter as a body line. Every gate passed on the result, because
 * a page is not required to be free of the prompt's framing and the frontmatter block was
 * still there (the connector's carry-forward restored the real one above the copy).
 */
Deno.test("guardProposal refuses the prompt's own framing echoed into a page", () => {
  const prior = new Map<string, string | null>([
    ["wiki/Deno_Fork_Options.md", "---\n'@type': schema:TechArticle\n---\n\n# Deno fork options\n"],
  ]);

  // The shape the pass actually returned, frontmatter and all.
  const echoed = guardProposal(
    [{
      path: "wiki/Deno_Fork_Options.md",
      content: "---\n'@type': schema:TechArticle\n---\n\n" +
        "## --- BEGIN page wiki/Deno_Fork_Options.md ---\n\n" +
        '## "@type": schema:TechArticle schema:name: Deno fork options\n\n' +
        "# Deno fork options\n\nMore.\n\n--- END page wiki/Deno_Fork_Options.md ---\n",
      reason: "edit",
    }],
    prior,
  );
  assert(
    echoed.some((p) => p.includes("carries the prompt's own framing")),
    echoed.join("; "),
  );

  // A capture fence is the same mistake, and the guard names it the same way.
  const captureFence = guardProposal([{
    path: "wiki/Deno_Fork_Options.md",
    content: "---\n'@type': schema:TechArticle\n---\n\n--- BEGIN capture raw/discord/x.md ---\n",
    reason: "edit",
  }]);
  assert(
    captureFence.some((p) => p.includes("carries the prompt's own framing")),
    captureFence.join("; "),
  );
});

/**
 * A guard that refused a bare `---` would refuse every page, so the ways a page legitimately
 * uses three dashes are pinned here: the frontmatter block's own delimiters, a horizontal
 * rule, and a markdown table's separator row.
 */
Deno.test("guardProposal leaves the legitimate uses of three dashes alone", () => {
  assertEquals(
    guardProposal([
      {
        path: "wiki/Deno_Fork_Options.md",
        content:
          "---\n'@type': schema:TechArticle\n---\n\n# Title\n\n---\n\n| Fork | Keeps |\n| --- | --- |\n| Compatibility | Deno |\n",
        reason: "edit",
      },
    ]),
    [],
  );
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
Deno.test("buildPrompt reads an over-long capture forward and says the slice is partial", () => {
  const oldest = "OLDEST MESSAGE, not folded in yet";
  const newest = "NEWEST MESSAGE, arriving in a later run";
  const capture = `${oldest}\n${"x".repeat(CAPTURE_CHAR_CAP)}\n${newest}`;
  assert(capture.length > CAPTURE_CHAR_CAP, "fixture must exceed the cap");
  const prompt = buildPrompt(input(), [], capture);
  assert(prompt.includes(oldest), "the oldest unfolded material is what this run folds");
  assert(!prompt.includes(newest), "the tail arrives in a later run rather than being dropped");
  assert(prompt.includes("CAPTURE RANGE"), "a partial capture must say it is partial");
  assert(prompt.includes("arrives in a later run"), prompt);
});

Deno.test("buildPrompt resumes a capture from where the last run stopped", () => {
  const head = "ALREADY FOLDED BY AN EARLIER RUN";
  const tail = "NOT YET FOLDED";
  const capture = `${head}\n${tail}`;
  const prompt = buildPrompt(input({ offset: head.length + 1 }), [], capture);
  assert(prompt.includes(tail), prompt);
  assert(!prompt.includes(head), "the folded head is not sent again");
  assert(prompt.includes("earlier slices were folded in by previous runs"), prompt);
});

Deno.test("captureSlice clamps an offset past the end instead of slicing backwards", () => {
  assertEquals(captureSlice("abcdef", 99, 4), { shown: "", from: 6, to: 6, more: false });
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
