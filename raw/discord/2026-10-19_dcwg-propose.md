---
title: "Discord #propose — 2026-10-19"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "Sandeep Kumar Kuanar✌🏼"
  - "netop://ウィビ"
  - "w"
  - "CaptainLach"
  - "daniellacosse"
  - "Cyan"
  - "Ooker"
created: 2026-10-19
description: "Append-only capture of #propose from 2026-10-19T21:08:19Z to 2026-10-20T14:43:49Z, pulled from the Discord REST API. 49 messages, 7 participants, across 3 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-19T21:08:19Z to 2026-10-20T14:43:49Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## Dodo Bencho's (thread 1559657749892300934)

**w** — 2026-10-19T21:57:47Z (`1561860946555699402`)

<@178483185468833793> haven't forgotten about this, but it'l have to sit on the shelf another day -- day job needing 100% of me today


**CaptainLach** — 2026-10-19T21:59:17Z (`1561861321446658139`)

Don't worry, I haven't checked your PR either, sorry 😄

---

## Continue developing Deno vs adding best features to Node.js (thread 1560790338480906290)

**daniellacosse** — 2026-10-20T03:01:25Z, edited 2026-10-20T03:02:17Z (`1561937356142149643`)

It's generally cheaper at enterprise scale to layer more crap on, like Docker or Synk, than port your 100k+ line codebase.

Dodo/Deno, again, wins for smaller teams in this regard - it's sort of what "secure by default" means. Node is "secure with addons" - and the addons are cheaper than a rewrite when your codebase is big enough


**Ooker** — 2026-10-20T07:45:56Z (`1562008958343053343`)

So it looks like even with many node compatibility features, the effort to keep using add-ons is still lower than the effort to use Deno, right? Is it theoretically possible that Deno can make the effort for transition lower than the effort to stay?


**daniellacosse** — 2026-10-20T14:38:25Z, edited 2026-10-20T14:41:14Z (`1562112761855737890`)

We would have to become a drop-in replacement for node, not just deno, which is what Bun targeted and is why it lept ahead. It's a tradeoff between architectural integrity and like... more people using it more quickly

_(2026-10-20T14:40:15Z, edited 2026-10-20T14:43:06Z `1562113225871597589`)_

"Node compat" is more about tapping into all the code living in NPM, not being drop-in that behaves exactly the same way Node does

_(2026-10-20T14:43:49Z, edited 2026-10-20T14:44:32Z `1562114121992900681`)_

I would be open to exploring what we could add to the "node compat" extension to ease the transition for those who want to make it, but doing things like intentionally trying to replicate node's fake permissions... that's too far

---

## Proposal: Dodo's identity & The Economic Reality (thread 1561488644219478176)

**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:08:19Z (`1561848496951398420`)

> ↳ replying to CaptainLach: At the same time it is possible to make deno mostly maintain itself by delegating more work to the external libraries

Then we have a few problems here. 
1. We need to then decide which libraries to choose from
2. We need someone to keep the dependencies updated and security checked. Like if the dependent libraries have any recent incident or any CVEs or not
3. We need someone to map new features to new projects

I think this could be solved by us actually building and maintain the packages that Dodo/Ende would use, so we can delegate/blame the maintainer for some risks. This is a risky situation to be in. But it's highly modular, Deno did it with Fresh, and so on.

_(2026-10-19T21:08:47Z `1561848613611634823`)_

> ↳ replying to CaptainLach: At the same time it is possible to make deno mostly maintain itself by delegating more work to the external libraries

Though I mostly agree on that.

_(2026-10-19T21:10:40Z `1561849088507514966`)_

> ↳ replying to CaptainLach: E.g replace some backends of laufey with tauri, leave only CEF here Rewrite the cryptography to a higher-level libraries

Yeah, the ad-hoc patches would be the sink for our time, like it was for Deno team.

_(2026-10-19T21:17:19Z `1561850762177290323`)_

> ↳ replying to CaptainLach: I just don't believe you can generate code this bad

`v1p1beta1` where.does.it.end?

_(2026-10-19T21:34:41Z `1561855131568447612`)_

I liked the thought of deferring the "deploy" to later.

_(2026-10-19T21:36:49Z `1561855670838624299`)_

I agree with <@400711308141658112>'s thinking in layers of opinionated default, unopinionated escape hatch 
The issue would be defining the boundary. The clear boundary that "this" is the core, and "those" are extensions, and "these" here are some thing you absolutely need

_(2026-10-19T21:41:19Z, edited 2026-10-19T21:41:28Z `1561856803262959626`)_

<@184349064161132563>  is fearing "jumping the gun" to just commit to the foundation *now*, well, I do agree with you. As Dodo is very early and we are still experimenting. 

