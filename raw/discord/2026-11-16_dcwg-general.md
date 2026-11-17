---
title: "Discord #general — 2026-11-16"
source: "Discord REST API, channel 1558888938842624093, UTC timestamps"
channel_type: text
author:
  - "daniellacosse"
  - "CaptainLach"
created: 2026-11-16
description: "Append-only capture of #general from 2026-11-16T22:27:17Z to 2026-11-17T19:06:36Z, pulled from the Discord REST API. 2 messages, 2 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#general` in the Deno Core Working Group Discord, 2026-11-16T22:27:17Z to 2026-11-17T19:06:36Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**daniellacosse** — 2026-11-16T22:27:17Z (`1572015228214976552`)

Quick and dirty adjustments to our organization page: https://github.com/are-we-dodo-yet?view_as=public

Any suggestions?


**CaptainLach** — 2026-11-17T19:06:36Z (`1572327112939933848`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: Ende removed the Node.js timer objects, so it also returns just web timer numbers, which can be successfully used by `De

https://github.com/are-we-dodo-yet/dodo/pull/23

Finally finished with the fix

It is a little bit more than I planned, because nodejs still wants its methods to be called, but I believe the new implementation is more fair with regard to system/non-system timer separation
[embed] fix: handle timer tracking in core by CertainLach · Pull Request #... Why?
Deno used two separate activeTimers map - one for ext/node, and one for ext/web
This caused discrepancy when trying to use timer ids obtained from ext/node timers (Using NodeJS.Timer[Symbol.to...
