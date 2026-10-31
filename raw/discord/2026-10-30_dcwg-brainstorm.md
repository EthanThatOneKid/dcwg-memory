---
title: "Discord #brainstorm — 2026-10-30"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "Soluble State"
  - "daniellacosse"
created: 2026-10-30
description: "Append-only capture of #brainstorm from 2026-10-30T19:43:52Z to 2026-10-30T21:24:00Z, pulled from the Discord REST API. 3 messages, 2 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-30T19:43:52Z to 2026-10-30T21:24:00Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**Soluble State** — 2026-10-30T19:43:52Z (`1565813511328763977`)

I would love to work for Dodo.
I am pretty good with TypeScript so I can work on maintaining std library and official typescript packages.

I use AI only when I am stuck and no solution is found, which is rare case.

I do not have any projects to show case though, I have never worked in any team or on any open source project, most of my repositories stay on my device.

I also love migrating legacy codebases to modern codebases so I think I can handle forking various packages that people depend on, yet they require Node compatibility.


**daniellacosse** — 2026-10-30T20:05:25Z, edited 2026-10-30T20:06:11Z (`1565818935746625537`)

> ↳ replying to Soluble State: I would love to work for Dodo. I am pretty good with TypeScript so I can work on maintaining std library and official ty

Welcome! Currently we're a little stuck on not having a build for people to use. I'm working my way toward trying to get one set up, but focus time in my current life is frustratingly hard to come by.

We've discussed sharing @std ownership with<#1559276145835253921>  and <#1560372147136888832> so feel free to check those channels out.

_(2026-10-30T21:24:00Z `1565838708593397792`)_

> ↳ replying to daniellacosse: Welcome! Currently we're a little stuck on not having a build for people to use. I'm working my way toward trying to get

first step: https://github.com/are-we-dodo-yet/dodo/pull/17

need to fix the CI next
[embed] chore: rename deno cli to dodo by daniellacosse · Pull Request #17... $ ./x build # =&gt; builds `dodo` now

$ ./target/debug/dodo      
Dodo 2.9.7
exit using ctrl+d, ctrl+c, or close()
REPL is running with all permissions allowed.
To specify permissions, run `de...
