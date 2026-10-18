/**
 * The capture index, generated deterministically instead of by the model.
 *
 * `wiki/Captures.md` is the wiki's front door: it lists every capture and every
 * derived page. Asking the model to maintain it meant the list drifted from the
 * tree whenever a pass forgot it, and a stale index is invisible because nothing
 * fails. So the page is a pure function of the filesystem: the captures under
 * `raw/`, the pages under `wiki/`, and the site origin in `wiki.yml`. The model
 * is not allowed to write it (see `guard.ts`).
 *
 * Prose that cannot be derived lives with the thing it describes: a capture's
 * own frontmatter carries its `description`, so a new capture brings its own
 * one-line summary and the index picks it up.
 */

import { parse as parseYaml } from "@std/yaml";

/** Where captures live, and the heading each source directory gets. */
export const CAPTURE_SOURCES: Array<{ dir: string; heading: string }> = [
  { dir: "raw/discord", heading: "Discord" },
  { dir: "raw/briefs", heading: "Pasted briefs" },
];

export const INDEX_PAGE = "wiki/Captures.md";

export interface CaptureEntry {
  path: string;
  title: string;
  description: string;
  source: string;
}

export interface DerivedPage {
  file: string;
  name: string;
  description: string;
}

/** Read the `---` frontmatter block. Returns {} when there is none. */
export function frontmatter(text: string): Record<string, unknown> {
  if (!text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end === -1) return {};
  const parsed = parseYaml(text.slice(4, end));
  return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  // YAML parses an unquoted `2026-10-11` as a Date, which would otherwise be
  // dropped here and silently blank the field.
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

/** Whether this root holds a wiki at all, which its config file is what decides. */
export async function isWikiTree(root: string): Promise<boolean> {
  try {
    await Deno.stat(`${root}/wiki.yml`);
    return true;
  } catch {
    return false;
  }
}

/** The published origin for capture links, taken from the `wiki:` CURIE in wiki.yml. */
export async function readSiteOrigin(root: string): Promise<string> {
  const config = await Deno.readTextFile(`${root}/wiki.yml`);
  const match = /^\s+wiki:\s*(\S+)\s*$/m.exec(config);
  if (!match) {
    throw new Error("wiki.yml has no `wiki:` prefix, so capture URLs cannot be built");
  }
  return match[1].replace(/\/+$/, "");
}

/** Read every capture under the known source directories, sorted by path. */
export async function readCaptures(root: string): Promise<CaptureEntry[]> {
  const entries: CaptureEntry[] = [];
  for (const { dir } of CAPTURE_SOURCES) {
    let names: string[] = [];
    try {
      for await (const entry of Deno.readDir(`${root}/${dir}`)) {
        if (entry.isFile && entry.name.endsWith(".md")) names.push(entry.name);
      }
    } catch {
      continue;
    }
    names = names.sort();
    for (const name of names) {
      const text = await Deno.readTextFile(`${root}/${dir}/${name}`);
      const meta = frontmatter(text);
      entries.push({
        path: `${dir}/${name}`,
        title: asString(meta.title) || name.replace(/\.md$/, ""),
        description: asString(meta.description),
        source: asString(meta.source),
      });
    }
  }
  return entries;
}

/** Read the wiki pages that the index links to, excluding the index itself. */
export async function readIndexPages(root: string): Promise<DerivedPage[]> {
  const pages: DerivedPage[] = [];
  for await (const entry of Deno.readDir(`${root}/wiki`)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;
    const path = `wiki/${entry.name}`;
    if (path === INDEX_PAGE) continue;
    const meta = frontmatter(await Deno.readTextFile(`${root}/${path}`));
    pages.push({
      file: entry.name,
      name: asString(meta["schema:name"]) || entry.name.replace(/\.md$/, "").replace(/_/g, " "),
      description: asString(meta["schema:description"]),
    });
  }
  return pages.sort((a, b) => a.name.localeCompare(b.name));
}

function captureHeading(path: string): string {
  const dir = path.split("/").slice(0, -1).join("/");
  return CAPTURE_SOURCES.find((s) => s.dir === dir)?.heading ?? dir;
}

/**
 * Render the index. Every line is derived, so re-running on an unchanged tree
 * reproduces the file byte for byte.
 */
export function renderCapturesIndex(input: {
  siteOrigin: string;
  captures: CaptureEntry[];
  pages: DerivedPage[];
}): string {
  const { siteOrigin, captures, pages } = input;
  const lines: string[] = [
    "---",
    // Double-quoted, because the engine's formatter canonicalizes to this and the
    // index must be byte-identical to what a regeneration produces.
    '"@type": schema:TechArticle',
    "schema:name: Captures",
    "schema:description: The verbatim source captures this memory is built from, published unredacted alongside the derived pages.",
    "wazoo:source: dcwg",
    "wiki:priority: medium",
    "---",
    "",
    "# Captures",
    "",
    `Everything in this memory is derived from the ${captures.length} captures below. They are reproduced verbatim, including Discord handles, message timestamps, and the parts where people disagree with each other, because a record that only keeps the conclusions cannot be checked.`,
    "",
    "The repository is public, so these files are readable in place. The same files are also served verbatim by this site under the repository's `raw/` path, so the evidence travels with the pages that cite it.",
    "",
  ];

  // Captures are linked by absolute URL: `wiki lint` reads a relative `.md`
  // target as a wiki page and fails on one that is not.
  const headings = [...new Set(captures.map((c) => captureHeading(c.path)))];
  for (const heading of headings) {
    lines.push(`## ${heading}`, "");
    for (const capture of captures.filter((c) => captureHeading(c.path) === heading)) {
      const note = capture.description || capture.source || "Verbatim capture.";
      lines.push(`- [${capture.title}](${siteOrigin}/${capture.path}): ${note}`);
    }
    lines.push("");
  }

  lines.push("## What is derived from them", "");
  for (const page of pages) {
    const note = page.description || `A page derived from the captures above.`;
    lines.push(`- [${page.name}](${page.file}): ${note}`);
  }
  lines.push("");
  return lines.join("\n");
}

/** Write the index if it differs from what is on disk. Returns whether it changed. */
export async function writeCapturesIndex(root: string): Promise<boolean> {
  // A root with no wiki config is not a wiki, so there is no index to write and
  // nothing to say: the connector's tests build minimal roots on purpose. A config
  // that exists but carries no `wiki:` prefix is a real misconfiguration and still
  // throws, because that tree claims to be a wiki and cannot name its own captures.
  if (!(await isWikiTree(root))) return false;
  const rendered = renderCapturesIndex({
    siteOrigin: await readSiteOrigin(root),
    captures: await readCaptures(root),
    pages: await readIndexPages(root),
  });
  const path = `${root}/${INDEX_PAGE}`;
  let current = "";
  try {
    current = await Deno.readTextFile(path);
  } catch {
    // absent: fall through and write it
  }
  if (current === rendered) return false;
  await Deno.writeTextFile(path, rendered);
  return true;
}

if (import.meta.main) {
  const check = Deno.args.includes("--check");
  const root = Deno.args.find((a) => !a.startsWith("-")) ?? ".";
  if (check) {
    // Compare without writing: CI uses this to fail a stale or hand-edited index.
    const rendered = renderCapturesIndex({
      siteOrigin: await readSiteOrigin(root),
      captures: await readCaptures(root),
      pages: await readIndexPages(root),
    });
    let current = "";
    try {
      current = await Deno.readTextFile(`${root}/${INDEX_PAGE}`);
    } catch {
      // absent counts as stale
    }
    if (current !== rendered) {
      console.error(
        `${INDEX_PAGE} does not match the captures and pages in the tree. Regenerate it with ` +
          `\`deno run -A tools/discord/index_page.ts\` rather than editing it by hand.`,
      );
      Deno.exit(1);
    }
    console.log(`${INDEX_PAGE} matches the tree`);
  } else {
    const changed = await writeCapturesIndex(root);
    console.log(changed ? `regenerated ${INDEX_PAGE}` : `${INDEX_PAGE} already current`);
  }
}
