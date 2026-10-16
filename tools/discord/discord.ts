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

/** Discord channel types this connector tells apart. */
export const CHANNEL_TEXT = 0;
export const CHANNEL_FORUM = 15;
export const CHANNEL_MEDIA = 16;

/**
 * A forum or media channel has no top-level history of its own: every post is a
 * thread, and the post body is that thread's first message. Reading such a
 * channel with `fetchMessages` returns only the post starters and no replies.
 */
export function isForum(type: number | undefined): boolean {
  return type === CHANNEL_FORUM || type === CHANNEL_MEDIA;
}

/**
 * The venue kind a capture records in its frontmatter.
 *
 * A forum and a media channel are post-shaped: their top-level history holds only
 * the post starters, so every block of their capture is a titled thread, while a
 * text channel carries its own untitled block first. `isForum` collapses the two
 * post-shaped types because the fetcher treats them the same way, but the record
 * keeps them apart, since calling a media channel a forum would be wrong. What
 * this buys is that a reader, and the thread check, can tell a forum's posts from
 * a text channel's side discussions without inferring it from the block shapes.
 */
export type CaptureChannelKind = "text" | "forum" | "media";

export function channelKind(type: number | undefined): CaptureChannelKind {
  if (type === CHANNEL_MEDIA) return "media";
  return isForum(type) ? "forum" : "text";
}

export interface ChannelMeta {
  id: string;
  name?: string | null;
  type?: number;
  guild_id?: string | null;
}

export async function fetchChannelMeta(channelId: string, token: string): Promise<ChannelMeta> {
  const meta = await apiGet<ChannelMeta>(`/channels/${channelId}`, token);
  if (!meta || typeof meta.id !== "string") {
    throw new DiscordError(`cannot read channel ${channelId}`, 0);
  }
  return meta;
}

export interface DiscordThread {
  id: string;
  name?: string | null;
  parent_id?: string | null;
  message_count?: number;
  thread_metadata?: { archived?: boolean; archive_timestamp?: string | null };
}

/**
 * A guild's currently active threads, which Discord returns in one unpaginated
 * response. Filtered to one parent by the caller, because the endpoint answers
 * for the whole guild.
 */
export async function fetchActiveThreads(
  guildId: string,
  token: string,
  sleep = sleepMs,
): Promise<DiscordThread[]> {
  const res = await apiGet<{ threads?: DiscordThread[] }>(
    `/guilds/${guildId}/threads/active`,
    token,
    6,
    sleep,
  );
  return Array.isArray(res?.threads) ? res.threads : [];
}

/**
 * A channel's archived public threads.
 *
 * This endpoint pages backwards on a timestamp rather than a snowflake, so the
 * cursor for the next page is one second past the oldest `archive_timestamp` on
 * this one. A channel the bot cannot read threads in answers 403 or 404 instead
 * of an empty list, which is a setup fact and not a capture failure, so it ends
 * the walk.
 */
/**
 * One second past an ISO timestamp.
 *
 * `before` is exclusive, so a cursor parked exactly on the oldest timestamp on a
 * page would skip every thread sharing that second. Stepping one second past it
 * re-reads those ties instead; the caller's `seen` set absorbs the repeat.
 */
function shiftSecond(iso: string): string | null {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return new Date(ms + 1000).toISOString();
}

export async function fetchArchivedThreads(
  channelId: string,
  token: string,
  sleep = sleepMs,
): Promise<DiscordThread[]> {
  const out: DiscordThread[] = [];
  const seen = new Set<string>();
  let before: string | null = null;
  for (let page = 0; page < 50; page++) {
    const query = `?limit=100${before ? `&before=${encodeURIComponent(before)}` : ""}`;
    let res: { threads?: DiscordThread[]; has_more?: boolean };
    try {
      res = await apiGet<{ threads?: DiscordThread[]; has_more?: boolean }>(
        `/channels/${channelId}/threads/archived/public${query}`,
        token,
        6,
        sleep,
      );
    } catch (error) {
      if (error instanceof DiscordError && (error.status === 403 || error.status === 404)) break;
      throw error;
    }
    const threads = Array.isArray(res?.threads) ? res.threads : [];
    let added = 0;
    for (const thread of threads) {
      if (seen.has(thread.id)) continue;
      seen.add(thread.id);
      out.push(thread);
      added++;
    }
    if (!res?.has_more || threads.length === 0) break;
    const oldest = threads
      .map((t) => t.thread_metadata?.archive_timestamp)
      .filter((ts): ts is string => typeof ts === "string")
      .sort()[0];
    const next = oldest ? shiftSecond(oldest) : null;
    // A page that is entirely ties cannot be cleared: every thread on it is
    // already held and stepping again would not move the cursor. Stopping is
    // better than looping, and 100 threads sharing one archive second is the
    // only way to reach it.
    if (!next || added === 0) break;
    before = next;
    await sleep(250);
  }
  return out;
}

/**
 * Every thread belonging to one venue, oldest first.
 *
 * A text channel's top-level history never returns its threads, so a side
 * discussion is invisible to `fetchMessages` alone; for a forum, the threads are
 * the entire content. Active and archived are unioned because Discord splits
 * them across two endpoints, and an archived thread that sees new activity comes
 * back to the active list.
 */
export async function fetchVenueThreads(
  channel: ChannelMeta,
  token: string,
  sleep = sleepMs,
): Promise<DiscordThread[]> {
  const active = channel.guild_id
    ? (await fetchActiveThreads(channel.guild_id, token, sleep)).filter(
      (thread) => thread.parent_id === channel.id,
    )
    : [];
  const archived = await fetchArchivedThreads(channel.id, token, sleep);
  const byId = new Map<string, DiscordThread>();
  // Archived first so the active copy wins when a thread is in both lists.
  for (const thread of [...archived, ...active]) byId.set(thread.id, thread);
  return [...byId.values()].sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
}

/** A thread's heading in a capture: its name, plus the id that names it. */
export function threadTitle(thread: DiscordThread): string {
  const name = (thread.name ?? "").trim();
  return `${name || "(untitled thread)"} (thread ${thread.id})`;
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
