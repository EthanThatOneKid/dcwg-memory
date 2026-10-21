---
title: "Discord #propose — 2026-10-20"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "CaptainLach"
  - "andy"
  - "daniellacosse"
  - "Matthew"
  - "Varad"
created: 2026-10-20
description: "Append-only capture of #propose from 2026-10-20T23:22:06Z to 2026-10-21T16:36:51Z, pulled from the Discord REST API. 42 messages, 5 participants, across 5 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-20T23:22:06Z to 2026-10-21T16:36:51Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## [REWRITE] Rust-Core and Typescript Extensions (thread 1559219836297547847)

**andy** — 2026-10-21T01:40:05Z (`1562279278295650358`)

at long last

_(2026-10-21T01:40:10Z, edited 2026-10-21T01:40:12Z `1562279300441317499`)_

after fighting with the shitty tar crate

_(2026-10-21T01:40:18Z `1562279332506898536`)_

i can now load extensions into memory

_(2026-10-21T16:29:16Z `1562503046695755858`)_

we now have shitty scrappy extensions prototype

_(2026-10-21T16:29:24Z `1562503083345317999`)_

now i just need to add inter-container communication and proper FFI

_(2026-10-21T16:29:37Z `1562503135778578436`)_

because right now extensions can't even talk to user code

_(2026-10-21T16:29:43Z `1562503159983775766`)_

they can just add a prelude to user code


**CaptainLach** — 2026-10-21T16:29:58Z (`1562503224362008619`)

> ↳ replying to andy: now i just need to add inter-container communication and proper FFI

Use deno compatible ffi so dodo-bindgen works with that 😄


**andy** — 2026-10-21T16:30:29Z (`1562503352976146564`)

