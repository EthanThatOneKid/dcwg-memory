---
title: "Discord #propose — 2026-11-04"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "davey"
  - "daniellacosse"
  - "CaptainLach"
created: 2026-11-04
description: "Append-only capture of #propose from 2026-11-04T17:10:10Z to 2026-11-04T17:37:51Z, pulled from the Discord REST API. 7 messages, 3 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-11-04T17:10:10Z to 2026-11-04T17:37:51Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## per-package (module-level) permissions (thread 1562324423615184897)

**davey** — 2026-11-04T17:10:10Z (`1567586770025979924`)

Apologies I've been quiet ... Been very busy. 

Per module or package would be huge in my eyes.

Have a look at how emdash cms had to do something off the happy path to have plugin isolation 

https://blog.cloudflare.com/emdash-wordpress/

Also similar with my own project

https://github.com/smallhoursorg/hotsauce/blob/main/packages/workers/README.md

I would support any approach that enables isolation natively. I could help evaluate options from a DX perspective.


**daniellacosse** — 2026-11-04T17:26:57Z, edited 2026-11-04T17:27:08Z (`1567590994482954273`)

I think the first big decision we need to make is package or module - i feel like package makes sense and is the cleanest (doable) - module is kinda messy and kinda crazy (compile-in isolates wtf), but even more flexible

_(2026-11-04T17:27:27Z `1567591118730694717`)_

I'd hate to like, do both and support both, seems rough


**CaptainLach** — 2026-11-04T17:36:01Z (`1567593274196099164`)

You can't really have per-module permissions, you don't even have a place to put permissions for module in, and no real way to enforce them

_(2026-11-04T17:36:45Z `1567593460297375787`)_

Before you have proposed to use import ... with {  }, but that doesn't really work, because you would somehow need to unify it in the module graph

_(2026-11-04T17:37:05Z `1567593543680270457`)_

But in case of packages you can easily scope permissions to package

_(2026-11-04T17:37:51Z `1567593738375528459`)_

Although, you need to be vary of not leaking some stuff through prototype polution by using primordials for example
