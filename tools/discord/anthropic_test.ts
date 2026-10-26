import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  type CallRequest,
  type Complete,
  composePage,
  emptyUsage,
  estimateCostUsd,
  expandPlan,
  normalizePlan,
  PageSchema,
  type Plan,
  PlanSchema,
  renderIndex,
  runAnthropicPass,
  splitCapture,
  type Usage,
  validatePlan,
  type WikiPage,
} from "./anthropic.ts";
import { postsInCapture } from "./thread_pages.ts";

const HEADER = `---
title: "Discord #propose"
channel_type: forum
---

Append-only capture of \`#propose\`.

---
`;

function post(id: string, title: string, runs: number, size = 200): string {
  const messages = Array.from(
    { length: runs },
    (_, i) => `**user${i}** — 2026-10-12T15:0${i % 10}:00Z (\`${id}${i}\`)\n\n${"x".repeat(size)}`,
  );
  return `## ${title} (thread ${id})\n\n${messages.join("\n\n")}\n`;
}

const page = (path: string, name: string, anchors: string[] = []): WikiPage => ({
  path,
  name,
  description: "",
  anchors,
  text: `---\n"@type": schema:Thing\nschema:name: ${name}\n---\n\n# ${name}\n\nBody.\n`,
});

Deno.test("both answers serialize to a JSON schema the API accepts", () => {
  for (const schema of [PlanSchema, PageSchema]) {
    const format = zodOutputFormat(schema);
    assertEquals(format.type, "json_schema");
    assertEquals((format.schema as { type?: string }).type, "object");
  }
});

Deno.test("a capture under the limit is one part, untouched", () => {
  const text = HEADER + post("111", "One", 3);
  assertEquals(splitCapture(text, text.length + 1), [text]);
});

Deno.test("a long forum capture splits between threads and keeps every part readable", () => {
  const text = HEADER + post("111", "One", 4) + "\n" + post("222", "Two", 4) + "\n" +
    post("333", "Three", 4);
  const parts = splitCapture(text, 1_800);
  assert(parts.length > 1);
  for (const part of parts) {
    assert(part.length <= 1_800 + 600, `part of ${part.length} chars is far over the limit`);
    // Each part still declares its venue kind, so its posts can be read.
    assertEquals(postsInCapture(part).length > 0, true);
  }
  // No thread is lost, and no message is cut in half.
  const ids = new Set(parts.flatMap((part) => postsInCapture(part).map((p) => p.id)));
  assertEquals([...ids].sort(), ["111", "222", "333"]);
  assertEquals(parts.join("").split("`1110`").length - 1 >= 1, true);
});

Deno.test("a thread longer than the limit repeats its heading on the continuation", () => {
  const text = HEADER + post("111", "Long thread", 12, 400);
  const parts = splitCapture(text, 2_500);
  assert(parts.length > 1);
  for (const part of parts) assertStringIncludes(part, "## Long thread (thread 111)");
  assertStringIncludes(parts[1], "[continued from the previous part]");
});

Deno.test("a plan is rejected for each rule it breaks", () => {
  const pages = [page("wiki/Deno.md", "Deno"), page("wiki/Anchored.md", "Anchored", ["111"])];
  const posts = [{ id: "111", title: "One" }, { id: "222", title: "Two" }];
  const plan: Plan = {
    summary: "x",
    pages: [
      // outside wiki/, and a create without linked_from
      {
        path: "raw/x.md",
        action: "create",
        concept: "c",
        thread_id: null,
        instructions: "i",
        linked_from: null,
      },
      // a create over an existing page
      {
        path: "wiki/Deno.md",
        action: "create",
        concept: "c",
        thread_id: null,
        instructions: "i",
        linked_from: "wiki/Deno.md",
      },
      // an update of a page that is not there
      {
        path: "wiki/Nope.md",
        action: "update",
        concept: "c",
        thread_id: null,
        instructions: "i",
        linked_from: null,
      },
      // a second page for a post that already has one
      {
        path: "wiki/Second.md",
        action: "create",
        concept: "c",
        thread_id: "111",
        instructions: "i",
        linked_from: "wiki/Deno.md",
      },
    ],
  };
  const problems = validatePlan(plan, { pages, posts }).join("\n");
  assertStringIncludes(problems, "raw/x.md: outside wiki/");
  assertStringIncludes(problems, 'a create needs "linked_from"');
  assertStringIncludes(problems, "wiki/Deno.md already exists");
  assertStringIncludes(problems, "wiki/Nope.md does not exist");
  assertStringIncludes(problems, "forum post 111 would have 2 pages");
  assertStringIncludes(problems, "forum post 222");
});

