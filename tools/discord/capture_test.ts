/**
 * Capture rendering: the append-only record's format.
 *
 * These assert on the properties the record must have — verbatim text, UTC
 * timestamps, snowflake ids, edit stamps, attachments, replies — rather than on
 * whole-file whitespace, so a reflow does not fail the suite but a dropped
 * property does.
 */

import { assert, assertEquals } from "@std/assert";
import {
  authorLabel,
  captureDay,
  contentBlock,
  nextCapturePath,
  participantsOf,
  renderBlocks,
  renderBody,
  renderCapture,
  yamlStr,
} from "./capture.ts";
import {
  CHANNEL_FORUM,
  CHANNEL_MEDIA,
  CHANNEL_TEXT,
  channelKind,
} from "./discord.ts";
import type { DiscordMessage } from "./discord.ts";

function msg(over: Partial<DiscordMessage> & { id: string }): DiscordMessage {
  return {
    content: "",
    timestamp: "2026-08-01T12:00:00.000Z",
    author: { id: "1", username: "u" },
    type: 0,
    ...over,
  };
}

Deno.test("yamlStr survives quotes and backslashes in handles", () => {
  const messy = `Ethan:Print"Ethan";:GoTo Ethan`;
  assertEquals(yamlStr(messy), JSON.stringify(messy));
  assert(yamlStr("back\\slash").includes("\\\\"));
});

Deno.test("authorLabel prefers the display name and marks bots", () => {
  assertEquals(authorLabel(msg({ id: "1", author: { id: "1", username: "u", global_name: "U" } })), "U");
  assertEquals(authorLabel(msg({ id: "1", author: { id: "1", username: "u" } })), "u");
  assertEquals(authorLabel(msg({ id: "1", author: { id: "1", username: "u", bot: true } })), "u [bot]");
  assertEquals(authorLabel(msg({ id: "1", author: { id: "42", username: "" } })), "42");
});

Deno.test("contentBlock records attachments, embeds, and stickers", () => {
  const block = contentBlock(msg({
    id: "1",
    content: "the text",
    attachments: [{ filename: "a.png", url: "https://cdn/a.png" }],
    embeds: [{ title: "T", description: "D" }],
    sticker_items: [{ name: "S1" }, { name: "S2" }],
  }));
  assert(block.startsWith("the text"));
  assert(block.includes("[attachment] a.png (https://cdn/a.png)"));
  assert(block.includes("[embed] T D"));
  assert(block.includes("[sticker] S1, S2"));
});

Deno.test("renderBody: verbatim text, UTC stamps, ids, edit stamps, replies", () => {
  const body = renderBody([
    msg({
      id: "100",
      content: "first  line\nsecond line",
      timestamp: "2026-08-01T19:03:29.000Z",
      author: { id: "1", username: "andy", global_name: "andy" },
    }),
    msg({
      id: "101",
      content: "edited text",
      timestamp: "2026-08-01T19:04:00.000Z",
      edited_timestamp: "2026-08-01T19:05:00.000Z",
      author: { id: "1", username: "andy", global_name: "andy" },
      referenced_message: msg({ id: "99", content: "the original", author: { id: "2", username: "jef" } }),
    }),
  ]);

  assert(body.includes("**andy** — 2026-08-01T19:03:29Z (`100`)"), body);
  // Verbatim: internal newlines and typos survive untouched.
  assert(body.includes("first  line\nsecond line"));
  // A continuation from the same author is stamped inline with its edit time.
  assert(body.includes("_(2026-08-01T19:04:00Z, edited 2026-08-01T19:05:00Z `101`)_"), body);
  assert(body.includes("> ↳ replying to jef: the original"), body);
});

Deno.test("renderBody marks non-text message types instead of inventing content", () => {
  const body = renderBody([msg({ id: "1", type: 7, content: "joined" })]);
  assert(body.includes("\\[system] 7"), body);
  assert(!body.includes("joined"), body);
});

Deno.test("renderBody falls back for a message with no text content", () => {
  const body = renderBody([msg({ id: "1", content: "" })]);
  assert(body.includes("\\[no text content]"), body);
});

Deno.test("renderCapture frontmatter names the venue, span, and participants", () => {
  const messages = [
    msg({ id: "1", content: "a", timestamp: "2026-08-01T01:00:00Z", author: { id: "1", username: "andy" } }),
    msg({ id: "2", content: "b", timestamp: "2026-08-01T02:00:00Z", author: { id: "2", username: "jef" } }),
    msg({ id: "3", content: "c", timestamp: "2026-08-01T03:00:00Z", author: { id: "1", username: "andy" } }),
  ];
  const text = renderCapture({
    messages,
    channelId: "1558888938842624093",
    channelName: "talk",
    channelType: "text",
  });

  assert(text.startsWith("---\n"), text);
  assert(text.includes(`title: "Discord #talk — 2026-08-01"`), text);
  assert(text.includes(`source: "Discord REST API, channel 1558888938842624093, UTC timestamps"`), text);
  assert(text.includes("channel_type: text"), text);
  assert(text.includes("created: 2026-08-01"), text);
  assert(text.includes("  - \"andy\"\n  - \"jef\"\n"), text);
  assert(text.includes("3 messages, 2 participants"), text);
  assert(text.includes("  - \"deno\"\n  - \"dcwg\"\n  - \"discord\"\n"), text);
  // The provenance paragraph states what is and is not in the record.
  assert(text.includes("not pasted from a client"), text);
  assert(text.includes("Bot and webhook"), text);
});

