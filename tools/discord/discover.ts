/**
 * Which channels the archive records.
 *
 * The record is only as complete as the list of channels it reads, and a channel nobody
 * listed is not archived at all. This asks the server instead of keeping a hand-written
 * list: every channel that is public and that the bot can read.
 *
 * "Public" is decided conservatively because this repository and its Pages site are
 * public, so a private channel that the bot happens to see would be published the moment
 * it was captured. A channel counts only when the `@everyone` role can view it and read
 * its history, computed from the role permissions and the channel's own overwrites with
 * Discord's algorithm. A channel the bot cannot read is left out too, since it would fail
 * the job every day without recording anything.
 *
 * Public is not consent, so by default a public channel is archived only if it also opts in: its
 * description must say "This channel is indexed by AI." (see `INDEX_ANNOTATION`). A caller can
 * turn that requirement off with `--require-annotation false` once the server's moderators have
 * agreed to archive every public channel.
 *
 * Channels the workflow already names are pinned: they keep their venue names, which are
 * the filenames of existing captures, and they are kept whatever discovery decides. Their
 * annotation status is logged, not enforced.
 *
 * Usage:
 *   DCWG_DISCORD_BOT_TOKEN=... deno run -A discover.ts --pinned-env VENUES
 *
 * Prints one `venue=channel` line per venue on stdout, pinned venues first, and the
 * channels it left out, with the reason, on stderr. If the server cannot be read it
 * prints the pinned venues alone and exits 1, so a caller that ignores the exit code
 * still archives what it archived before.
 */
import { apiGet, CHANNEL_FORUM, CHANNEL_MEDIA, CHANNEL_TEXT } from "./discord.ts";
import { DEFAULT_GUILD } from "./invite.ts";

export const CHANNEL_ANNOUNCEMENT = 5;

/** The channel types whose history this connector can capture. */
export const CAPTURABLE_TYPES: ReadonlySet<number> = new Set([
  CHANNEL_TEXT,
  CHANNEL_ANNOUNCEMENT,
  CHANNEL_FORUM,
  CHANNEL_MEDIA,
]);

export const ADMINISTRATOR = 1n << 3n;
export const VIEW_CHANNEL = 1n << 10n;
export const READ_MESSAGE_HISTORY = 1n << 16n;
const ALL_PERMISSIONS = (1n << 64n) - 1n;

export interface PermissionOverwrite {
  id: string;
  /** 0 for a role, 1 for a member. */
  type: number;
  allow: string;
  deny: string;
}

export interface GuildChannel {
  id: string;
  name?: string | null;
  type: number;
  position?: number;
  nsfw?: boolean;
  /** The channel's description. Read to see whether the channel opts in to indexing; never logged. */
  topic?: string | null;
  permission_overwrites?: PermissionOverwrite[];
}

/**
 * The phrase a channel's description carries to opt in to being archived.
 *
 * `andy` proposed on 2026-10-16 that the memory bot watch channels whose description includes
 * "This channel is indexed by AI." and that it "should never index channels not explicitly
 * annotated as being indexed"; `daniellacosse` agreed and suggested an opt-out. On 2026-10-28 the
 * server was told the archive covered only two channels. Public is not consent, so a discovered
 * channel is archived only when it says so.
 */
export const INDEX_ANNOTATION = /this channel is indexed by ai/i;

/** Whether a channel description opts in to being indexed. */
export function isIndexed(topic: string | null | undefined): boolean {
  return INDEX_ANNOTATION.test(topic ?? "");
}

export interface GuildRole {
  id: string;
  permissions: string;
}

/** Who is asking: a member's id and roles, or nobody in particular for `@everyone`. */
export interface Viewer {
  memberId?: string;
  roleIds: readonly string[];
}

export interface Venue {
  venue: string;
  channel: string;
}

export interface Skipped {
  channel: string;
  name: string;
  reason: string;
}

/**
 * What a viewer may do in a channel, by Discord's permission algorithm: the `@everyone`
 * role plus the viewer's roles, then the channel's `@everyone` overwrite, then the
 * overwrites for the viewer's roles, then the overwrite for the viewer themself.
 * Administrator bypasses every overwrite.
 */
