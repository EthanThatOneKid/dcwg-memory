/**
 * Render a Discord capture.
 *
 * The output format is a contract: captures are append-only evidence, so this
 * renderer reproduces the Python connector's byte-for-byte behaviour (same
 * helpers, same separators) to keep the record uniform across both writers.
 */

import type { CaptureChannelKind, DiscordMessage } from "./discord.ts";
import { isoUtc } from "./discord.ts";

/** Message types whose text belongs in the record; anything else is annotated. */
export const TEXT_TYPES = new Set([0, 19, 20, 21]);

export const DEFAULT_SERVER_LABEL = "the Deno Core Working Group Discord";
export const DEFAULT_TAGS = ["deno", "dcwg", "discord"];

/** Double-quoted YAML scalar. JSON escaping is the same shape the record already uses. */
export function yamlStr(value: string): string {
  return JSON.stringify(value);
}

export function authorLabel(msg: DiscordMessage): string {
  const a = msg.author ?? {};
  let name = a.global_name || a.username || a.id || "unknown";
  if (a.bot) name += " [bot]";
  return name;
}

export function contentBlock(msg: DiscordMessage): string {
  const parts: string[] = [];
  if (msg.content) parts.push(msg.content);
  for (const emb of msg.embeds ?? []) {
    const title = emb.title || emb.url || "";
    const desc = emb.description || "";
    parts.push(`[embed] ${title} ${desc}`.trim());
  }
  for (const att of msg.attachments ?? []) {
    parts.push(`[attachment] ${att.filename} (${att.url})`);
  }
  if (msg.sticker_items?.length) {
    parts.push(`[sticker] ${msg.sticker_items.map((s) => s.name || "?").join(", ")}`);
  }
  return parts.join("\n").trim();
}

/** The message body, in the record's established shape. */
export function renderBody(messages: DiscordMessage[]): string {
  const lines: string[] = [];
  let prevAuthor: string | null = null;
  for (const msg of messages) {
    if (!TEXT_TYPES.has(msg.type)) {
      lines.push(`\\[system] ${msg.type} — ${isoUtc(msg.timestamp)}`);
      continue;
    }
    const label = authorLabel(msg);
    let stamp = isoUtc(msg.timestamp);
    if (msg.edited_timestamp) stamp = `${stamp}, edited ${isoUtc(msg.edited_timestamp)}`;
    if (label !== prevAuthor) {
      lines.push("");
      lines.push(`**${label}** — ${stamp} (\`${msg.id}\`)`);
      lines.push("");
      prevAuthor = label;
    } else {
      lines.push(`_(${stamp} \`${msg.id}\`)_`);
      lines.push("");
    }
    const ref = msg.referenced_message;
    if (ref) {
      const preview = (ref.content ?? "").slice(0, 120).replace(/\n/g, " ");
      lines.push(`> ↳ replying to ${authorLabel(ref)}: ${preview}`);
      lines.push("");
    }
    const block = contentBlock(msg);
    lines.push(block || "\\[no text content]");
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

/**
 * One block of a capture: a channel's own top-level history, or one thread.
 *
 * A forum has no top-level history at all, so every one of its blocks is titled.
 * A text channel keeps its untitled block first and follows it with its threads.
 */
export interface CaptureSection {
  /** Heading for the block; omitted for a channel's top-level history. */
  title?: string;
  messages: DiscordMessage[];
}

export interface CaptureInput {
  /**
   * The flat message list, ascending, across every section. It supplies the
   * frontmatter and the prose, so it must be the whole capture even when
   * `sections` is what gets rendered.
   */
  messages: DiscordMessage[];
  /** How to group the body; omitted means one undivided body. */
  sections?: CaptureSection[];
  channelId: string;
  channelName: string;
  /**
   * Discord's own kind for the venue. Required rather than optional so a capture
   * can never be written without saying whether its blocks are a channel plus its
   * threads or a forum's posts, which is what the thread check keys on.
   */
  channelType: CaptureChannelKind;
  tags?: string[];
  serverLabel?: string;
}

/** Render one block per section, separated by a rule. */
export function renderBlocks(sections: CaptureSection[]): string {
  return sections
    .map((section) =>
      section.title ? `## ${section.title}\n\n${renderBody(section.messages)}` : renderBody(section.messages)
    )
    .join("\n---\n\n");
}

export function participantsOf(messages: DiscordMessage[]): string[] {
  const participants: string[] = [];
  for (const m of messages) {
    const label = authorLabel(m);
    if (!participants.includes(label)) participants.push(label);
  }
  return participants;
}

/** UTC date of the first message: the day the capture file is named for. */
export function captureDay(messages: DiscordMessage[]): string {
  return isoUtc(messages[0].timestamp).slice(0, 10);
}

export function renderCapture(input: CaptureInput): string {
  const { messages, channelId, channelName, channelType } = input;
  const sections = input.sections ?? [];
  const tags = input.tags ?? DEFAULT_TAGS;
  const serverLabel = input.serverLabel ?? DEFAULT_SERVER_LABEL;
  const day = captureDay(messages);
  const participants = participantsOf(messages);
  const spanStart = isoUtc(messages[0].timestamp);
  const spanEnd = isoUtc(messages[messages.length - 1].timestamp);

  const threads = sections.filter((s) => s.title).length;
  const threadClause = threads ? `, across ${threads} thread${threads === 1 ? "" : "s"}` : "";
  const groupingNote = threads
    ? " Threads are grouped under their own headings below, and a forum post's body is the " +
      "first message under its heading."
    : "";

  const head =
    "---\n" +
    `title: ${yamlStr(`Discord #${channelName} — ${day}`)}\n` +
    `source: ${yamlStr(`Discord REST API, channel ${channelId}, UTC timestamps`)}\n` +
    `channel_type: ${channelType}\n` +
    "author:\n" +
    participants.map((p) => `  - ${yamlStr(p)}\n`).join("") +
    `created: ${day}\n` +
    "description: " +
    yamlStr(
      `Append-only capture of #${channelName} from ${spanStart} to ${spanEnd}, pulled ` +
        `from the Discord REST API. ${messages.length} messages, ${participants.length} participants` +
        `${threadClause}.`,
    ) +
    "\n" +
    "tags:\n" +
    tags.map((t) => `  - ${yamlStr(t)}\n`).join("") +
    "---\n\n" +
    `Append-only capture of \`#${channelName}\` in ${serverLabel}, ` +
    `${spanStart} to ${spanEnd}. Pulled from the Discord REST API, not pasted from a client, ` +
    "so every timestamp below is the server's own UTC timestamp and every message carries its " +
    "snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook " +
    "messages are omitted. Attachment and embed URLs are recorded as sent; they may expire." +
    `${groupingNote}\n\n` +
    "---\n";

  return head + (sections.length ? renderBlocks(sections) : renderBody(messages));
}

/** Never overwrite an existing capture: a re-run gets the next free suffix. */
export function nextCapturePath(dir: string, day: string, venue: string, taken: string[]): string {
  const existing = taken.filter((p) => p.startsWith(`${day}_${venue}`) && p.endsWith(".md"));
  const suffix = existing.length ? `-${existing.length + 1}` : "";
  return `${dir}/${day}_${venue}${suffix}.md`;
}
