---
title: "Discord #brainstorm — 2026-11-14"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "SpaceMonkey"
  - "daniellacosse"
created: 2026-11-14
description: "Append-only capture of #brainstorm from 2026-11-14T01:32:23Z to 2026-11-14T16:08:54Z, pulled from the Discord REST API. 37 messages, 2 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-11-14T01:32:23Z to 2026-11-14T16:08:54Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**SpaceMonkey** — 2026-11-14T01:32:23Z (`1570974650014638253`)

> ↳ replying to daniellacosse: Let's start with using claude to populate the board first and see how that goes

I've captured all the conversations from the Dodo channels as items on the project board. I stopped short of adding any Deno repo issues, as there are over 1k, but say the word if you want all or a specific subset of them... We can also analyze them collectively and selectively limit based on X, Y, Z criteria. Here is a summary (from Claude Code) of what was done...

_(2026-11-14T01:32:26Z `1570974662056222882`)_

**Dodo Triage board update:** https://github.com/orgs/are-we-dodo-yet/projects/2 is filled in, up from 21 items to 64. As <@400711308141658112> suggested, Claude did the first pass, and everything it added is marked for a maintainer to confirm.

**What it read:** every message in <#1558888938842624093>, <#1558965777850302546>, <#1560371677127381232>, <#1558888988398583978>, <#1560371841325858927>, <#1559276145835253921>, <#1560372147136888832>, <#1562265796929916938> and <#1559579912698986707>, plus all 8 <#1559218298128695386> threads (Oct 11 to Nov 13). It skipped <#1561512610308816936>, <#1560064232115015760> and <#1558889952949968917>, and couldn't read about 150 lines, mostly code snippets and links.

**What changed on the board:**
- **A new Source field** with the options *bot suggestion* and *confirmed*. Filter on *bot suggestion* to review, then confirm, edit or delete each card.
- **43 new cards**, all in Backlog with Priority and Size set. Each card names the channel and message it came from. They cover:
  - the whole <#1560371677127381232>: first build, GitHub Releases, CI, the TypeScript 7 plan, Bart and the Foundation, extensions, Desktop and Mobile;
  - Summer's security items;
  - requested web APIs: WebRTC, MIDI, Web Audio, OPFS, Gamepad;
  - governance, funding, the AI-use policy and the website;
  - my own item: curating the Brainwires/deno changes that fit Dodo.
- **Two existing cards moved:** PR #17 (the rename to dodo) to In progress, and PR #20 (dependency updates) to In review.

**Next, if you want it: transferring Deno issues.** Ende has no published triage list, but its release notes include a long list of Deno bug fixes. The plan is a "port from Ende" card for each one that applies to Dodo, then cards for recent denoland/deno issues, all marked *bot suggestion* the same way. Let me know if that sounds good.

Corrections welcome. Anything wrong or missing, just say so or fix the card.


**daniellacosse** — 2026-11-14T01:34:23Z (`1570975151707783209`)

Ah, for next time - let's just ask for permission re: indexing channels with AI. There are a couple channels marked as AI-indexed in their descriptions, but not all.


**SpaceMonkey** — 2026-11-14T01:35:43Z (`1570975487621210153`)

okay, thought that's what you wanted me to do


**daniellacosse** — 2026-11-14T01:36:31Z, edited 2026-11-14T01:36:43Z (`1570975687911673939`)

I didn't mention crawling the chat - it's okay, I should have

_(2026-11-14T01:37:20Z `1570975893286027285`)_

This is what I was referencing re: Ende triage https://discord.com/channels/1558888938251223050/1559276145835253921/1568411789576769547

I'm guessing it's in the current issues? One minute


**SpaceMonkey** — 2026-11-14T01:37:31Z, edited 2026-11-14T01:38:16Z (`1570975938618065050`)

So you didn't want this channel's suggestion placed there? I haven't personally kept up with every conversation (to add them manually)


**daniellacosse** — 2026-11-14T01:38:43Z (`1570976243921326201`)

> ↳ replying to daniellacosse: This is what I was referencing re: Ende triage https://discord.com/channels/1558888938251223050/1559276145835253921/1568

ah, no, there's only one issue in ende currently. nevermind!


**SpaceMonkey** — 2026-11-14T01:39:05Z (`1570976332693766276`)

> ↳ replying to daniellacosse: This is what I was referencing re: Ende triage https://discord.com/channels/1558888938251223050/1559276145835253921/1568

<#1559276145835253921> was indexed 😄 🙂


**daniellacosse** — 2026-11-14T01:39:44Z (`1570976499723665449`)

> ↳ replying to SpaceMonkey: So you didn't want this channel's suggestion placed there? I haven't personally kept up with every conversation (to add 

Yeah, totally, and there's no link, but I thought maybe paul was referencing his own issue board, but there's nothing there

_(2026-11-14T01:39:55Z `1570976542916350044`)_

So it's private, which is okay.

_(2026-11-14T01:40:10Z `1570976607617679523`)_

More so I'm reacting to what your LLM said

_(2026-11-14T01:41:23Z `1570976914334818387`)_

> ↳ replying to SpaceMonkey: So you didn't want this channel's suggestion placed there? I haven't personally kept up with every conversation (to add 

Of course - in my head I was thinking, you know, just take the "roadmap" channel alone and cross reference it with Deno's current issues. But I didn't explicitly say that, that's my bad.


**SpaceMonkey** — 2026-11-14T01:42:22Z (`1570977162964500541`)

You are right, my bad... My brain was overreaching. My fault.

