/**
 * A deterministic orphan check, run as a gate.
 *
 * The prompt asks the model to give every page an inbound link, and asking is
 * not verification: a pass that adds a page and forgets to link it succeeds, and
 * the page is invisible until a human notices. This walks the pages, builds the
 * link graph from the markdown links between them, and fails when a page has no
 * inbound link from anywhere.
 *
 * Entry points are exempt by design: the index is linked to from nowhere and
 * that is correct, so it is named in ROOT_PAGES rather than special-cased by
 * filename.
 *
 * Dependency-free on purpose, so it runs as a bare `deno run` gate with no
 * import map or lockfile in the way.
 */

export const WIKI_DIR = "wiki";

/** Pages that are entry points and are expected to have no inbound link. */
export const ROOT_PAGES: string[] = ["wiki/Captures.md"];

const MARKDOWN_LINK = /\[[^\]]*\]\(([^)\s]+?)(?:#[^)]*)?\)/g;

/** Absolute URLs, fragments, and site-root paths are not wiki-page links. */
export function localLinkTargets(text: string): string[] {
  const targets: string[] = [];
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const target = match[1];
    if (target.startsWith("#") || target.startsWith("/")) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    targets.push(target);
  }
  return targets;
}

/** Resolve a sibling-relative link against the page that contains it. */
export function resolveTarget(from: string, target: string): string | null {
  const segments = from.split("/").slice(0, -1).concat(target.split("/"));
  const out: string[] = [];
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (!out.length) return null;
      out.pop();
      continue;
    }
    out.push(segment);
  }
  return out.join("/");
}

/**
 * Count inbound links per page. Self-links do not count, and links from the
 * declared entry points do not either: the index links to every page by
 * construction, so counting it would make this check vacuous and let a page
 * whose only inbound link is the index pass as connected.
 */
export function inboundCounts(
  pages: Map<string, string>,
  ignoreSources: string[] = [],
): Map<string, number> {
  const skip = new Set(ignoreSources);
  const counts = new Map<string, number>();
  for (const path of pages.keys()) counts.set(path, 0);
  for (const [path, text] of pages) {
    if (skip.has(path)) continue;
    for (const target of localLinkTargets(text)) {
      const resolved = resolveTarget(path, target);
      if (!resolved || resolved === path) continue;
      if (!counts.has(resolved)) continue;
      counts.set(resolved, counts.get(resolved)! + 1);
    }
  }
  return counts;
}

export async function readWikiPages(root: string): Promise<Map<string, string>> {
  const pages = new Map<string, string>();
  for await (const entry of Deno.readDir(`${root}/${WIKI_DIR}`)) {
    if (!entry.isFile || !entry.name.endsWith(".md")) continue;
    const path = `${WIKI_DIR}/${entry.name}`;
    pages.set(path, await Deno.readTextFile(`${root}/${path}`));
  }
  return pages;
}

/**
 * The orphan rule against an in-memory page set: a page with no inbound link
 * from outside the entry points. findOrphans is this plus a directory read.
 */
export function orphansIn(pages: Map<string, string>, roots: string[] = ROOT_PAGES): string[] {
  const exempt = new Set(roots);
  return [...inboundCounts(pages, roots).entries()]
    .filter(([path, count]) => count === 0 && !exempt.has(path))
    .map(([path]) => path)
    .sort();
}

/** Pages with no inbound link, excluding the declared entry points. */
export async function findOrphans(root: string, roots: string[] = ROOT_PAGES): Promise<string[]> {
  return orphansIn(await readWikiPages(root), roots);
}

if (import.meta.main) {
  const root = Deno.args[0] ?? ".";
  const orphans = await findOrphans(root);
  if (orphans.length) {
    console.error(`orphan pages (no inbound link from another page): ${orphans.join(", ")}`);
    console.error(
      `Link each page from a page that already exists, or add it to ROOT_PAGES in tools/discord/orphans.ts if it is an entry point.`,
    );
    Deno.exit(1);
  }
  console.log("orphan check: every page has an inbound link");
}
