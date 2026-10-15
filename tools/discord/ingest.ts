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
 *   ANTHROPIC_API_KEY        used by the wiki pass only
 */

import { fetchChannelMeta, fetchMessages, snowflakeFromIso, isoUtc } from "./discord.ts";
import { captureDay, nextCapturePath, renderCapture, DEFAULT_TAGS, DEFAULT_SERVER_LABEL } from "./capture.ts";
import { checkEditablePath, validateSummary } from "./guard.ts";
import { buildPrompt, readPages, runWikiPass, writePage } from "./wiki.ts";
import { writeCapturesIndex } from "./index_page.ts";
import { findOrphans } from "./orphans.ts";
import { gateFeedback, runWikiGates } from "./wiki_gates.ts";
import type { DiscordMessage } from "./discord.ts";
import type { PageEdit, Provider } from "./wiki.ts";

const USAGE = `dcwg-memory Discord connector

Usage:
  deno run -A ingest.ts --channel <id> --venue <venue> [options]

Required:
  --channel <id>        Discord channel id to capture
  --venue <venue>       capture venue slug, e.g. dcwg-talk (names the file)

Options:
  --out <dir>           capture directory (default: raw/discord)
  --root <dir>          repo root (default: current directory)
  --server <label>      server name for the capture prose
  --tag <tag>           repeatable; defaults to ${DEFAULT_TAGS.join(", ")}
  --limit <n>           max messages to pull (default 200; 0 means no cap)
  --all                 ignore the cursor and pull from the channel's first message
  --since <iso>         ISO-8601 UTC lower bound (overrides the cursor)
  --token-env <name>    env var holding the bot token (default: DCWG_DISCORD_BOT_TOKEN)
  --provider <name>     anthropic or openrouter (default: whichever key is set)
  --model <id>          model id for the wiki pass (default: provider-specific)
  --skip-wiki           capture only; do not touch wiki pages
  --attempts <n>        how many times the page pass may be retried against the gates
                        (default 2: one retry, because the usual failure is correctable)
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
  provider?: Provider;
  /** Unset means the provider's own default, so the two defaults cannot collide. */
  model?: string;
  skipWiki: boolean;
  noGates: boolean;
  /** How many times the page pass may be retried against the gates. */
  attempts: number;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    out: "raw/discord",
    root: ".",
    server: DEFAULT_SERVER_LABEL,
    tags: [...DEFAULT_TAGS],
    limit: 200,
    all: false,
    tokenEnv: "DCWG_DISCORD_BOT_TOKEN",
    skipWiki: false,
    noGates: false,
    attempts: 2,
    dryRun: false,
  };
  let tagsExplicit = false;
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${flag} needs a value`);
      return v;
    };
    switch (flag) {
      case "--channel": args.channel = value(); break;
      case "--venue": args.venue = value(); break;
      case "--out": args.out = value(); break;
      case "--root": args.root = value(); break;
      case "--server": args.server = value(); break;
      case "--tag": {
        const tag = value();
        args.tags = tagsExplicit ? [...args.tags, tag] : [tag];
        tagsExplicit = true;
        break;
      }
      case "--limit": args.limit = Number(value()); break;
      case "--since": args.since = value(); break;
      case "--token-env": args.tokenEnv = value(); break;
      case "--model": args.model = value(); break;
      case "--provider": {
        const name = value();
        if (name !== "anthropic" && name !== "openrouter") {
          throw new Error(`--provider must be anthropic or openrouter, not '${name}'`);
        }
        args.provider = name;
        break;
      }
      case "--all": args.all = true; break;
      case "--attempts": args.attempts = Number(value()); break;
      case "--skip-wiki": args.skipWiki = true; break;
      case "--no-gates": args.noGates = true; break;
      case "--dry-run": args.dryRun = true; break;
      case "-h":
      case "--help": console.log(USAGE); Deno.exit(0);
      default: throw new Error(`unknown flag: ${flag}`);
    }
  }
  return args;
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

