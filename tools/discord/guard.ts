/**
 * Guards for the two things this connector could get badly wrong.
 *
 * 1. What an LLM is allowed to write. Captures are append-only evidence about
 *    named third parties, so the model may only touch wiki pages: never `raw/`,
 *    never a workflow, never a build file, never a path that escapes the repo.
 * 2. What `raw/discord/SUMMARY.json` must contain. The hub's memory-check owns
 *    this contract (`wazootech/memory` scripts/memory_check.py); this validates
 *    the same shape locally so a malformed summary cannot be committed.
 */

/** Mirrors SUMMARY_CONTRACT in the hub's scripts/memory_check.py. */
export const SUMMARY_CONTRACT: Record<string, "string" | "int" | "nullable_string"> = {
  status: "string",
  connector: "string",
  fetched: "int",
  ingested: "int",
  skipped_by_appraisal: "int",
  actionable_candidates: "int",
  cursor: "nullable_string",
  lastRun: "nullable_string",
};

export const VALID_STATUSES = ["OK", "NEEDS_ATTENTION"];

/** Connector-owned files that are expected to change on every run. */
export const MUTABLE_BASENAMES = new Set([
  "SUMMARY.json",
  ".cursor",
  ".sync_token",
  "thread_ids.json",
  ".gitkeep",
]);

/** Pages may only be written under this prefix, relative to the repo root. */
export const WIKI_PREFIX = "wiki/";
/** Pages the connector generates from the tree, which the model may not write. */
/**
 * Pages the connector generates from the tree. A model edit to one of these is
 * refused rather than accepted and then overwritten, so the failure is visible
 * in the run instead of silent.
 */
export const CODE_OWNED = new Set([`${WIKI_PREFIX}Captures.md`]);

/** The filename policy from wiki.yml: `[A-Za-z0-9_()-]+\.md`. */
export const WIKI_FILENAME = /^[A-Za-z0-9_()-]+\.md$/;

/** A page large enough to suggest the model ran away. */
export const MAX_PAGE_BYTES = 128 * 1024;

/**
 * A page opens with a YAML frontmatter block.
 *
 * The wiki gates do not require frontmatter, so a rewrite that flattens the
 * block into body text passes every check while silently destroying the page's
 * type and source. That makes this the one content property worth asserting in
 * code rather than asking the model to respect.
 */
export function hasFrontmatter(text: string): boolean {
  return /^---\r?\n/.test(text);
}

export type PathCheck = { ok: true } | { ok: false; reason: string };

/**
 * Decide whether a model-proposed path may be written.
 *
 * Deliberately an allowlist: only `wiki/<Name>.md`. A denylist would have to
 * anticipate every way to reach `raw/`, and append-only evidence is the one
 * thing here that cannot be repaired after the fact.
 */
export function checkEditablePath(path: string, contentBytes = 0): PathCheck {
  if (!path) return { ok: false, reason: "empty path" };
  if (path.includes("\\")) return { ok: false, reason: "backslash in path" };
  if (path.startsWith("/")) return { ok: false, reason: "absolute path" };
  if (/^[A-Za-z]:/.test(path)) return { ok: false, reason: "drive-letter path" };

  const segments = path.split("/");
  if (segments.some((s) => s === ".." || s === "" || s === ".")) {
    return { ok: false, reason: "traversal or empty segment" };
  }
  if (!path.startsWith(WIKI_PREFIX)) {
    return { ok: false, reason: `outside ${WIKI_PREFIX} (captures and config are not model-writable)` };
  }
  if (CODE_OWNED.has(path)) {
    return { ok: false, reason: `${path} is generated from the tree, so the model may not write it` };
  }

  const basename = segments[segments.length - 1];
  if (!WIKI_FILENAME.test(basename)) {
    return { ok: false, reason: `basename violates the wiki filename policy: ${basename}` };
  }
  if (segments.length !== 2) {
    return { ok: false, reason: "pages live directly under wiki/, not in subdirectories" };
  }
  if (contentBytes > MAX_PAGE_BYTES) {
    return { ok: false, reason: `page exceeds ${MAX_PAGE_BYTES} bytes` };
  }
  return { ok: true };
}

function isIso8601(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

/** Validate a summary against the hub's contract. Returns a list of problems. */
export function validateSummary(summary: unknown): string[] {
  const errors: string[] = [];
  if (typeof summary !== "object" || summary === null || Array.isArray(summary)) {
    return ["SUMMARY.json must be a JSON object"];
  }
  const record = summary as Record<string, unknown>;
  for (const [key, kind] of Object.entries(SUMMARY_CONTRACT)) {
    if (!(key in record)) {
      errors.push(`missing required key: ${key}`);
      continue;
    }
    const value = record[key];
    if (kind === "string" && typeof value !== "string") errors.push(`${key} must be a string`);
    if (kind === "int" && !Number.isInteger(value)) errors.push(`${key} must be an integer`);
    if (kind === "nullable_string" && value !== null && typeof value !== "string") {
      errors.push(`${key} must be a string or null`);
    }
  }
  const status = record.status;
  if (typeof status === "string" && !VALID_STATUSES.includes(status)) {
    errors.push(`status must be one of ${VALID_STATUSES.join(", ")}, got ${status}`);
  }
  const lastRun = record.lastRun;
  if (typeof lastRun === "string" && !isIso8601(lastRun)) {
    errors.push("lastRun must be ISO 8601 or null");
  }
  return errors;
}
