/**
 * Drive the wiki pass through `fx`, the Vercel Labs coding agent, against the
 * Vercel AI Gateway, instead of asking a model for a JSON list of whole-file
 * rewrites.
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
 * what may change, verifies it, and owns the revert. fx's permission rules are a
 * second control rather than the boundary. `snapshotTree`/`diffTree` compare the
 * tree either side of the run and revert anything outside `wiki/`, and that is
 * what a run is trusted against, because a rule that fails open is not a control.
 * The rules do work at the tool layer, though: measured 2026-10-18 on 0.0.14,
 * with `{"*": "deny", "edit": {"*": "deny", "wiki/**": "allow"}}`, a
 * `write_file` to `wiki/New.md` was allowed and one to `other/Bad.md` was denied.
 * Two details are load-bearing: the allow pattern must be the tree form
 * (`wiki/**`, not `wiki/*`), because a create is matched against the new file's
 * parent, and `edit` is the permission name for both `write_file` and
 * `edit_file`. The rules live in `~/.fx/settings.json`, which is per-machine
 * rather than per-repo, so the workflow writes them before the pass runs.
 *
 * `dcwg.md` in `prompt/` is the agent's standing instructions, handed in with
 * `--system`; fx reads the repository's `AGENTS.md` itself. The tool set is
 * read/glob/grep/list/edit with `bash` denied by those same rules, so a run
 * cannot exfiltrate the Gateway key it is handed or run a command nobody
 * reviewed.
 */

/** Directories the snapshot ignores: version control, tool state, build output. */
const IGNORED_DIRS = [".git", ".fx", ".dcwg", "_site", "node_modules"];

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
  /**
   * True when an earlier run committed this capture and could not fold it in, so this
   * run is picking the work back up. The task is the same; the brief just stops
   * describing a capture that may be days old as "new".
   */
  queued?: boolean;
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
    input.queued
      ? `Fold the staged Discord capture at \`${input.capturePath}\` into the wiki. An ` +
        `earlier run committed it to \`raw/\` but the wiki does not carry it yet, so ` +
        `this run is picking that work back up. Read that file in full before you ` +
        `write anything.`
      : `Integrate the new Discord capture at \`${input.capturePath}\` into the wiki. ` +
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

/**
 * One `fx ask --json` result, as far as the connector reads it.
 *
 * fx emits a single JSON object rather than opencode's per-step event stream, so the
 * spend is read off the envelope instead of accumulated. Measured 2026-10-18 on
 * 0.0.14, the keys are `exit_code`, `final_output`, `model`, `output`,
 * `resolved_provider`, `session_id`, `steps`, `tool_calls`, and `usage`; `recovery`
 * appears only when fx retried a response, and is absent otherwise.
 */
export interface FxResult {
  steps?: number;
  model?: string;
  exit_code?: number;
  tool_calls?: Array<{ name?: string; status?: string }>;
  usage?: { input_tokens?: number | null; output_tokens?: number | null };
  output?: string;
  final_output?: string;
  recovery?: { state?: string; kind?: string; attempt?: number };
}

export interface FxUsage {
  /**
   * Tool calls the pass reported, which is what fx's `steps` counts.
   *
   * Not model requests: measured 2026-10-18 on 0.0.14, a probe run capped at
   * `max_agent_steps: 2` made 6 tool calls and reported `steps: 6`, and the
   * 594-message pass reported 39 against exactly 39 tool calls. `max_agent_steps`
   * bounds the model's own turns, which is a coarser unit than either, so neither
   * number is used as a request count anywhere in this repo.
   */
  steps: number;
  inputTokens: number;
  outputTokens: number;
  /** The model the Gateway resolved for the pass. */
  model?: string;
  /** fx's own note when it retried a response, e.g. through a rate limit. */
  recovery?: string;
}

/**
 * Parse the JSON envelope.
 *
 * The envelope is the whole of stdout, but a stray line before or after it should not
 * cost the run its spend figures, so the last line that parses as an object is accepted
 * too. `undefined` for output that holds no object at all, which is what a crash before
 * the first request looks like.
 */
