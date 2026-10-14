/**
 * The mechanical adjustments: the connector's answer to the two things the model
 * reliably gets wrong.
 *
 * Both cases below are transcribed from a real run on 2026-10-14, where the pass
 * was refused twice in a row and nothing was committed. A refused pass never
 * advances the cursor, so the same failure would have repeated every day.
 */

import { assertEquals } from "@std/assert";
import { adjustProposal } from "./wiki.ts";
import { carryFrontmatterForward } from "./guard.ts";

const PAGE = `---
"@type": schema:TechArticle
schema:name: Deno fork options
wiki:priority: high
---

# Deno fork options

The group weighed two forks.
`;

Deno.test("carryFrontmatterForward puts the block back on body-only content", () => {
  const repaired = carryFrontmatterForward(PAGE, "# Deno fork options\n\nRewritten body.\n");
  assertEquals(
    repaired,
    `---\n"@type": schema:TechArticle\nschema:name: Deno fork options\nwiki:priority: high\n---\n\n` +
      "# Deno fork options\n\nRewritten body.\n",
  );
});

Deno.test("carryFrontmatterForward leaves content that already opens with a block", () => {
  assertEquals(carryFrontmatterForward(PAGE, PAGE), null);
});

Deno.test("carryFrontmatterForward leaves a brand-new page alone", () => {
  assertEquals(carryFrontmatterForward(null, "# New page\n\nBody.\n"), null);
  assertEquals(carryFrontmatterForward(undefined, "# New page\n\nBody.\n"), null);
});

Deno.test("carryFrontmatterForward leaves a page that never had frontmatter alone", () => {
  assertEquals(carryFrontmatterForward("# Plain\n\nBody.\n", "# Plain\n\nNew body.\n"), null);
});

Deno.test("adjustProposal drops an edit to the connector-generated index", () => {
  const prior = new Map<string, string | null>([["wiki/Captures.md", "---\nx: y\n---\n\n# Captures\n"]]);
  const { edits, adjustments } = adjustProposal(
    [{ path: "wiki/Captures.md", content: "---\nx: y\n---\n\n# Captures\n\nmore\n", reason: "bump count" }],
    prior,
  );
  assertEquals(edits, []);
  assertEquals(adjustments.length, 1);
  assertEquals(adjustments[0].includes("connector-generated page"), true);
});

Deno.test("adjustProposal keeps a normal edit untouched", () => {
  const prior = new Map<string, string | null>([["wiki/Ende_vs_Dodo.md", PAGE]]);
  const { edits, adjustments } = adjustProposal(
    [{ path: "wiki/Ende_vs_Dodo.md", content: PAGE + "\nA new claim.\n", reason: "fold in capture" }],
    prior,
  );
  assertEquals(adjustments, []);
  assertEquals(edits.length, 1);
  assertEquals(edits[0].content, PAGE + "\nA new claim.\n");
});

Deno.test("adjustProposal repairs a frontmatter-stripping edit instead of refusing the pass", () => {
  const prior = new Map<string, string | null>([["wiki/Ende_vs_Dodo.md", PAGE]]);
  const { edits, adjustments } = adjustProposal(
    [{ path: "wiki/Ende_vs_Dodo.md", content: "# Ende vs Dodo\n\nBody only.\n", reason: "rewrite" }],
    prior,
  );
  assertEquals(edits.length, 1);
  assertEquals(edits[0].content.startsWith("---\n"), true);
  assertEquals(edits[0].content.includes("schema:name: Deno fork options"), true);
  assertEquals(adjustments.length, 1);
  assertEquals(adjustments[0].includes("carried the page's existing frontmatter forward"), true);
});
