/**
 * What a pass may change, and how a failed one is undone.
 *
 * The staged pass writes pages itself, so the connector's control over the write surface
 * is a before/after compare of the whole tree: anything that changed outside `wiki/`
 * reverts the attempt, and a failed attempt is restored to the snapshot taken before it.
 * Nothing in the pass is trusted to stay inside `wiki/` on its own.
 */

/** Directories the snapshot ignores: version control, tool state, build output. */
const IGNORED_DIRS = [".git", ".dcwg", "_site", "node_modules"];

export interface FileTree {
  /** Repo-relative path -> file content. Text only; this repo is all text. */
  files: Map<string, string>;
}

/** Read the whole working tree into memory, minus the ignored directories. */
export async function snapshotTree(root: string): Promise<FileTree> {
  const files = new Map<string, string>();
  async function walk(dir: string, prefix: string): Promise<void> {
    for await (const entry of Deno.readDir(dir)) {
      if (IGNORED_DIRS.includes(entry.name)) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory) {
        await walk(`${dir}/${entry.name}`, rel);
      } else if (entry.isFile) {
        try {
          files.set(rel, await Deno.readTextFile(`${dir}/${entry.name}`));
        } catch {
          // A file that is not valid UTF-8 cannot be a wiki page. Record it as
          // present with unreadable content so a later diff still sees a change
          // in its existence rather than silently losing it.
          files.set(rel, "");
        }
      }
    }
  }
  await walk(root, "");
  return { files };
}

/** Paths that differ between two snapshots: added, removed, or modified. */
export function diffTree(before: FileTree, after: FileTree): string[] {
  const changed: string[] = [];
  for (const [path, text] of after.files) {
    if (!before.files.has(path)) changed.push(path);
    else if (before.files.get(path) !== text) changed.push(path);
  }
  for (const path of before.files.keys()) {
    if (!after.files.has(path)) changed.push(path);
  }
  return changed.sort();
}

/** Put the tree back exactly as the snapshot found it. */
export async function restoreTree(root: string, before: FileTree): Promise<void> {
  const after = await snapshotTree(root);
  for (const path of diffTree(before, after)) {
    const wanted = before.files.get(path);
    const full = `${root}/${path}`;
    if (wanted === undefined) {
      try {
        await Deno.remove(full);
      } catch {
        // already gone
      }
      continue;
    }
    await Deno.mkdir(full.slice(0, full.lastIndexOf("/")), { recursive: true });
    await Deno.writeTextFile(full, wanted);
  }
}

/**
 * Everything a run changed that is not a wiki page, and so not writable.
 *
 * `wiki/Captures.md` is under `wiki/` and passes here, which is correct: the
 * connector regenerates it from the tree after the pass, so an edit to it is
 * discarded rather than refused.
 */
export function outsideWiki(changed: string[]): string[] {
  return changed.filter((path) => !path.startsWith("wiki/"));
}

/**
 * The marker that tells the workflow `wiki/` is safe to commit.
 *
 * It lives under `.dcwg/` precisely because that path is gitignored and never staged,
 * and the workflow deletes the directory before each venue runs, so one venue's marker
 * cannot authorise the next venue's crash.
 */
export const PAGES_OK_PATH = ".dcwg/pages-ok";

/**
 * Record whether every page edit currently on disk passed the gates.
 *
 * `ok: false` is not the same as leaving no marker: it says the tree is in a known state
 * (the baseline, because a failed fold reverts) while the marker that authorises a
 * commit is absent. Removing any earlier marker is the point, so it is unconditional.
 */
export async function writePagesOk(root: string, ok: boolean): Promise<void> {
  const path = `${root}/${PAGES_OK_PATH}`;
  if (!ok) {
    try {
      await Deno.remove(path);
    } catch {
      // no marker to remove
    }
    return;
  }
  await Deno.mkdir(`${root}/.dcwg`, { recursive: true });
  await Deno.writeTextFile(path, `${new Date().toISOString()}\n`);
}