export function permissionsFor(
  guildId: string,
  roles: readonly GuildRole[],
  channel: GuildChannel,
  viewer: Viewer,
): bigint {
  const byId = new Map(roles.map((role) => [role.id, BigInt(role.permissions)]));
  let perms = byId.get(guildId) ?? 0n;
  for (const roleId of viewer.roleIds) perms |= byId.get(roleId) ?? 0n;
  if (perms & ADMINISTRATOR) return ALL_PERMISSIONS;

  const overwrites = channel.permission_overwrites ?? [];
  const everyone = overwrites.find((ow) => ow.type === 0 && ow.id === guildId);
  if (everyone) perms = (perms & ~BigInt(everyone.deny)) | BigInt(everyone.allow);

  let deny = 0n;
  let allow = 0n;
  for (const ow of overwrites) {
    if (ow.type !== 0 || ow.id === guildId || !viewer.roleIds.includes(ow.id)) continue;
    deny |= BigInt(ow.deny);
    allow |= BigInt(ow.allow);
  }
  perms = (perms & ~deny) | allow;

  if (viewer.memberId) {
    const own = overwrites.find((ow) => ow.type === 1 && ow.id === viewer.memberId);
    if (own) perms = (perms & ~BigInt(own.deny)) | BigInt(own.allow);
  }
  return perms;
}

/** Whether the viewer can open the channel and read what was said in it. */
export function canRead(perms: bigint): boolean {
  return (perms & VIEW_CHANNEL) !== 0n && (perms & READ_MESSAGE_HISTORY) !== 0n;
}

/** A channel's name as a venue slug: lowercase ASCII words joined by hyphens. */
export function slugify(name: string | null | undefined): string {
  return (name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** A venue name no other venue has, falling back to the channel id when the name is no help. */
export function venueName(name: string | null | undefined, channelId: string, taken: ReadonlySet<string>): string {
  const slug = slugify(name);
  const base = `dcwg-${slug || channelId}`;
  return taken.has(base) ? `${base}-${channelId.slice(-6)}` : base;
}

export interface DiscoverInput {
  guildId: string;
  channels: readonly GuildChannel[];
  roles: readonly GuildRole[];
  bot: Viewer;
  pinned: readonly Venue[];
  exclude?: ReadonlySet<string>;
  /**
   * Whether a channel must carry the opt-in annotation. Defaults to true: widening the archive to
   * every public channel is a deliberate choice, made with a repository variable, not a default.
   */
  requireAnnotation?: boolean;
}

export interface Discovery {
  venues: Venue[];
  skipped: Skipped[];
}

/** Pinned venues, then every public channel the bot can read, in server order. */
export function discoverVenues(input: DiscoverInput): Discovery {
  const exclude = input.exclude ?? new Set<string>();
  const requireAnnotation = input.requireAnnotation ?? true;
  const venues: Venue[] = [...input.pinned];
  const taken = new Set(venues.map((v) => v.venue));
  const pinnedChannels = new Set(venues.map((v) => v.channel));
  const skipped: Skipped[] = [];

  const ordered = [...input.channels].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || (BigInt(a.id) < BigInt(b.id) ? -1 : 1),
  );
  for (const channel of ordered) {
    if (pinnedChannels.has(channel.id)) continue;
    const name = channel.name ?? channel.id;
    const skip = (reason: string) => skipped.push({ channel: channel.id, name, reason });

    if (!CAPTURABLE_TYPES.has(channel.type)) {
      skip(`type ${channel.type} has no message history to capture`);
    } else if (exclude.has(channel.id)) {
      skip("excluded by DCWG_EXCLUDE_CHANNELS");
    } else if (channel.nsfw) {
      skip("age-restricted");
    } else if (!canRead(permissionsFor(input.guildId, input.roles, channel, { roleIds: [] }))) {
      skip("not public: @everyone cannot view it and read its history");
    } else if (!canRead(permissionsFor(input.guildId, input.roles, channel, input.bot))) {
      skip("the bot cannot view it and read its history");
    } else if (requireAnnotation && !isIndexed(channel.topic)) {
      skip("not annotated as indexed");
    } else {
      const venue = venueName(channel.name, channel.id, taken);
      taken.add(venue);
      venues.push({ venue, channel: channel.id });
    }
  }
  return { venues, skipped };
}

export interface PinnedStatus {
  venue: string;
  channel: string;
  /** Whether the channel's description opts in; undefined when the server does not list the channel. */
  indexed: boolean | undefined;
}

/**
 * Whether each pinned venue's channel carries the opt-in annotation.
 *
 * Pinned venues are archived whatever discovery decides, because someone named them, so this
 * only reports: a pinned channel that is not annotated is for a person to look at.
 */
export function pinnedStatus(channels: readonly GuildChannel[], pinned: readonly Venue[]): PinnedStatus[] {
  const byId = new Map(channels.map((c) => [c.id, c]));
  return pinned.map((v) => {
    const channel = byId.get(v.channel);
    return { ...v, indexed: channel ? isIndexed(channel.topic) : undefined };
  });
}

/** Parse `venue=channel` lines, ignoring blanks. */
export function parseVenues(text: string): Venue[] {
  const venues: Venue[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) throw new Error(`not a venue=channel line: ${trimmed}`);
    venues.push({ venue: trimmed.slice(0, eq).trim(), channel: trimmed.slice(eq + 1).trim() });
  }
  return venues;
}

