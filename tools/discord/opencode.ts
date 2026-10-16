/**
 * Drive the wiki pass through `opencode`, an agentic coding CLI, instead of
 * asking a model for a JSON list of whole-file rewrites.
 *
 * The connector used to hand the model every wiki page inline and ask for a
 * complete new body for each page it wanted to change. That works, and it has
 * two costs this path removes:
 *
 * 1. It truncates. The capture goes in through `clip(text, CAPTURE_CHAR_CAP)`,
 *    which keeps the newest 24,000 characters and drops the rest, so a channel
 *    that grows past that loses its oldest activity with only a note in the
 *    prompt. Measured 2026-10-16: the pending `#brainstorm` backfill is 115,516
 *    bytes, so more than three quarters of it would have been discarded. An
 *    agent that reads the capture off disk reads all of it.
 * 2. It is one shot. The model sees the pages it was handed and nothing else, so
 *    it cannot follow a reference, grep for how a concept is already named, or
 *    notice that a claim it is about to add already has a page.
 *
 * What the connector keeps is the part that must stay deterministic: it decides
 * what may change, verifies it, and owns the revert. opencode's own permission
 * globs are not the boundary. Measured 2026-10-16 on 1.19.3, the same
 * `{"wiki/**": "allow", "**": "deny"}` rule allowed `wiki/Alpha.md` in one
 * checkout and refused `wiki/New.md` in another, so a rule that fails open is
 * not a control. `snapshotTree`/`diffTree` are: they compare the tree either side
 * of the run and revert anything outside `wiki/`.
 *
 * `dcwg.md` in `prompt/` is the agent's standing instructions, wired through the
 * `dcwg` agent in the repo's `opencode.json`. Nothing here shells out to a shell:
 * the agent's tool set is read/glob/grep/list/write/edit, with bash, webfetch,
 * websearch, task, and question denied, so a run cannot exfiltrate the OpenRouter
 * key it is handed or run a command nobody reviewed.
 */

/** Directories the snapshot ignores: version control, tool state, build output. */
const IGNORED_DIRS = [".git", ".opencode", ".dcwg", "_site", "node_modules"];

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

export interface BriefInput {
  /** The capture the run is folding in, repo-relative. */
  capturePath: string;
  channelName: string;
  messageCount: number;
  lastUpdated?: string;
  /** True when the venue is a forum, so every post needs its own page. */
  forum: boolean;
  /** Forum post ids and titles, when the venue is a forum. */
  threads?: Array<{ id: string; title: string }>;
  /** Why the previous attempt was rejected, so a retry can fix it. */
  feedback?: string;
}

/**
 * The per-run task. Stable rules live in `prompt/dcwg.md`; this carries only
 * what changes run to run, and points at the capture rather than inlining it, so
 * nothing is truncated by an argument or prompt limit.
 */
export function renderBrief(input: BriefInput): string {
  const parts: string[] = [];
  parts.push(`# CURRENT TASK`);
  parts.push(
    `Integrate the new Discord capture at \`${input.capturePath}\` into the wiki. ` +
      `Read that file in full before you write anything.`,
  );
  parts.push(`LAST UPDATED: ${input.lastUpdated ?? "(unknown)"}`);
  parts.push(`CHANNEL: #${input.channelName}`);
  parts.push(`NEW MESSAGES: ${input.messageCount}`);

  if (input.forum) {
    const posts = input.threads ?? [];
    parts.push(
      `VENUE TYPE: forum. Every post below is one concept and needs its own page ` +
        `under \`wiki/\`, anchored with \`wazoo:thread: "<thread id>"\` in its ` +
        `frontmatter. A page that covers two posts fails the thread gate.`,
    );
    for (const post of posts) {
      parts.push(`  - thread ${post.id}: ${post.title}`);
    }
  }

  if (input.feedback) {
    parts.push(
      `# YOUR PREVIOUS ATTEMPT WAS REJECTED\n\n` +
        `Nothing from it was kept, and the tree is back where it started. Fix ` +
        `exactly this, then make the edit again:\n\n${input.feedback}`,
    );
  }

  parts.push(
    `# REMINDER\n\n` +
      `Change only files under \`wiki/\`, and never \`wiki/Captures.md\`. The ` +
      `connector compares the tree before and after you run and reverts anything ` +
      `else, which discards the whole attempt.`,
  );
  return parts.join("\n\n") + "\n";
}

