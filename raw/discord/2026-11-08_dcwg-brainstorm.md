---
title: "Discord #brainstorm — 2026-11-08"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "CaptainLach"
  - "daniellacosse"
created: 2026-11-08
description: "Append-only capture of #brainstorm from 2026-11-08T20:42:33Z to 2026-11-09T17:02:02Z, pulled from the Discord REST API. 2 messages, 2 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-11-08T20:42:33Z to 2026-11-09T17:02:02Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**CaptainLach** — 2026-11-08T20:42:33Z (`1569089768220794891`)

During fuzzing found out v8_valueserializer does not always output the same values as v8 implementation, breaking v8x roundtrip in some cases, for example

```
const a = [];
a[5] = 1;
delete a[5];
```

Should produce array of 5 holes after roundtrip, but the current denokv vas producing empty array instead, forked denokv to fix that


**daniellacosse** — 2026-11-09T17:02:02Z (`1569396662483423394`)

do you know which cases? should we wrap it and fix them?