so the console extension right now is literally just a prelude that makes console.log call `extensionsRuntime.postMessage` (which isn't even properly done yet, which is why it just prints its input) 😭

_(2026-10-21T16:32:35Z `1562503881689272351`)_

> ↳ replying to CaptainLach: Use deno compatible ffi so dodo-bindgen works with that 😄

this is intended to be even more low level, so it's probably not gonna be deno compatible ffi. there will be an extension for deno ffi maybe, and if people want, maybe a polyfill in the extensions sdk, but right now the plan for ffi is that extensions will talk to native system APIs rather than talking via rust, so the sdk will provide a code-generator for native system api bindings based on a typescript config file (and maybe a standard library of really common native system apis)


**CaptainLach** — 2026-10-21T16:35:04Z (`1562504507865305229`)

I mean, deno ffi is already pretty low-level


**andy** — 2026-10-21T16:35:19Z (`1562504569710321736`)

yeah

_(2026-10-21T16:35:23Z `1562504585241690226`)_

but dodo-bindgen assumes a rust layer


**CaptainLach** — 2026-10-21T16:35:26Z (`1562504597761695765`)

It is just a wrappers over dlopen+dlsym+etc


**andy** — 2026-10-21T16:35:29Z (`1562504612789882994`)

gtg


**CaptainLach** — 2026-10-21T16:35:34Z (`1562504632226422845`)

> ↳ replying to andy: but dodo-bindgen assumes a rust layer

Nope, it doesn't

_(2026-10-21T16:35:47Z `1562504687633170444`)_

Ah, you mean for the target library

_(2026-10-21T16:36:02Z `1562504750895726725`)_

No, I was only meaning to implement Deno.dlopen method on your side

_(2026-10-21T16:36:30Z `1562504866897858601`)_

And then using this method it would be possible to use both system libraries and dodo-bindgen compiled ones

_(2026-10-21T16:36:51Z `1562504954634313739`)_

All dodo-bindgen wants is Deno.dlopen method

---

## Dodo Bencho's (thread 1559657749892300934)

**CaptainLach** — 2026-10-20T23:22:06Z, edited 2026-10-20T23:22:30Z (`1562244553153450014`)

https://are-we-dodo-yet.github.io/dodo/benches/ - the current results are from a temporary repo, now the CI will run on the primary one

---

## Continue developing Deno vs adding best features to Node.js (thread 1560790338480906290)

**Matthew** — 2026-10-21T03:51:50Z (`1562312434700779581`)

I think that trust is very important. Many large companies already trust Node.js which has a major organization behind it and many years track record. I think that it could be very difficult to convince large companies to switch to a fork of Deno if it has no formal structure / governance behind it and is just maintained by random volunteers who might abandon it in months.

_(2026-10-21T03:55:40Z `1562313399885496464`)_

My ideal option if possible would be for everything good about Deno to just be merged into Node.js so as many people as possible benefit and there is less fragmentation but there may be architectural differences that make this difficult.

_(2026-10-21T03:55:47Z `1562313429241434205`)_

If Deno has a fundamentally superior architecture then I think that it would be good for an organization like the OpenJSF to adopt Deno and continue the development and try to get as many people as possible to switch from Node.js to Deno.

_(2026-10-21T03:57:26Z `1562313844678856766`)_

Ideally we could get as many large companies as possible to start using Deno and hopefully contribute in some way so Deno can continue to be well supported and hopefully eventually replace Node.js.

_(2026-10-21T04:00:33Z `1562314627663011943`)_

Security is very important and one of the major benefits of Deno but I wouldn't trust a fork as much if it is just a side project from random volunteers. I would like to have large companies using it in production where they would have a strong incentive to keep it secure because they would have an a lot to lose if there were issues.


**andy** — 2026-10-21T04:50:19Z (`1562327151280136280`)

> ↳ replying to daniellacosse: It's generally cheaper at enterprise scale to layer more crap on, like Docker or Synk, than port your 100k+ line codebas

node is insecure with monitoring

---

## A "Killer App Framework" (thread 1562291277209411675)

**daniellacosse** — 2026-10-21T02:27:46Z (`1562291277209411675`)

I’ve tried to keep this as concise as I can so as not to be *too* overwhelming, which required me to skip parts and write simplified examples. Each layer of the proposal I'm less sure of than the last, and I would request we consider them in said order.

I’d thought about assembling a full prototype and can still do so, but realized that certain portions of this are blocked on in-flight explorations. Better to set it down and come back as the situation evolves.
[attachment] killer-framework.md (https://cdn.discordapp.com/attachments/1562291277209411675/1562291277758996511/killer-framework.md?ex=6ada1d62&is=6ad8cbe2&hm=29a730adfc1073104977d40807b9ce412e5f533d90f9c0e03b8bcf13e3a12b3e&)


**andy** — 2026-10-21T02:29:30Z (`1562291714926846186`)

how does this relate to the runtime?


**daniellacosse** — 2026-10-21T02:29:45Z, edited 2026-10-21T02:29:56Z (`1562291776755204109`)

'As discussed in General, I think we need to be coming up with ways to educate that “show don’t tell”, and one way to do that is to provide a fullstack framework that fully leverages our *runtimes* capabilities.'


**andy** — 2026-10-21T02:29:59Z (`1562291833831161979`)

ah


**daniellacosse** — 2026-10-21T02:30:04Z, edited 2026-10-21T02:36:55Z (`1562291854819459094`)

i should have said runtime there. can't edit the file now 😭

_(2026-10-21T02:31:06Z `1562292116976042036`)_

https://discord.com/channels/1558888938251223050/1558965777850302546/1561215631699873812

_(2026-10-21T02:32:08Z `1562292377681530951`)_

aaand
https://discord.com/channels/1558888938251223050/1558888938842624093/1560961855004868699


**andy** — 2026-10-21T02:32:21Z (`1562292431771275275`)

i see


**daniellacosse** — 2026-10-21T02:33:22Z, edited 2026-10-21T02:40:05Z (`1562292687040946247`)

so yeah. it's potential marketing, basically. it's not a framework that could exist outside of Dodo

_(2026-10-21T02:37:50Z, edited 2026-10-21T02:40:22Z `1562293809855856691`)_

> ↳ replying to andy: how does this relate to the runtime?

but it's certainly not a priority atm and for this reason i understand if we ignore this, just wanted to follow through

_(2026-10-21T02:44:07Z `1562295390617993308`)_

i failed to mention, type checking is possible with this approach

---

## per-package (module-level) permissions (thread 1562324423615184897)

**Varad** — 2026-10-21T04:39:29Z (`1562324423615184897`)

deno apply permissions apply to whole process if any app has -allow-net and --allow-read so every every dependency gets them too...

idea:
so packages declare what they need in their manifest
"permissions": {
  "read": ["./.cache"],
  "net": ["api.xyz.com"],
  "env": ["API_KEY"],
  "run": []
}
and package gets only what it declared and never more than the app was granted.

so next is that denials name the package : @x/xyz tried to read ~/.ssh/id_rsa not declared

and so on..

and I have some doubts and questions there.

most of my pain is that if package A passes a function or object to B then Whose permissions apply?

what if npm packages with no manifest ?


**andy** — 2026-10-21T04:49:49Z (`1562327025878962248`)

this is not viable, modules all share the same context, which means that code you call into can interfere with code that has higher permissions (e.g, prototype pollution, etc.)


**Matthew** — 2026-10-21T04:54:18Z (`1562328153836228760`)

It could be nice to be able to have a feature like this but it would probably be too complicated to be practical for normal things and would require something like having each module run in its own process and then communicating via some kind of serialized format like JSON between processes.


**Varad** — 2026-10-21T05:17:07Z (`1562333894802538587`)

i think  that https://github.com/LavaMoat/LavaMoat its Interesting to research ...
[embed] GitHub - LavaMoat/LavaMoat: tools for sandboxing your dependency graph tools for sandboxing your dependency graph. Contribute to LavaMoat/LavaMoat development by creating an account on GitHub.
