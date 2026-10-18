/**
 * The guards: what a model is allowed to write, and what SUMMARY.json must say.
 *
 * These are the checks that stand between an inferred edit and a public,
 * append-only record, so they are tested adversarially rather than for the happy
 * path alone.
 */

import { assert, assertEquals } from "@std/assert";
import {
  checkEditablePath,
  CODE_OWNED,
  MAX_PAGE_BYTES,
  validateSummary,
  WIKI_FILENAME,
} from "./guard.ts";

Deno.test("checkEditablePath allows wiki pages with conforming names", () => {
  for (const path of ["wiki/Deno_Core_Working_Group.md", "wiki/A-1_(x).md"]) {
    const check = checkEditablePath(path);
    assert(check.ok, `${path}: ${check.ok ? "" : check.reason}`);
  }
  assert(WIKI_FILENAME.test("Deno_Core_Working_Group.md"));
});

Deno.test("checkEditablePath refuses the generated capture index", () => {
  const check = checkEditablePath("wiki/Captures.md");
  assert(!check.ok);
  assert(CODE_OWNED.has("wiki/Captures.md"));
});

Deno.test("checkEditablePath refuses anything outside the wiki", () => {
  const cases: Array<[string, string]> = [
    ["raw/discord/2026-08-01_talk.md", "the append-only record"],
    ["wiki.yml", "the wiki config"],
    ["AGENTS.md", "the agent instructions"],
    ["README.md", "the readme"],
    ["build.py", "the build script"],
    [".github/workflows/ci.yml", "CI"],
    ["layouts/page.html", "layouts"],
    ["assets/style.css", "assets"],
  ];
  for (const [path, what] of cases) {
    const check = checkEditablePath(path);
    assert(!check.ok, `${path} (${what}) was allowed`);
  }
});

Deno.test("checkEditablePath refuses traversal and absolute paths", () => {
  for (
    const path of [
      "../raw/discord/x.md",
      "wiki/../raw/discord/x.md",
      "wiki/./x.md",
      "/etc/passwd",
      "/home/workspace/wiki/x.md",
      "C:\\wiki\\x.md",
      "wiki\\x.md",
      "",
    ]
  ) {
    const check = checkEditablePath(path);
    assert(!check.ok, `${path} was allowed`);
  }
});

Deno.test("checkEditablePath refuses non-page filenames", () => {
  for (
    const path of [
      "wiki/x.txt",
      "wiki/x.json",
      "wiki/.md",
      "wiki/x.md.bak",
      "wiki/",
      "wiki/sub/dir.md",
    ]
  ) {
    const check = checkEditablePath(path);
    assert(!check.ok, `${path} was allowed`);
  }
});

Deno.test("checkEditablePath enforces the page size cap", () => {
  assert(checkEditablePath("wiki/X.md", MAX_PAGE_BYTES).ok);
  const over = checkEditablePath("wiki/X.md", MAX_PAGE_BYTES + 1);
  assert(!over.ok);
  assert(over.reason.includes("exceeds"));
});

function summary(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    status: "OK",
    connector: "discord",
    fetched: 12,
    ingested: 2,
    skipped_by_appraisal: 0,
    actionable_candidates: 12,
    cursor: "1532900671488000000",
    lastRun: "2026-08-01T12:00:00Z",
    ...over,
  };
}

Deno.test("validateSummary accepts a conforming summary, extras included", () => {
  assertEquals(validateSummary(summary()), []);
  // The connector records a capture count the hub's contract does not name.
  assertEquals(validateSummary(summary({ captures: 7 })), []);
  // The hub allows a null cursor and lastRun on a first run.
  assertEquals(validateSummary(summary({ cursor: null, lastRun: null })), []);
});

Deno.test("validateSummary refuses a missing key, a wrong type, and a bad status", () => {
  const missing = summary();
  delete missing.cursor;
  assert(validateSummary(missing).length > 0);

  assert(validateSummary(summary({ fetched: "12" })).length > 0);
  assert(validateSummary(summary({ ingested: null })).length > 0);
  assert(validateSummary(summary({ status: "BROKEN" })).length > 0);
  assert(validateSummary(summary({ lastRun: "yesterday" })).length > 0);
  assert(
    validateSummary(summary({ connector: "discord", status: "NEEDS_ATTENTION" })).length === 0,
  );
  assert(validateSummary(null).length > 0);
});
