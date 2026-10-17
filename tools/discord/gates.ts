/**
 * Run the repo's gates with no subprocess and no Python.
 *
 * The connector embeds the engine so a run can judge its own output, and this
 * exposes that same path as a command: the four wiki gates plus the orphan and
 * thread checks, exiting non-zero when any of them fails. CI and a human run the
 * same code, so a gate cannot pass here and fail there.
 *
 * The site build (`deno task build`) is deliberately absent: it renders the
 * published site rather than validating the record.
 *
 * Usage:
 *   deno task gates
 */

import { runWikiGates, gateFeedback } from "./wiki_gates.ts";
import { findOrphans } from "./orphans.ts";
import { findForumThreads, findThreadProblems } from "./thread_pages.ts";

export async function runGates(root: string): Promise<string[]> {
  const outcomes = await runWikiGates(`${root}/wiki.yml`);
  const orphans = await findOrphans(root);
  /**
   * The orphan message names the link form the prompt names, because this text is what
   * the model is handed when the pass is retried: a gate that says only what is wrong
   * leaves the model to guess the link form, and the form it guessed was a backticked
   * page name, which this check cannot see.
   */
  outcomes.push({
    name: "orphans",
    ok: orphans.length === 0,
    output: orphans.length === 0
      ? "every page has an inbound link"
      : `no inbound link from another page:\n  - ${orphans.join("\n  - ")}\n` +
        `Link each of these from a page that already exists, with a relative markdown ` +
        `link to its filename, for example [Deno fork options and naming](Deno_Fork_Options.md). ` +
        `A link from wiki/Captures.md does not count, and a link inside the orphan page ` +
        `itself does not count.`,
  });
  /**
   * Every forum post gets its own page. The output names the count it covered,
   * because a pass over zero captures proves nothing and should not read like one
   * that checked four proposals.
   */
  const threadProblems = await findThreadProblems(root);
  const postCount = (await findForumThreads(root)).length;
  outcomes.push({
    name: "threads",
    ok: threadProblems.length === 0,
    output: threadProblems.length === 0
      ? (postCount
        ? `every one of ${postCount} forum post(s) has its own page`
        : "no post-shaped captures yet")
      : `a forum post is missing its own page:\n  - ${threadProblems.join("\n  - ")}`,
  });

  for (const outcome of outcomes) {
    console.log(`${outcome.ok ? "PASS" : "FAIL"}  ${outcome.name}`);
  }
  return outcomes.filter((outcome) => !outcome.ok).map((outcome) => outcome.name);
}

if (import.meta.main) {
  const root = Deno.args[0] ?? new URL("../..", import.meta.url).pathname;
  const failed = await runGates(root.replace(/\/$/, ""));
  if (failed.length > 0) {
    console.error(`\n${failed.length} gate(s) failed: ${failed.join(", ")}`);
    Deno.exit(1);
  }
  console.log("\nall gates pass");
}
