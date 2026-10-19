---
title: "Discord #brainstorm — 2026-10-18"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "Sandeep Kumar Kuanar✌🏼"
  - "Cyan"
  - "CaptainLach"
  - "Pierrot"
  - "andy"
  - "w"
created: 2026-10-18
description: "Append-only capture of #brainstorm from 2026-10-18T21:16:27Z to 2026-10-19T15:45:48Z, pulled from the Discord REST API. 28 messages, 6 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-18T21:16:27Z to 2026-10-19T15:45:48Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T21:16:27Z (`1561488156547621058`)

I've been thinking about <@400711308141658112> question, and <@184349064161132563>  warning that 'modularity isn't a differentiator.' Here is my best shot at Dodo's identity:

We are the embeddable, predictable runtime for the next generation of cross-platform tools. Not a Node killer. Not a Deno replacement. The foundation for builders.

That breaks down into three layers:

1. The Core (<@184349064161132563> 's vision): cli <-> core <-> runtime <-> v8. Highly embeddable. Modular. You can put it inside a Tauri app, a desktop app, or a CLI.

2. The DX (<@400711308141658112> 's vision): Predictable, deterministic, standards-based. A place where JITless environments (like iPad or Switch) don't scare us.

3. The Ecosystem (The missing piece): A lightweight way to distribute these apps. If we don't want to fight Vercel on Deploy, maybe Dodo's "Deploy" is local-first or edge-first by default. You don't host it on our servers; you embed it in your workflow.

The differentiator isn't just modularity. It's that Dodo is the only runtime that treats JavaScript as a first-class citizen for embedding, not just a script runner. Tauri for web apps. If we do that, the 'void' left by Deno Deploy doesn't matter—because our users won't need a monolithic cloud host. They'll run their apps everywhere

_(2026-10-18T21:17:00Z `1561488293198041211`)_

Given this, I am starting a new thread in the <#1559218298128695386> channel, please follow there. We need to standardise this a bit more.


**Cyan** — 2026-10-19T03:43:33Z (`1561585571510489120`)

bindings
[attachment] Screenshot_2026-10-19_11.43.172x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1561585571300905010/Screenshot_2026-10-19_11.43.172x.webp?ex=6ad78c25&is=6ad63aa5&hm=99a1a7e7b9aebd36ab37282e51768112bc990ba0766b82c7dbb4b8f74830e121&)


**CaptainLach** — 2026-10-19T13:42:51Z (`1561736391736426668`)

I have looked into how deno deploy is organized... And it was surprisingly easy now...

_(2026-10-19T13:43:12Z `1561736479322017863`)_

Deploy classic was a custom daemon on top of deno as far as I can see, which was running the containers in isolates

_(2026-10-19T13:44:41Z `1561736855358013451`)_

But as far as I can see, now it is just a microvm waiting on what to run using DENO_UNSTABLE_CONTROL_SOCK
The control plane mounts the built app into the microvm, and submits a command line to this microvm, and then it is just running normal deno

_(2026-10-19T13:45:14Z `1561736990557208727`)_

So it is only compensating for the deno cold start, which isn't slow already?..


**Pierrot** — 2026-10-19T13:50:31Z (`1561738320067829913`)

> ↳ replying to CaptainLach: But as far as I can see, now it is just a microvm waiting on what to run using DENO_UNSTABLE_CONTROL_SOCK The control pl

Is it different than how workerd ran?
I thought the point of edge compute was to save resources.


**CaptainLach** — 2026-10-19T13:51:01Z (`1561738447834587277`)

It doesn't seem like current deno deploy saves resources at all

_(2026-10-19T13:51:27Z `1561738557608042517`)_

Looking at how it works it seems this is just microvms like firecracker


**Pierrot** — 2026-10-19T13:54:38Z (`1561739358044688489`)

That seems like a waste. Supabase edge function, which based off deno core, use isolates


**CaptainLach** — 2026-10-19T13:54:41Z (`1561739367976800489`)

Given that all the functionality that is supposedly used for deno deploy is based on vsock:'s

_(2026-10-19T13:55:07Z `1561739480149401631`)_

I guess this is done for compatibility?..

_(2026-10-19T13:56:43Z `1561739881292767362`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561739880327942144/image.png?ex=6ad7731b&is=6ad6219b&hm=f738e5e2a736bf003e2f90dba66f0fe1cf2d7fe8f696acc140135972b2f79377&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561739880923660299/image.png?ex=6ad7731b&is=6ad6219b&hm=0f4d1c9f31f5f4f32904f5eb5e284619160dab59155b63e7289ef7ebbcc816f1&)

_(2026-10-19T13:56:45Z `1561739888938975294`)_

Yep


**Pierrot** — 2026-10-19T13:58:23Z (`1561740302090240021`)

Ah, yeah


**CaptainLach** — 2026-10-19T13:59:57Z (`1561740693792096349`)

...I would try to implement deno-deploy compatible service a bit later, it seems fairly easy

_(2026-10-19T14:01:19Z `1561741039910256781`)_

The hardest part then is UI 😄


**andy** — 2026-10-19T14:52:24Z (`1561753893493276683`)

> ↳ replying to CaptainLach: ...I would try to implement deno-deploy compatible service a bit later, it seems fairly easy

good luck, i appreciate your optimism but i imagine it's pretty fucking massive undertaking


**CaptainLach** — 2026-10-19T14:52:36Z (`1561753945519562843`)

Nope

_(2026-10-19T14:52:40Z `1561753961726214215`)_

Look in <#1559345359308849273>

_(2026-10-19T15:39:05Z `1561765642582097951`)_

I guess for better resource usage it is possible to clone deno processes instead of spawning them from scratch, and then the runtime memory usage would be zero
Or by dropping some randomness during the start somehow and using kernel same-page merging


**w** — 2026-10-19T15:41:21Z (`1561766214408212571`)

> ↳ replying to CaptainLach: I guess for better resource usage it is possible to clone deno processes instead of spawning them from scratch, and then

i was thinking isolates might have a use here


**CaptainLach** — 2026-10-19T15:42:18Z (`1561766453403713579`)

I'm only talking about the non-classic deploy

_(2026-10-19T15:42:43Z `1561766558559113258`)_

There is no way non-classic deploy was using isolates

_(2026-10-19T15:42:58Z `1561766618768347179`)_

There is just no integration points for that at all

_(2026-10-19T15:43:27Z `1561766740529254425`)_

I mean, there is many integration points, but the APIs they propose to use for it are not compatible with that usecase at all


**w** — 2026-10-19T15:45:48Z (`1561767334836961465`)

knee jerk response, _just_ caught up with the conversation at hand, sorry!