function report(payload: Record<string, unknown>, status: "OK" | "NEEDS_ATTENTION", message: string): number {
  console.log(message);
  console.log(`RESULT ${JSON.stringify({ status, ...payload })}`);
  return status === "OK" ? 0 : 1;
}

/** The CLI entry point. Takes argv so a test can drive a whole run without a token. */
export async function main(argv: string[] = Deno.args): Promise<number> {
  let args: Args;
  try {
    args = parseArgs(argv);
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
  const root = args.root;
  const outDir = args.out.startsWith("/") ? args.out : `${root}/${args.out}`;
  const cursorPath = `${outDir}/.cursor`;

  const channel = await fetchChannelMeta(args.channel, token);
  const channelName = channel.name ?? args.channel;

  const cursorStore = await readJson(cursorPath);
  let after: string | null = null;
  if (args.since) after = String(snowflakeFromIso(args.since));
  else if (!args.all && typeof cursorStore[args.channel] === "string") after = cursorStore[args.channel] as string;

  const fetched = await fetchMessages(args.channel, token, { after, limit: args.limit });
  if (args.limit && fetched.length >= args.limit) {
    console.error(
      `warning: hit the ${args.limit}-message cap; the cursor will advance to the newest ` +
        `message fetched, so anything older than that and newer than the previous cursor ` +
        `would be skipped. Re-run with --limit 0 to drain the backlog.`,
    );
  }

  const messages: DiscordMessage[] = fetched.filter((m) => !m.author?.bot);
  if (!messages.length) {
    return report({ venue: args.venue, channel: args.channel, captured: 0 }, "OK", `no new messages in #${channelName}`);
  }

  const text = renderCapture({
    messages,
    channelId: args.channel,
    channelName,
    tags: args.tags,
    serverLabel: args.server,
  });
  const day = captureDay(messages);

  if (args.dryRun) {
    console.log(text);
    if (!args.skipWiki) {
      const pages = await readPages(root);
      console.error("\n--- wiki pass prompt (dry run; no model call) ---\n");
      console.error(buildPrompt({ root, messages, channelName, capturePath: "(not written)" }, pages, text));
    }
    return report(
      { venue: args.venue, channel: args.channel, day, captured: messages.length, dryRun: true },
      "OK",
      `[dry-run] ${messages.length} messages, ${new Set(messages.map((m) => m.author?.id)).size} authors, ${text.length} bytes`,
    );
  }

  await Deno.mkdir(outDir, { recursive: true });
  const capturePath = nextCapturePath(args.out, day, args.venue, await readExistingCaptures(outDir));
  await Deno.writeTextFile(`${root}/${capturePath}`, text);

  const nowIso = isoUtc(new Date().toISOString());
  {
    const store: Record<string, unknown> = await readJson(cursorPath) as Record<string, unknown>;
    store[args.channel] = messages[messages.length - 1].id;
    store._lastRun = nowIso;
    await Deno.writeTextFile(cursorPath, JSON.stringify(store, null, 2) + "\n");
  }

  const summaryPath = `${outDir}/SUMMARY.json`;
  const summary: Record<string, unknown> = await readJson(summaryPath);
  const captureCount = (await readExistingCaptures(outDir)).length;
  Object.assign(summary, {
    status: "OK" as const,
    connector: "discord",
    captures: captureCount,
    fetched: messages.length,
    ingested: 0,
    skipped_by_appraisal: 0,
    actionable_candidates: messages.length,
    cursor: messages[messages.length - 1].id,
    lastRun: nowIso,
  });

  if (args.skipWiki) {
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      { venue: args.venue, channel: args.channel, day, captured: messages.length, capture: capturePath },
      "OK",
      `wrote ${capturePath} (${messages.length} messages); wiki pass skipped`,
    );
  }

  // The capture is written once, above; only the page pass iterates. A failed
  // gate is not fatal on the first attempt: the failures go back to the model as
  // feedback and the pass runs again, because the usual failure is a correctable
  // detail (a page left with no inbound link, a frontmatter block flattened into
  // body text) rather than a bad reading of the capture.
  let feedback: string | undefined;
  let written: string[] = [];
  let notes = "";
  let usage: { inputTokens?: number; outputTokens?: number } = {};
  let lastFailure = "";
  let passed = false;

  for (let attempt = 1; attempt <= args.attempts; attempt++) {
    const wiki = await runWikiPass({
      root,
      messages,
      channelName,
      capturePath,
      cursorBefore: after,
      provider: args.provider,
      model: args.model,
      feedback,
    });

    if ("problems" in wiki) {
      const byModel = wiki.failure === "model";
      lastFailure = byModel
        ? `the model call failed:\n  - ${wiki.problems.join("\n  - ")}`
        : `the write guard rejected the pass:\n  - ${wiki.problems.join("\n  - ")}`;
      feedback = lastFailure;
      console.log(
        `attempt ${attempt}/${args.attempts} rejected: ${byModel ? "the model call failed" : "the write guard"}`,
      );
      continue;
    }

    const unwritable = wiki.edits.find((edit) =>
      !checkEditablePath(edit.path, new TextEncoder().encode(edit.content).length).ok
    );
    if (unwritable) {
      await wiki.revert();
      const check = checkEditablePath(unwritable.path, new TextEncoder().encode(unwritable.content).length);
      lastFailure = `the model proposed a path it may not write (${unwritable.path}: ${"reason" in check ? check.reason : "no reason given"})`;
      feedback = lastFailure;
      console.log(`attempt ${attempt}/${args.attempts} proposed an unwritable path`);
      continue;
    }

    written = wiki.edits.map((edit) => edit.path);
    notes = wiki.notes;
    usage = wiki.usage;
    for (const edit of wiki.edits) await writePage(root, edit as PageEdit);
    console.log(
      `attempt ${attempt}/${args.attempts}: ${written.length} page edit(s): ${written.join(", ") || "none"}`,
    );
    for (const adjustment of wiki.adjustments) console.log(`  adjusted: ${adjustment}`);

    await writeCapturesIndex(root);

    if (args.noGates) {
      summary.ingested = written.length;
      await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
      return report(
        { venue: args.venue, channel: args.channel, capture: capturePath, pages: written, gates: "skipped" },
        "OK",
        `wrote ${capturePath} and ${written.length} page edit(s); gates skipped`,
      );
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

    const failed = outcomes.filter((outcome) => !outcome.ok);
    if (failed.length === 0) {
      passed = true;
      break;
    }

    // Undo this attempt before the next one: the model must see the pages as
    // they were, not as its own rejected edit left them.
    await wiki.revert();
    await writeCapturesIndex(root);
    lastFailure = gateFeedback(outcomes);
    feedback = lastFailure;
    console.log(
      `attempt ${attempt}/${args.attempts} failed ${failed.map((outcome) => outcome.name).join(", ")}`,
    );
  }

  if (!passed) {
    summary.status = "NEEDS_ATTENTION";
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      {
        venue: args.venue,
        channel: args.channel,
        capture: capturePath,
        attempts: args.attempts,
        output: lastFailure.slice(-1200),
      },
      "NEEDS_ATTENTION",
      `wrote ${capturePath}, but the page pass did not complete on any of ${args.attempts} attempt(s), so no page edits were committed:\n${lastFailure.slice(-1200)}`,
    );
  }

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

  summary.ingested = written.length;
  await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
  return report(
    {
      venue: args.venue,
      channel: args.channel,
      day,
      capture: capturePath,
      captured: messages.length,
      pages: written,
      usage,
      notes,
    },
    "OK",
    `wrote ${capturePath} (${messages.length} messages) and updated ${written.length} page(s); all gates pass`,
  );
}

if (import.meta.main) Deno.exit(await main());