export interface OpencodeUsage {
  steps: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cost: number;
  sessionId?: string;
}

/**
 * Sum the per-step token counts and cost out of the JSON event stream.
 *
 * opencode emits one `step_finish` per model request, each carrying that
 * request's usage, so the totals have to be accumulated rather than read off a
 * final envelope. A model request is also the unit the OpenRouter free tier
 * meters, which makes `steps` the number that decides whether a day's runs stay
 * inside its cap.
 */
export function parseUsage(jsonl: string): OpencodeUsage {
  const usage: OpencodeUsage = {
    steps: 0,
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    cost: 0,
  };
  for (const line of jsonl.split("\n")) {
    const text = line.trim();
    if (!text.startsWith("{")) continue;
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(text) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (event.type !== "step_finish") continue;
    const part = event.part as { tokens?: Record<string, number>; cost?: number } | undefined;
    if (!part) continue;
    usage.steps += 1;
    usage.sessionId ??= typeof event.sessionID === "string" ? event.sessionID : undefined;
    const tokens = part.tokens ?? {};
    usage.inputTokens += tokens.input ?? 0;
    usage.outputTokens += tokens.output ?? 0;
    usage.reasoningTokens += tokens.reasoning ?? 0;
    usage.cost += part.cost ?? 0;
  }
  return usage;
}

export interface OpencodeRunResult {
  /** The process exited on its own, with code 0. */
  ok: boolean;
  code: number;
  timedOut: boolean;
  usage: OpencodeUsage;
  /** Last lines of stderr, for the run report. Never contains the API key. */
  stderr: string;
  stdout: string;
}

export interface OpencodeRunInput {
  root: string;
  /** The agent to run; matches the `dcwg` entry in the repo's `opencode.json`. */
  agent: string;
  /** The brief, already written to disk by the caller. */
  briefPath: string;
  model?: string;
  timeoutMs?: number;
  /** Path to the CLI, for tests and for a pin that is not on PATH. */
  bin?: string;
}

/**
 * Run one pass and wait for it.
 *
 * The prompt is a fixed sentence naming the brief, rather than the brief itself.
 * The brief goes in as a file the agent reads with its own tool, which keeps the
 * capture out of an argument list: measured 2026-10-16, the pending
 * `#brainstorm` capture alone is 115,516 bytes, and Linux caps a single argument
 * at 128 KiB, so a venue that grows a little would fail an exec rather than
 * truncate it.
 */
export async function runOpencode(input: OpencodeRunInput): Promise<OpencodeRunResult> {
  const bin = input.bin ?? Deno.env.get("DCWG_OPENCODE_BIN") ?? "opencode";
  const timeoutMs = input.timeoutMs ?? 900_000;
  const command = new Deno.Command(bin, {
    cwd: input.root,
    args: [
      "run",
      "--agent",
      input.agent,
      "--format",
      "json",
      ...(input.model ? ["--model", input.model] : []),
      `Read ${input.briefPath} and carry out the instructions in it.`,
    ],
    stdout: "piped",
    stderr: "piped",
    env: { ...Deno.env.toObject(), OPENCODE_DISABLE_AUTOUPDATE: "1" },
  });

  const child = command.spawn();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    try {
      child.kill("SIGKILL");
    } catch {
      // already exited
    }
  }, timeoutMs);

  try {
    const output = await child.output();
    const decoder = new TextDecoder();
    const stdout = decoder.decode(output.stdout);
    const stderr = decoder.decode(output.stderr);
    return {
      ok: !timedOut && output.code === 0,
      code: output.code,
      timedOut,
      usage: parseUsage(stdout),
      stderr: stderr.trim().split("\n").slice(-20).join("\n"),
      stdout,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Where the brief is written, relative to the repo root. */
export const BRIEF_PATH = ".dcwg/brief.md";

/** Write the brief the agent is told to read. Returns its repo-relative path. */
export async function writeBrief(root: string, text: string): Promise<string> {
  await Deno.mkdir(`${root}/.dcwg`, { recursive: true });
  await Deno.writeTextFile(`${root}/${BRIEF_PATH}`, text);
  return BRIEF_PATH;
}

/** Remove the scratch directory a run leaves behind. */
export async function cleanBrief(root: string): Promise<void> {
  try {
    await Deno.remove(`${root}/.dcwg`, { recursive: true });
  } catch {
    // nothing to clean
  }
}
