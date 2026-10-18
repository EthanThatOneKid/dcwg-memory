#!/usr/bin/env -S deno run -A
/**
 * Build the read-only invite URL for the DCWG capture bot.
 *
 * The connector owns its own Discord application, so this only needs that
 * application's client id. The URL requests View Channel and Read Message History
 * and nothing else: a bot that cannot post cannot write into the record it is
 * archiving.
 *
 * Usage:
 *   deno task invite -- 123456789012345678
 *   deno task invite -- 123456789012345678 --guild-id 1558888938251223050
 *   deno task invite -- 123456789012345678 --guild-id 1558888938251223050 --any-guild
 *
 * Notes on the parameters, all of which matter for a one-shot handoff:
 *   permissions        66560 = View Channel (1 << 10) | Read Message History (1 << 16)
 *   scope              bot only; the archive registers no slash commands
 *   integration_type   0 forces a GUILD install. A freshly created application
 *                      defaults to USER_INSTALL, which adds the bot to the
 *                      authorizer's account instead of the server.
 *   guild_id           preselects the server, so whoever holds Manage Server does
 *                      not have to pick one from a dropdown
 *   disable_guild_select
 *                      locks the dropdown to that server, so the invite cannot be
 *                      accepted somewhere else by accident
 *
 * The application's "Public Bot" setting must stay enabled, or only the app owner
 * can complete this invite. A server owner who is not the app owner cannot.
 */

const VIEW_CHANNEL = 1 << 10;
const READ_MESSAGE_HISTORY = 1 << 16;

/** The whole grant: read the channel list and the history of what the bot sees. */
export const PERMISSIONS = VIEW_CHANNEL | READ_MESSAGE_HISTORY;

const GUILD_INSTALL = 0;

export const DEFAULT_GUILD = "1558888938251223050";

export const READ_ONLY_BITS: Record<string, number> = {
  "View Channel": VIEW_CHANNEL,
  "Read Message History": READ_MESSAGE_HISTORY,
};

/**
 * Any of these on the invite would make the archive able to change the record
 * instead of only reading it.
 */
export const FORBIDDEN: Record<string, number> = {
  "Administrator": 1 << 3,
  "Manage Server": 1 << 5,
  "Manage Messages": 1 << 13,
  "Send Messages": 1 << 11,
  "Manage Channels": 1 << 4,
  "Manage Roles": 1 << 28,
  "Kick Members": 1 << 1,
  "Ban Members": 1 << 2,
  "Mention Everyone": 1 << 17,
  "Create Instant Invite": 1 << 0,
};

export function inviteUrl(clientId: string, guildId: string | null, lockGuild = true): string {
  const params = new URLSearchParams();
  params.set("client_id", clientId);
  params.set("permissions", String(PERMISSIONS));
  params.set("scope", "bot");
  params.set("integration_type", String(GUILD_INSTALL));
  if (guildId) {
    params.set("guild_id", guildId);
    if (lockGuild) params.set("disable_guild_select", "true");
  }
  return `https://discord.com/oauth2/authorize?${params}`;
}

/** Check the grant against the read-only set before printing a URL from it. */
export function selfCheck(): string[] {
  const problems: string[] = [];
  if (PERMISSIONS !== 66560) {
    problems.push(`permissions integer is ${PERMISSIONS}, expected 66560`);
  }
  for (const [name, bit] of Object.entries(FORBIDDEN)) {
    if (PERMISSIONS & bit) problems.push(`${name} is set on the invite but must not be`);
  }
  const granted = Object.values(READ_ONLY_BITS).reduce((sum, bit) => sum + bit, 0);
  if (granted !== PERMISSIONS) {
    problems.push("the invite grants bits that are not in the read-only set");
  }
  return problems;
}

const USAGE = `Usage: deno task invite -- <client-id> [--guild-id <id>] [--any-guild]

  <client-id>     the DCWG Archive application's client id (digits only)
  --guild-id <id> server to preselect (default ${DEFAULT_GUILD})
  --any-guild     leave the server selectable instead of locked
  -h, --help      show this help`;

export function main(argv: string[] = Deno.args): number {
  let clientId: string | null = null;
  let guildId: string | null = DEFAULT_GUILD;
  let anyGuild = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      console.log(USAGE);
      return 0;
    }
    if (arg === "--any-guild") {
      anyGuild = true;
      continue;
    }
    if (arg === "--guild-id") {
      const value = argv[++i];
      if (!value) {
        console.error("error: --guild-id needs a value");
        return 2;
      }
      guildId = value;
      continue;
    }
    if (arg.startsWith("--guild-id=")) {
      guildId = arg.slice("--guild-id=".length);
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`error: unknown option ${arg}\n\n${USAGE}`);
      return 2;
    }
    if (clientId !== null) {
      console.error(`error: unexpected extra argument ${arg}`);
      return 2;
    }
    clientId = arg;
  }

  const problems = selfCheck();
  if (problems.length) {
    console.error("self-check FAILED:");
    for (const problem of problems) console.error(`  - ${problem}`);
    return 1;
  }

  if (!clientId) {
    console.error(`error: a client id is required\n\n${USAGE}`);
    return 2;
  }
  if (!/^\d+$/.test(clientId)) {
    console.error(`error: ${JSON.stringify(clientId)} is not a client id (expects digits only)`);
    return 2;
  }

  const url = inviteUrl(clientId, guildId, !anyGuild);
  const granted = Object.entries(READ_ONLY_BITS).map(([name, bit]) => `${name} (${bit})`).join(
    " | ",
  );
  console.log(url);
  console.log();
  console.log(`permissions  ${PERMISSIONS} = ${granted}`);
  console.log(`scope        bot        integration_type  ${GUILD_INSTALL} (GUILD_INSTALL)`);
  if (guildId) {
    console.log(`guild_id     ${guildId} (${anyGuild ? "selectable" : "locked to this server"})`);
  }
  console.log();
  console.log("Grants: read the channel list and message history of channels this bot can see.");
  console.log("Does not grant: Send Messages, Manage Messages, or anything else.");
  console.log("Requires: Manage Server on the target server, and the app's Public Bot");
  console.log("setting left enabled so someone other than the app owner can accept it.");
  return 0;
}

if (import.meta.main) Deno.exit(main());
