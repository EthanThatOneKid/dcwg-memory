#!/usr/bin/env -S deno run -A
/**
 * The dcwg-memory Discord connector.
 *
 * One run = fetch new channel activity over the Discord REST API, record it as an
 * append-only capture, then let the wiki pass fold it into the pages. The capture
 * is the record; the wiki pass is the synthesis, and it is gated: if the repo's
 * own validation fails, the page edits are reverted and the run reports
 * NEEDS_ATTENTION rather than committing prose that does not pass.
 *
 *   deno task ingest -- --channel <id> --venue dcwg-talk
 *
 * Credentials (never passed as arguments, never logged):
 *   DCWG_DISCORD_BOT_TOKEN   the capture bot's token
 *   ANTHROPIC_API_KEY        the wiki pass on --provider anthropic (the default), a Console API key
 *   GEMINI_API_KEY           the wiki pass on --provider gemini, a Google AI Studio key
 *
 * The wiki pass is the staged pipeline in `anthropic.ts`: one plan call, then one write
 * call per page, bounded by `--max-usd`. See "The staged Anthropic pass" in AGENTS.md.
 */

import { parseArgs } from "@std/cli/parse-args";
import {
  channelKind,
  fetchChannelMeta,
  fetchMessages,
  fetchVenueThreads,
  isForum,
  isoUtc,
  snowflakeFromIso,
  threadTitle,
} from "./discord.ts";
import { captureDay, DEFAULT_SERVER_LABEL, DEFAULT_TAGS, nextCapturePath, renderCapture } from "./capture.ts";
import { validateSummary } from "./guard.ts";
import { anthropicComplete, DEFAULT_MAX_USD, makeClient, readPassInstructions, runAnthropicPass } from "./anthropic.ts";
import { geminiComplete } from "./gemini.ts";
import type { Complete } from "./model.ts";
import { diffTree, outsideWiki, restoreTree, snapshotTree, writePagesOk } from "./tree.ts";
import { describeModel, missingKeyMessage, parseProviderName, resolveApiKey, resolveProvider } from "./providers.ts";
import type { ProviderSpec } from "./providers.ts";
import { writeCapturesIndex } from "./index_page.ts";
import { findOrphans } from "./orphans.ts";
import { captureKind, findThreadProblems, POST_SHAPED, postsInCapture } from "./thread_pages.ts";
import { advance, drop, enqueue, pendingFor, readPending, setPending, stall } from "./pending.ts";
import { gateFeedback, runWikiGates } from "./wiki_gates.ts";
import type { CaptureSection } from "./capture.ts";
import type { DiscordMessage } from "./discord.ts";
import type { PendingFold } from "./pending.ts";

/** What the staged pass answers with, as far as the fold reads it. */
type PassRun = Awaited<ReturnType<typeof runAnthropicPass>>;

const USAGE = `dcwg-memory Discord connector

Usage:
  deno run -A ingest.ts --channel <id> --venue <venue> [options]

Required:
  --channel <id>        Discord channel id to capture
  --venue <venue>       capture venue slug, e.g. dcwg-brainstorm (names the file)

A venue is the channel plus every thread under it. A forum holds nothing else:
its posts are threads, and the post body is the first message of one. A text
channel's threads are captured too, because its top-level history never returns
them.

Options:
  --out <dir>           capture directory (default: raw/discord)
  --root <dir>          repo root (default: current directory)
  --server <label>      server name for the capture prose
  --tag <tag>           repeatable; defaults to ${DEFAULT_TAGS.join(", ")}
  --limit <n>           max messages to pull per channel and per thread
                        (default 200; 0 means no cap)
  --all                 ignore the cursor and pull from the channel's first message
  --since <iso>         ISO-8601 UTC lower bound (overrides the cursor)
  --token-env <name>    env var holding the bot token (default: DCWG_DISCORD_BOT_TOKEN)
  --provider <name>     who answers the wiki pass: anthropic (default, billed per token) or
                        gemini (Google AI Studio; free tier unless the key's project is billed)
  --model <id>          model id for the wiki pass on that provider (default claude-opus-5-5 on
                        anthropic, gemini-2.5-flash on gemini)
  --skip-wiki           capture only; do not touch wiki pages
  --max-usd <n>         spend cap for one wiki pass, in USD, estimated from the usage the
                        API reports (default ${DEFAULT_MAX_USD})
  --pass-timeout <sec>  kill a pass that runs longer than this (default 900)
  --attempts <n>        how many times the page pass may be retried against the gates
                        (default 2: one retry, because the usual failure is correctable)
  --drain               fold every capture this venue still owes the wiki, not just the
                        oldest one (default: one fold per run, so a backlog drains over
                        several runs instead of overrunning the job's own time limit)
  --drain-max <n>       how many folds one --drain run may attempt (default 6). Each
                        fold is a whole page pass, and a capture too long for one
                        prompt takes several, so this is the cap on one job's work
  --no-gates            skip the repo validation commands (local iteration only)
  --dry-run             fetch and render, but write nothing and call no model
  -h, --help            show this help

Exit codes: 0 success, 1 the run needs attention, 2 usage or credential error.
`;