My solution would be a tentative release schedule. A date when Dodo/Ende are shown to the world. Our answer to this mess. This would give us 2 things: 
1. This will give us clear roadmap as we would have an deadline to follow. Clear deadline gives the idea of how much we can do and how many more people we now need to help. 
2. This will give us clear V1 for both of them. 

This aren't that glamorous but hey deadlines do keep me motivated as well.

_(2026-10-19T21:43:21Z `1561857314632503367`)_

I feel <@370871659839619072> being anxious of Dodo being just another bloated framework instead of being a embeddable engine. I would love further discussion on this by <@184349064161132563> and maybe <@125029111839064065>


**netop://ウィビ** — 2026-10-19T21:45:12Z (`1561857780892176515`)

Has anyone done a high-level overview of the features of Deno and what to keep?

_(2026-10-19T21:45:52Z `1561857945564614657`)_

Drawing things out makes it much easier to figure out a plan to go forward.  A lot of convos seem like unnecessary waffling.

_(2026-10-19T21:46:38Z `1561858139077349519`)_

Idk what's changed but from my recollection, Dodo was to be a drop-in, maintained replacement for Deno.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:47:38Z (`1561858390970474527`)

> ↳ replying to netop://ウィビ: Idk what's changed but from my recollection, Dodo was to be a drop-in, maintained replacement for Deno.

Yups.


**netop://ウィビ** — 2026-10-19T21:47:52Z (`1561858450630385739`)

Figure THAT out first. Get the CI running after changing `Deno` to `Dodo` across the codebase. Move on from there.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:48:10Z (`1561858527834808335`)

> ↳ replying to netop://ウィビ: Figure THAT out first. Get the CI running after changing `Deno` to `Dodo` across the codebase. Move on from there.

Okay, adding to the doc


**netop://ウィビ** — 2026-10-19T21:48:42Z (`1561858661754732736`)

Just seems like common sense product management to me...


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:49:03Z (`1561858747498889277`)

> ↳ replying to netop://ウィビ: Just seems like common sense product management to me...

which one? the change in CI?


**netop://ウィビ** — 2026-10-19T21:49:16Z (`1561858803303981058`)

Everything I just stated


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:50:08Z (`1561859022783782913`)

> ↳ replying to netop://ウィビ: Everything I just stated

Okay, noted

_(2026-10-19T21:51:47Z `1561859437998637201`)_

<@178483185468833793> 
"I want to clarify what I meant by 'maintaining the packages' because it came off wrong, and <@184349064161132563> k's fear about embedding is valid.

I don't mean Dodo becomes an JSR-like registry. I mean a Trait/Adapter pattern.

Let's say Dodo wants to run on iOS. The core Dodo team shouldn't have to learn Apple's WebKit APIs and maintain that forever. The core team just defines the interface (the trait). I step up and say 'I will build and maintain the `WebKitAdapter` in Rust'. I take ownership of that specific piece.

If it breaks, the core team has an 'address' to look into (me), and they don't have to build the abstraction themselves—I just hand them the API and they plug it in. It distributes the maintenance burden across the community while keeping the core tiny. It solves the burnout problem without sacrificing cross-platform DX. What do you think <@400711308141658112> <@184349064161132563> ?


**w** — 2026-10-19T21:53:24Z (`1561859844070314069`)

as a thought experiment, it can be good to have different owners of different parts of the codebase -- the webkit api example might not be the most apropos only because of v8x


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:53:54Z (`1561859970717327572`)

> ↳ replying to w: as a thought experiment, it can be good to have different owners of different parts of the codebase -- the webkit api ex

I see, what is v8x? 
and why there is not v9?


**w** — 2026-10-19T21:53:56Z (`1561859978275455081`)

at the same time, oss projects _can_ have people dip in and dip out as their interest waxes/wanes, so you don't want a bus factor of 1 on something important


**CaptainLach** — 2026-10-19T21:54:31Z (`1561860125449265154`)

Nope, I meant to resort to higher-level libraries for some stuff, and contribute to them. In case of laufey - it is mostly the same thing as tauri do in wry.
The only thing that is not implemented in wry is embedded CEF

We can greately reduce maintenance burden by replacing all the laufey backends except for CEF with wry, or even contribute CEF support to wry


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:54:50Z (`1561860205120196729`)

> ↳ replying to w: at the same time, oss projects _can_ have people dip in and dip out as their interest waxes/wanes, so you don't want a b

Oh yeah. Like to just keep things interesting for the maintainer and having a safety net incase someone dips out


**CaptainLach** — 2026-10-19T21:55:04Z (`1561860261072212129`)