/** Channel ids separated by commas or whitespace. */
export function parseIds(text: string | undefined): Set<string> {
  return new Set((text ?? "").split(/[\s,]+/).filter((id) => /^\d+$/.test(id)));
}

export function formatVenues(venues: readonly Venue[]): string {
  return venues.map((v) => `${v.venue}=${v.channel}`).join("\n");
}

/**
 * The log lines for the channels discovery left out.
 *
 * This runs in a public repository's Actions log, so a skipped channel is named by id
 * only. The channels it skips are mostly the ones that are not public, and a private
 * channel's name is itself something the server did not publish. Channels with no message
 * history (voice, category, stage) are one count, since nothing about them needs a line.
 */
export function formatSkipped(skipped: readonly Skipped[]): string[] {
  const lines: string[] = [];
  const noHistory = skipped.filter((s) => s.reason.startsWith("type "));
  for (const s of skipped) {
    if (!s.reason.startsWith("type ")) lines.push(`skipped ${s.channel}: ${s.reason}`);
  }
  if (noHistory.length) lines.push(`skipped ${noHistory.length} channel(s) that hold no message history`);
  return lines;
}

async function main(argv: string[]): Promise<number> {
  const opts = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      console.error(`unexpected argument: ${arg}`);
      return 2;
    }
    opts.set(arg.slice(2), argv[++i] ?? "");
  }
  const pinnedEnv = opts.get("pinned-env");
  const pinned = parseVenues((pinnedEnv ? Deno.env.get(pinnedEnv) : opts.get("pinned")) ?? "");
  const guildId = opts.get("guild") || DEFAULT_GUILD;
  const exclude = parseIds(opts.get("exclude"));
  // Only an explicit "false" widens the archive past the annotation; anything else keeps the rule.
  const requireAnnotation = opts.get("require-annotation") !== "false";

  try {
    const token = Deno.env.get(opts.get("token-env") || "DCWG_DISCORD_BOT_TOKEN");
    if (!token) throw new Error("no bot token in the environment");
    const me = await apiGet<{ id: string }>("/users/@me", token);
    const [channels, roles, member] = await Promise.all([
      apiGet<GuildChannel[]>(`/guilds/${guildId}/channels`, token),
      apiGet<GuildRole[]>(`/guilds/${guildId}/roles`, token),
      apiGet<{ roles: string[] }>(`/guilds/${guildId}/members/${me.id}`, token),
    ]);
    const { venues, skipped } = discoverVenues({
      guildId,
      channels,
      roles,
      bot: { memberId: me.id, roleIds: member.roles },
      pinned,
      exclude,
      requireAnnotation,
    });
    for (const p of pinnedStatus(channels, pinned)) {
      const state = p.indexed === undefined
        ? "not listed by the server"
        : p.indexed
        ? "annotated as indexed"
        : "NOT annotated as indexed";
      console.error(`pinned ${p.venue} (${p.channel}): ${state}`);
    }
    for (const line of formatSkipped(skipped)) console.error(line);
    console.error(`${venues.length} venue(s): ${pinned.length} pinned, ${venues.length - pinned.length} discovered`);
    console.log(formatVenues(venues));
    return 0;
  } catch (error) {
    console.error(`discovery failed, keeping the pinned venues only: ${(error as Error).message}`);
    console.log(formatVenues(pinned));
    return 1;
  }
}

if (import.meta.main) Deno.exit(await main(Deno.args));
