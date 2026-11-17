---
title: "Discord #brainstorm — 2026-11-16"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "daniellacosse"
  - "CaptainLach"
  - "SpaceMonkey"
created: 2026-11-16
description: "Append-only capture of #brainstorm from 2026-11-16T21:28:47Z to 2026-11-17T12:31:35Z, pulled from the Discord REST API. 22 messages, 3 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-11-16T21:28:47Z to 2026-11-17T12:31:35Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**daniellacosse** — 2026-11-16T21:28:47Z, edited 2026-11-16T21:34:49Z (`1572000506161799182`)

Okay, I've made a couple edits to the board:
1. The first tab is "Current Work" which only displays stuff that is ready to be worked on or in flight
2. A tab for "Review" which contains a table of all the issues that require human review.

So, looking at the setup, I think it can definitely be tweaked a bit, some ideas:
1. I know we just added the "review" property, but I've realized that could probably be added to status, which would simplify the filtering. So the status could be "Needs Review" then "Ready", and so on, and we drop the review property.
2. Ah, so at first I was like "why don't we use the native priority field" but I see, we want to use the properties on the project because we can't actually edit the tickets that belong to the Deno codebase - makes sense. That said, we should probably add an "owner" field to those properties so we can manage that as well. I can do that.

_(2026-11-16T21:32:24Z, edited 2026-11-16T21:32:49Z `1572001419781738567`)_

We probably also want to make the "size" property more meaningful. There are a few schools of thought about this, open to any suggestions:

- Splitting into "complexity" versus "volume"
- Volunteer hour estimate, est. PR count
- Enumerating modules the work would touch (a more specific proxy for complexity/volume)

_(2026-11-16T21:33:31Z, edited 2026-11-16T21:33:41Z `1572001699638419570`)_

It would be great to have a tab for our goals/the roadmap: I can probably just add it to the .github repo and link it in the project description

_(2026-11-16T21:34:31Z, edited 2026-11-16T21:34:37Z `1572001950310993983`)_

Did Claude set up these workflow automations?

_(2026-11-16T21:55:14Z `1572007164195635332`)_

> ↳ replying to daniellacosse: Okay, I've made a couple edits to the board: 1. The first tab is "Current Work" which only displays stuff that is ready 

Okay! Collapsed needs human review and backlog into a single "needs review" status. And added an "owner" text field so we can group by that.

_(2026-11-16T21:55:40Z `1572007275550478458`)_

[attachment] Screenshot_2026-11-16_at_16.55.37.png (https://cdn.discordapp.com/attachments/1558965777850302546/1572007275609067601/Screenshot_2026-11-16_at_16.55.37.png?ex=6afd761c&is=6afc249c&hm=1d38ada04be1cf248654b7b3155709d4fd0a6e0c6b8be9d1db555dbb3f401cdf&)

_(2026-11-16T21:56:09Z `1572007393552764960`)_

I also noticed there's a readme in the project...  let me add our goals/roadmap


**CaptainLach** — 2026-11-16T21:57:42Z (`1572007784604504126`)

> ↳ replying to daniellacosse: 

37008 can be closed, it will be covered by v8x update... I just need to finish it...


**daniellacosse** — 2026-11-16T21:58:14Z (`1572007918495072341`)

cool, removed from project

_(2026-11-16T22:01:14Z `1572008675910885547`)_

hm, I wish you could say why you're closing draft issues.

"Get CI green on trunk" and "Release a runnable Dodo build" are redundant with "Publish CD artifacts to GitHub Releases instead of dl.deno.land"

_(2026-11-16T22:05:08Z `1572009657084674071`)_

for this one: https://github.com/orgs/are-we-dodo-yet/projects/2/views/6?pane=issue&itemId=304444237

I was reading your convo w/ <@371201159630815234>; we probably just need a ticket for pulling in latest deno (2.9.8)

new tickets can be added as new versions are released for us to pull in?

_(2026-11-16T22:05:19Z `1572009702647136337`)_

it is a little weird...


**CaptainLach** — 2026-11-16T22:07:51Z (`1572010338096914483`)

Latest deno is just deno including partial(!) fix for eMudhra

_(2026-11-16T22:08:43Z `1572010555965837404`)_

I had an issue with a couple of things that we might want to cherry-pick that they also released in 2.9.8, but I looked into that and I'm not confident that those fixes are correct and acceptable to be merged as-is


**daniellacosse** — 2026-11-16T22:09:00Z (`1572010630779641920`)

Alright. We'll just do it case by case then

_(2026-11-16T22:30:05Z `1572015934892417024`)_

> ↳ replying to SpaceMonkey: His has some nice server-side extras (shared UDP port, ICE-lite, raw RTP) worth borrowing, though. 🙂

so this is the official w3c repo for determining web plaftform compatibility: https://github.com/web-platform-tests/wpt
[embed] GitHub - web-platform-tests/wpt: Test suites for Web platform specs... Test suites for Web platform specs — including WHATWG, W3C, and others - web-platform-tests/wpt

_(2026-11-16T22:30:24Z, edited 2026-11-16T22:30:33Z `1572016015577972767`)_

I don't think we can really consider an addition until it at least passes the respective tests

_(2026-11-16T22:31:16Z `1572016232444465324`)_

problem is a lot of these are html. wiring this up into dodo would be interesting...

_(2026-11-16T22:33:18Z, edited 2026-11-17T00:43:07Z `1572016746162815007`)_

there's other acceptance criteria as well, not just these tests. performance, type safety, whether the code makes sense, whether we understand it, and so on...

_(2026-11-16T22:36:20Z, edited 2026-11-16T22:37:09Z `1572017509111173240`)_

aha, there is this though: https://github.com/denoland/deno/tree/main/tests/wpt
[embed] deno/tests/wpt at main · denoland/deno A modern runtime for JavaScript and TypeScript. Contribute to denoland/deno development by creating an account on GitHub.

_(2026-11-16T22:36:55Z `1572017654884077679`)_

apologies if i'm lagging behind you here


**SpaceMonkey** — 2026-11-17T12:31:35Z (`1572227705888309360`)

> ↳ replying to daniellacosse: Did Claude set up these workflow automations?

No automations yet: those are GitHub's 7 default project workflows, and they're all disabled. The "automatic" Needs Review was just my agent setting the field when it adds cards, so your Status change doesn't break anything; it uses Status = Needs Review from now on. If you'd also like every new item (human or AI) to start in Needs Review, the built-in "Item added to project" workflow can do that. I'd flip it on.

Re `WebRTC`: agreed, it should pass WPT before you consider it. I'm running it through tests/wpt now and fixing what fails; I'll keep you posted on the results.
