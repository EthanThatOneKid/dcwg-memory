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

interface CommandResult {
  cmd: string;
  ok: boolean;
  output: string;
}

async function run(cmd: string[], cwd: string): Promise<CommandResult> {
  const proc = new Deno.Command(cmd[0], { args: cmd.slice(1), cwd, stdout: "piped", stderr: "piped" });
  const { code, stdout, stderr } = await proc.output();
  const decoder = new TextDecoder();
  const output = (decoder.decode(stdout) + decoder.decode(stderr)).trim();
  return { cmd: cmd.join(" "), ok: code === 0, output };
}

/** The repo's own validation, in the order AGENTS.md prescribes. */
export const GATES: string[][] = [
  ["wiki", "-c", "wiki.yml", "fmt"],
  ["wiki", "-c", "wiki.yml", "fmt", "--check"],
  ["wiki", "-c", "wiki.yml", "check", "--strict"],
  ["wiki", "-c", "wiki.yml", "lint", "--strict"],
  ["wiki", "-c", "wiki.yml", "render", "--check"],
  ["deno", "run", "-A", "tools/discord/orphans.ts"],
  ["python3", "build.py"],
];

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

  const wiki = await runWikiPass({
    root,
    messages,
    channelName,
    capturePath,
    cursorBefore: after,
    provider: args.provider,
    model: args.model,
  });

  if ("problems" in wiki) {
    summary.status = "NEEDS_ATTENTION";
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      { venue: args.venue, channel: args.channel, day, captured: messages.length, capture: capturePath, problems: wiki.problems },
      "NEEDS_ATTENTION",
      `wrote ${capturePath}, but the wiki pass was rejected:\n  - ${wiki.problems.join("\n  - ")}`,
    );
  }

  const written: string[] = [];
  for (const edit of wiki.edits) {
    const bytes = new TextEncoder().encode(edit.content).length;
    const check = checkEditablePath(edit.path, bytes);
    if (!check.ok) {
      await wiki.revert();
      summary.status = "NEEDS_ATTENTION";
      await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
      return report(
        { venue: args.venue, channel: args.channel, capture: capturePath, rejected: edit.path },
        "NEEDS_ATTENTION",
        `wrote ${capturePath}, but the model proposed a path it may not write (${edit.path}: ${check.reason}). Nothing else was changed.`,
      );
    }
    written.push(edit.path);
  }

  for (const edit of wiki.edits) {
    await writePage(root, edit as PageEdit);
  }
  console.log(`wiki pass proposed ${written.length} page edit(s): ${written.join(", ") || "none"}`);

  const indexChanged = await writeCapturesIndex(root);
  if (indexChanged) console.log("regenerated wiki/Captures.md from the tree");

  if (args.noGates) {
    await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
    return report(
      { venue: args.venue, channel: args.channel, capture: capturePath, pages: written, gates: "skipped" },
      "OK",
      `wrote ${capturePath} and ${written.length} page edit(s); gates skipped`,
    );
  }

  if (written.length || indexChanged) {
    for (const gate of GATES) {
      const result = await run(gate, root);
      if (!result.ok) {
        await wiki.revert();
        await writeCapturesIndex(root);
        summary.status = "NEEDS_ATTENTION";
        await Deno.writeTextFile(summaryPath, JSON.stringify(summary, null, 2) + "\n");
        return report(
          { venue: args.venue, channel: args.channel, capture: capturePath, failedGate: result.cmd, output: result.output.slice(-1200) },
          "NEEDS_ATTENTION",
          `wrote ${capturePath}, but \`${result.cmd}\` failed, so the page edits were reverted:\n${result.output.slice(-1200)}`,
        );
      }
    }
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
      usage: wiki.usage,
      notes: wiki.notes,
    },
    "OK",
    `wrote ${capturePath} (${messages.length} messages) and updated ${written.length} page(s); all gates pass`,
  );
}

if (import.meta.main) Deno.exit(await main());