Deno.test("participantsOf and captureDay derive from message order", () => {
  const messages = [
    msg({ id: "1", timestamp: "2026-08-01T23:00:00Z", author: { id: "1", username: "andy" } }),
    msg({ id: "2", timestamp: "2026-08-02T01:00:00Z", author: { id: "2", username: "jef" } }),
  ];
  assertEquals(participantsOf(messages), ["andy", "jef"]);
  // The day is the first message's UTC day, which is what names the file.
  assertEquals(captureDay(messages), "2026-08-01");
});

Deno.test("nextCapturePath never reuses a taken capture", () => {
  assertEquals(nextCapturePath("raw/discord", "2026-08-01", "talk", []), "raw/discord/2026-08-01_talk.md");
  assertEquals(
    nextCapturePath("raw/discord", "2026-08-01", "talk", ["2026-08-01_talk.md"]),
    "raw/discord/2026-08-01_talk-2.md",
  );
  assertEquals(
    nextCapturePath("raw/discord", "2026-08-01", "talk", ["2026-08-01_talk.md", "2026-08-01_talk-2.md"]),
    "raw/discord/2026-08-01_talk-3.md",
  );
  // A different venue on the same day does not collide.
  assertEquals(
    nextCapturePath("raw/discord", "2026-08-01", "general", ["2026-08-01_talk.md"]),
    "raw/discord/2026-08-01_general.md",
  );
});

Deno.test("renderBlocks titles a thread and leaves a channel's own history untitled", () => {
  const top = msg({ id: "10", content: "channel message" });
  const reply = msg({ id: "20", content: "thread reply" });
  const out = renderBlocks([
    { messages: [top] },
    { title: "Rust Academy? (thread 20)", messages: [reply] },
  ]);
  assert(!out.startsWith("##"), "a channel's own history carries no heading");
  assert(out.includes("## Rust Academy? (thread 20)"), "the thread gets one");
  assert(out.includes("channel message") && out.includes("thread reply"));
  assert(
    out.indexOf("channel message") < out.indexOf("thread reply"),
    "blocks keep the order they are given in",
  );
});

Deno.test("a sectioned capture counts every block in its frontmatter and says how it grouped them", () => {
  const sections = [
    { messages: [msg({ id: "10", content: "top", author: { id: "1", username: "andy" } })] },
    {
      title: "Rust Academy? (thread 20)",
      messages: [msg({ id: "20", content: "reply", author: { id: "2", username: "ethan" } })],
    },
  ];
  const text = renderCapture({
    messages: sections.flatMap((s) => s.messages),
    sections,
    channelId: "C",
    channelName: "idea",
    channelType: "text",
  });
  assert(
    text.includes("2 messages, 2 participants, across 1 thread"),
    "the frontmatter counts the whole capture, not one block",
  );
  assert(
    text.includes("Threads are grouped under their own headings"),
    "the prose explains the grouping rather than leaving it implicit",
  );
  assert(text.includes("## Rust Academy? (thread 20)"));
});
Deno.test("a post-shaped venue says so in the frontmatter, and a forum is not called a text channel", () => {
  const messages = [msg({ id: "10", content: "a proposal", author: { id: "1", username: "andy" } })];
  const text = renderCapture({
    messages,
    sections: [{ title: "Rust Academy? (thread 20)", messages }],
    channelId: "F",
    channelName: "propose",
    channelType: "forum",
  });
  assert(text.includes("channel_type: forum"), text);
  // A forum's own channel id is never a resume point, and its blocks are all posts.
  assertEquals(channelKind(CHANNEL_FORUM), "forum");
  assertEquals(channelKind(CHANNEL_MEDIA), "media");
  assertEquals(channelKind(CHANNEL_TEXT), "text");
  assertEquals(channelKind(undefined), "text");
});

Deno.test("a capture with no sections renders exactly as it did before sections existed", () => {
  const messages = [msg({ id: "10", content: "one" }), msg({ id: "11", content: "two" })];
  const bare = { messages, channelId: "C", channelName: "talk", channelType: "text" as const };
  assertEquals(renderCapture(bare), renderCapture({ ...bare, sections: [] }));
  assert(!renderCapture(bare).includes("## "), "no headings without sections");
  assert(!renderCapture(bare).includes("across "), "no thread clause without sections");
});