interface Args {
  channel?: string;
  venue?: string;
  out: string;
  root: string;
  server: string;
  tags: string[];
  limit: number;
  all: boolean;
  since?: string;
  tokenEnv: string;
  /** Who answers the pass, and so which key and which default model it uses. */
  provider: ProviderSpec;
  /** Unset means the provider's default model. */
  model?: string;
  skipWiki: boolean;
  /** Wall-clock cap on one wiki pass, in seconds. */
  passTimeoutSec: number;
  /** Estimated-spend cap for one anthropic pass, in USD. */
  maxUsd: number;
  noGates: boolean;
  /** How many times the page pass may be retried against the gates. */
  attempts: number;
  /** Fold every capture this venue still owes the wiki, not just the oldest. */
  drain: boolean;
  /** How many folds one --drain run may attempt, so a backlog cannot overrun the job. */
  drainMax: number;
  dryRun: boolean;
}

/** Parse the CLI's flags, then validate them into `Args`.
 *
 *  Every flag is declared, which is what lets `unknown` refuse a typo instead of
 *  dropping it: a workflow that misspelled `--drain-max` would otherwise run on
 *  the default and report success. A string flag passed last with nothing after
 *  it arrives as `""`, which `str` reports as the missing value it is. */
function parseCliArgs(argv: string[]): Args {
  const parsed = parseArgs(
    argv,
    {
      string: [
        "channel",
        "venue",
        "out",
        "root",
        "server",
        "tag",
        "limit",
        "since",
        "token-env",
        "model",
        "provider",
        "pass-timeout",
        "max-usd",
        "attempts",
        "drain-max",
      ],
      boolean: ["all", "drain", "skip-wiki", "no-gates", "dry-run", "help"],
      collect: ["tag"],
      alias: { h: "help" },
      unknown: (arg: string) => {
        throw new Error(`unknown flag: ${arg}`);
      },
    } as const,
  );

  // A token after `--` is a positional, and the parser does not route those
  // through `unknown`, so refuse it here rather than dropping it in silence.
  if (parsed._.length > 0) throw new Error(`unknown flag: ${parsed._[0]}`);

  if (parsed.help === true) {
    console.log(USAGE);
    Deno.exit(0);
  }

  /** A string flag's value, or undefined when the flag was not passed. */
  const str = (name: string): string | undefined => {
    const value = parsed[name];
    if (typeof value !== "string") return undefined;
    if (value === "") throw new Error(`--${name} needs a value`);
    return value;
  };
  const num = (name: string, fallback: number): number => {
    const raw = str(name);
    return raw === undefined ? fallback : Number(raw);
  };

  /** The `--tag` values, or the defaults when no `--tag` was passed. `collect`
   *  gives the key an empty array when the flag is absent, so an empty list means
   *  "not passed", and the first explicit --tag replaces the defaults rather than
   *  adding to them. */
  const tagList = (): string[] => {
    const collected = parsed.tag;
    if (collected === undefined || collected.length === 0) return [...DEFAULT_TAGS];
    if (collected.some((tag) => tag === "")) throw new Error("--tag needs a value");
    return collected;
  };

  const drainMaxRaw = str("drain-max");
  let drainMax = 6;
  if (drainMaxRaw !== undefined) {
    const n = Number(drainMaxRaw);
    if (!Number.isInteger(n) || n < 1) throw new Error("--drain-max must be a positive integer");
    drainMax = n;
  }

  const channel = str("channel");
  const venue = str("venue");
  const since = str("since");
  const model = str("model");
  const providerFlag = str("provider");
  const provider = resolveProvider(providerFlag === undefined ? undefined : parseProviderName(providerFlag));
  const tags = tagList();
  return {
    ...(channel === undefined ? {} : { channel }),
    ...(venue === undefined ? {} : { venue }),
    out: str("out") ?? "raw/discord",
    root: str("root") ?? ".",
    server: str("server") ?? DEFAULT_SERVER_LABEL,
    tags,
    limit: num("limit", 200),
    all: parsed.all === true,
    ...(since === undefined ? {} : { since }),
    tokenEnv: str("token-env") ?? "DCWG_DISCORD_BOT_TOKEN",
    provider,
    ...(model === undefined ? {} : { model }),
    skipWiki: parsed["skip-wiki"] === true,
    passTimeoutSec: num("pass-timeout", 900),
    maxUsd: num("max-usd", DEFAULT_MAX_USD),
    noGates: parsed["no-gates"] === true,
    attempts: num("attempts", 2),
    drain: parsed.drain === true,
    drainMax,
    dryRun: parsed["dry-run"] === true,
  };
}

