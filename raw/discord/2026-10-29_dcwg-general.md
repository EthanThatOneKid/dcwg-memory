---
title: "Discord #general — 2026-10-29"
source: "Discord REST API, channel 1558888938842624093, UTC timestamps"
channel_type: text
author:
  - "Summer"
  - "paula"
  - "Soluble State"
  - "davey"
  - "daniellacosse"
  - "hazel"
  - "noisyspinach"
  - "𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素"
  - "andy"
  - "Ooker"
  - "Doctor 🤖"
created: 2026-10-29
description: "Append-only capture of #general from 2026-10-29T13:52:52Z to 2026-11-03T07:18:20Z, pulled from the Discord REST API. 35 messages, 11 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#general` in the Deno Core Working Group Discord, 2026-10-29T13:52:52Z to 2026-11-03T07:18:20Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**Summer** — 2026-10-29T13:52:52Z (`1565362790804492441`)

Separating out the topic of server/client message passing fun, it takes about 14 lines of code to display a webpage in GJS 🤔 unfortunately I want my gimmick to be more secure than deno's desktop feature so a lot more code setting up the web view to come

_(2026-10-29T13:54:43Z `1565363256271573143`)_

(and what with GtkWebKit already existing in Fedora Linux, that means its less than half a KB overhead for an app! for specifically Fedora Linux at least!)


**paula** — 2026-10-30T18:04:00Z (`1565788377721077791`)

tried fresh next on deno and it uses package.json and doesnt even work 😢

_(2026-10-30T18:04:05Z `1565788398101471273`)_

i'll keep on using fresh 2

\[system] 7 — 2026-10-30T19:38:18Z

**davey** — 2026-10-30T20:27:37Z (`1565824519380144190`)

> ↳ replying to paula: tried fresh next on deno and it uses package.json and doesnt even work 😢

Sad that they don't test against Deno 😮


**daniellacosse** — 2026-10-30T20:28:48Z, edited 2026-10-30T20:37:39Z (`1565824819587711077`)

> ↳ replying to Summer: Separating out the topic of server/client message passing fun, it takes about 14 lines of code to display a webpage in G

i'm not really a security expert - what are you having to harden?


**Summer** — 2026-10-30T20:32:01Z (`1565825626990968912`)

> ↳ replying to daniellacosse: i'm not really a security expert - what are you having to harden?

https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/ while full of Edge and Chrome specifics, it gives a good example of how very mundane features can quickly become problems. So its less a need to disable unused features, more of it all being a just-in-case kinda thing
[embed] The Last Proof of Human Craft: Forging a Microsoft Edge Full Chain ... This is what I built for Pwn2Own Berlin 2026 — a completely handmade, logic-only Microsoft Edge Full Chain, with no memory corruption, and no AI at all! 🔥
[embed] https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/
[embed] https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/
[embed] https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/

_(2026-10-30T20:36:50Z `1565826839937683599`)_

This all being said, https://www.electronjs.org/docs/latest/tutorial/security#checklist-security-recommendations of this set, 13 and 17 at the very least are impossible in deno deskop
[embed] Security | Electron A set of guidelines for building secure Electron apps

_(2026-10-30T20:39:37Z, edited 2026-10-30T20:40:17Z `1565827540092981379`)_

Deno network permissions do not apply to the webview of deno desktop neither iirc


**daniellacosse** — 2026-10-30T21:25:54Z (`1565839189139001528`)

> ↳ replying to Summer: https://blog.orange.tw/posts/2026-10-the-last-proof-of-human-craft-browser-full-chain/ while full of Edge and Chrome spe

ah yeah what's it called? principle of least privilege, or something?

i wonder to what extent it makes sense to have the extension system we've been discussing apply to the web view as well.

_(2026-10-30T21:26:41Z `1565839383985393897`)_

it kinda is and isn't the same thing? i.e. `dodo --ext=fetch`


**Summer** — 2026-10-31T04:37:03Z (`1565947691710808148`)

> ↳ replying to daniellacosse: ah yeah what's it called? principle of least privilege, or something?  i wonder to what extent it makes sense to have th

it is PoLP but I'd say its probably more Defense in Depth thing. For the webview permissions, probably implementing stuff like https://webkit.org/blog/3476/content-blockers-first-look/ is more likely to catch the 200 different ways that a resource can be reached: image loads, script loads, stylesheets, xhr, dns preloads, etc etc.

_(2026-10-31T04:37:39Z `1565947842437189777`)_

similar, loading a webextension into the webview could also help to enforce such things, mostly.

\[system] 7 — 2026-10-31T08:31:00Z

**hazel** — 2026-10-31T08:32:47Z (`1566007015837401132`)

