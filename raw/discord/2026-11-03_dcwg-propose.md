---
title: "Discord #propose — 2026-11-03"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "CaptainLach"
  - "daniellacosse"
created: 2026-11-03
description: "Append-only capture of #propose from 2026-11-03T07:43:48Z to 2026-11-03T08:38:54Z, pulled from the Discord REST API. 9 messages, 2 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-11-03T07:43:48Z to 2026-11-03T08:38:54Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## per-package (module-level) permissions (thread 1562324423615184897)

**CaptainLach** — 2026-11-03T07:43:48Z (`1567081851795808277`)

> ↳ replying to daniellacosse: should work with <@178483185468833793> 's compile-time optimization idea, throw errors when the wrong attributes are use

I was never proposing per-module, I was proposing per-package!

_(2026-11-03T07:44:59Z, edited 2026-11-03T07:45:32Z `1567082151630078063`)_

ESM modules are deduplicated in the graph, using `with` attributes for such thing is just wrong


**daniellacosse** — 2026-11-03T07:56:40Z, edited 2026-11-03T12:44:12Z (`1567085089672790118`)

> ↳ replying to CaptainLach: I was never proposing per-module, I was proposing per-package!

sorry, I didn't mean to imply *you* were proposing per-module, *I* was trying to move your ideas to the module level. maybe that's crazy

_(2026-11-03T07:59:06Z, edited 2026-11-03T08:00:34Z `1567085700950794253`)_

> ↳ replying to CaptainLach: ESM modules are deduplicated in the graph, using `with` attributes for such thing is just wrong

scratch that idea then. I guess i thought because { type: "json" } occurs after the module is deduped this could work in a similar way, with each "module" `with` instance being placed in a sandbox (a sort of post-processing in the way that { type: "json" } works)

_(2026-11-03T08:04:47Z `1567087133913645081`)_

but it's a runtime behavior, not a compile-time one

_(2026-11-03T08:05:09Z `1567087224363683882`)_

unless...

_(2026-11-03T08:15:59Z, edited 2026-11-03T08:17:06Z `1567089951034712234`)_

we could like... "compile-in" the sandbox per-module somehow. look at this: https://github.com/tc39/proposal-source-phase-imports
[embed] GitHub - tc39/proposal-source-phase-imports: Proposal to enable imp... Proposal to enable importing modules at the source phase - tc39/proposal-source-phase-imports

_(2026-11-03T08:16:55Z `1567090186251280477`)_

this proposal even mentions Deno as a use case

_(2026-11-03T08:38:54Z `1567095719981219893`)_

also if you're wondering why im messaging at this hour i got stuck in an airport overnight lol