Deno.test("a sound forum plan has no problems", () => {
  const pages = [page("wiki/Deno.md", "Deno")];
  const plan: Plan = {
    summary: "x",
    pages: [{
      path: "wiki/Rust_Core.md",
      action: "create",
      concept: "Rust core",
      thread_id: "111",
      instructions: "i",
      linked_from: "wiki/Deno.md",
    }],
  };
  assertEquals(validatePlan(plan, { pages, posts: [{ id: "111", title: "One" }] }), []);
});

Deno.test("an empty plan is valid for a text channel", () => {
  assertEquals(
    validatePlan({ summary: "nothing durable", pages: [] }, { pages: [], posts: [] }),
    [],
  );
});

Deno.test("a create adds the inbound link to the page it is linked from", () => {
  const pages = [page("wiki/Deno.md", "Deno")];
  const ops = expandPlan({
    summary: "x",
    pages: [{
      path: "wiki/Rust_Core.md",
      action: "create",
      concept: "Rust core",
      thread_id: null,
      instructions: "write it",
      linked_from: "wiki/Deno.md",
    }],
  }, pages);
  assertEquals(ops.map((op) => `${op.action}:${op.path}`), [
    "create:wiki/Rust_Core.md",
    "update:wiki/Deno.md",
  ]);
  assertStringIncludes(ops[1].instructions, "[Rust core](Rust_Core.md)");
});

Deno.test("an update keeps the page's frontmatter, whatever the model returns", () => {
  const current = page("wiki/Deno.md", "Deno");
  const op = {
    path: "wiki/Deno.md",
    action: "update" as const,
    concept: "c",
    thread_id: null,
    instructions: "i",
    linked_from: null,
  };
  const out = { type: "", name: "", description: "" };

  const bodyOnly = composePage(op, current, { ...out, body: "# Deno\n\nNew body.\n" });
  assert(bodyOnly.ok);
  assert(bodyOnly.content.startsWith('---\n"@type": schema:Thing\nschema:name: Deno\n---\n'));
  assertStringIncludes(bodyOnly.content, "New body.");

  // A model that invents its own block does not get to replace the page's.
  const forged = composePage(op, current, {
    ...out,
    body: '---\n"@type": schema:Evil\n---\n\n# Deno\n\nNew body.\n',
  });
  assert(forged.ok);
  assert(!forged.content.includes("schema:Evil"));
  assert(forged.content.startsWith('---\n"@type": schema:Thing'));
});

Deno.test("a create composes its own frontmatter, with the thread anchor", () => {
  const op = {
    path: "wiki/Rust_Core.md",
    action: "create" as const,
    concept: "c",
    thread_id: "111",
    instructions: "i",
    linked_from: "wiki/Deno.md",
  };
  const made = composePage(op, undefined, {
    body: "# Rust core\n\nA proposal.\n",
    type: "schema:TechArticle",
    name: "Rust core",
    description: "A proposal\nacross lines.",
  });
  assert(made.ok);
  assertStringIncludes(made.content, '"@type": schema:TechArticle');
  assertStringIncludes(made.content, 'wazoo:thread: "111"');
  assertStringIncludes(made.content, 'schema:description: "A proposal across lines."');
});

Deno.test("composePage refuses a bad type, an empty body, a prompt fence, and a bad path", () => {
  const create = {
    path: "wiki/Ok.md",
    action: "create" as const,
    concept: "c",
    thread_id: null,
    instructions: "i",
    linked_from: "wiki/Deno.md",
  };
  const good = { body: "# Ok\n\nText.\n", type: "schema:Thing", name: "Ok", description: "d" };
  assert(composePage(create, undefined, good).ok);
  assert(!composePage(create, undefined, { ...good, type: "Thing" }).ok);
  assert(!composePage(create, undefined, { ...good, body: "   " }).ok);
  assert(!composePage(create, undefined, { ...good, body: "--- BEGIN page wiki/X.md ---\nx" }).ok);
  assert(!composePage({ ...create, path: "wiki/Has Space.md" }, undefined, good).ok);
});

Deno.test("estimateCostUsd prices cached reads cheaper than fresh input, and skips unknown models", () => {
  const usage: Usage = { ...emptyUsage(), inputTokens: 1_000_000, cacheReadTokens: 1_000_000 };
  assertEquals(estimateCostUsd("claude-opus-5-5", usage), 4.2);
  assertEquals(estimateCostUsd("claude-sonnet-5-5", usage), 2.2);
  assertEquals(estimateCostUsd("some-other-model", usage), undefined);
});

Deno.test("renderIndex lists path, name, anchor and description", () => {
  const text = renderIndex([{ ...page("wiki/A.md", "A", ["9"]), description: "About A." }]);
  assertEquals(text, "- wiki/A.md — A [forum post 9]: About A.");
});

// ---- the whole pass, against a stubbed model --------------------------------------------

