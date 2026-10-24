/**
 * The thread check: every forum post gets a page of its own.
 *
 * The two failures this exists for are the two ways a pass misses the intent, and
 * neither is visible to any other gate: a post nobody wrote a page for, and
 * several proposals aggregated into one page. A capture declares its venue kind,
 * so the check reads that rather than guessing from the shape of its blocks.
 */

import { assert, assertEquals } from "@std/assert";
import { findForumThreads, findThreadProblems, threadAnchors, threadHeadings } from "./thread_pages.ts";

const FORUM = "1559218298128695386";

/** A capture in the connector's own shape, with one heading per thread. */
function capture(kind: string, threads: Array<[string, string]>): string {
  const blocks = threads.map(([id, name]) => `## ${name} (thread ${id})\n\n**andy** — a message\n`)
    .join(
      "\n---\n\n",
    );
  return `---\ntitle: "Discord #propose — 2026-10-16"\n` +
    `source: "Discord REST API, channel ${FORUM}, UTC timestamps"\n` +
    `channel_type: ${kind}\n---\n\nbody\n\n---\n${blocks}`;
}

/** A wiki page in the shape the guard allows, with the given thread anchors. */
function page(name: string, anchors: string[]): string {
  const lines = anchors.map((id) => `wazoo:thread: "${id}"\n`).join("");
  return `---\n"@type": schema:TechArticle\nschema:name: ${name}\nschema:description: d\n${lines}---\n\n# ${name}\n`;
}

async function tree(files: Record<string, string>): Promise<string> {
  const root = await Deno.makeTempDir();
  for (const [path, text] of Object.entries(files)) {
    const dir = path.split("/").slice(0, -1).join("/");
    if (dir) await Deno.mkdir(`${root}/${dir}`, { recursive: true });
    await Deno.writeTextFile(`${root}/${path}`, text);
  }
  return root;
}

Deno.test("threadHeadings reads the connector's own heading and nothing else", () => {
  const text = "# Title\n\n## Rust Academy? (thread 20)\n\n" +
    "## a message that happens to start with hashes\n\n## Sustainability idea (thread 21)\n";
  assertEquals(threadHeadings(text), [
    { id: "20", name: "Rust Academy?" },
    { id: "21", name: "Sustainability idea" },
  ]);
});

Deno.test("threadAnchors reads frontmatter only, and keeps a snowflake exact", () => {
  const id = "1559219836297547847";
  const text = `---\nwazoo:thread: "${id}"\n---\n\nA body line that says wazoo:thread: "999".\n`;
  assertEquals(threadAnchors(text), [id]);
  assert(
    BigInt(id) > BigInt(Number.MAX_SAFE_INTEGER),
    "the fixture has to be bigger than a YAML number holds exactly, or it proves nothing",
  );
});

Deno.test("a forum post with no page is reported, naming the capture and the post", async () => {
  const root = await tree({
    "raw/discord/2026-10-16_dcwg-propose.md": capture("forum", [["20", "Rust Academy?"]]),
    "wiki/Deno.md": page("Deno", []),
  });
  const problems = await findThreadProblems(root);
  assertEquals(problems.length, 1);
  assert(problems[0].includes("2026-10-16_dcwg-propose.md"), problems[0]);
  assert(problems[0].includes("thread 20"), problems[0]);
  assert(problems[0].includes("Rust Academy?"), problems[0]);
});

Deno.test("a forum post with a page of its own passes", async () => {
  const root = await tree({
    "raw/discord/2026-10-16_dcwg-propose.md": capture("forum", [["20", "Rust Academy?"]]),
    "wiki/Rust_Academy.md": page("Rust Academy", ["20"]),
  });
  assertEquals(await findThreadProblems(root), []);
});

Deno.test("a text channel's threads are not required to have pages of their own", async () => {
  const root = await tree({
    "raw/discord/2026-10-16_dcwg-brainstorm.md": capture("text", [["30", "side discussion"]]),
    "wiki/Deno.md": page("Deno", []),
  });
  assertEquals(await findForumThreads(root), []);
  assertEquals(await findThreadProblems(root), []);
});

Deno.test("a page holding two posts is reported, because that is the aggregation", async () => {
  const root = await tree({
    "raw/discord/2026-10-16_dcwg-propose.md": capture("forum", [
      ["20", "Rust Academy?"],
      ["21", "Sustainability idea"],
    ]),
    "wiki/Proposals.md": page("Proposals", ["20", "21"]),
  });
  const problems = await findThreadProblems(root);
  assertEquals(problems.length, 1);
  assert(problems[0].includes("anchors 2 threads"), problems[0]);
  assert(problems[0].includes("gets its own page"), problems[0]);
});

Deno.test("a media channel is post-shaped too, and no captures means nothing to check", async () => {
  const root = await tree({
    "raw/discord/2026-10-16_dcwg-clips.md": capture("media", [["40", "a clip"]]),
  });
  assertEquals((await findForumThreads(root)).map((thread) => thread.id), ["40"]);

  const empty = await tree({ "wiki/Deno.md": page("Deno", []) });
  assertEquals(await findThreadProblems(empty), []);
});
