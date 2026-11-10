---
title: "Discord #general — 2026-11-10"
source: "Discord REST API, channel 1558888938842624093, UTC timestamps"
channel_type: text
author:
  - "killioiden"
  - "Ivory door"
  - "Summer"
  - "SpaceMonkey"
  - "daniellacosse"
  - "hazel"
  - "𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素"
  - "Ethan:Print\"Ethan\";:GoTo Ethan"
created: 2026-11-10
description: "Append-only capture of #general from 2026-11-10T08:18:18Z to 2026-11-10T18:12:36Z, pulled from the Discord REST API. 25 messages, 8 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#general` in the Deno Core Working Group Discord, 2026-11-10T08:18:18Z to 2026-11-10T18:12:36Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**killioiden** — 2026-11-10T08:18:18Z (`1569627248640655421`)

Will the Dodo implementation of JS/TS be the same as Deno's?

I am trying to say, there are small differences between NodeJS javascript and Deno javascript, for example sloppy imports and the override keyword. Will Dodo have any of those differences from deno?

\[system] 7 — 2026-11-10T10:41:13Z

**Summer** — 2026-11-10T14:43:16Z (`1569724127613423731`)

> ↳ replying to netop://ウィビ: I turned off Dependabot and CodeQL because they added too much noise.

its annoying that github made the actions system for those things to be far less noisy, but then they just make a bunch of noise anyhow. I used to run usercss to make github take up less space visually but... github is broken half the time anyhow these days

_(2026-11-10T14:45:57Z, edited 2026-11-10T14:46:48Z `1569724803793813696`)_

> ↳ replying to killioiden: Will the Dodo implementation of JS/TS be the same as Deno's?  I am trying to say, there are small differences between No

only thing listed for dodo's import approach at the moment is (other than fixes for bugs which prevent importing things) a request to support `bun:<package-name>` to make it easier to use code authored for bun

_(2026-11-10T14:48:20Z `1569725405680894004`)_