async function fixture(): Promise<string> {
  const root = await Deno.makeTempDir();
  await Deno.mkdir(`${root}/wiki`);
  await Deno.writeTextFile(`${root}/wiki/Deno.md`, page("wiki/Deno.md", "Deno").text);
  await Deno.writeTextFile(`${root}/wiki/Captures.md`, "generated\n");
  return root;
}

const FORUM_CAPTURE = HEADER + post("111", "Rust core idea", 2);

function stub(
  handle: (request: CallRequest<unknown>) => unknown,
  usage: Partial<Usage> = {},
): { complete: Complete; requests: CallRequest<unknown>[] } {
  const requests: CallRequest<unknown>[] = [];
  const complete: Complete = (request) => {
    requests.push(request as CallRequest<unknown>);
    return Promise.resolve({
      ok: true,
      value: handle(request as CallRequest<unknown>),
      usage: { ...emptyUsage(), calls: 1, inputTokens: 1_000, outputTokens: 100, ...usage },
    } as never);
  };
  return { complete, requests };
}

const task = {
  capturePath: "raw/discord/2026-10-12_dcwg-propose.md",
  channelName: "propose",
  messageCount: 2,
  forum: true,
};

Deno.test("a pass plans once, writes each page, links the new page, and books the spend", async () => {
  const root = await fixture();
  try {
    const { complete, requests } = stub((request) => {
      if (request.schema === PlanSchema) {
        return {
          summary: "One proposal.",
          pages: [{
            path: "wiki/Rust_Core_Idea.md",
            action: "create",
            concept: "Rust core idea",
            thread_id: "111",
            instructions: "Record andy's proposal.",
            linked_from: "wiki/Deno.md",
          }],
        } satisfies Plan;
      }
      return request.task.includes("PAGE: wiki/Rust_Core_Idea.md")
        ? {
          body: "# Rust core idea\n\nA proposal.\n",
          type: "schema:TechArticle",
          name: "Rust core idea",
          description: "d",
        }
        : {
          body: "# Deno\n\nSee [Rust core idea](Rust_Core_Idea.md).\n",
          type: "",
          name: "",
          description: "",
        };
    });

    const result = await runAnthropicPass({
      root,
      capturePath: task.capturePath,
      captureText: FORUM_CAPTURE,
      system: "rules",
      model: "claude-opus-5-5",
      complete,
      task,
      posts: [{ id: "111", title: "Rust core idea" }],
    });

    assertEquals(result.stderr, "");
    assert(result.ok);
    assertEquals(result.written.sort(), ["wiki/Deno.md", "wiki/Rust_Core_Idea.md"]);
    assertEquals(result.usage.steps, 3); // one plan, two writes
    assertEquals(result.usage.inputTokens, 3_000);

    const created = await Deno.readTextFile(`${root}/wiki/Rust_Core_Idea.md`);
    assertStringIncludes(created, 'wazoo:thread: "111"');
    const linked = await Deno.readTextFile(`${root}/wiki/Deno.md`);
    assertStringIncludes(linked, "(Rust_Core_Idea.md)");
    assert(linked.startsWith("---\n")); // frontmatter survived the rewrite
    assertEquals(await Deno.readTextFile(`${root}/wiki/Captures.md`), "generated\n");

    // The capture is the cached first block of every call and is identical across them.
    assertEquals(new Set(requests.map((r) => r.prefix)).size, 1);
    assertStringIncludes(requests[0].prefix, "Rust core idea (thread 111)");
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("a plan that breaks a rule is repaired once, then the pass fails with the reasons", async () => {
  const root = await fixture();
  try {
    const { complete, requests } = stub(() => ({ summary: "nothing", pages: [] }));
    const result = await runAnthropicPass({
      root,
      capturePath: task.capturePath,
      captureText: FORUM_CAPTURE,
      system: "rules",
      model: "claude-opus-5-5",
      complete,
      task,
      posts: [{ id: "111", title: "Rust core idea" }],
    });
    assert(!result.ok);
    assertStringIncludes(result.stderr, "forum post 111");
    assertEquals(requests.length, 2); // the plan, and its one repair
    assertStringIncludes(requests[1].task, "YOUR PLAN WAS REJECTED");
    assertEquals(result.written, []);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("an empty plan for a text channel writes nothing and succeeds", async () => {
  const root = await fixture();
  try {
    const { complete } = stub(() => ({ summary: "nothing durable", pages: [] }));
    const result = await runAnthropicPass({
      root,
      capturePath: task.capturePath,
      captureText: "---\nchannel_type: text\n---\n\n**a** — 2026-10-12T00:00:00Z (`1`)\n\nhi\n",
      system: "rules",
      model: "claude-opus-5-5",
      complete,
      task: { ...task, forum: false },
      posts: [],
    });
    assert(result.ok);
    assertEquals(result.written, []);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("the spend cap stops the pass before the next call", async () => {
  const root = await fixture();
  try {
    // 3M fresh input tokens at $4/M is $12 on the first call, so the second never goes out.
    const { complete, requests } = stub(
      () => ({
        summary: "x",
        pages: [{
          path: "wiki/Rust_Core_Idea.md",
          action: "create",
          concept: "c",
          thread_id: "111",
          instructions: "i",
          linked_from: "wiki/Deno.md",
        }],
      }),
      { inputTokens: 3_000_000 },
    );
    const result = await runAnthropicPass({
      root,
      capturePath: task.capturePath,
      captureText: FORUM_CAPTURE,
      system: "rules",
      model: "claude-opus-5-5",
      complete,
      task,
      posts: [{ id: "111", title: "Rust core idea" }],
      maxUsd: 1,
    });
    assert(!result.ok);
    assertStringIncludes(result.stderr, "over its $1.00 cap");
    assertEquals(requests.length, 1);
    assertEquals(result.written, []);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("a rate limit is reported as one, not as a verdict on the material", async () => {
  const root = await fixture();
  try {
    const complete: Complete = () =>
      Promise.resolve({
        ok: false,
        kind: "rate_limit",
        message: "rate limited: 429",
        usage: emptyUsage(),
      } as never);
    const result = await runAnthropicPass({
      root,
      capturePath: task.capturePath,
      captureText: FORUM_CAPTURE,
      system: "rules",
      model: "claude-opus-5-5",
      complete,
      task,
      posts: [{ id: "111", title: "Rust core idea" }],
    });
    assert(!result.ok);
    assertEquals(result.rateLimited, "rate limited: 429");
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

// ---- mechanical plan repairs ---------------------------------------------------------------

const create = (over: Partial<Plan["pages"][number]>): Plan["pages"][number] => ({
  path: "wiki/New.md",
  action: "create",
  concept: "New",
  thread_id: null,
  instructions: "i",
  linked_from: "wiki/Deno.md",
  ...over,
});

Deno.test("normalizePlan drops a thread_id on a text channel, and leaves a forum's alone", () => {
  const pages = [page("wiki/Deno.md", "Deno")];
  const plan: Plan = { summary: "x", pages: [create({ thread_id: "999" })] };

  const text = normalizePlan(plan, { pages, posts: [] });
  assertEquals(text.plan.pages[0].thread_id, null);
  assertStringIncludes(text.adjusted.join("\n"), "dropped thread_id 999");
  assertEquals(validatePlan(text.plan, { pages, posts: [] }), []);

  const forum = normalizePlan(plan, { pages, posts: [{ id: "111", title: "One" }] });
  assertEquals(forum.plan.pages[0].thread_id, "999");
  assertEquals(forum.adjusted, []);
});

Deno.test("normalizePlan reads a bare filename as the indexed page", () => {
  const pages = [page("wiki/Deno.md", "Deno")];
  const plan: Plan = { summary: "x", pages: [create({ linked_from: "Deno.md" })] };
  const fixed = normalizePlan(plan, { pages, posts: [] });
  assertEquals(fixed.plan.pages[0].linked_from, "wiki/Deno.md");
  assertEquals(validatePlan(fixed.plan, { pages, posts: [] }), []);
});

Deno.test("normalizePlan replaces a link to an invented page with the closest real one", () => {
  const pages = [
    page("wiki/Deno.md", "Deno"),
    { ...page("wiki/Runtime_Options.md", "Runtime options"), description: "JavaScript engines" },
  ];
  const plan: Plan = {
    summary: "x",
    pages: [create({
      path: "wiki/Porffor_JavaScript_Engine.md",
      concept: "Porffor JavaScript engine",
      linked_from: "Prior_Art_Runtimes.md",
    })],
  };
  const fixed = normalizePlan(plan, { pages, posts: [] });
  assertEquals(fixed.plan.pages[0].linked_from, "wiki/Runtime_Options.md");
  assertEquals(validatePlan(fixed.plan, { pages, posts: [] }), []);
});

Deno.test("a create may link from another create that links on to a real page", () => {
  const pages = [page("wiki/Deno.md", "Deno")];
  const hub = create({ path: "wiki/Hub.md", concept: "Hub" });
  const leaf = create({ path: "wiki/Leaf.md", concept: "Leaf", linked_from: "wiki/Hub.md" });
  assertEquals(validatePlan({ summary: "x", pages: [leaf, hub] }, { pages, posts: [] }), []);

  const a = create({ path: "wiki/A.md", linked_from: "wiki/B.md" });
  const b = create({ path: "wiki/B.md", linked_from: "wiki/A.md" });
  assertStringIncludes(
    validatePlan({ summary: "x", pages: [a, b] }, { pages, posts: [] }).join("\n"),
    "is not a page in the index",
  );
});
