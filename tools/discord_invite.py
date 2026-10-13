#!/usr/bin/env python3
"""Build the read-only invite URL for the DCWG capture bot.

The connector owns its own Discord application, so this only needs that
application's client id. The URL requests View Channel and Read Message History
and nothing else: a bot that cannot post cannot write into the record it is
archiving.

Usage:
  discord_invite.py 123456789012345678
  discord_invite.py 123456789012345678 --guild-id 1558888938251223050
  discord_invite.py 123456789012345678 --guild-id 1558888938251223050 --open

Notes on the parameters, all of which matter for a one-shot handoff:
  permissions        66560 = View Channel (1 << 10) | Read Message History (1 << 16)
  scope              bot only; the archive registers no slash commands
  integration_type   0 forces a GUILD install. A freshly created application
                     defaults to USER_INSTALL, which adds the bot to the
                     authorizer's account instead of the server.
  guild_id           preselects the server, so whoever holds Manage Server does
                     not have to pick one from a dropdown
  disable_guild_select
                     locks the dropdown to that server, so the invite cannot be
                     accepted somewhere else by accident

The application's "Public Bot" setting must stay enabled, or only the app owner
can complete this invite. A server owner who is not the app owner cannot.
"""

from __future__ import annotations

import argparse
import sys
import webbrowser
from urllib.parse import urlencode

VIEW_CHANNEL = 1 << 10
READ_MESSAGE_HISTORY = 1 << 16
PERMISSIONS = VIEW_CHANNEL | READ_MESSAGE_HISTORY

GUILD_INSTALL = 0
USER_INSTALL = 1

DEFAULT_GUILD = "1558888938251223050"

READ_ONLY_BITS = {"View Channel": VIEW_CHANNEL, "Read Message History": READ_MESSAGE_HISTORY}

# Any of these on the invite would make the archive able to change the record
# instead of only reading it.
FORBIDDEN = {
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
}


def invite_url(client_id: str, guild_id: str | None, lock_guild: bool = True) -> str:
    params = [
        ("client_id", client_id),
        ("permissions", str(PERMISSIONS)),
        ("scope", "bot"),
        ("integration_type", str(GUILD_INSTALL)),
    ]
    if guild_id:
        params.append(("guild_id", guild_id))
        if lock_guild:
            params.append(("disable_guild_select", "true"))
    return "https://discord.com/oauth2/authorize?" + urlencode(params)


def self_check() -> list[str]:
    problems = []
    if PERMISSIONS != 66560:
        problems.append(f"permissions integer is {PERMISSIONS}, expected 66560")
    for name, bit in FORBIDDEN.items():
        if PERMISSIONS & bit:
            problems.append(f"{name} is set on the invite but must not be")
    granted = sum(READ_ONLY_BITS.values())
    if granted != PERMISSIONS:
        problems.append("the invite grants bits that are not in the read-only set")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("client_id", help="the DCWG Archive application's client id")
    ap.add_argument("--guild-id", default=DEFAULT_GUILD, help=f"server to preselect (default {DEFAULT_GUILD})")
    ap.add_argument("--any-guild", action="store_true", help="leave the server selectable instead of locked")
    ap.add_argument("--open", action="store_true", help="open the URL in the default browser")
    args = ap.parse_args()

    problems = self_check()
    if problems:
        print("self-check FAILED:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        return 1

    if not args.client_id.isdigit():
        print(f"error: {args.client_id!r} is not a client id (expects digits only)", file=sys.stderr)
        return 2

    url = invite_url(args.client_id, args.guild_id, lock_guild=not args.any_guild)
    granted = " | ".join(f"{n} ({b})" for n, b in READ_ONLY_BITS.items())
    print(url)
    print()
    print(f"permissions  {PERMISSIONS} = {granted}")
    print(f"scope        bot        integration_type  {GUILD_INSTALL} (GUILD_INSTALL)")
    if args.guild_id:
        locked = "selectable" if args.any_guild else "locked to this server"
        print(f"guild_id     {args.guild_id} ({locked})")
    print()
    print("Grants: read the channel list and message history of channels this bot can see.")
    print("Does not grant: Send Messages, Manage Messages, or anything else.")
    print("Requires: Manage Server on the target server, and the app's Public Bot")
    print("setting left enabled so someone other than the app owner can accept it.")
    if args.open:
        webbrowser.open(url)
    return 0


if __name__ == "__main__":
    sys.exit(main())
