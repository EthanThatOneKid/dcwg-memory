---
title: "Discord #brainstorm — 2026-11-03"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "CaptainLach"
  - "daniellacosse"
created: 2026-11-03
description: "Append-only capture of #brainstorm from 2026-11-03T23:42:35Z to 2026-11-04T02:19:26Z, pulled from the Discord REST API. 3 messages, 2 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-11-03T23:42:35Z to 2026-11-04T02:19:26Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**CaptainLach** — 2026-11-03T23:42:35Z (`1567323137392250970`)

Can someone on macos check if https://github.com/are-we-dodo-yet/dodo/pull/15 really slows launch significantly enough? This PR would drop couple of things that I would consider significant for security and allow to bump reqwest and couple of other packages that are not good to be sitting outdated
[embed] ci: ensure the necessity of macos dyld hacks by CertainLach · Pull... Deno depends on a couple of optimizations developed by littledivy to improve the startup time on macos
While those might be useful, deno_native_certs for example is a potential security liability, ...

_(2026-11-03T23:43:11Z `1567323289859391489`)_

After it is merged we would be able to enable dependabot which I would like a lot


**daniellacosse** — 2026-11-04T02:19:26Z (`1567362608624046291`)

> ↳ replying to CaptainLach: Can someone on macos check if https://github.com/are-we-dodo-yet/dodo/pull/15 really slows launch significantly enough? 

Yeah, I can test
