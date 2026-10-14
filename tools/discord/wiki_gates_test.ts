/**
 * The embedded gates.
 *
 * These decide whether an inferred pass becomes a commit, so they are tested
 * both for the happy path (the real repo passes) and for detection (a tree with
 * a broken link must fail `lint --strict` and say why, because that failure is
 * what gets handed back to the model on the next attempt).
 */

import { assert, assertEquals } from "@std/assert";
import { gateFeedback, runWikiGates } from "./wiki_gates.ts";

const REPO_ROOT = `${Deno.cwd()}/../..`;

Deno.test("gateFeedback names only the failing gates and keeps their output", () => {
  const feedback = gateFeedback([
    { name: "fmt", ok: true, output: "3 file(s) formatted" },
    { name: "lint --strict", ok: false, output: "1 error(s):\n  - wiki/A.md: broken link" },
    { name: "orphans", ok: false, output: "no inbound link from another page:\n  - wiki/B.md" },
  ]);

  assert(feedback.includes("lint --strict FAILED"), feedback);
  assert(feedback.includes("broken link"), feedback);
  assert(feedback.includes("orphans FAILED"), feedback);
  assert(!feedback.includes("fmt"), "a passing gate must not appear in the retry prompt");
});

Deno.test("gateFeedback is empty when every gate passes", () => {
  assertEquals(gateFeedback([{ name: "fmt", ok: true, output: "" }]), "");
});

Deno.test("the repository itself passes all four gates", async () => {
  const outcomes = await runWikiGates(`${REPO_ROOT}/wiki.yml`);
  const failed = outcomes.filter((outcome) => !outcome.ok);
  assertEquals(failed.map((outcome) => `${outcome.name}: ${outcome.output}`), []);
  assertEquals(outcomes.map((outcome) => outcome.name), [
    "fmt",
    "check --strict",
    "lint --strict",
    "render --check",
  ]);
});

Deno.test("a broken link fails lint --strict and the failure is actionable", async () => {
  const root = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${root}/wiki`);
    await Deno.writeTextFile(
      `${root}/wiki.yml`,
      [
        "wiki:",
        "  input: wiki",
        "lint:",
        "  broken_links: error",
        "",
      ].join("\n"),
    );
    await Deno.writeTextFile(
      `${root}/wiki/A.md`,
      "---\nschema:name: A\n---\n\nSee [B](B.md).\n",
    );

    const outcomes = await runWikiGates(`${root}/wiki.yml`);
    const lint = outcomes.find((outcome) => outcome.name === "lint --strict");
    assert(lint, "lint ran");
    assert(!lint.ok, "a link to a page that does not exist must fail lint");
    assert(lint.output.includes("B.md"), lint.output);
    assert(gateFeedback(outcomes).includes("lint --strict FAILED"));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});
