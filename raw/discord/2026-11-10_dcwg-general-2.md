---
title: "Discord #general — 2026-11-10"
source: "Discord REST API, channel 1558888938842624093, UTC timestamps"
channel_type: text
author:
  - "netop://ウィビ"
  - "𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素"
  - "CaptainLach"
  - "Summer"
  - "daniellacosse"
  - "hazel"
  - "davey"
  - "andy"
  - "Varad"
  - "SpaceMonkey"
created: 2026-11-10
description: "Append-only capture of #general from 2026-11-10T19:42:16Z to 2026-11-11T18:05:38Z, pulled from the Discord REST API. 70 messages, 10 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#general` in the Deno Core Working Group Discord, 2026-11-10T19:42:16Z to 2026-11-11T18:05:38Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**netop://ウィビ** — 2026-11-10T19:42:16Z (`1569799375704690828`)

Looks like Cloudflare had to pay out Deno's investors https://www.reddit.com/r/Deno/comments/1xp84j9/cloudflare_paid_approximately_265_million_usd_in/
[embed] Cloudflare paid approximately $26.5 million USD in cash for Deno Cloudflare disclosed the amount in its Form 10-Q filed with the SEC on November 5, 2026, under Note 16: Subsequent Events. The…

_(2026-11-10T19:42:34Z `1569799450686132385`)_

> Deno raised $26M, this was the minimal price for investors to agree to this.


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:08:02Z, edited 2026-11-10T21:08:54Z (`1569820960117231788`)

TIL `Deno.refTimer` actually expects `NodeJS.Timeout` instead of `number|NodeJS.Timeout`... their own documentation lied

_(2026-11-10T21:11:44Z `1569821891076685867`)_

my jaw dropped when `Deno.unrefTimer` did nothing when using the numeric timer ID returned by `setTimeout`


**netop://ウィビ** — 2026-11-10T21:12:29Z (`1569822078012756180`)

Deno is Node sugar


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:17:36Z (`1569823367949844501`)

true...

_(2026-11-10T21:22:12Z, edited 2026-11-10T21:38:53Z `1569824524546085087`)_

<https://github.com/ltgcgo/octavia/commit/1622ab96d71357f058986e9fa64b07b0c566398e>
did some plumbing to get rid of that


**netop://ウィビ** — 2026-11-10T21:35:51Z (`1569827959924195506`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: <https://github.com/ltgcgo/octavia/commit/1622ab96d71357f058986e9fa64b07b0c566398e> did some plumbing to get rid of that

LMAO
> Deno.(un)?refTimer that actually matches Deno's OWN documentation.

_(2026-11-10T21:35:54Z `1569827973719138346`)_

Very good


