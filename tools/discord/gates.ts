/**
 * Run the repo's gates with no subprocess and no Python.
 *
 * The connector embeds the engine so a run can judge its own output, and this
 * exposes that same path as a command: the four wiki gates plus the orphan
 * check, exiting non-zero when any of them fails. CI and a human run the same
 * code, so a gate cannot pass here and fail there.
 *
 * `build.py` is deliberately absent. It is the templates' Python site builder
 * and has no Deno port yet, so it is not a gate.
 *
 * Usage:
 *   deno task gates
 */

import { runWikiGates, gateFeedback } from "./wiki_gates.ts";
import { findOrphans } from "./orphans.ts";

export async function runGates(root: string): Promise<string[]> {
  const outcomes = await runWikiGates(`${root}/wiki.yml`);
  const orphans = await findOrphans(root);
  outcomes.push({
    name: "orphans",
    ok: orphans.length === 0,
    output: orphans.length === 0
      ? "every page has an inbound link"
      : `no inbound link from another page:\n  - ${orphans.join("\n  - ")}`,
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
