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
import { buildPrompt, SYSTEM_PROMPT } from "./wiki.ts";

const FX_PROMPT = await Deno.readTextFile(new URL("./prompt/dcwg.md", import.meta.url));

const FORBIDS_MD_LINKS = "Never write a markdown link whose target ends in";

Deno.test("the fx prompt instructs the link form the orphan gate counts", () => {
  assertStringIncludes(FX_PROMPT, "(Deno_Fork_Options.md)");
  assert(!FX_PROMPT.includes(FORBIDS_MD_LINKS));
});

Deno.test("the api prompt instructs the link form the orphan gate counts", () => {
  assertStringIncludes(SYSTEM_PROMPT, "(Deno_Fork_Options.md)");
  assert(!SYSTEM_PROMPT.includes(FORBIDS_MD_LINKS));
});
/**
 * The api prompt fences its own input, so it has to say the fences are not page text.
 *
 * The same shape of bug as the link rule above, caught the same way: the prompt's framing
 * is invisible to every gate, and the pass on 2026-10-18 wrote it into a page body. Both
 * surfaces the model reads carry the rule, and `guardProposal` refuses an edit that
 * carries the fence anyway, so the prompt and the guard agree rather than one relying on
 * the other.
 */
const FENCE_RULE = "--- BEGIN page ... ---";

Deno.test("the api prompt says its own fences are not page content", () => {
  // The rule, in the system prompt's own words, where the fence is named as a shape.
  assertStringIncludes(SYSTEM_PROMPT, FENCE_RULE);
  assertStringIncludes(SYSTEM_PROMPT, "they are not page text");

  // And it sits next to the fences themselves, where a model copying a block is looking,
  // because that copy is the one the pass actually wrote into a page. The prompt fences
  // real paths, so this is the reminder that has to carry the rule there.
  const prompt = buildPrompt(
    {
      root: ".",
      channelName: "brainstorm",
      capturePath: "raw/discord/2026-10-18_dcwg-brainstorm.md",
    },
    [{ path: "wiki/Deno_Fork_Options.md", text: "# Deno fork options\n" }],
    "NEW MESSAGE TEXT",
  );
  assertStringIncludes(prompt, "--- BEGIN page wiki/Deno_Fork_Options.md ---");
  assertStringIncludes(prompt, "they are not page content");
});
