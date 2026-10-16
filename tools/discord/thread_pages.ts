/**
 * A deterministic thread check, run as a gate.
 *
 * A forum's posts are its entire content, so one post is one concept and gets one
 * page. The prompt asks for that, and asking is not verification: a pass that
 * folds four proposals into a single page satisfies every other gate, because the
 * page still carries a type, a name, a description, and an inbound link. This
 * reads the forum captures and the pages and fails when the two do not line up.
 *
 * Two ways to fail, and they are the two ways the intent is missed:
 *
 * - a thread in a forum capture has no page, so the post was dropped;
 * - a page anchors more than one thread, so several posts were aggregated into one
 *   page instead of being given one each.
 *
 * The anchor is `wazoo:thread: "<id>"` in a page's frontmatter. A thread id is the
 * only stable handle a post has: the connector titles a block with the thread's
 * name and its id, and a post can be renamed while its id cannot.
 *
 * The id is read out of the raw frontmatter text rather than through the YAML
 * parser, because a snowflake is larger than a YAML number holds exactly and a
 * parser would round it.
 *
 * Dependency-free on purpose, like the orphan check, so it runs as a bare
 * `deno run` gate with no import map or lockfile in the way.
 */

export const RAW_DIR = "raw/discord";
export const WIKI_DIR = "wiki";

/** A forum capture's thread heading: `## <name> (thread <id>)`. */
const THREAD_HEADING = /^## (.+?) \(thread (\d+)\)\s*$/gm;

/** The anchor a page carries in its frontmatter. */
const THREAD_ANCHOR = /^wazoo:thread:[ \t]*"?(\d+)"?[ \t]*$/gm;

/** The venue kind a capture declares, read as text for the same reason. */
const CHANNEL_TYPE = /^channel_type:[ \t]*"?([a-z]+)"?[ \t]*$/m;

/**
 * Venues whose blocks are posts rather than a channel plus its threads.
 *
 * A media channel is post-shaped the same way a forum is, so it is checked the
 * same way; only a text channel has an untitled block of its own.
 */
export const POST_SHAPED = new Set(["forum", "media"]);

export interface ForumThread {
  id: string;
  name: string;
  /** The capture it was found in, so a failure names where to look. */
  capture: string;
}

/** A file's frontmatter block, or "" when it has none. */
export function frontmatterBlock(text: string): string {
  if (!text.startsWith("---\n")) return "";
  const end = text.indexOf("\n---", 4);
  return end === -1 ? "" : text.slice(4, end);
}

/** Every thread heading in one capture's text. */
export function threadHeadings(text: string): Array<{ id: string; name: string }> {
  return [...text.matchAll(THREAD_HEADING)].map((match) => ({ id: match[2], name: match[1] }));
}

/** The thread ids one page anchors, in frontmatter order. */
export function threadAnchors(text: string): string[] {
  const block = frontmatterBlock(text);
  if (!block) return [];
  return [...block.matchAll(THREAD_ANCHOR)].map((match) => match[1]);
}

/** The venue kind a capture declares in its frontmatter, or undefined. */
export function captureKind(text: string): string | undefined {
  return CHANNEL_TYPE.exec(frontmatterBlock(text))?.[1];
}

/**
 * The posts one capture holds, read out of its own headings.
 *
 * Derived from the capture rather than from the live channel, so folding a capture
 * some later run staged describes the venue that capture came from. The alternative —
 * listing what the current fetch saw — names one venue's posts while the agent reads
 * another venue's capture.
 */
export function postsInCapture(text: string): Array<{ id: string; title: string }> {
  const kind = captureKind(text);
  if (!kind || !POST_SHAPED.has(kind)) return [];
  return threadHeadings(text).map((heading) => ({ id: heading.id, title: heading.name }));
}

/** Every markdown file directly in a directory, sorted; [] when it is absent. */
async function markdownFiles(dir: string): Promise<string[]> {
  const names: string[] = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith(".md")) names.push(entry.name);
    }
  } catch {
    return [];
  }
  return names.sort();
}

/** Every post in every capture that declares itself a post-shaped venue. */
export async function findForumThreads(root: string): Promise<ForumThread[]> {
  const threads: ForumThread[] = [];
  for (const name of await markdownFiles(`${root}/${RAW_DIR}`)) {
    const path = `${RAW_DIR}/${name}`;
    const text = await Deno.readTextFile(`${root}/${path}`);
    for (const post of postsInCapture(text)) {
      threads.push({ id: post.id, name: post.title, capture: path });
    }
  }
  return threads;
}

/** Which pages anchor each thread id. */
export async function findThreadPages(root: string): Promise<Map<string, string[]>> {
  const byThread = new Map<string, string[]>();
  for (const name of await markdownFiles(`${root}/${WIKI_DIR}`)) {
    const path = `${WIKI_DIR}/${name}`;
    const text = await Deno.readTextFile(`${root}/${path}`);
    for (const id of threadAnchors(text)) {
      const pages = byThread.get(id) ?? [];
      pages.push(path);
      byThread.set(id, pages);
    }
  }
  return byThread;
}

/**
 * One line per problem, empty when every post has a page of its own.
 *
 * A thread anchored by two pages is not a problem: two pages can both describe one
 * post, and the failure this exists to catch is the opposite one.
 */
export async function findThreadProblems(root: string): Promise<string[]> {
  const threads = await findForumThreads(root);
  if (!threads.length) return [];
  const byThread = await findThreadPages(root);
  const problems: string[] = [];

  for (const thread of threads) {
    if (byThread.has(thread.id)) continue;
    problems.push(`${thread.capture}: thread ${thread.id} (${thread.name}) has no page`);
  }

  const byPage = new Map<string, string[]>();
  for (const [id, pages] of byThread) {
    for (const page of pages) {
      const ids = byPage.get(page) ?? [];
      ids.push(id);
      byPage.set(page, ids);
    }
  }
  for (const [page, ids] of byPage) {
    if (ids.length < 2) continue;
    problems.push(
      `${page} anchors ${ids.length} threads (${ids.join(", ")}); a forum post gets its own page`,
    );
  }

  return problems;
}

if (import.meta.main) {
  const root = Deno.args[0] ?? ".";
  const problems = await findThreadProblems(root);
  if (problems.length) {
    console.error(`forum posts without a page of their own:\n  - ${problems.join("\n  - ")}`);
    console.error(
      `Give each forum thread its own page under wiki/ and anchor it with \`wazoo:thread: "<id>"\` in the frontmatter.`,
    );
    Deno.exit(1);
  }
  console.log("thread check: every forum post has a page of its own");
}