**CaptainLach** — 2026-11-10T21:40:13Z (`1569829059247210609`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: my jaw dropped when `Deno.unrefTimer` did nothing when using the numeric timer ID returned by `setTimeout`

Did you drop nodejs compat not fully, or how did you manage to end up with setTimeout returning number and incompatible unrefTimer?

There are two implementations of setTimeout, one provided by ext/web, and other provided by ext/node, and if you fully disable ext/node then Deno.unrefTimer does work

_(2026-11-10T21:40:49Z `1569829207566196847`)_

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: TIL `Deno.refTimer` actually expects `NodeJS.Timeout` instead of `number|NodeJS.Timeout`... their own documentation lied

It expects ReturnType<setTimeout> in implementation


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:43:06Z (`1569829782504349719`)

> ↳ replying to CaptainLach: Did you drop nodejs compat not fully, or how did you manage to end up with setTimeout returning number and incompatible 

basically added a middleman that forced `setInterval` and `setTimeout` to return the integer `[Symbol.toPrimitive]()` value in the returned `NodeJS.Timeout` object
the unwrapped integer works for `clearInterval` and `clearTimeout`, but not `Deno.(un)?refTimer` for some reason


**CaptainLach** — 2026-11-10T21:44:12Z (`1569830060196634794`)

I mean, deno impl is this and it works with both ext/node and ext/web
[attachment] image.png (https://cdn.discordapp.com/attachments/1558888938842624093/1569830059651633233/image.png?ex=6af58a6c&is=6af438ec&hm=b9811677a1a10e68c54f6145c1a0701ee188e7a5142ebba8b2d6ca8b8c571944&)

_(2026-11-10T21:45:34Z `1569830402594709575`)_

And ext/web always populates the activeTimers map

_(2026-11-10T21:47:10Z `1569830808372519003`)_

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: basically added a middleman that forced `setInterval` and `setTimeout` to return the integer `[Symbol.toPrimitive]()` va

You mean you written your own setInterval wrapper that returns object (not a number), but added toPrimitive?

_(2026-11-10T21:47:35Z `1569830913204818042`)_

Then the reason why it fails is that clearInterval performs webidl cast, but Deno.unrefTimer is not
[attachment] image.png (https://cdn.discordapp.com/attachments/1558888938842624093/1569830912810680542/image.png?ex=6af58b37&is=6af439b7&hm=aa9c3151b620674c0d0f5bdc26abe47e33880b03df2f202e513cab3abf6a250f&)


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:48:03Z (`1569831029760594011`)

> ↳ replying to CaptainLach: You mean you written your own setInterval wrapper that returns object (not a number), but added toPrimitive?

no

_(2026-11-10T21:48:43Z `1569831199008882860`)_

this is the code, added `console.debug` lines to make sure the two values match
[attachment] 7mxvhnbb.webp (https://cdn.discordapp.com/attachments/1558888938842624093/1569831198430208050/7mxvhnbb.webp?ex=6af58b7b&is=6af439fb&hm=2240be410f257581c3cd34940242cec814776f797acf3d4c28057044e4ef27aa&)


**CaptainLach** — 2026-11-10T21:49:25Z (`1569831371495702612`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: this is the code, added `console.debug` lines to make sure the two values match

Deno.unrefTimer does not call toPrimitive

_(2026-11-10T21:50:02Z `1569831529709048000`)_

clearInterval does, because browser spec developers for some reason thought that clearInterval should also accept string and other stuff and convert it to number first


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:50:27Z (`1569831633870131283`)

[attachment] 6drdnsh3.webp (https://cdn.discordapp.com/attachments/1558888938842624093/1569831633518067833/6drdnsh3.webp?ex=6af58be3&is=6af43a63&hm=2dab5f2608798cde4126f03dd1fedc95f70f982844da53fb32007180feb70fce&)
[attachment] b9bn53ns.webp (https://cdn.discordapp.com/attachments/1558888938842624093/1569831634046427176/b9bn53ns.webp?ex=6af58be3&is=6af43a63&hm=32455c3aa1bdea4ec4c36155afdec1b253acc6d21e9ab3cecfbc356646730dee&)


**CaptainLach** — 2026-11-10T21:51:20Z (`1569831854113300653`)

unrefTimer only means that the process should be able to exit if timer had not finished

_(2026-11-10T21:52:05Z `1569832042886205573`)_

And it does work fine
[attachment] image.png (https://cdn.discordapp.com/attachments/1558888938842624093/1569832042709909574/image.png?ex=6af58c45&is=6af43ac5&hm=bef965824e5293535ea2c04fc44e72e53cc99f8cfbf1677524aa8259a9b54580&)


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:52:17Z (`1569832093931016366`)

> ↳ replying to CaptainLach: Deno.unrefTimer does not call toPrimitive

uhh... why does `Deno.unrefTimer` not calling `toPrimitive` matter when Deno's own docs said the method accepts pure numbers, when on 2.9.8 the method failed when actual numbers from the unwrapped IDs are fed into the method?


**CaptainLach** — 2026-11-10T21:52:39Z (`1569832186390253570`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: uhh... why does `Deno.unrefTimer` not calling `toPrimitive` matter when Deno's own docs said the method accepts pure num

How did you unwrap it?


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:52:53Z, edited 2026-11-10T21:53:25Z (`1569832247698399275`)

> ↳ replying to CaptainLach: How did you unwrap it?

`NodeJS.Timeout[Symbol.toPrimitive]()`

_(2026-11-10T21:53:10Z, edited 2026-11-10T21:54:26Z `1569832315528675349`)_

that's the same value accepted by `clearTimeout` and `clearInterval`


**CaptainLach** — 2026-11-10T21:55:13Z (`1569832833147474063`)

I see, its deno authors who implemented NodeJS.Timeout[Symbol.toPrimitive]()

_(2026-11-10T21:55:39Z `1569832940287033446`)_

> that's the same value accepted by clearTimeout and clearInterval 
It is not, this is an index into another map

_(2026-11-10T21:56:59Z `1569833276410171514`)_

Web timers and numbers accepted by Deno.unrefTimer are indexes into this map
https://github.com/denoland/deno/blob/main/ext/web/02_timers.js#L37
[embed] deno/ext/web/02_timers.js at main · denoland/deno A modern runtime for JavaScript and TypeScript. Contribute to denoland/deno development by creating an account on GitHub.

_(2026-11-10T21:57:15Z `1569833346756772003`)_

However NodeJS timeout ids are https://github.com/denoland/deno/blob/main/ext/node/polyfills/internal/timers.mjs#L73C7-L73C19 this map
[embed] deno/ext/node/polyfills/internal/timers.mjs at main · denoland/deno A modern runtime for JavaScript and TypeScript. Contribute to denoland/deno development by creating an account on GitHub.

_(2026-11-10T21:58:35Z, edited 2026-11-10T21:58:41Z `1569833679637843989`)_

Web timers and node timers live in different namespaces, and Deno.unrefTimer does not expect that someone will use Timeout[toPrimitive] to get an id


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T21:59:52Z (`1569834003580583988`)

so where does the`number` in `id: number|NodeJS.Timeout` actually come from that can be retrieved by JS code?


**CaptainLach** — 2026-11-10T22:00:39Z (`1569834200230535291`)

From ext/web timers which are overridden by ext/node

_(2026-11-10T22:00:52Z `1569834254265880689`)_

You can use ext/web without ext/node when embedding after all 😄

_(2026-11-10T22:01:01Z `1569834294275215504`)_

But I do understand the confusion

_(2026-11-10T22:01:19Z `1569834366408982703`)_

Never thought that NodeJS timers had conversion to a number


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T22:02:02Z (`1569834548118949950`)

the return values of browser timers always had been numbers, Node.js returns timer objects instead


**CaptainLach** — 2026-11-10T22:03:45Z (`1569834979498922107`)

If you won't convert it to a number and use `ReturnType<typeof setTimeout>` everywhere then `Deno.unrefTimer` will work just fine, its the number conversion that's broken here, the timers should be in the same namespace for it to work like you expect it to

_(2026-11-10T22:04:15Z `1569835107987099871`)_

I'll prepare fix for dodo to unify those


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-10T22:06:13Z, edited 2026-11-10T22:06:40Z (`1569835600880869437`)

Ende removed the Node.js timer objects, so it also returns just web timer numbers, which can be successfully used by `Deno.unrefTimer` if that test script I wrote didn't have mistakes
the whole point of that compat layer I'm writing rn (the one in that commit) is to avoid relying on Node.js conventions, so forcing numbers is a must. looking forward to the fix in Dodo nonetheless


**Summer** — 2026-11-11T08:00:00Z (`1569985033421193277`)

I kinda wanna take just a javascript engine, and the start and end of the non-web apis like file access etc is IPC with other processes

`runtime --ext=stdio:runtime-stdio script.js`, or for permissioned access, `runtime --ext stdio:'runtime-stdio --rw ./some/folder' script.js`

_(2026-11-11T08:01:27Z, edited 2026-11-11T08:01:29Z `1569985396245266504`)_

and then the script can `import stdio from 'ext:stdio';`

_(2026-11-11T08:02:28Z `1569985651259215902`)_

with the ipc roughly following https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
[embed] Native messaging - Mozilla | MDN Native messaging enables an extension to exchange messages with a native application, installed on the user's computer. The native messaging serves the extensions without additional accesses over the web.


**daniellacosse** — 2026-11-11T10:25:43Z (`1570021701062889543`)

> ↳ replying to Summer: I kinda wanna take just a javascript engine, and the start and end of the non-web apis like file access etc is IPC with 

That's kinda the per-extension permissioning proposal we were circling around earlier. <@1136701682131144714> where did we land with that?


**Summer** — 2026-11-11T10:30:21Z (`1570022870627651665`)

> ↳ replying to daniellacosse: That's kinda the per-extension permissioning proposal we were circling around earlier. <@1136701682131144714> where did 

kind of, except my system allows writing extensions in bash 👍 this will cause no issues


**daniellacosse** — 2026-11-11T10:30:38Z (`1570022940987228293`)

> ↳ replying to Summer: kind of, except my system allows writing extensions in bash 👍 this will cause no issues

completely fine


**Summer** — 2026-11-11T10:32:29Z (`1570023404269076540`)

I'm going to have to try really hard to resurrect [shellshock](https://en.wikipedia.org/wiki/Shellshock_(software_bug))


**daniellacosse** — 2026-11-11T10:39:20Z (`1570025128157384764`)

down to [23 failing checks](https://github.com/are-we-dodo-yet/dodo/actions/runs/42963363171?pr=17) 😭 side note that a lot of these CI checks are still using node v20, we should fix that


**hazel** — 2026-11-11T11:21:23Z (`1570035711095341078`)

> ↳ replying to daniellacosse: down to [23 failing checks](https://github.com/are-we-dodo-yet/dodo/actions/runs/42963363171?pr=17) 😭 side note that a 

at least its down and not up :D


**daniellacosse** — 2026-11-11T11:36:59Z (`1570039636682604616`)

yep, chipping away at it

_(2026-11-11T11:38:41Z `1570040066041061437`)_

which, btw, anyone is welcome to push to that branch; i'm going back to sleep for now. no reason we can't

_(2026-11-11T11:38:44Z `1570040077462016030`)_

https://media.tenor.com/wmbc_Q_vVaYAAAAM/hammer.gif
[embed] https://media.tenor.com/wmbc_Q_vVaYAAAAM/hammer.gif

_(2026-11-11T11:39:04Z `1570040160542916679`)_

as long as we're coordinated about it


**davey** — 2026-11-11T12:35:09Z (`1570054276481552435`)

> ↳ replying to daniellacosse: down to [23 failing checks](https://github.com/are-we-dodo-yet/dodo/actions/runs/42963363171?pr=17) 😭 side note that a 

Yikes, node20 didn't get patched for the emudhra cert leak. Probably not a big deal for tests though.

_(2026-11-11T12:35:29Z `1570054357687337022`)_

Amazing progress getting the failing tests down!!

_(2026-11-11T12:47:21Z `1570057347781632105`)_

I could have a look at bumping from node20 over the next few days


**andy** — 2026-11-11T15:52:40Z (`1570103981856792670`)

> ↳ replying to daniellacosse: That's kinda the per-extension permissioning proposal we were circling around earlier. <@1136701682131144714> where did 

i did not end up finishing my experiment, i've gotten swept up with a whole lot of other things in life, we still don't have a clear answer

_(2026-11-11T15:53:32Z `1570104201063694357`)_

i'm probably not going to be super active in dodo for a while, but i will probably be a lot more active around christmas and thanksgiving


**daniellacosse** — 2026-11-11T16:46:25Z (`1570117509074526370`)

> ↳ replying to davey: I could have a look at bumping from node20 over the next few days

yeah normally i would pause and do it now but like you said, it's only tests

_(2026-11-11T16:48:28Z, edited 2026-11-11T16:55:03Z `1570118022994071596`)_

> ↳ replying to andy: i'm probably not going to be super active in dodo for a while, but i will probably be a lot more active around christmas

I hope everything's okay. please let us know if there's anything we can do to help

_(2026-11-11T16:55:06Z, edited 2026-11-11T16:55:42Z `1570119694734856364`)_

I've only been able to give roughly 25% myself given my own life circumstance _(which, btw, will likely be the case for the next 3-6months)_. but that's sort of the whole idea, you know? apes together strong. we have to find a way to be resilient as a community to what life throws at each of us individually


**netop://ウィビ** — 2026-11-11T17:26:25Z (`1570127576708685897`)

Sign of a dead server is constant spam. I just left the Deno Discord.


**andy** — 2026-11-11T17:28:58Z (`1570128215526219870`)

> ↳ replying to daniellacosse: I hope everything's okay. please let us know if there's anything we can do to help

yeah it's not anything wrong im just busy, and i still want to allocate time to personal projects (like my buidl system) alongside common-good projects (dodo)


**CaptainLach** — 2026-11-11T17:30:22Z (`1570128567730176143`)

> ↳ replying to daniellacosse: yeah normally i would pause and do it now but like you said, it's only tests

Its actually actions altogether, many github actions including checkout are written using nodejs


**daniellacosse** — 2026-11-11T17:31:26Z (`1570128837344493569`)

> ↳ replying to CaptainLach: Its actually actions altogether, many github actions including checkout are written using nodejs

it's not nodejs but the version, right?


**Varad** — 2026-11-11T17:36:36Z, edited 2026-11-11T17:36:45Z (`1570130138476056778`)

https://cloudflare.tv/shows/cloudflare-connect-2026/self-hosting-durable-objects/DZyXbOEa
[embed] Self-hosting Durable Objects - Cloudflare TV This session explores the architecture of celld, which allows you to self-host Cloudflare Durable Objects and Cloudflare Workers across many VMs. Learn how this relates to the Deno acquisition and the team’s nascent plans to bring this functionality...


**SpaceMonkey** — 2026-11-11T17:58:58Z (`1570135764631814307`)

Someone else posted and Reddit notified me… https://www.reddit.com/r/Deno/s/XTTkMazwNe 🙂
[embed] Dodo: Community-backed drop-in Deno successor, preserving Node.js/n... …and maybe the two can merge in the future

_(2026-11-11T18:02:24Z, edited 2026-11-11T18:02:33Z `1570136632030527591`)_

A reply speaks of "OpenDeno", I assume another fork... We should investigate if this is news here (it's news to me).


**netop://ウィビ** — 2026-11-11T18:05:38Z (`1570137442441371699`)

OpenDeno was created three days ago https://github.com/kanryu/opendeno-servo-boa/commits/main/
[embed] Commits · kanryu/opendeno-servo-boa An experimental Rust browser prototype combining Servo’s HTML rendering engine with Boa for sandboxed Deno-style script execution. - Commits · kanryu/opendeno-servo-boa