export function parseFxResult(stdout: string): FxResult | undefined {
  const text = stdout.trim();
  if (!text) return undefined;
  for (const candidate of [text, ...text.split("\n").reverse()]) {
    const line = candidate.trim();
    if (!line.startsWith("{")) continue;
    try {
      const value = JSON.parse(line);
      if (typeof value === "object" && value !== null) return value as FxResult;
    } catch {
      // not this line; try the next candidate
    }
  }
  return undefined;
}

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Read a pass's spend off a parsed envelope. */
export function fxUsage(result: FxResult | undefined): FxUsage {
  const recovery = result?.recovery;
  const note = recovery?.state
    ? `${recovery.state}${recovery.kind ? ` (${recovery.kind})` : ""}` +
      `${typeof recovery.attempt === "number" ? ` after ${recovery.attempt} attempt(s)` : ""}`
    : undefined;
  return {
    steps: count(result?.steps),
    inputTokens: count(result?.usage?.input_tokens),
    outputTokens: count(result?.usage?.output_tokens),
    ...(typeof result?.model === "string" ? { model: result.model } : {}),
    ...(note ? { recovery: note } : {}),
  };
}

/** Anything a run's own output might say about a spent or throttled provider budget. */
const RATE_LIMIT = /(\b429\b|rate.?limit|too many requests|throttl|quota)/i;

/**
 * The provider's own rate-limit message, when a pass died on one.
 *
 * A spent budget has to be told apart from material the model could not fold: the
 * connector reports the first as a budget condition and the second as a stall, because a
 * pass the provider refused judged nothing. fx folds a retried response into `recovery`
 * in the envelope and writes its diagnostics to stderr, so both are read, and stderr is
 * what a failure before the first request leaves behind.
 */
export function parseFxRateLimit(result: FxResult | undefined, stderr: string): string | undefined {
  const recovery = result?.recovery ? JSON.stringify(result.recovery) : "";
  for (const line of `${recovery}\n${stderr}`.split("\n")) {
    if (RATE_LIMIT.test(line)) return line.trim().slice(0, 300);
  }
  return undefined;
}

export interface FxRunResult {
  /** The process exited on its own, with code 0. */
  ok: boolean;
  code: number;
  timedOut: boolean;
  usage: FxUsage;
  /** Last lines of stderr, for the run report. Never contains the Gateway key. */
  stderr: string;
  stdout: string;
  /**
   * The provider's rate-limit message when the pass died on one, so a spent budget is
   * reported as a budget condition rather than as material the model could not fold.
   * `undefined` for every other failure.
   */
  rateLimited: string | undefined;
}

export interface FxRunInput {
  root: string;
  /** The brief, already written to disk by the caller. */
  briefPath: string;
  /** The agent's standing instructions, handed in with `--system`. */
  system: string;
  /** Model id on this pass's provider, e.g. `nvidia/nemotron-3.5-lightning-free`. */
  model?: string;
  /**
   * The provider this pass runs on. Decides `FX_PROVIDER`, and with `apiKey` the
   * variable the child inherits the credential under.
   *
   * Structural rather than a `ProviderSpec` import: fx.ts drives a process and has no
   * business knowing which providers exist.
   */
  provider?: { fxProvider: string; keyEnv: string };
  /**
   * The credential for `provider`, exported to the child under `provider.keyEnv`.
   *
   * fx looks a key up in its own environment by the name its settings give, so the value
   * is handed over here rather than written into the settings file.
   */
  apiKey?: string;
  timeoutMs?: number;
  /** Path to the CLI, for tests and for a pin that is not on PATH. */
  bin?: string;
}

/**
 * Run one pass and wait for it.
 *
 * The prompt is a fixed sentence naming the brief, rather than the brief itself. The
 * brief goes in as a file the agent reads with its own tool, which keeps the capture out
 * of an argument list: measured 2026-10-16, the pending `#brainstorm` capture alone is
 * 115,516 bytes, and Linux caps a single argument at 128 KiB, so a venue that grows a
 * little would fail an exec rather than truncate it. The standing instructions do ride in
 * an argument, through `--system`, because they are a fixed 4 KB file that replaces the
 * built-in base prompt; `AGENTS.md` is read by fx itself.
 *
 * `--no-save` keeps no session state between runs, and `FX_PROVIDER` names the provider so
 * a machine's own default cannot serve an automation pass. `FX_AUTO_UPGRADE=0` keeps the
 * binary from replacing itself mid-run, which matters because the version decides the tool
 * set and the shape of the envelope parsed above.
 */
