/**
 * The prompt and the orphan gate have to agree on one thing: the link form.
 *
 * They disagreed until 2026-10-17, and the disagreement was the whole bug. The prompt
 * told the model never to write a markdown link ending in `.md` and to name a page in
 * backticks instead, while `orphans.ts` counts exactly that link and cannot see a
 * backticked name. Any pass that added a page was therefore unsatisfiable, and the fold
 * of the 594-message `#brainstorm` capture failed both of its attempts on
 * `wiki/Deno_Desktop.md`.
 *
 * Asserting on prose is blunt, so this is aimed at the contract rather than the wording:
 * the prompt must instruct the relative `.md` link, and must not forbid it. The gate's
 * side of the same contract is pinned in `orphans_test.ts`.
 */
import { assert, assertStringIncludes } from "@std/assert";

const PASS_PROMPT = await Deno.readTextFile(new URL("./prompt/dcwg-pass.md", import.meta.url));

const FORBIDS_MD_LINKS = "Never write a markdown link whose target ends in";

Deno.test("the pass prompt instructs the link form the orphan gate counts", () => {
  assertStringIncludes(PASS_PROMPT, "(Deno_Fork_Options.md)");
  assert(!PASS_PROMPT.includes(FORBIDS_MD_LINKS));
});

Deno.test("the pass prompt tells the model its framing tags are not page text", () => {
  // The staged prompts wrap the capture and pages in tags, and a model copying a block
  // would otherwise carry the tag into a page, where no gate sees it.
  assertStringIncludes(PASS_PROMPT, "<capture>");
  assertStringIncludes(PASS_PROMPT, "never copy one into a page");
});
