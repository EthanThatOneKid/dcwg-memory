---
title: "Discord #propose — 2026-10-24"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "netop://ウィビ"
  - "CaptainLach"
  - "davey"
  - "andy"
  - "daniellacosse"
created: 2026-10-24
description: "Append-only capture of #propose from 2026-10-24T19:36:38Z to 2026-10-24T23:33:20Z, pulled from the Discord REST API. 15 messages, 5 participants, across 2 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-24T19:36:38Z to 2026-10-24T23:33:20Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## per-package (module-level) permissions (thread 1562324423615184897)

**davey** — 2026-10-24T21:44:20Z (`1563669502204448859`)

<@400711308141658112> idk, I think extension and modules are 2 different ideas right? Extensions can interact with a bigger surface area that is not just js/ts? 

Whereas modules would be limited to js/ts code?

_(2026-10-24T21:46:18Z `1563669997161676821`)_

<@1136701682131144714> why must the context and globals be shared?

Could a solution be something like new Worker (but better)? Deno let's you set permissions as an argument to Worker.


**andy** — 2026-10-24T21:55:21Z (`1563672273905524767`)

> ↳ replying to davey: <@1136701682131144714> why must the context and globals be shared?  Could a solution be something like new Worker (but b

that's how ES modules work, they share context

_(2026-10-24T21:55:29Z `1563672306230763551`)_

extensions dont


**daniellacosse** — 2026-10-24T23:33:20Z (`1563696931925008536`)

> ↳ replying to davey: <@400711308141658112> idk, I think extension and modules are 2 different ideas right? Extensions can interact with a big

yeah, they are two different ideas, but modules can't really be per-permission'd effectively. with different contexts it becomes possible

---

## Sandboxed extension boundary (thread 1562944037135196211)

**netop://ウィビ** — 2026-10-24T19:36:38Z (`1563637365380096171`)

What do y'all think about this?
[attachment] SS_2026-10-24_at_12.36.28_PM.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563637365056995339/SS_2026-10-24_at_12.36.28_PM.png?ex=6ade5a46&is=6add08c6&hm=23874110ec30c82567e3caf7d662e0a7394f6925c0156b9b65c06cc2b628f9c0&)

_(2026-10-24T19:39:39Z `1563638124196663306`)_

[attachment] SS_2026-10-24_at_12.39.08_PM.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563638123177713785/SS_2026-10-24_at_12.39.08_PM.png?ex=6ade5afb&is=6add097b&hm=01dc84ce4c9b0603a9d03c2df991f0b36acb36cb0e49145a63af86c76b299ce7&)
[attachment] SS_2026-10-24_at_12.39.19_PM.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563638123542483044/SS_2026-10-24_at_12.39.19_PM.png?ex=6ade5afb&is=6add097b&hm=5f6a170abb397cb20e793c6f8ae0faeb8b08b926d705d820c83758adbffbc2c7&)
[attachment] SS_2026-10-24_at_12.39.35_PM.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563638123903189062/SS_2026-10-24_at_12.39.35_PM.png?ex=6ade5afb&is=6add097b&hm=13c33ea24ff09e83e4a8d80bc7a4c90f93c56d01189720ce648370fed334bb02&)

_(2026-10-24T19:40:32Z `1563638346494902403`)_

I started with the shape of the extension, how it might look in a project, and then threw that in Claude for it to flesh out.

_(2026-10-24T19:41:20Z `1563638547037036585`)_

No matter what an extension might declare, it'll never overrun what the app allows. You'll see an error instead.

_(2026-10-24T19:43:15Z `1563639027381309491`)_

Importing from URLs is useful but if the contents of said URL ever change, you'll get alerted and will have to allow the extension again. _Hopefully_ most people would think to check contents of said extension if/when that happens and is not expecting that.

_(2026-10-24T19:43:53Z `1563639187922489456`)_

l o c k f i l e


**CaptainLach** — 2026-10-24T21:30:09Z (`1563665932147101807`)

> ↳ replying to netop://ウィビ: What do y'all think about this?

So, every extension is just a webworker with its API described with webidl so the shims can be implemented in primary worker?


**netop://ウィビ** — 2026-10-24T21:31:57Z (`1563666382480998450`)

> ↳ replying to CaptainLach: So, every extension is just a webworker with its API described with webidl so the shims can be implemented in primary wo

Idk what `webidl` is but as long as the extension can match this shape, it should work.

_(2026-10-24T21:52:10Z `1563671469932810271`)_

Ah fascinating https://en.wikipedia.org/wiki/Web_IDL
[embed] https://en.wikipedia.org/wiki/Web_IDL

_(2026-10-24T21:52:47Z `1563671627630248148`)_

https://webidl.spec.whatwg.org
