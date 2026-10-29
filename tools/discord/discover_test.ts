/**
 * Channel discovery. The property that matters is one-sided: a channel that is not
 * public must never be listed, because the archive is published. Every case that could
 * leak one is pinned here, and the cases that merely lose a channel are pinned too.
 */
import { assertEquals } from "@std/assert";
import {
  ADMINISTRATOR,
  canRead,
  discoverVenues,
  type GuildChannel,
  type GuildRole,
  parseIds,
  parseVenues,
  permissionsFor,
  READ_MESSAGE_HISTORY,
  slugify,
  venueName,
  VIEW_CHANNEL,
} from "./discover.ts";

const GUILD = "100";
const BOT = "900";
const MODS = "500";
const READ = VIEW_CHANNEL | READ_MESSAGE_HISTORY;

const everyoneRole = (permissions: bigint): GuildRole => ({ id: GUILD, permissions: String(permissions) });
const modsRole: GuildRole = { id: MODS, permissions: "0" };

function channel(id: string, name: string, extra: Partial<GuildChannel> = {}): GuildChannel {
  return { id, name, type: 0, ...extra };
}

const deny = (id: string, bits: bigint, type = 0) => ({ id, type, allow: "0", deny: String(bits) });
const allow = (id: string, bits: bigint, type = 0) => ({ id, type, allow: String(bits), deny: "0" });

function discover(
  channels: GuildChannel[],
  roles: GuildRole[],
  opts: Partial<Parameters<typeof discoverVenues>[0]> = {},
) {
  return discoverVenues({
    guildId: GUILD,
    channels,
    roles,
    bot: { memberId: BOT, roleIds: [] },
    pinned: [],
    ...opts,
  });
}

Deno.test("a channel @everyone can read is discovered", () => {
  const found = discover([channel("1", "General")], [everyoneRole(READ)]);
  assertEquals(found.venues, [{ venue: "dcwg-general", channel: "1" }]);
});

Deno.test("a channel whose @everyone overwrite denies viewing is not discovered", () => {
  const found = discover(
    [channel("1", "staff", { permission_overwrites: [deny(GUILD, VIEW_CHANNEL)] })],
    [everyoneRole(READ)],
  );
  assertEquals(found.venues, []);
  assertEquals(found.skipped[0].reason.startsWith("not public"), true);
});

Deno.test("a channel that is visible but has no readable history is not discovered", () => {
  const found = discover([channel("1", "announce")], [everyoneRole(VIEW_CHANNEL)]);
  assertEquals(found.venues, []);
});

Deno.test("a channel is public when its own overwrite allows what the base role lacks", () => {
  const found = discover(
    [channel("1", "open", { permission_overwrites: [allow(GUILD, READ)] })],
    [everyoneRole(0n)],
  );
  assertEquals(found.venues.map((v) => v.channel), ["1"]);
});

Deno.test("a role overwrite that grants access does not make a channel public", () => {
  // Only members holding the role can see it; @everyone still cannot.
  const found = discover(
    [channel("1", "mods", { permission_overwrites: [deny(GUILD, VIEW_CHANNEL), allow(MODS, VIEW_CHANNEL)] })],
    [everyoneRole(READ), modsRole],
    { bot: { memberId: BOT, roleIds: [MODS] } },
  );
  assertEquals(found.venues, []);
});

Deno.test("a member overwrite for someone else does not make a channel public", () => {
  const found = discover(
    [channel("1", "dm-like", { permission_overwrites: [deny(GUILD, VIEW_CHANNEL), allow("777", READ, 1)] })],
    [everyoneRole(READ)],
  );
  assertEquals(found.venues, []);
});

Deno.test("administrator on @everyone is public even past a deny overwrite", () => {
  // Discord grants every permission to an administrator, so this is genuinely public.
  assertEquals(
    canRead(permissionsFor(
      GUILD,
      [everyoneRole(ADMINISTRATOR)],
      channel("1", "x", {
        permission_overwrites: [deny(GUILD, VIEW_CHANNEL)],
      }),
      { roleIds: [] },
    )),
    true,
  );
});

Deno.test("a public channel the bot cannot read is skipped, not listed", () => {
  const hiddenFromBot = channel("1", "public-but-botless", {
    permission_overwrites: [deny(BOT, VIEW_CHANNEL, 1)],
  });
  const found = discover([hiddenFromBot], [everyoneRole(READ)]);
  assertEquals(found.venues, []);
  assertEquals(found.skipped[0].reason.startsWith("the bot cannot"), true);
});

Deno.test("age-restricted channels are never discovered", () => {
  const found = discover([channel("1", "nsfw", { nsfw: true })], [everyoneRole(READ)]);
  assertEquals(found.venues, []);
  assertEquals(found.skipped[0].reason, "age-restricted");
});

Deno.test("only channel types with message history are discovered", () => {
  const found = discover(
    [
      channel("1", "text"),
      channel("2", "voice", { type: 2 }),
      channel("3", "category", { type: 4 }),
      channel("4", "news", { type: 5 }),
      channel("5", "forum", { type: 15 }),
      channel("6", "media", { type: 16 }),
      channel("7", "stage", { type: 13 }),
    ],
    [everyoneRole(READ)],
  );
  assertEquals(found.venues.map((v) => v.channel), ["1", "4", "5", "6"]);
});

Deno.test("pinned venues keep their names, come first, and are not rediscovered", () => {
  const found = discover(
    [channel("1", "Brainstorm"), channel("2", "propose"), channel("3", "talk")],
    [everyoneRole(READ)],
    { pinned: [{ venue: "dcwg-brainstorm", channel: "1" }, { venue: "dcwg-propose", channel: "2" }] },
  );
  assertEquals(found.venues, [
    { venue: "dcwg-brainstorm", channel: "1" },
    { venue: "dcwg-propose", channel: "2" },
    { venue: "dcwg-talk", channel: "3" },
  ]);
});

Deno.test("a pinned venue is kept even when the channel would not be discovered", () => {
  const found = discover(
    [channel("1", "private", { permission_overwrites: [deny(GUILD, VIEW_CHANNEL)] })],
    [everyoneRole(READ)],
    { pinned: [{ venue: "dcwg-private", channel: "1" }] },
  );
  assertEquals(found.venues, [{ venue: "dcwg-private", channel: "1" }]);
});

Deno.test("an excluded channel is skipped", () => {
  const found = discover([channel("1", "general"), channel("2", "other")], [everyoneRole(READ)], {
    exclude: new Set(["1"]),
  });
  assertEquals(found.venues.map((v) => v.channel), ["2"]);
});

Deno.test("two channels with the same name get different venue names", () => {
  const found = discover([channel("111111", "chat"), channel("222222", "Chat!")], [everyoneRole(READ)]);
  assertEquals(found.venues.map((v) => v.venue), ["dcwg-chat", "dcwg-chat-222222"]);
});

Deno.test("a name with nothing usable in it falls back to the channel id", () => {
  assertEquals(slugify("💡"), "");
  assertEquals(venueName("💡", "123", new Set()), "dcwg-123");
  assertEquals(venueName("💡-ideas", "123", new Set()), "dcwg-ideas");
});

Deno.test("venues and ids parse from the formats the workflow passes", () => {
  assertEquals(parseVenues("a=1\n\n  b = 2  \n"), [{ venue: "a", channel: "1" }, { venue: "b", channel: "2" }]);
  assertEquals([...parseIds("1, 2\n3 x")], ["1", "2", "3"]);
  assertEquals([...parseIds(undefined)], []);
});
