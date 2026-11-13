---
title: "Discord #brainstorm — 2026-11-13"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "SpaceMonkey"
  - "daniellacosse"
  - "𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素"
created: 2026-11-13
description: "Append-only capture of #brainstorm from 2026-11-13T05:26:05Z to 2026-11-13T17:43:35Z, pulled from the Discord REST API. 18 messages, 3 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-11-13T05:26:05Z to 2026-11-13T17:43:35Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**SpaceMonkey** — 2026-11-13T05:26:05Z (`1570671073274626049`)

Just a thought... What about starting a project board? I've just started using one myself for Denext a few weeks ago... https://github.com/orgs/Brainwires/projects/2


**daniellacosse** — 2026-11-13T05:29:21Z (`1570671895697694801`)

it's here, i haven't had time to fill it out

_(2026-11-13T05:29:23Z `1570671904723828818`)_

https://github.com/orgs/are-we-dodo-yet/projects/2/views/1
[embed] Dodo Triage • are-we-dodo-yet Dodo Triage

_(2026-11-13T05:31:52Z `1570672528022704190`)_

anyone want write access lmk


**SpaceMonkey** — 2026-11-13T05:35:00Z (`1570673315960332399`)

> ↳ replying to daniellacosse: anyone want write access lmk

If you want to give me write access, I'll have Claude transfer the contents of the Roadmap channel in to tasks in the project. 🙂

_(2026-11-13T05:35:20Z `1570673401666736169`)_

`nightness` on Github

_(2026-11-13T05:59:28Z `1570679475073716279`)_

<@400711308141658112>  I've another idea too if you don't mind some more help from AI... We can write a community-to-code bot to handle management of the project board. That way you have guardrails to what is added to the project board. I'd be happy to start one, I get a good value from my subscriptions. https://chatgpt.com/share/6af6a70d-dc78-83e9-873d-f49ba9d69f9d
[embed] Check out this chat Here's a chat someone thought you'd want to see.


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-13T07:08:39Z (`1570696882840150049`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: sounds like a potential Dodo milestone?

on that front, [Web MIDI API](https://discord.com/channels/684898665143206084/1259924907874320415/1259924907874320415) as well

_(2026-11-13T07:09:47Z, edited 2026-11-13T09:12:59Z `1570697168749338735`)_

so far there aren't any MIDI 2.0 support yet, Web MIDI API thus is still strictly MIDI 1.0


**SpaceMonkey** — 2026-11-13T08:36:40Z (`1570719035136409631`)

> ↳ replying to daniellacosse: can't host a local server though because Deno doesn't implement WebRTC

Working on this with my Deno fork, I was mostly there as I already have implemented WebRTC in Rust for another project... https://github.com/Brainwires/webrtc-rs-rtc - Last commit was 7 months ago, but I'm auditing an fixing any issues with its existing release.

_(2026-11-13T08:37:16Z `1570719185997275167`)_

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: on that front, [Web MIDI API](https://discord.com/channels/684898665143206084/1259924907874320415/1259924907874320415) a

Looking at this too 🙂


**daniellacosse** — 2026-11-13T16:31:15Z, edited 2026-11-13T16:34:48Z (`1570838466814541835`)

> ↳ replying to SpaceMonkey: If you want to give me write access, I'll have Claude transfer the contents of the Roadmap channel in to tasks in the pr

I think using LLMs for project management isn't a bad idea overall, as long as they're well supervised.

What I might suggest is starting by transferring some issues from the Deno codebase over to this project board. Everything that's transferred by the bot can be labeled with something like `bot suggestion` first and then one of us can go over and confirm

_(2026-11-13T16:31:31Z `1570838534217011412`)_

You might want to start with the triage that <#1559276145835253921> has already done.

_(2026-11-13T16:31:51Z `1570838619243937844`)_

> ↳ replying to SpaceMonkey: <@400711308141658112>  I've another idea too if you don't mind some more help from AI... We can write a community-to-cod

Let's start with using claude to populate the board first and see how that goes

_(2026-11-13T16:33:15Z `1570838971188121662`)_

you're nightness on github?


**SpaceMonkey** — 2026-11-13T17:11:06Z (`1570848494409879676`)

> ↳ replying to daniellacosse: Let's start with using claude to populate the board first and see how that goes

Sure

_(2026-11-13T17:11:10Z `1570848514219573339`)_

> ↳ replying to daniellacosse: you're nightness on github?

yes


**daniellacosse** — 2026-11-13T17:43:35Z (`1570856671537012878`)

> ↳ replying to SpaceMonkey: yes

added you
