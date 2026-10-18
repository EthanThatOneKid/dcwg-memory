/**
 * The invite URL is the one grant that decides what the archive can do, and it is
 * built by hand rather than fetched, so a wrong bit would go unnoticed until the
 * bot could write into the record it exists to read. These tests pin the integer,
 * the URL shape, and the absence of every write bit.
 */

import { assert, assertEquals } from "@std/assert";
import {
  DEFAULT_GUILD,
  FORBIDDEN,
  inviteUrl,
  main,
  PERMISSIONS,
  READ_ONLY_BITS,
  selfCheck,
} from "./invite.ts";

Deno.test("the invite grants read access and nothing else", () => {
  assertEquals(PERMISSIONS, 66560);
  assertEquals(
    READ_ONLY_BITS["View Channel"] | READ_ONLY_BITS["Read Message History"],
    PERMISSIONS,
  );
  assertEquals(selfCheck(), []);
});

Deno.test("every write capability is absent from the grant", () => {
  for (const [name, bit] of Object.entries(FORBIDDEN)) {
    assertEquals(PERMISSIONS & bit, 0, `${name} must not be granted`);
  }
  // The list is only useful if it covers the bits that would matter most.
  for (const name of ["Administrator", "Manage Server", "Send Messages", "Manage Messages"]) {
    assert(name in FORBIDDEN, `${name} must be listed as forbidden`);
  }
});

Deno.test("the URL preselects and locks the guild by default", () => {
  const url = new URL(inviteUrl("1559632041484484709", DEFAULT_GUILD));
  assertEquals(url.origin + url.pathname, "https://discord.com/oauth2/authorize");
  assertEquals(url.searchParams.get("client_id"), "1559632041484484709");
  assertEquals(url.searchParams.get("permissions"), "66560");
  assertEquals(url.searchParams.get("scope"), "bot");
  assertEquals(
    url.searchParams.get("integration_type"),
    "0",
    "a guild install, not a user install",
  );
  assertEquals(url.searchParams.get("guild_id"), DEFAULT_GUILD);
  assertEquals(url.searchParams.get("disable_guild_select"), "true");
});

Deno.test("--any-guild leaves the server selectable", () => {
  const url = new URL(inviteUrl("1", DEFAULT_GUILD, false));
  assertEquals(url.searchParams.get("guild_id"), DEFAULT_GUILD);
  assertEquals(url.searchParams.get("disable_guild_select"), null);
});

Deno.test("no guild id means no guild parameters at all", () => {
  const url = new URL(inviteUrl("1", null));
  assertEquals(url.searchParams.get("guild_id"), null);
  assertEquals(url.searchParams.get("disable_guild_select"), null);
});

Deno.test("the CLI refuses a non-numeric client id", () => {
  assertEquals(main(["not-an-id"]), 2);
  assertEquals(main([]), 2);
});

Deno.test("the CLI succeeds on a client id", () => {
  assertEquals(main(["1559632041484484709", "--any-guild"]), 0);
});
