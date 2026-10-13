const API = "https://discord.com/api/v10";
const USER_AGENT = "dcwg-memory/1.0 (+https://github.com/EthanThatOneKid/dcwg-memory)";

export interface DiscordAuthor {
  id: string;
  username: string;
  global_name?: string | null;
  bot?: boolean;
}

export interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  edited_timestamp?: string | null;
  type: number;
  author: DiscordAuthor;
  attachments?: Array<{ filename: string; url: string }>;
  embeds?: Array<{ title?: string | null; description?: string | null; url?: string | null }>;
  sticker_items?: Array<{ name: string }>;
  referenced_message?: DiscordMessage | null;
}

export class DiscordError extends Error {
  /**
   * `code` is Discord's own error code (50001 missing access, 10004 unknown
   * guild), which is what tells a setup problem from a transient one.
   */
  constructor(message: string, readonly status: number, readonly code?: number) {
    super(message);
    this.name = "DiscordError";
  }
}

export const MISSING_ACCESS = 50001;
export const UNKNOWN_GUILD = 10004;

/**
 * GET a Discord API path, waiting out 429s instead of dying on them.
 *
 * A full-history backfill of a busy channel will trip the per-route bucket, and
 * Discord's Retry-After is authoritative, so honour it and back off
 * geometrically as a floor for the global bucket, which reports 429 without a
 * useful header.
 */
export async function apiGet<T>(
  path: string,
  token: string,
  attempts = 6,
  sleep = sleepMs,
): Promise<T> {
  let wait = 1000;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const res = await fetch(`${API}${path}`, {
      headers: {
        Authorization: `Bot ${token}`,
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    if (res.ok) return (await res.json()) as T;

    // Read the body before deciding: it carries Discord's error code.
    const body = await res.text();
    if (res.status === 429 && attempt + 1 < attempts) {
      const header = Number(res.headers.get("Retry-After"));
      const serverWait = Number.isFinite(header) && header > 0 ? header * 1000 : wait;
      await sleep(Math.min(Math.max(serverWait, 500), 60_000) + 250);
      wait = Math.min(wait * 2, 60_000);
      continue;
    }
    let detail = body.slice(0, 400);
    let code: number | undefined;
    try {
      const parsed = JSON.parse(body) as { message?: string; code?: number };
      code = typeof parsed.code === "number" ? parsed.code : undefined;
      detail = `${parsed.message ?? detail} (code ${parsed.code ?? "?"})`;
    } catch {
      // Not JSON; the raw slice is the best detail available.
    }
    throw new DiscordError(`GET ${path} -> HTTP ${res.status}: ${detail}`, res.status, code);
  }
  throw new DiscordError(`GET ${path} -> still rate limited after ${attempts} attempts`, 429);
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ISO-8601 -> Discord snowflake, for `after` pagination. */
export function snowflakeFromIso(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) throw new Error(`not an ISO-8601 timestamp: ${iso}`);
  return ((BigInt(ms) - 1420070400000n) << 22n).toString();
}

/** Normalise a Discord timestamp to second-precision UTC with a trailing Z. */
export function isoUtc(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) throw new Error(`not a Discord timestamp: ${ts}`);
  return `${d.toISOString().slice(0, 19)}Z`;
}

export function authorLabel(msg: DiscordMessage): string {
  const a = msg.author;
  const name = a.global_name || a.username || a.id || "unknown";
  return a.bot ? `${name} [bot]` : name;
}

export interface ChannelMeta {
  id: string;
  name?: string | null;
}

export async function fetchChannelMeta(channelId: string, token: string): Promise<ChannelMeta> {
  const meta = await apiGet<ChannelMeta>(`/channels/${channelId}`, token);
  if (!meta || typeof meta.id !== "string") {
    throw new DiscordError(`cannot read channel ${channelId}`, 0);
  }
  return meta;
}

export interface FetchOptions {
  after?: string | null;
  /** 0 or less means no cap, which is what a backfill uses. */
  limit: number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Page through a channel's history.
 *
 * Discord returns, per page, the 100 messages immediately adjacent to the
 * anchor (not the furthest ones), newest-first in the body. Sort each page
 * ascending, extend, and re-anchor on the extreme id in the direction of
 * travel; that is what keeps consecutive runs gap-free.
 */
export async function fetchMessages(
  channelId: string,
  token: string,
  { after = null, limit, sleep = sleepMs }: FetchOptions,
): Promise<DiscordMessage[]> {
  let out: DiscordMessage[] = [];
  let anchor = after;

  while (limit <= 0 || out.length < limit) {
    // Branch on the direction of travel, not on whether an anchor exists: a
    // backward walk sets an anchor after its first page and must keep going
    // `before`, or it turns around and re-reads the newest messages forever.
    const params = after
      ? `?limit=100&after=${anchor}`
      : `?limit=100${anchor ? `&before=${anchor}` : ""}`;
    const page = await apiGet<DiscordMessage[]>(
      `/channels/${channelId}/messages${params}`,
      token,
      6,
      sleep,
    );
    if (!Array.isArray(page) || page.length === 0) break;

    page.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0));
    out = after ? [...out, ...page] : [...page, ...out];
    // Forward travel re-anchors on the newest id of the page; backward on the oldest.
    anchor = after ? page[page.length - 1].id : page[0].id;

    if (page.length < 100) break;
    await sleep(250);
  }

  const seen = new Set<string>();
  const deduped: DiscordMessage[] = [];
  for (const m of out) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    deduped.push(m);
  }
  deduped.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0));
  if (limit <= 0) return deduped;
  return after ? deduped.slice(0, limit) : deduped.slice(-limit);
}