Then we wouldn't need to maintain the largest part of deno desktop/mobile by ourselves at all


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:55:53Z (`1561860466593107999`)

> ↳ replying to CaptainLach: Then we wouldn't need to maintain the largest part of deno desktop/mobile by ourselves at all

I agree. As we are short on people, we can do that. Yeah


**w** — 2026-10-19T21:56:08Z (`1561860528891101225`)

Simplified, "Rather than specialize for apple's webkit api, find another well maintained package that abstracts across various this-or-that-specific apis, use these, make simple."


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:57:34Z (`1561860889982935140`)

> ↳ replying to w: Simplified, "Rather than specialize for apple's webkit api, find another well maintained package that abstracts across v

Trade-off: Dependency Risk. If you use a third-party crate to abstract WebKit, you are inheriting their bugs, their release cycle, and their limitations.


**CaptainLach** — 2026-10-19T21:58:13Z (`1561861053267058699`)

Unless we have a large team of paid people third-party crate would be much better maintained than ours


**w** — 2026-10-19T21:58:18Z (`1561861077640421387`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Trade-off: Dependency Risk. If you use a third-party crate to abstract WebKit, you are inheriting their bugs, their rele

and their sweet sweet cve patches


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:58:47Z (`1561861198688026698`)

> ↳ replying to CaptainLach: Unless we have a large team of paid people third-party crate would be much better maintained than ours

Fair point, exactly my worry. Like there is just one way to go


**CaptainLach** — 2026-10-19T21:58:49Z (`1561861204975030395`)

Especially if the third-party lib is used in e.g tauri


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T21:59:13Z (`1561861305042997300`)

> ↳ replying to w: and their sweet sweet cve patches

yeah! ‼️


**daniellacosse** — 2026-10-20T01:07:54Z (`1561908788728959091`)

> ↳ replying to netop://ウィビ: Has anyone done a high-level overview of the features of Deno and what to keep?

I believe this is largely because we're still saying Dodo is drop-in, yes? So we have to keep everything

_(2026-10-20T01:08:46Z, edited 2026-10-20T01:12:56Z `1561909007025971211`)_

> ↳ replying to netop://ウィビ: Everything I just stated

which is also in <#1560371677127381232> - if the roadmap is unclear, or you believe it needs adjustments, please let me know

_(2026-10-20T01:10:53Z `1561909540759412798`)_

i have been trying to keep it simple so as to not overplan

_(2026-10-20T01:14:39Z `1561910490332925993`)_

> ↳ replying to daniellacosse: I believe this is largely because we're still saying Dodo is drop-in, yes? So we have to keep everything

i keep having the thought to diagram out the codebase but haven't had the time


**netop://ウィビ** — 2026-10-20T01:19:13Z (`1561911638762717187`)

> ↳ replying to daniellacosse: which is also in <#1560371677127381232> - if the roadmap is unclear, or you believe it needs adjustments, please let me 

I'll find some time to look at it tonight


**daniellacosse** — 2026-10-20T02:58:03Z (`1561936510629060708`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Fair point, exactly my worry. Like there is just one way to go

I feel your worry, but too much will burn us all out, we need to take things one step at a time and have patience. Community governance is slow, but durable

I have a suggestion I feel you might take to. Would you be interested in looking through the [Deno backlog](https://github.com/denoland/deno/issues?q=is%3Aissue+AND+state%3Aopen+AND+(label%3Abug+OR+label%3A"fix+available"+OR+label%3A"high+priority"+OR+label%3Apanic)+sort%3Aupdated-desc ) for a few issues we might want to prioritize? Then we can add them to the [mostly empty board](https://github.com/orgs/are-we-dodo-yet/projects/2 )

You'll need to understand each issue fully before selecting them, which will push you sift through the code base. What seems critical? What seems aligned with our roadmap? What seems fairly easy to accomplish? Only so many people can work on the build - this will open up opportunities for more people to start to take things on.

_(2026-10-20T03:44:18Z, edited 2026-10-20T03:46:27Z `1561948148027625485`)_

(btw, taking on relevant issues that people have logged to Deno but were ignored is a great way to slowly build trust - I've experienced this first hand but that's a longer story)


**Cyan** — 2026-10-20T05:03:38Z, edited 2026-10-20T05:03:46Z (`1561968116622163989`)

> ↳ replying to daniellacosse: (btw, taking on relevant issues that people have logged to Deno but were ignored is a great way to slowly build trust - 

~~support deleting import cache please~~


**Sandeep Kumar Kuanar✌🏼** — 2026-10-20T07:40:24Z (`1562007566395899956`)

> ↳ replying to daniellacosse: I feel your worry, but too much will burn us all out, we need to take things one step at a time and have patience. Commu

Okay. I will look into it.