for the JS/TS in general, I'd imagine what with deno's focus on having browser-equivalent JS, at the current moment it'd be safe to assume that wouldn't change for dodo (especially with one of deno's big usecases being yt-dlp executing browser js)


**SpaceMonkey** — 2026-11-10T15:18:04Z (`1569732888021172394`)

> ↳ replying to killioiden: Will the Dodo implementation of JS/TS be the same as Deno's?  I am trying to say, there are small differences between No

Denext's fork of Deno will soon support all of Node 26. I'm targeting passing all of Node's runtime test suite; currently I'm at 72%, almost to the max (16–18% of the suite is out of reach by design). My current development branch is [train/denext18](https://github.com/Brainwires/deno/tree/train/denext18).

I know many of you don't fully trust this fly-by-wire (piloting term), AI-driven, AI-audited, rapid development that I'm experimenting with; and I get it, but I'm convinced AI can competently complete the tasks I'm asking it to do.  What I would like to propose is that the Dodo fork use the work I've done by cherry-picking my fork based on this project's shared needs. My design approach works great for an autistic, introverted GenX software engineer (with a ton of back-knowledge) that still needs a creative outlet. One person making all the decisions can make adopters uneasy... But it's my generation's calling card; if you want it done right, do it yourself. 🙂

I have 308 patches (up 22 in just two days) documented in the latest [DENEXT.md](https://github.com/Brainwires/deno/blob/train/denext18/DENEXT.md).


**daniellacosse** — 2026-11-10T16:29:26Z (`1569750847091380378`)

> ↳ replying to SpaceMonkey: Denext's fork of Deno will soon support all of Node 26. I'm targeting passing all of Node's runtime test suite; currentl

Would you be willing to start with curating a list of changes that you think align with the community's vision for Dodo? We could decide which are applicable and then review the PRs. As long as they're not, like, meaningful 10k line changes, or whatever.

_(2026-11-10T16:30:13Z, edited 2026-11-10T16:30:22Z `1569751043787456565`)_

> ↳ replying to Summer: for the JS/TS in general, I'd imagine what with deno's focus on having browser-equivalent JS, at the current moment it'd

In fact, I think we can lean into this even harder. There are plenty of browser APIs that are still not supported.


**hazel** — 2026-11-10T16:31:31Z (`1569751370053984300`)

as only a user i like how deno works right now and i'd like something that just continues to work yk
the node compatibility stuff is nice and like the Deno stdlib and other than that i dont relaly use many fancy deno features (except for, ofc, deno install, run, add, etc). its basically just a better node for me and i like it that way


**SpaceMonkey** — 2026-11-10T16:31:48Z (`1569751443903094980`)

> ↳ replying to daniellacosse: Would you be willing to start with curating a list of changes that you think align with the community's vision for Dodo?

Yeah, I can certainly work on that curated list. Where are we keeping Dodo project goals?


**daniellacosse** — 2026-11-10T16:31:57Z (`1569751481244979290`)

> ↳ replying to hazel: as only a user i like how deno works right now and i'd like something that just continues to work yk the node compatibil

That's mostly where we want Dodo to land

_(2026-11-10T16:32:22Z `1569751583942512651`)_

> ↳ replying to SpaceMonkey: Yeah, I can certainly work on that curated list. Where are we keeping Dodo project goals?

<#1560371677127381232> , but it could probably use an update

_(2026-11-10T16:33:38Z `1569751905293570140`)_

let me tweak it, i need to shower first

_(2026-11-10T16:35:18Z, edited 2026-11-10T16:35:26Z `1569752323645771848`)_

at this point I think basically <@178483185468833793> is the one who really knows the codebase and has been doing incredible maintenance work - I'm currently trying to learn the cb while renaming the binary and get a release CI working (the current one assumes access to urls we don't own)


**Summer** — 2026-11-10T16:35:46Z (`1569752442835304501`)

I do wish deno allowed full header control for fetch, it was so unfortunate that they mandated the user agent header


**daniellacosse** — 2026-11-10T16:35:49Z, edited 2026-11-10T16:36:23Z (`1569752453174263969`)

as well as learning rust on top of that. but all PRs are welcome. happy to review anything (within reason)

_(2026-11-10T16:37:39Z `1569752913255997545`)_

I'm only able to really give partial focus to this currently so I'm in a better position to help coordinate and review code, but getting a build out is obviously essential


**SpaceMonkey** — 2026-11-10T17:09:52Z (`1569761021642412225`)

> ↳ replying to Summer: I do wish deno allowed full header control for fetch, it was so unfortunate that they mandated the user agent header

I've added this to the project board as well; there will be a few headers restricted for security reasons. 🙂

_(2026-11-10T17:10:07Z `1569761085614067783`)_

> ↳ replying to daniellacosse: Would you be willing to start with curating a list of changes that you think align with the community's vision for Dodo?

https://gist.github.com/nightness/8f9f592795a13fdaf4d8a40f8de6533f

_(2026-11-10T17:13:32Z, edited 2026-11-10T17:14:10Z `1569761945806966807`)_

A couple of those look a bit large still... I'm trying to stay bleeding edge on the Typescript... Right now using the Go TypeScript 7. But I really want to switch to https://github.com/pingdotgg/ts-rust after it's a bit more mature.


**daniellacosse** — 2026-11-10T17:23:33Z, edited 2026-11-10T17:26:56Z (`1569764466621677598`)

> ↳ replying to SpaceMonkey: A couple of those look a bit large still... I'm trying to stay bleeding edge on the Typescript... Right now using the Go

I just updated <#1560371677127381232> - let's first see what everyone thinks, then you can update your gist to match

_(2026-11-10T17:23:50Z `1569764537916199004`)_

\[no text content]

_(2026-11-10T17:23:51Z `1569764540680241213`)_

How do we feel about this?


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T17:50:11Z, edited 2026-11-10T17:52:54Z (`1569771169828180100`)

no objections here


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-11-10T18:12:36Z (`1569776808713392229`)

in today's news (speculation): https://x.com/etok_me/status/2120217494690689122?a=9Sz7DqZQkxr1F6sE33Y&s=20
[embed] https://twitter.com/etok_me/status/2120217494690689122?a=9Sz7DqZQkxr1F6sE33Y&s=20 Val Town is the first major @deno\_land\-native product I’ve seen shut down\.

Given the funding landscape for dev tools right now, I expect they won’t be the last\. End of an era for a really slick piece of tech\.

Looking forward to what @stevekrouse builds next\!