/** A config error the CLI reports as exit 2. Thrown, never exited, so `main` owns
 *  the exit code and a test can drive this path without killing the test runner. */
class ConfigError extends Error {}

function requireToken(name: string): string {
  const token = Deno.env.get(name);
  if (!token) {
    throw new ConfigError(
      `${name} is not set. This connector uses its own Discord application's bot\n` +
        `token. Add that bot's token to the environment under ${name} rather than\n` +
        `reusing another project's bot.`,
    );
  }
  return token;
}

/** The repo's own validation, in the order AGENTS.md prescribes. */
async function readJson(path: string): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await Deno.readTextFile(path));
  } catch {
    return {};
  }
}

async function readExistingCaptures(dir: string): Promise<string[]> {
  const names: string[] = [];
  try {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isFile && entry.name.endsWith(".md")) names.push(entry.name);
    }
  } catch {
    // directory does not exist yet
  }
  return names;
}

function report(
  payload: Record<string, unknown>,
  status: "OK" | "NEEDS_ATTENTION",
  message: string,
): number {
  console.log(message);
  console.log(`RESULT ${JSON.stringify({ status, ...payload })}`);
  return status === "OK" ? 0 : 1;
}

/** The CLI entry point. Takes argv so a test can drive a whole run without a token. */
export async function main(argv: string[] = Deno.args): Promise<number> {
  let args: Args;
  try {
    args = parseCliArgs(argv);
  } catch (error) {
    console.error(`error: ${(error as Error).message}\n\n${USAGE}`);
    return 2;
  }
  if (!args.channel || !args.venue) {
    console.error(`error: --channel and --venue are required\n\n${USAGE}`);
    return 2;
  }
  if (!Number.isInteger(args.limit) || args.limit < 0) {
    console.error("error: --limit must be a non-negative integer");
    return 2;
  }
  if (!Number.isInteger(args.passTimeoutSec) || args.passTimeoutSec <= 0) {
    console.error("error: --pass-timeout must be a positive integer");
    return 2;
  }
  if (!Number.isFinite(args.maxUsd) || args.maxUsd <= 0) {
    console.error("error: --max-usd must be a positive number");
    return 2;
  }

  let token: string;
  try {
    token = requireToken(args.tokenEnv);
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(`error: ${error.message}`);
      return 2;
    }
    throw error;
  }
  /**
   * The pass's credential, checked before any capture is fetched. A missing key is
   * configuration rather than content, so it exits 2 with the fix named: a run that got as
   * far as calling a model without one would spend its whole time budget to learn what
   * this check says in a line.
   */
  let passKey: string | undefined;
  if (!args.skipWiki && !args.dryRun) {
    const resolved = resolveApiKey(args.provider, (name) => Deno.env.get(name));
    if (!resolved) {
      console.error(`error: ${missingKeyMessage(args.provider)}`);
      return 2;
    }
    passKey = resolved.value;
  }

  const root = args.root;
  const outDir = args.out.startsWith("/") ? args.out : `${root}/${args.out}`;
  const cursorPath = `${outDir}/.cursor`;

  const channel = await fetchChannelMeta(args.channel, token);
  const channelName = channel.name ?? args.channel;
  const forum = isForum(channel.type);

  const cursorStore = await readJson(cursorPath);

  /**
   * Where a channel or a thread resumes.
   *
   * An explicit --since or --all wins over the stored cursor, and something never
   * seen before starts at its first message. Anchoring on "now" instead, with a
   * cap, keeps the newest N and advances the cursor past everything older:
   * measured 2026-10-15, that left the 395 messages between the last capture and
   * the newest 200 unreachable, because the next run resumed from the newest id
   * and never looked back.
   */
  function resumeFrom(id: string): string {
    if (args.since) return String(snowflakeFromIso(args.since));
    if (args.all) return "0";
    const stored = cursorStore[id];
    return typeof stored === "string" ? stored : "0";
  }

  function warnIfCapped(count: number, where: string): void {
    if (args.limit > 0 && count >= args.limit) {
      console.error(
        `warning: hit the ${args.limit}-message cap on ${where}; this run took the oldest ` +
          `${args.limit} message(s) after the cursor, and the next run resumes where this one ` +
          `stopped. Re-run with --limit 0 to drain the backlog in one pass.`,
      );
    }
  }

  const sections: CaptureSection[] = [];
  /**
   * The cursor keys this run may advance, each with the newest message id for it.
   *
   * The stored cursor is keyed by channel id and by thread id, because a thread is
   * its own message stream with its own resume point. Advancing a channel's key to
   * a thread's newest id would be a bug rather than a shortcut: the two streams
   * interleave in time, so the next run would skip the channel's own messages that
   * are older than that thread message.
   */
  const advances = new Map<string, string>();

  if (!forum) {
    const fetched = await fetchMessages(args.channel, token, {
      after: resumeFrom(args.channel),
      limit: args.limit,
    });
    warnIfCapped(fetched.length, `#${channelName}`);
    const messages = fetched.filter((m) => !m.author?.bot);
    if (messages.length) {
      sections.push({ messages });
      advances.set(args.channel, messages[messages.length - 1].id);
    }
  }

  // Threads are captured whatever the channel type. For a forum they are the whole
  // venue, since its top-level history holds only the post starters and no replies;
  // for a text channel they are content its top-level history never returns, so
  // skipping them would silently drop whole side discussions.
  for (const thread of await fetchVenueThreads(channel, token)) {
    const fetched = await fetchMessages(thread.id, token, {
      after: resumeFrom(thread.id),
      limit: args.limit,
    });
    warnIfCapped(fetched.length, `thread ${thread.id}`);
    const messages = fetched.filter((m) => !m.author?.bot);
    if (!messages.length) continue;
    sections.push({ title: threadTitle(thread), messages });
    advances.set(thread.id, messages[messages.length - 1].id);
  }

  const messages: DiscordMessage[] = sections
    .flatMap((section) => section.messages)
    .sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0));

  /**
   * What this run folds, in the order it folds it.
   *
   * The queue is drained oldest first, so material an earlier run committed and could
   * not fold in is absorbed before anything newer, and this run's own capture joins the
   * back of it. One fold per run by default: each one is a whole page pass with its own
   * attempts, so a backlog drains over several runs instead of overrunning the job's own
   * time limit. --drain folds the venue's whole queue.
   */
  const folds = readPending(cursorStore);
  const queued = pendingFor(folds, args.venue);
  const newMessages = messages.length > 0;
  if (!newMessages && !queued.length) {
    return report(
      { venue: args.venue, channel: args.channel, captured: 0 },
      "OK",
      `no new messages in #${channelName}`,
    );
  }

  const text = newMessages
    ? renderCapture({
      messages,
      sections,
      channelId: args.channel,
      channelName,
      channelType: channelKind(channel.type),
      tags: args.tags,
      serverLabel: args.server,
    })
    : "";
  const day = newMessages ? captureDay(messages) : isoUtc(new Date().toISOString()).slice(0, 10);

  if (args.dryRun) {
    if (newMessages) console.log(text);
    if (!args.skipWiki) {
      const target = queued[0];
      console.error(
        `\n[dry-run] the wiki pass would fold ${target?.capture ?? "(not written)"} with ` +
          `${args.model ?? args.provider.defaultModel} on ${args.provider.name}; no model call is made`,
      );
    }
    return report(
      { venue: args.venue, channel: args.channel, day, captured: messages.length, dryRun: true },
      "OK",
      `[dry-run] ${messages.length} messages, ${
        new Set(messages.map((m) => m.author?.id)).size
      } authors, ${text.length} bytes`,
    );
  }

  /**
   * The capture is written and committed whatever the wiki pass goes on to do.
   *
   * It is the evidence, so it cannot be hostage to a model call, a gate, or a rate
   * limit: the archive being complete through the last message is a fact the moment
   * this file exists, and it stays true whether or not the fold succeeds.
   */
  let capturePath: string | undefined;
  if (newMessages) {
    await Deno.mkdir(outDir, { recursive: true });
    capturePath = nextCapturePath(args.out, day, args.venue, await readExistingCaptures(outDir));
    await Deno.writeTextFile(`${root}/${capturePath}`, text);
    /**
     * The index is a view of the captures, so it moves in the same commit as the
     * capture that changed it.
     *
     * It is written here, before the pass rather than only after one, because a
     * capture that is committed without a fold still changes the tree the index
     * describes: a pass that fails its gates reverts its pages but leaves the
     * capture, and a pass that is killed cannot revert anything at all. Writing it
     * twice is cheap and idempotent, and the alternative is a repository whose
     * index contradicts its own captures, which is what `index_page.ts --check`
     * fails on and what left `main` with a stale index on 2026-10-18.
     */
    await writeCapturesIndex(root);
  }

  /**
   * The fetch cursor advances with the capture and never with the wiki.
   *
   * They fail differently. The archive is complete through the newest message as soon
   * as the capture is written, so the cursor moves here, before any model call, and a
   * fold that fails cannot pull it back and make the next run re-fetch what is already
   * archived. What the wiki still owes is remembered in the queue instead of in the
   * fetch position, which is what lets the archive run ahead of the fold.
   */
  const nowIso = isoUtc(new Date().toISOString());
  let pending: PendingFold[] = capturePath
    ? enqueue(folds, { capture: capturePath, venue: args.venue, messages: messages.length })
    : folds;
  {
    const store: Record<string, unknown> = await readJson(cursorPath) as Record<string, unknown>;
    // Only the keys this connector will read again are advanced. For a forum that
    // is the thread ids and never the channel id, because a forum's own channel id
    // is not a resume point and a cursor nothing reads is just a stale claim.
    for (const [id, newest] of advances) store[id] = newest;
    store._lastRun = nowIso;
    setPending(store, pending);
    await Deno.writeTextFile(cursorPath, JSON.stringify(store, null, 2) + "\n");
  }

  const summaryPath = `${outDir}/SUMMARY.json`;
  const summary: Record<string, unknown> = await readJson(summaryPath);
  // Read before this run overwrites it: the brief shows the model when the wiki
  // was last touched, which is how a page judges how stale its claims are.
  const previousRun = typeof summary.lastRun === "string" ? summary.lastRun : undefined;
  const captureCount = (await readExistingCaptures(outDir)).length;
  Object.assign(summary, {
    status: "OK" as const,
    connector: "discord",
    captures: captureCount,
    fetched: messages.length,
    ingested: 0,
    skipped_by_appraisal: 0,
    actionable_candidates: messages.length,
    lastRun: nowIso,
  });
  // A run that only drains its queue fetched nothing, and a cursor there would claim
  // it read messages it never saw. An existing cursor is left as it was; a first run
  // that finds nothing new has to satisfy the contract too, which allows an explicit
  // null, rather than failing validation because it had nothing to write.
  if (newMessages) summary.cursor = messages[messages.length - 1].id;
  else if (!("cursor" in summary)) summary.cursor = null;

  if (args.skipWiki) {
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      {
        venue: args.venue,
        channel: args.channel,
        day,
        captured: messages.length,
        capture: capturePath,
        pending: pendingFor(pending, args.venue).length,
      },
      "OK",
      capturePath
        ? `wrote ${capturePath} (${messages.length} messages); wiki pass skipped`
        : `no new messages in #${channelName}; wiki pass skipped`,
    );
  }

  /**
   * What this run may fold: the oldest capture this venue still owes the wiki.
   *
   * Read live from the queue on every pass rather than snapshotted, because a fold moves
   * an entry's own offset. A capture too long for one prompt is folded a slice at a time,
   * so it stays queued behind its offset and a drain has to pick that same entry back up
   * instead of calling the capture finished because it appeared in a list built before
   * the run started.
   *
   * One fold per run by default: each fold is a whole page pass with its own gate
   * attempts, so draining a backlog inside one job risks the job's own time limit.
   * `--drain` opts in and `--drain-max` caps how far it will go.
   */
  const foldCeiling = args.drain ? args.drainMax : 1;

  /**
   * The pass's standing instructions, and the client that carries them.
   *
   * Read once per run rather than per fold: they do not change between folds, and a
   * missing prompt file should stop the run here instead of halfway through a pass. The
   * wiki pass is not skipped past this point, so the key is present.
   */
  const standingInstructions = await readPassInstructions(root);
  const modelId = args.model ?? args.provider.defaultModel;
  const complete: Complete = args.provider.name === "gemini"
    ? geminiComplete(passKey!, modelId)
    : anthropicComplete(makeClient(passKey!), modelId);
  console.log(`provider: ${describeModel(args.provider, modelId)}`);

  /** Attempts the last fold was allowed, so the report names what actually ran. */
  let foldAttempts = args.attempts;

  /**
   * Persist the queue to the cursor file.
   *
   * Called after every fold that lands and again once the loop is over, so the queue on
   * disk tracks the queue in memory. Writing per fold rather than only at the end is what
   * makes a throw mid-drain harmless: a fold that advanced an entry and then hit an I/O
   * error would otherwise leave the file holding the offset from before the run, and the
   * next run would fold that slice a second time. Re-folding is the conservative failure
   * and never a lost slice, but it spends a model call redoing work the wiki already has.
   */
  const persistQueue = async (): Promise<void> => {
    const store: Record<string, unknown> = await readJson(cursorPath) as Record<string, unknown>;
    setPending(store, pending);
    await Deno.writeTextFile(cursorPath, JSON.stringify(store, null, 2) + "\n");
  };

  let allWritten: string[] = [];
  let notes = "";
  let usage: { inputTokens?: number; outputTokens?: number } = {};
  let lastFailure = "";
  let folded = 0;
  let stalled = false;
  let stalledCapture = "";
  let gatesSkipped = false;
  /**
   * Set when the fold was never judged because there was no budget to judge it with.
   *
   * Kept apart from `stalled` on purpose: a stall is a verdict on the material, and a
   * pass that never reached the model reached no verdict at all.
   */
  let budgetBlocked = false;
  let budgetBlockedCapture = "";
  let budgetBlockedReason = "";
  /**
   * Set when the pass ran and changed no page, so the wiki did not absorb the capture.
   *
   * A no-op pass used to be counted as a fold, and that is how the 594-message
   * `#brainstorm` capture left the queue on 2026-10-18 without a page being written:
   * an unchanged tree passes every gate, so the connector advanced the entry to the end
   * of a capture the wiki still did not carry. The entry now stays queued and the run
   * says which capture it was.
   */
  let noopFold = false;
  let noopCapture = "";
  let noopReason = "";

  for (let foldCount = 0; foldCount < foldCeiling; foldCount++) {
    const fold = pendingFor(pending, args.venue)[0];
    if (!fold) break;
    const foldPath = fold.capture;
    let captureText: string;
    try {
      captureText = await Deno.readTextFile(`${root}/${foldPath}`);
    } catch (error) {
      // Only a capture that is genuinely gone leaves the queue. A read that failed for
      // any other reason (permissions, a truncated file, an I/O error) is not evidence
      // that the material is absent, and dropping the entry would forget it in silence:
      // the run stops instead, and the queue is still on disk for the next one.
      if (!(error instanceof Deno.errors.NotFound)) throw error;
      pending = drop(pending, foldPath);
      console.log(`fold skipped: ${foldPath} is not on disk; dropped from the queue`);
      continue;
    }

    // The venue's shape, read out of the capture rather than off the live channel: a
    // queued capture may be days old, and describing it with this run's channel would
    // name one venue while the agent reads another venue's file.
    const kind = captureKind(captureText);
    const posts = postsInCapture(captureText);
    const foldForum = kind ? POST_SHAPED.has(kind) : forum;
    // The pass reads the whole capture, so one fold absorbs all of it.
    const absorbed = captureText.length;

    const attempts = args.attempts;
    foldAttempts = attempts;

    let changedThisFold: string[] = [];
    let feedback: string | undefined;
    let passed = false;
    /** Attempts this fold lost to the provider's own cap rather than to its own work. */
    let rateLimitedAttempts = 0;
    let rateLimitNote = "";

    /**
     * What a pass is measured against, and what a failed attempt is
     * restored to. Taken here, after the connector's own capture and cursor
     * writes, so those are not mistaken for changes the agent made.
     */
    const treeBefore = await snapshotTree(root);

    /**
     * Mark this capture folded in: the queue advances past what the pass absorbed and
     * its pages join the run's report. The entry advances to the end of the capture the
     * pass absorbed, and leaves the queue once that is the whole of it.
     */
    const recordFold = async () => {
      // A fold that landed supersedes an earlier attempt that wrote nothing: the
      // material is in the wiki now, so the run is not reporting a no-op fold.
      noopFold = false;
      pending = advance(pending, foldPath, absorbed, captureText.length);
      allWritten = [...allWritten, ...changedThisFold];
      folded++;
      await persistQueue();
    };

    for (let attempt = 1; attempt <= attempts; attempt++) {
      // Bound before the pass runs rather than after it: a throw (a network failure, a
      // bug) surfaces as an exception, not a failed result, and by then the pass may
      // already have written pages. Bound here, the throw can undo them instead of
      // leaving pages behind that no gate has seen.
      const revert = () => restoreTree(root, treeBefore);
      // A capture an earlier run committed and could not fold in is being picked back up
      // here, and the pass should not call days-old material new.
      const queued = foldPath !== capturePath;
      // The staged pass: the capture goes to the model whole (split only past the chunk
      // limit), and every page it writes is composed and checked in code.
      const run: PassRun = await runAnthropicPass({
        root,
        capturePath: foldPath,
        captureText,
        system: standingInstructions,
        model: modelId,
        complete,
        task: {
          capturePath: foldPath,
          channelName,
          messageCount: fold.messages,
          lastUpdated: previousRun,
          queued,
          forum: foldForum,
          feedback,
        },
        posts,
        maxUsd: args.maxUsd,
        timeoutMs: args.passTimeoutSec * 1000,
      }).catch(async (error: unknown) => {
        await revert();
        throw error;
      });
      const changed = diffTree(treeBefore, await snapshotTree(root));
      const stray = outsideWiki(changed);
      usage = { inputTokens: run.usage.inputTokens, outputTokens: run.usage.outputTokens };

      // The tree compare is the write-surface control: anything outside wiki/ reverts the
      // whole attempt, whatever the pass reported.
      if (!run.ok || stray.length) {
        await revert();
        lastFailure = !run.ok
          ? `the pass did not finish: ${run.timedOut ? `killed after ${args.passTimeoutSec}s` : `exit ${run.code}`}${
            run.stderr ? `\n${run.stderr}` : ""
          }`
          : `the pass changed files outside wiki/, so the whole attempt was reverted:\n  - ${stray.join("\n  - ")}`;
        feedback = lastFailure;
        console.log(
          `attempt ${attempt}/${attempts} ${
            !run.ok
              ? run.timedOut ? `timed out after ${args.passTimeoutSec}s` : `failed (exit ${run.code})`
              : `wrote outside wiki/ (${stray.length} path(s))`
          }`,
        );
        // A provider cap is not a verdict on the material. Noted per attempt so a fold
        // whose attempts were *all* rate-limited can be told apart from one that reached
        // the model and wrote something the gates rejected.
        if (run.rateLimited) {
          rateLimitedAttempts += 1;
          rateLimitNote = run.rateLimited;
          console.log(`attempt ${attempt}/${attempts} was rate-limited: ${run.rateLimited}`);
        }
        continue;
      }

      changedThisFold = changed;
      notes = `${run.usage.steps} call(s), ${run.usage.inputTokens} in / ` +
        `${run.usage.outputTokens} out${run.usage.costUsd === undefined ? "" : `, ~$${run.usage.costUsd.toFixed(3)}`}`;
      console.log(
        `attempt ${attempt}/${attempts}: ${changedThisFold.length} page file(s) changed: ${
          changedThisFold.join(", ") || "none"
        }`,
      );

      // A pass that changed no page did not fold the capture, whatever the gates say
      // about an untouched tree, so this is settled before the gates rather than left to
      // them: an untouched tree passes all six. It is a failed attempt, not a fold, so
      // the retry sees the same material with that feedback, and the entry stays queued
      // when every attempt comes back empty. `noopFold` carries the condition to the
      // report, where it reads differently from a stall: a stall is this material's
      // verdict, while this one says the model ran and wrote nothing at all.
      if (changedThisFold.length === 0) {
        await revert();
        noopFold = true;
        lastFailure = "the pass changed no page, so the wiki did not absorb the capture";
        feedback = lastFailure;
        console.log(`attempt ${attempt}/${attempts}: the pass changed no page`);
        continue;
      }

      await writeCapturesIndex(root);

      if (args.noGates) {
        // Local iteration only: nothing here checks the pages, so the fold is recorded as
        // done and the run moves on. The report says the gates were skipped rather than
        // claiming they passed, and no `pages-ok` marker is written, so an unattended
        // workflow will not commit pages that no gate has seen.
        //
        // `break`, not `continue`: continuing runs the next attempt over the pages this
        // one already wrote, which double-counts the fold and ends every run as
        // NEEDS_ATTENTION because `passed` is never set.
        gatesSkipped = true;
        passed = true;
        await recordFold();
        break;
      }

      const outcomes = await runWikiGates(`${root}/wiki.yml`);
      const orphans = await findOrphans(root);
      if (orphans.length) {
        outcomes.push({
          name: "orphans",
          ok: false,
          output: `no inbound link from another page:\n  - ${orphans.join("\n  - ")}`,
        });
      }
      const threadProblems = await findThreadProblems(root);
      if (threadProblems.length) {
        outcomes.push({
          name: "threads",
          ok: false,
          output: `a forum post is missing its own page:\n  - ${threadProblems.join("\n  - ")}`,
        });
      }

      const failed = outcomes.filter((outcome) => !outcome.ok);
      if (failed.length === 0) {
        passed = true;
        await recordFold();
        break;
      }

      // Undo this attempt before the next one: the pass must see the pages as
      // they were, not as its own rejected attempt left them.
      await revert();
      await writeCapturesIndex(root);
      lastFailure = gateFeedback(outcomes);
      feedback = lastFailure;
      console.log(
        `attempt ${attempt}/${attempts} failed ${failed.map((outcome) => outcome.name).join(", ")}`,
      );
    }

    // Every attempt on this capture failed. It stays committed and stays queued, so
    // the next run retries it rather than skipping the material this venue still owes
    // the wiki. The queue is ordered, so the run stops here instead of folding a newer
    // capture over an older one that was never absorbed.
    if (!passed) {
      /**
       * A spent budget is not a stall.
       *
       * `stalls` counts runs that failed to fold a capture, a diagnostic for material
       * the model could not integrate. A pass the provider refused judged nothing, so
       * counting it would make a spent budget look like a venue with bad content and
       * send the next run looking at the wrong problem. The status stays
       * NEEDS_ATTENTION either way: `VALID_STATUSES` mirrors the hub's contract, so a
       * new status value would be a cross-repo change.
       */
      if (rateLimitedAttempts > 0 && rateLimitedAttempts === attempts) {
        budgetBlocked = true;
        budgetBlockedCapture = foldPath;
        budgetBlockedReason = `every attempt was rate-limited by the provider: ${rateLimitNote}`;
        console.log(`fold deferred: ${budgetBlockedReason}`);
        break;
      }
      /**
       * Every attempt ran and wrote nothing, which is the outcome that has to be loud:
       * the material is still on disk, the wiki still does not carry it, and a run that
       * reported this as a fold would advance the queue past it.
       *
       * It counts as a stall, because it is a run that failed to fold the capture and
       * `stalls` is the number that makes a venue stuck on one capture visible. It is
       * reported as its own condition rather than as a generic stall, so the log says
       * what actually happened: the model ran, and produced no pages.
       */
      if (noopFold) {
        pending = stall(pending, foldPath);
        const attemptsSoFar = pending.find((entry) => entry.capture === foldPath)?.stalls ?? 1;
        noopCapture = foldPath;
        noopReason = `${foldPath} did not fold in on any of ${attempts} attempt(s): every pass ` +
          `ran to completion and changed no page, so the wiki did not absorb the capture. ` +
          `It stays queued (${attemptsSoFar} consecutive stall(s)).`;
        console.log(
          `fold stalled: ${foldPath} stays queued for the next run (${attemptsSoFar} consecutive stall(s)); the pass changed no page`,
        );
        break;
      }

      stalled = true;
      stalledCapture = foldPath;
      pending = stall(pending, foldPath);
      const attemptsSoFar = pending.find((entry) => entry.capture === foldPath)?.stalls ?? 1;
      console.log(
        `fold stalled: ${foldPath} stays queued for the next run (${attemptsSoFar} consecutive stall(s))`,
      );
      break;
    }
  }

  /**
   * The queue's final write, after the folds rather than with the capture.
   *
   * The first cursor write records the capture and the entry for it, which is what makes
   * the archive durable before any model call. This one carries the entries this run
   * stalled or dropped as well as any fold that landed, and it is the reason a fold that
   * fails cannot lose material: the entry it did not absorb is still there for the next
   * run. A fold that landed already wrote itself, so a throw between here and there
   * costs a repeated slice, never a forgotten one.
   */
  await persistQueue();

  /**
   * Authorise the workflow to commit `wiki/`.
   *
   * The commit step cannot tell a tree holding gate-passed pages from one a crashed
   * agent left behind: both are a non-zero exit with a dirty `wiki/`. So the process
   * that ran the gates is the one that says so, and it says it only here, after every
   * fold has either passed or been reverted. The marker is deleted before each venue
   * runs and `.dcwg/` is never committed, so a run that dies before this line, and a
   * run under `--no-gates`, authorise nothing.
   */
  await writePagesOk(root, !gatesSkipped);

  const stillQueued = pendingFor(pending, args.venue).length;
  summary.ingested = allWritten.length;
  if (stalled || budgetBlocked || noopFold) summary.status = "NEEDS_ATTENTION";

  const summaryErrors = validateSummary(summary);
  if (summaryErrors.length) {
    summary.status = "NEEDS_ATTENTION";
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      { venue: args.venue, channel: args.channel, capture: capturePath, summaryErrors },
      "NEEDS_ATTENTION",
      `SUMMARY.json violates the connector contract:\n  - ${summaryErrors.join("\n  - ")}`,
    );
  }

  await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");

  const archived = capturePath ? `${capturePath} (${messages.length} messages)` : "nothing new";
  const foldedNote = `${folded} capture(s) folded${gatesSkipped ? ", gates skipped" : ""}`;

  if (budgetBlocked) {
    return report(
      {
        venue: args.venue,
        channel: args.channel,
        capture: capturePath,
        captured: messages.length,
        folded,
        pending: stillQueued,
        budget: budgetBlockedReason,
        attempts: foldAttempts,
        output: lastFailure.slice(-1200),
      },
      "NEEDS_ATTENTION",
      `archived ${archived}; ${foldedNote}, but ${budgetBlockedCapture} was not folded for want of model budget: ${budgetBlockedReason}. It stays queued, so the next run retries it.`,
    );
  }

  if (noopFold) {
    return report(
      {
        venue: args.venue,
        channel: args.channel,
        capture: capturePath,
        captured: messages.length,
        folded,
        pending: stillQueued,
        noop: noopCapture,
        attempts: foldAttempts,
        output: lastFailure.slice(-1200),
      },
      "NEEDS_ATTENTION",
      `archived ${archived}; ${foldedNote}, but ${noopReason}`,
    );
  }

  if (stalled) {
    return report(
      {
        venue: args.venue,
        channel: args.channel,
        capture: capturePath,
        // Reported even though the fold failed: the archive is committed, and a
        // NEEDS_ATTENTION run that hid what it archived would read as a lost run.
        captured: messages.length,
        folded,
        pending: stillQueued,
        stalled: stalledCapture,
        attempts: foldAttempts,
        output: lastFailure.slice(-1200),
      },
      "NEEDS_ATTENTION",
      `archived ${archived}; ${foldedNote}, but ${stalledCapture} did not fold in on any of ${foldAttempts} attempt(s). It stays queued, so the next run retries it:\n${
        lastFailure.slice(-1200)
      }`,
    );
  }

  return report(
    {
      venue: args.venue,
      channel: args.channel,
      day,
      capture: capturePath,
      captured: messages.length,
      pages: allWritten,
      folded,
      pending: stillQueued,
      usage,
      notes,
    },
    "OK",
    `archived ${archived}; ${foldedNote} and updated ${allWritten.length} page(s)`,
  );
}

if (import.meta.main) Deno.exit(await main());
