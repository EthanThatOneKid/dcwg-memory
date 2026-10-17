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
 * each prompt surface must instruct the relative `.md` link, and neither may forbid it.
 * The gate's side of the same contract is pinned in `orphans_test.ts`.
 */
import { assert, assertStringIncludes } from "@std/assert";
import { SYSTEM_PROMPT } from "./wiki.ts";

const OPENCODE_PROMPT = await Deno.readTextFile(new URL("./prompt/dcwg.md", import.meta.url));

const FORBIDS_MD_LINKS = "Never write a markdown link whose target ends in";

Deno.test("the opencode prompt instructs the link form the orphan gate counts", () => {
  assertStringIncludes(OPENCODE_PROMPT, "(Deno_Fork_Options.md)");
  assert(!OPENCODE_PROMPT.includes(FORBIDS_MD_LINKS));
});

Deno.test("the api prompt instructs the link form the orphan gate counts", () => {
  assertStringIncludes(SYSTEM_PROMPT, "(Deno_Fork_Options.md)");
  assert(!SYSTEM_PROMPT.includes(FORBIDS_MD_LINKS));
});