_(2026-11-14T01:42:38Z, edited 2026-11-14T01:46:59Z `1570977228311765185`)_

Want me to ask the AI to remove the other ones? And cross-reference the remaining ones with Deno's current issues?


**daniellacosse** — 2026-11-14T01:46:21Z (`1570978163566059612`)

I mean - it's probably okay. I know messages aren't used to train Claude anyway and that was everyone's primary concern. Just double check with the group before ingesting people's info next time

_(2026-11-14T01:47:35Z `1570978471960776805`)_

Some of these issues are useful to keep - I can go through and curate them when I have time

_(2026-11-14T01:47:42Z `1570978503581769821`)_

Some are out of date

_(2026-11-14T01:47:56Z `1570978563354525818`)_

It definitely makes this easier overall

_(2026-11-14T01:48:26Z, edited 2026-11-14T01:48:47Z `1570978688596705321`)_

Some may also be rendundant with Deno issues, idk


**SpaceMonkey** — 2026-11-14T01:48:40Z (`1570978745299509334`)

> ↳ replying to daniellacosse: It definitely makes this easier overall

Nice... Sounds good; let me know if you would like any follow-ups.

_(2026-11-14T01:49:30Z `1570978954096025680`)_

> ↳ replying to daniellacosse: Some may also be rendundant with Deno issues, idk

Yeah, a future pass through their issues is probably worth the time.


**daniellacosse** — 2026-11-14T01:50:54Z, edited 2026-11-14T01:51:19Z (`1570979307235315857`)

As a (quick?) follow-up, it might be nice to ask Claude if any of the issues it created are actually redundant with ones that are open against Deno, that way I don't have to go through those


**SpaceMonkey** — 2026-11-14T01:53:52Z (`1570980056031826003`)

Sure... Do you want those issues removed from Dodo's project board, or should we be adding a reference to the Deno issues instead?


**daniellacosse** — 2026-11-14T01:54:13Z (`1570980141138452643`)

I think you can simply add those issues to the project board

_(2026-11-14T01:54:21Z `1570980177318514761`)_

And remove the old ones, yeah


**SpaceMonkey** — 2026-11-14T01:54:56Z (`1570980324815409303`)

Sure, I'll update you when I have the results. 🙂

_(2026-11-14T02:05:29Z `1570982976945397941`)_

<@400711308141658112> Done, here is its summary...

Three of the bot cards duplicated open Deno issues, so those Deno issues are now on the board in their place, and the duplicate cards are gone:
- **WebRTC** → denoland/deno#1612
- **Desktop: `will-navigate` event with preventDefault** → denoland/deno#36860
- **Desktop: verify the sender of binding messages** → denoland/deno#36861

They keep the same settings (Backlog, Priority, Size, Source = *bot suggestion*), so they show up in the same review filter.

None of the other 40 cards has an open Deno duplicate:
- Most are about Dodo itself: CI, releases, the roadmap, governance.
- TypeScript 7 is related to Deno's tsgo work (#36086, #35905) but not a duplicate. Those issues cover upstream's own migration, not Dodo's plan.
- Traversal-resistant file APIs match Ende's issue #6, not a Deno one.
- I found no Deno issue for Web MIDI, Web Audio, OPFS, Gamepad, or kernel sandboxing.

_(2026-11-14T02:07:59Z, edited 2026-11-14T02:08:39Z `1570983606787248198`)_

On the WebRTC thing... I have made a crazy amount of progress on this with my fork of webrtc-rs/rtc and my latest Deno fork (`denext.22`) which will hopefully be in releases in a few hours... https://github.com/Brainwires/deno/releases


**daniellacosse** — 2026-11-14T02:08:31Z (`1570983740254191738`)

I also found someone else had a webrtc implementation - yeah it's an obvious include

_(2026-11-14T02:08:45Z `1570983802308927549`)_

https://github.com/jeff-hykin/deno-webrtc

_(2026-11-14T02:10:28Z `1570984233139179651`)_

Thanks, I'll go through and triage these tickets soon. My weekend is going to be fairly busy


**SpaceMonkey** — 2026-11-14T02:11:35Z (`1570984514384040037`)

> ↳ replying to daniellacosse: https://github.com/jeff-hykin/deno-webrtc

Claude's comments on this project... `Takeaway: his library is the easy route for stock Deno or Dodo today, but needing --allow-ffi works against Dodo's permissions goals. Building it into the runtime fits Dodo's direction better. His server features are worth borrowing either way.`

_(2026-11-14T02:13:09Z, edited 2026-11-14T02:15:52Z `1570984909445791895`)_

Here is how the two compare... I can certainly take it to the next level, too, but it seems mostly finished. 🙂

_(2026-11-14T02:13:33Z `1570985008175386765`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1570985007890047077/image.png?ex=6af9be0d&is=6af86c8d&hm=f9ca57fc217d44020a36d1fec02f952ee8d1b131382e784ea744192cf02bc012&)

_(2026-11-14T02:19:57Z, edited 2026-11-14T02:20:02Z `1570986620210126851`)_

His has some nice server-side extras (shared UDP port, ICE-lite, raw RTP) worth borrowing, though. 🙂


**daniellacosse** — 2026-11-14T16:08:54Z, edited 2026-11-14T16:09:46Z (`1571195231762907137`)

<@634601287173931049> I genuinely kid you not, I had this really long dream where I met you in real life and we had a long talk about the importance of privacy. And then we went to, like, this hellish summer camp where kids had to pick teams and we ended up on the same team and I eventually yelled at all the other teenagers at the camp for being rude because I'm 35 apparently and I can do that now