export async function runFx(input: FxRunInput): Promise<FxRunResult> {
  const bin = input.bin ?? Deno.env.get("DCWG_FX_BIN") ?? "fx";
  const timeoutMs = input.timeoutMs ?? 900_000;
  const command = new Deno.Command(bin, {
    cwd: input.root,
    args: [
      "ask",
      "--json",
      "--no-save",
      "--system",
      input.system,
      ...(input.model ? ["--model", input.model] : []),
      `Read ${input.briefPath} and carry out the instructions in it.`,
    ],
    stdout: "piped",
    stderr: "piped",
    env: {
      ...Deno.env.toObject(),
      FX_AUTO_UPGRADE: "0",
      FX_PROVIDER: input.provider?.fxProvider ?? "gateway",
      // The key rides in the environment rather than in a flag, so it cannot reach a
      // process list or a log line, and under the name the settings read it by.
      ...(input.provider && input.apiKey ? { [input.provider.keyEnv]: input.apiKey } : {}),
    },
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
    const result = parseFxResult(stdout);
    return {
      ok: !timedOut && output.code === 0,
      code: output.code,
      timedOut,
      usage: fxUsage(result),
      stderr: stderr.trim().split("\n").slice(-20).join("\n"),
      stdout,
      rateLimited: parseFxRateLimit(result, stderr),
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

/**
 * Where the pass's step ceiling lives in the repo.
 *
 * fx splits its configuration by scope: `~/.fx/settings.json` holds the per-machine
 * settings, including the permission rules, and a workspace's `.fx.json` holds the
 * per-repo ones. Only the second can be committed, which is why the ceiling is read from
 * here and the rules are written by the workflow.
 */
export const FX_CONFIG_PATH = ".fx.json";

/** The agent's standing instructions, relative to the repo root. */
export const STANDING_INSTRUCTIONS_PATH = "tools/discord/prompt/dcwg.md";

/**
 * Read the agent's standing instructions.
 *
 * Throws rather than returning a default: a pass with no rules is a pass that writes
 * whatever it likes, and a missing prompt file is a broken checkout, not a reason to run
 * the model ungoverned.
 */
export function readStandingInstructions(root: string): Promise<string> {
  return Deno.readTextFile(`${root}/${STANDING_INSTRUCTIONS_PATH}`);
}

/**
 * The step ceiling a pass falls back to when `.fx.json` does not name one.
 *
 * Matches the `max_agent_steps` a working config uses. A ceiling that bounds nothing is
 * worse than a low one: the pass is capped by fx itself, and this number is only what the
 * connector reports when the file it reads is missing or unreadable.
 */
export const DEFAULT_AGENT_STEPS = 24;

/**
 * Read a step ceiling out of a parsed `.fx.json`.
 *
 * `max_agent_steps` bounds an fx pass, and it is read from the config rather than
 * restated here because the ceiling that bounds the pass is the one fx applies.
 *
 * Measured 2026-10-18 on 0.0.14: a workspace configured with `{"max_agent_steps": 2}`
 * stopped after six tool calls, printed "Agent step limit reached", and exited non-zero
 * with the task unfinished. So one agent step is not one tool call, and the connector
 * counts neither as model requests: what a run spends is read from the pass's own
 * token usage, which is what the Gateway bills.
 */
export function fxSteps(config: unknown): number {
  const steps = (config as { max_agent_steps?: unknown } | null)?.max_agent_steps;
  return typeof steps === "number" && Number.isInteger(steps) && steps > 0
    ? steps
    : DEFAULT_AGENT_STEPS;
}

/**
 * `fxSteps` for the repo on disk.
 *
 * Answers the fallback rather than throwing when the file is missing or unreadable: a
 * report must not be the thing that fails a run.
 */
export async function readFxSteps(root: string): Promise<number> {
  try {
    return fxSteps(JSON.parse(await Deno.readTextFile(`${root}/${FX_CONFIG_PATH}`)));
  } catch {
    return DEFAULT_AGENT_STEPS;
  }
}
