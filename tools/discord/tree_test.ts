/** The tree compare on its own: what a pass changed, and putting the tree back. */
import { assertEquals } from "@std/assert";
import { diffTree, outsideWiki, restoreTree, snapshotTree } from "./tree.ts";

async function withTempTree(
  files: Record<string, string>,
  fn: (root: string) => Promise<void>,
): Promise<void> {
  const root = await Deno.makeTempDir();
  try {
    for (const [path, text] of Object.entries(files)) {
      const full = `${root}/${path}`;
      await Deno.mkdir(full.slice(0, full.lastIndexOf("/")), { recursive: true });
      await Deno.writeTextFile(full, text);
    }
    await fn(root);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
}

Deno.test("diffTree reports added, removed, and modified paths", async () => {
  await withTempTree({ "wiki/A.md": "one", "wiki/Keep.md": "same" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.writeTextFile(`${root}/wiki/A.md`, "two");
    await Deno.writeTextFile(`${root}/wiki/New.md`, "new");
    await Deno.remove(`${root}/wiki/Keep.md`);
    const after = await snapshotTree(root);
    assertEquals(diffTree(before, after), ["wiki/A.md", "wiki/Keep.md", "wiki/New.md"]);
  });
});

Deno.test("diffTree is empty when nothing changed", async () => {
  await withTempTree({ "wiki/A.md": "one", "raw/x.md": "y" }, async (root) => {
    assertEquals(diffTree(await snapshotTree(root), await snapshotTree(root)), []);
  });
});

Deno.test("the scratch directories are outside the snapshot", async () => {
  // `.dcwg` is the connector's scratch space and marker, and `_site` is build output. Both are
  // written inside the repo root during a pass, so both have to be invisible to the
  // tree compare, or every pass would report them as files written outside wiki/.
  await withTempTree({ "wiki/A.md": "one" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.mkdir(`${root}/.dcwg`, { recursive: true });
    await Deno.writeTextFile(`${root}/.dcwg/brief.md`, "the brief");
    await Deno.mkdir(`${root}/_site/dcwg-memory`, { recursive: true });
    await Deno.writeTextFile(`${root}/_site/dcwg-memory/index.html`, "built");
    assertEquals(diffTree(before, await snapshotTree(root)), []);
  });
});

Deno.test("restoreTree returns the tree exactly as snapshotted", async () => {
  await withTempTree({ "wiki/A.md": "one", "raw/capture.md": "evidence" }, async (root) => {
    const before = await snapshotTree(root);
    await Deno.writeTextFile(`${root}/wiki/A.md`, "clobbered");
    await Deno.writeTextFile(`${root}/raw/capture.md`, "rewritten");
    await Deno.writeTextFile(`${root}/wiki/Stray.md`, "new page");
    await Deno.remove(`${root}/wiki`, { recursive: true }); // as if a whole directory went
    await restoreTree(root, before);
    assertEquals(await Deno.readTextFile(`${root}/wiki/A.md`), "one");
    assertEquals(await Deno.readTextFile(`${root}/raw/capture.md`), "evidence");
    assertEquals(diffTree(before, await snapshotTree(root)), []);
  });
});

Deno.test("outsideWiki keeps only what may not be written", () => {
  assertEquals(
    outsideWiki(["wiki/A.md", "raw/c.md", "wiki.yml", "tools/x.ts", "wiki/B.md"]),
    ["raw/c.md", "wiki.yml", "tools/x.ts"],
  );
  assertEquals(outsideWiki(["wiki/Captures.md"]), []);
});