gooooooood morning o/

\[system] 7 — 2026-10-31T10:47:00Z
_(2026-10-31T10:56:15Z `1566043121337376839`)_

doh tun


**noisyspinach** — 2026-10-31T10:58:55Z (`1566043791020920944`)

aah


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-02T13:33:46Z, edited 2026-11-02T13:33:48Z (`1566807534734540912`)

not sure if this is cursed
[attachment] IMG_20261102_133312_597.jpg (https://cdn.discordapp.com/attachments/1558888938842624093/1566807534260588704/IMG_20261102_133312_597.jpg?ex=6aeb343a&is=6ae9e2ba&hm=b7eb7d1c4e6cb1e1d13a978ce70e69567fdee7d77125c987f606db875686d468&)
[attachment] IMG_20261102_133313_593.jpg (https://cdn.discordapp.com/attachments/1558888938842624093/1566807534617108621/IMG_20261102_133313_593.jpg?ex=6aeb343a&is=6ae9e2ba&hm=65018c8fd228981991cc7342345ea7bf5271796a27cac631075a05d762f6d7ab&)

_(2026-11-02T13:34:15Z `1566807656541196330`)_

(tiny PoC)


**andy** — 2026-11-02T15:04:53Z, edited 2026-11-02T15:05:00Z (`1566830467657769123`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: not sure if this is cursed

worst of both worlds ahh


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-02T15:14:25Z (`1566832866531221557`)

XD


**Ooker** — 2026-11-02T17:34:41Z (`1566868166867427471`)

what exactly is this?


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-02T18:04:41Z (`1566875713435602989`)

forcing Deno APIs onto other runtimes

_(2026-11-02T20:25:35Z `1566911171783823655`)_

> ↳ replying to Ooker: what exactly is this?

```
Welcome to Node.js v20.19.2.
Type ".help" for more information.
> Deno.FsFile
[class LeafFsFile]
> Deno.version
LeafVersion {
  backend: 'Node',
  deno: '2.9.8',
  ende: undefined,
  engine: 'V8',
  flyLeaf: '0.0.1',
  typescript: undefined,
  v8: '11.3.244.8-node.38'
```
like this


**Ooker** — 2026-11-03T04:49:29Z (`1567037985570947225`)

So to have this happens, the program has to call another process, and the runtime (node, bun) has to take the stdout of the process, am I correct? At the first glance I thought that this is a security hole, but after elaborating the whole process I think that it's normal, right?


**Doctor 🤖** — 2026-11-03T05:24:57Z (`1567046909250769069`)

> ↳ replying to paula: has deno company/cloudflare said exactly what will happen to jsr? like the frontend is built on deno fresh all they said

From my understanding, some parts are being migrated to other stuff, some parts of Deno will continue to be maintained as their own individual thing.


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-03T06:04:08Z, edited 2026-11-03T06:05:03Z (`1567056771422486609`)

> ↳ replying to Ooker: So to have this happens, the program has to call another process, and the runtime (node, bun) has to take the stdout of 

you mean how I stuffed (a part of) Deno's API on runtines that don't have the Deno global? I just re-implemented the properties, classes and methods while attempting to delete the runtime-native globals

_(2026-11-03T06:05:43Z, edited 2026-11-03T06:07:00Z `1567057169189179537`)_

I remember there was an attempt called `@cross` that did similar things, but that project has been abandoned for quite a long time

_(2026-11-03T06:09:39Z, edited 2026-11-03T06:09:47Z `1567058159514947680`)_

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: not sure if this is cursed

(if that's not apparent, Node.js globals were also not available in these sessions)


**Ooker** — 2026-11-03T07:12:58Z (`1567074092211896411`)

> ↳ replying to 𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素: you mean how I stuffed (a part of) Deno's API on runtines that don't have the Deno global? I just re-implemented the pro

ah I see. So it's not really Deno runtime in here. I wonder if that has any benefit. Or is it just for fun?


**𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素** — 2026-11-03T07:16:11Z, edited 2026-11-03T14:16:43Z (`1567074901049741385`)

> ↳ replying to Ooker: ah I see. So it's not really Deno runtime in here. I wonder if that has any benefit. Or is it just for fun?

either as a contingency plan, or as a way to write code that "targets" a bunch of runtimes at once without really paying much attention

_(2026-11-03T07:17:36Z, edited 2026-11-03T07:29:06Z `1567075260296208445`)_

I picked this one up from the abandoned project I had around three years ago, because I now want to write automated checks to test if the same ESM behaves the same under different runtimes, or at least produces identical output

_(2026-11-03T07:18:20Z `1567075442601500714`)_

Node.js APIs are pure pain
