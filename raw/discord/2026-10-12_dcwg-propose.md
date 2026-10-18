---
title: "Discord #propose — 2026-10-12"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "andy"
  - "Flying Mindz | Jannick"
  - "davey"
  - "daniellacosse"
  - "CaptainLach"
  - "Ethan:Print\"Ethan\";:GoTo Ethan"
  - "strmnn"
  - "w"
  - "Sandeep Kumar Kuanar✌🏼"
  - "Pierrot"
  - "netop://ウィビ"
  - "Broglah"
  - "Ooker"
  - "Matthew"
  - "hajime_san"
created: 2026-10-12
description: "Append-only capture of #propose from 2026-10-12T15:02:57Z to 2026-10-18T19:09:33Z, pulled from the Discord REST API. 180 messages, 15 participants, across 5 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-12T15:02:57Z to 2026-10-18T19:09:33Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## [REWRITE] Rust-Core and Typescript Extensions (thread 1559219836297547847)

**andy** — 2026-10-12T15:02:57Z (`1559219836297547847`)

This is a pretty popular idea, so I figure I might as well formalize it.

The idea is to have a very minimal Rust-based loader to the runtime, which handles permission management, and inter-component communication, and then have a component for user code (a JavaScript context), and several components for extensions (more JavaScript contexts).

Extensions would be able to load system libraries and interface with them directly, as well as inject setup code into the user code process.

Extensions would also have a build step to bundle them, as to keep the Rust core truly tiny.

An extension will also probably handle the CLI entrypoint.

Thoughts?


**Flying Mindz | Jannick** — 2026-10-12T15:36:58Z (`1559228395513184450`)

On a technical level I can’t argue. But I do not see how a technical shift or rewrite helps us solve the actual problem.


**daniellacosse** — 2026-10-12T16:34:37Z, edited 2026-10-12T16:49:49Z (`1559242902255837316`)

Worth pointing out, the initial "get everything into the same repo so it's not a tangled mess" aligns with this - once well organized, supporting extensions will become a lot easier, and seems necessary besides


**andy** — 2026-10-12T17:45:46Z (`1559260809400557660`)

> ↳ replying to Flying Mindz | Jannick: On a technical level I can’t argue. But I do not see how a technical shift or rewrite helps us solve the actual problem.

it lets us solve the issue of everyone having different wants of what dodo should be, by allowing for customization


**daniellacosse** — 2026-10-12T17:46:29Z, edited 2026-10-12T17:47:33Z (`1559260990397218969`)

I think his concern is about the rewrite aspect, not the adding-of-the modularity?


**andy** — 2026-10-12T17:48:29Z (`1559261491935445105`)

That's true, we should definitely have a fork as a safety net, and maybe switch to a rewrite as a sort of 'dodo v2', because in the long run, deno's codebase has a very strange architecture


**daniellacosse** — 2026-10-12T17:50:50Z (`1559262085622399057`)

Forking is definitely the fastest way to get our footing, but yeah, doesn't necessarily rule out other options

_(2026-10-12T23:40:59Z `1559350203528781977`)_

https://discord.com/channels/1558888938251223050/1558888938842624093/1559339391913300110


**andy** — 2026-10-13T00:00:11Z (`1559355035069194261`)

given my inexperience with rust and v8, i'm going to prototype the initial version of this in another language, still using v8, just to see how well it works, and understand v8, and then eventually move to rust


**daniellacosse** — 2026-10-13T00:01:06Z (`1559355266401828967`)

i'm curious to hear how difficult redoing the bindings is


**andy** — 2026-10-13T00:03:03Z (`1559355754442653717`)

the borrow checker was being mean to me

_(2026-10-13T15:00:55Z `1559581712839745690`)_

i'll probably use zig for the initial prototype

_(2026-10-13T15:01:07Z `1559581762047180902`)_

partially because it doesn't fight you about memory management, it just kinda trusts you

_(2026-10-13T15:01:13Z `1559581787028586567`)_

partially because it has a really nice build system

_(2026-10-13T15:01:46Z `1559581925583101973`)_

and partially to gently poke fun at bun


**daniellacosse** — 2026-10-13T15:01:59Z (`1559581978284523521`)

that would certainly be funny

_(2026-10-13T15:03:42Z `1559582412160245851`)_

(btw im a bit busy with family stuff this week, so i can't code too much until that's done)


**CaptainLach** — 2026-10-13T15:20:39Z (`1559586675490033756`)

> partially because it doesn't fight you about memory management, it just kinda trusts you
But rust doesn't fight with you, it just keeps you from shooting yourself in the foot ever again
You would have the same problems in zig, they just would be invisible until some point


**daniellacosse** — 2026-10-13T15:28:45Z (`1559588714357981345`)

This is totally accurate, but I do think the direct v8 understanding is valuable and if this gets @andy there faster that's great. I would prefer we all get better at rust, but in my mind that's the next push after the initial fork is stable


**andy** — 2026-10-13T16:11:51Z (`1559599560324546673`)

> ↳ replying to CaptainLach: > partially because it doesn't fight you about memory management, it just kinda trusts you But rust doesn't fight with y

Rust keeps you safe, but it also can be a bit overbearing, it forces you to prove safety to the compiler, rather than to humans, it does fight with you a little bit, perhaps for the better, but for a prototype I just want to get something down

_(2026-10-15T01:04:10Z `1560095910128787487`)_

yay i finally got custom rust functions to work
[attachment] image.png (https://cdn.discordapp.com/attachments/1559219836297547847/1560095909792981023/image.png?ex=6ad6154a&is=6ad4c3ca&hm=30af73392ce77cd2a47b6416f705fd454acd766d9e38dcee3f2afcff8aff1c49&)

_(2026-10-15T15:47:21Z `1560318170311557134`)_

extremely bare-bones event loop
[attachment] image.png (https://cdn.discordapp.com/attachments/1559219836297547847/1560318170147856474/image.png?ex=6ad63b89&is=6ad4ea09&hm=d192eb522b6221bf1a67696164dc4929c5d347848b8ca766bddcbe6ebbc5025a&)


**daniellacosse** — 2026-10-15T17:10:24Z (`1560339072545853553`)

how's your cold start?


**andy** — 2026-10-15T17:58:26Z (`1560351159753908366`)

good question, i haven't checked yet lol

_(2026-10-16T00:31:05Z `1560449974578192535`)_

btw this is now available on github as https://github.com/are-we-dodo-yet/dodo-x
[embed] GitHub - are-we-dodo-yet/dodo-x: an experment with a modular archit... an experment with a modular architecture for dodo. Contribute to are-we-dodo-yet/dodo-x development by creating an account on GitHub.

_(2026-10-16T00:31:13Z `1560450009198235742`)_

its very incomplete

_(2026-10-16T00:31:20Z `1560450036326862922`)_

the extensions sdk is taking a little bit


**daniellacosse** — 2026-10-16T01:12:21Z, edited 2026-10-16T01:21:33Z (`1560460358575988877`)

no it's awesome. I stopped tinkering with my own implementation since you've been killing it

_(2026-10-16T01:12:41Z, edited 2026-10-16T01:21:44Z `1560460443984863325`)_

maybe it makes sense for you to give an informal presentation on what you've learned when you're feeling good about it


**andy** — 2026-10-16T01:21:49Z (`1560462739556802681`)

yeah totally

_(2026-10-16T20:48:56Z `1560756455328583721`)_

extensions sdk CLI is working, now i need to run extensions at runtime

_(2026-10-16T20:49:04Z `1560756489147261061`)_

hopefully will be able to do that today, may be busy for a few hours


**CaptainLach** — 2026-10-17T12:02:15Z (`1560986299706376303`)

What if we rename it from dodo-x to something different to not confuse people?..
I understand this is just an experiment, but as long as it is unable to use extensions from dodo/deno itself I don't think it should hold such name


**andy** — 2026-10-17T14:24:48Z (`1561022174305984643`)

what are you thinking?

_(2026-10-18T00:49:10Z `1561179301800317029`)_

no progress will be made for a few days

_(2026-10-18T00:49:12Z `1561179310763548734`)_

i am playing silksong


**CaptainLach** — 2026-10-18T00:51:45Z (`1561179950311014402`)

Btw, for user extensions, deno has built-in ffi thingy. I already used it in several projects, but what we really should have is https://github.com/denoland/deno_bindgen
This repo is very old and doesn't work, and how it did work was very wrong

There was a fork of this thing: https://github.com/kzha0/deno-bindgen2

And it did work, but the code is utter ass.

I have forked it and will try to get it to usable state here: https://github.com/are-we-dodo-yet/dodo-bindgen

_(2026-10-18T01:03:36Z `1561182933753004184`)_

The first thing I want to do with this is to replace -rust-ir crate and source code parsing with uniffi-like approach, where macros generates some symbols in the binary, that can be extracted and parsed to produce an actually usable code

---

## Sustainability idea - cloud hosting (thread 1559236057663414383)

**davey** — 2026-10-12T16:07:25Z (`1559236057663414383`)

Does anyone have an aim to keep a fork sustainable in the long run. 

I'm bothered that a solo dev might burn out after a while, then we are back to square 1.

Any thoughts on making sure a team is fairly compensated for their hard work?

Setting up sponsorship?

One crazy idea that I had was that we could form a small team and sell a cloud solution. Not so far from Deno deploy, bit also runtime agnostic. So demo first class citizen, but also support for others - a bit like heroku.

That could fund development. 

Is that just an awful idea, and would dilute the main goals of a fork?

\[system] 4 — 2026-10-12T16:08:05Z

**daniellacosse** — 2026-10-12T16:11:30Z (`1559237087574626404`)

So, I used to work on outlinevpn, which was successfully coverted into a foundation and collects donations to survive:  https://github.com/OutlineFoundation/outline-apps


**CaptainLach** — 2026-10-12T16:11:53Z (`1559237183913725966`)

I don't think cloud solution is sustainable at all, because it requires a lot of trust, and even on the scale of deno they were unable to turn it profitable

I think opencollective sounds better for the start


**daniellacosse** — 2026-10-12T16:12:54Z, edited 2026-10-12T17:43:20Z (`1559237439078535191`)

Yah, opencollective or something like it is definitely the easiest. But I'll be getting in touch with the folks that helped us foundationalize as well as a backup


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-12T16:13:28Z (`1559237582171406466`)

https://void.cloud/guide/deployment
[embed] Deployment | Void Build and deploy full-stack Vite apps at warp speed


**CaptainLach** — 2026-10-12T16:14:51Z, edited 2026-10-12T16:15:10Z (`1559237928415137793`)

Opencollective also allows to set bounties and stuff for contributors, which is again would be most useful in the beginning


**strmnn** — 2026-10-12T16:16:01Z (`1559238222155096185`)

i wish they would make deno deploy open source, the interface is so nice


**davey** — 2026-10-12T16:18:24Z (`1559238820858167309`)

OK so no cloud. Good potential for sponsorship though. Nice


**Pierrot** — 2026-10-13T06:34:54Z (`1559454366359101512`)

How about reaching to corporate that currently use deno? Like supabase or netlify .


**daniellacosse** — 2026-10-13T13:51:50Z (`1559564324849319992`)

Yeah, I think we need a little more first, but that's part of what I'm thinking. @wbk also made this list https://discord.com/channels/1558888938251223050/1558901532370542714/1558905623792455731


**netop://ウィビ** — 2026-10-13T15:23:36Z (`1559587417235792023`)

With cloud hosting you're competing with existing cloud providers. Gel had this same issue. They tried to push their hosted Gel Cloud but someone like me would never use that, I've written a couple tutorials on how to self-host instead. So, you'd be competing with people who have the know-how or at least the determinedness to trudge through and figure it out.

_(2026-10-13T15:25:24Z `1559587873483788309`)_

I do think it's worth having though, if you can convince enterprise-level folks that Dodo Cloud (oh that sounds like a nice domain) is THE best option on the market...mainly, because you can tout the focus and expertise versus other cloud providers merely having Dodo as an _option among many_.

_(2026-10-13T15:27:08Z `1559588306453528718`)_

`dodo.cloud` was registered years ago, womp.


**Broglah** — 2026-10-13T18:40:25Z (`1559636948165988442`)

> ↳ replying to Pierrot: How about reaching to corporate that currently use deno? Like supabase or netlify .

Or reach out to Neon

Use Neon with Deno Deploy - Neon Docs https://neon.com/docs/guides/deno
[embed] Use Neon with Deno Deploy - Neon Docs Deno Deploy is a scalable serverless platform for running JavaScript, TypeScript, and WebAssembly at the edge, designed by the creators of Deno. It simplifies the deployment process and offers automat...

_(2026-10-13T18:41:00Z `1559637095411359807`)_

Databricks owns it


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T18:41:52Z (`1559637315297611807`)

> ↳ replying to Broglah: Or reach out to Neon  Use Neon with Deno Deploy - Neon Docs https://neon.com/docs/guides/deno

fwiw iirc the Turso team used Deno and they recently got aquihired too


**Ooker** — 2026-10-16T05:51:04Z (`1560530498617606185`)

> ↳ replying to CaptainLach: I don't think cloud solution is sustainable at all, because it requires a lot of trust, and even on the scale of deno th

What kind of trust do customers need? For me just the price and convenience are enough for me. I guess most people just need that as well


**daniellacosse** — 2026-10-17T00:01:38Z (`1560804951062609961`)

> ↳ replying to Ooker: What kind of trust do customers need? For me just the price and convenience are enough for me. I guess most people just 

I'd recommend going to talk to some and report back. Security is a big one you didn't mention, I imagine

---

## Rust Academy? (thread 1559251707228192778)

**daniellacosse** — 2026-10-12T17:09:36Z (`1559251707228192778`)

Seems we're leading with a fork - I've noticed a lot of people mentioning their experience with rust is limited, myself included. How can we collectively upskill?

_(2026-10-12T17:31:44Z, edited 2026-10-12T17:32:21Z `1559257277649649685`)_

It's probably good to get a bit more information on skill level. Personally I'm not completely green, but mostly - i've read the book, done a tutorial, and am prototyping a separate runtime both as a hedge and a learning experience. so it's less clear to me where to go after that

<@1136701682131144714> maybe some sort of async hackathon on top of <@178483185468833793> 's fork would be a good idea. would also get a bunch of people more familiar with the CB

_(2026-10-12T17:33:08Z `1559257630327709697`)_

we should also probably note in the server somehow the people who know rust and the CB well


**andy** — 2026-10-12T17:44:56Z (`1559260597621882931`)

What is the CB?


**w** — 2026-10-12T17:44:59Z (`1559260611160969310`)

I'm not completely green, I've read the book, probably written 500k loc of rust between personal and professional projects over eight or nine years. I can _usually_ realize if I'm using the wrong idiom.

I like the hackathon idea. Maybe we can collectively come up with a list of concepts that, holistically, we consider important to understand in order to grok the cb as well.

_(2026-10-12T17:45:01Z `1559260619755094130`)_

codebase?


**daniellacosse** — 2026-10-12T17:45:03Z, edited 2026-10-12T18:27:47Z (`1559260628617535610`)

sorry, short for codebase. my corporate is showing


**andy** — 2026-10-12T17:45:05Z (`1559260634846068810`)

ah


**CaptainLach** — 2026-10-12T17:46:08Z (`1559260899066384507`)

I would consider writing your own runtime based on deno_core an useful exercise, unfortunately is is more annoying that it might seem because of all the version mismatches


**w** — 2026-10-12T17:46:27Z (`1559260978892242987`)

Yeah there's so much that needs to be in lock step


**CaptainLach** — 2026-10-12T17:46:57Z (`1559261107561168977`)

(That's another reason why I consider making deno a monorepo a good idea)


**andy** — 2026-10-12T17:47:27Z (`1559261231125373018`)

I'll be asynchronously working on a rewrite while you guys work on adapting the current deno codebase, we can convene and decide which is a better approach after a while.


**daniellacosse** — 2026-10-12T20:00:00Z (`1559294591763484683`)

<@1258271039679369237> we were just discussing here how best to learn - how much rust exposure do you have currently?


**w** — 2026-10-12T20:02:28Z (`1559295212159901829`)

<@400711308141658112> a good initial litmus test here would be solving for how much of a nightmare dynamic libs are in Rust, also.  Gating extensions on feature flags, but statically compiling them in might be pretty easy, though.


**CaptainLach** — 2026-10-12T20:04:24Z (`1559295696304078911`)

...Improving the UX of building your own runtime based on deno might do as well, because right now it takes too much code to wire everything up together


**w** — 2026-10-12T20:06:02Z (`1559296106532438117`)

that said, if extensions are dynamic, adopt C abi, some sort of manifest, eventually you've got a [napi](https://napi.rs/docs/introduction/getting-started)

_(2026-10-12T20:06:17Z `1559296171304943857`)_

or at least replicate a big chunk of it

_(2026-10-12T20:06:59Z `1559296348250050641`)_

there might be some value there, though -- rusty_v8 ain't so bad, so something like napi which moves in lock step to _it_ has value


**daniellacosse** — 2026-10-12T20:07:37Z, edited 2026-10-12T20:08:36Z (`1559296508673921085`)

yeah, fyi, my prototype is using rusty_v8 directly, which has committed LTS, unlike deno core - i'll review napi, tysm for the pointer


**CaptainLach** — 2026-10-12T20:07:55Z (`1559296582204133457`)

It is also worth considering if some stuff really needs to be a proper deno extension, or if it would be enough to improve ergonomics of writing Deno.dlsym-based stuff


**daniellacosse** — 2026-10-12T20:09:09Z (`1559296892083376207`)

kind of a product decision, I guess

_(2026-10-12T20:09:18Z `1559296930675298395`)_

which, I don't think we're at that layer yet


**CaptainLach** — 2026-10-12T20:43:07Z (`1559305439936778300`)

Also, regarding stripping some stuff from deno, upstream already considered downgrading some stuff to typescript, so it does not require as much maintenance, e.g they did that with kv:
https://github.com/denoland/deno/pull/33327
[embed] refactor(ext/kv): pure JS implementation of Deno.openKv() API by ba... Summary
Prototype reimplementation of the Deno KV API in pure JS/TS, aiming to replace the Rust ops layer and 3 external denokv_* crate dependencies with self-contained TypeScript modules.
New file...


**w** — 2026-10-12T20:50:00Z (`1559307171764768809`)

That's fair -- but #[op2] with serde_v8 in my experience is sloooow, so in the kv case it might just be efficient v8 object primitives vs less-efficient rust interop

_(2026-10-12T20:51:32Z `1559307556504084622`)_

the low-maintenance argument is a good one, though


**CaptainLach** — 2026-10-12T20:51:35Z (`1559307569686642754`)

...At the same time, when the intended target for such stuff is network, does this overhead really matter?


**w** — 2026-10-12T20:51:48Z (`1559307627467374745`)

> ↳ replying to CaptainLach: ...At the same time, when the intended target for such stuff is network, does this overhead really matter?

nope

_(2026-10-12T20:52:07Z `1559307704340582462`)_

color me surprised it was ever op-supported to begin with, really


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T20:53:32Z (`1559308062387470357`)

> ↳ replying to daniellacosse: <@1258271039679369237> we were just discussing here how best to learn - how much rust exposure do you have currently?

I have Completed 19 chapters from the book + Nearly all of Rustlings 2 or 3 remaining. 
I have made the tutorial project, that `grep`-like projects made on. 

Basically, I am a complete beginner.

_(2026-10-12T20:56:42Z `1559308856754970625`)_

> ↳ replying to daniellacosse: we should also probably note in the server somehow the people who know rust and the CB well

what is CB?


**w** — 2026-10-12T20:56:48Z (`1559308884626116609`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I have Completed 19 chapters from the book + Nearly all of Rustlings 2 or 3 remaining.  I have made the tutorial project

codebase*


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T20:57:00Z (`1559308933359996989`)

> ↳ replying to w: codebase*

yeah

_(2026-10-12T20:57:06Z `1559308957389037650`)_

not thing but codebase

_(2026-10-12T20:57:13Z `1559308987147616458`)_

to get a feel of Rust.


**w** — 2026-10-12T20:57:25Z (`1559309039127630007`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I have Completed 19 chapters from the book + Nearly all of Rustlings 2 or 3 remaining.  I have made the tutorial project

What's your background look like outside of Rust?


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T20:58:32Z (`1559309322066853979`)

Python, and I used C for a DSA course. Building structures in pure C.

_(2026-10-12T20:58:55Z `1559309417684537357`)_

I hated C++, but I wanted to contribute to Deno. So I picked up Rust for the task.


**w** — 2026-10-12T20:59:04Z (`1559309454510653553`)

Ah, currently in undergrad?


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T20:59:36Z (`1559309588887511083`)

> ↳ replying to w: Ah, currently in undergrad?

Yeah. I am a physics undergrad, who has fascination of CS, and I am learning CS bit by bit.

_(2026-10-12T21:00:06Z `1559309713663991911`)_

I am currently settling on the languages and doing basic DSA. 
I haven't went crazy deep into compilers and all.

_(2026-10-12T21:00:45Z `1559309875966644369`)_

Genuinely I am a beginner when it comes to such a big project, I never had any experience in anything remotely close to this.


**w** — 2026-10-12T21:02:56Z (`1559310429249998920`)

In my experience, enough hunger is kind of enough, as long as someone around is motivated enough to provide the right mentorship.

I applaud the speedrunning of rust you're doing, and you should keep doing it, but keep in mind that these things take time, and a lot of the decisions right now _here_ are probably going to be judged more by taste than functionality.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:03:39Z (`1559310609512792136`)

> ↳ replying to w: In my experience, enough hunger is kind of enough, as long as someone around is motivated enough to provide the right me

I see. That's a very good point.

_(2026-10-12T21:03:50Z `1559310652319866883`)_

I am giving it time.

_(2026-10-12T21:03:54Z `1559310670158364673`)_

I am not rushing it.

_(2026-10-12T21:04:29Z `1559310818519031919`)_

Okay! I am motivated to keep going. Okay! You know Rust ahead of me, right? Can you guide me on this?

_(2026-10-12T21:05:10Z `1559310988384407582`)_

For now, I am keeping this on the eye. 
https://roadmap.sh/rust
[embed] Learn to become a Rust developer Step by step guide to becoming a Rust developer in 2026

_(2026-10-12T21:06:00Z, edited 2026-10-12T21:06:41Z `1559311200372916258`)_

I am keeping this as a Roadmap. As I don't have anything specifically aligned to Deno contribution roadmap yet. I am loving it. Rust feels like a natural way for me to do things to be honest. I am looking forward if you can help me. In anyway. Calibrating me into a proper path.


**w** — 2026-10-12T21:06:37Z (`1559311353884450829`)

that's _kind_ of useful, but imo it starts to go off the rails at about the 60% mark -- no reason to understand all of those different crates, except, for, maybe 70% of them, knowing they exist


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:06:54Z (`1559311424050831533`)

> ↳ replying to w: that's _kind_ of useful, but imo it starts to go off the rails at about the 60% mark -- no reason to understand all of t

Ok!

_(2026-10-12T21:06:57Z `1559311439318089750`)_

I see. Noted.

_(2026-10-12T21:07:24Z `1559311552346062869`)_

How far do you know Rust? Any professional experience?


**w** — 2026-10-12T21:11:07Z (`1559312487155892274`)

I use it at work, but not for anything boundary-pushing, ten or twelve microservices that look like microservices in any other app-based startup company, and personally I work on [smudgy](https://github.com/smudgy-mud/smudgy).

_(2026-10-12T21:12:43Z `1559312888441733133`)_

_Expert_ in Rust is a VERY high bar, and I wouldn't claim it -- i don't think many people would. I've been programming since I was a tween ~32 years ago, toyed with a long list of languages, and I know enough rust to implement anything I've cared to implement, with reasonable idioms/zca's/etc.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:13:30Z (`1559313086501101641`)

> ↳ replying to w: I use it at work, but not for anything boundary-pushing, ten or twelve microservices that look like microservices in any

I see.

_(2026-10-12T21:14:31Z, edited 2026-10-12T21:14:45Z `1559313343980904459`)_

> ↳ replying to w: _Expert_ in Rust is a VERY high bar, and I wouldn't claim it -- i don't think many people would. I've been programming s

I see. It's just being 2 years of me with programming. 2 months of Rust.

_(2026-10-12T21:14:54Z `1559313439015313439`)_

I need to take it slow then

_(2026-10-12T21:15:23Z `1559313558968471593`)_

Okay! I will cover the path there. Okay? Then I will come back and ask for more


**w** — 2026-10-12T21:21:32Z, edited 2026-10-12T21:21:46Z (`1559315109120053269`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Okay! I will cover the path there. Okay? Then I will come back and ask for more

Sure, and I'm not saying you need to slow down so much as don't rush.  You can also (and you need to reach a certain point before this is viable) learn a lot reading through deno's or rusty_v8's repositories -- and most personal growth happens when you open a PR and get a real good critique


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:25:14Z (`1559316039265820715`)

> ↳ replying to w: Sure, and I'm not saying you need to slow down so much as don't rush.  You can also (and you need to reach a certain poi

Okay!

_(2026-10-12T21:25:47Z, edited 2026-10-12T21:25:54Z `1559316175815708783`)_

What should be under the list of subjects that I need to learn? For this? Any crates? Any CS topics? Please tell me.


**w** — 2026-10-12T21:30:16Z (`1559317308009218209`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: What should be under the list of subjects that I need to learn? For this? Any crates? Any CS topics? Please tell me.

That flowchart you sent is a good start. I don't really subscribe to "learning crates"; e.g. someone might say you need to "learn tokio" -- but to one person that might mean you need to learn the API, to another person that might mean that cooperative multitasking needs to "click" for you.  The former you learn by reading and the latter you learn by doing.

_(2026-10-12T21:30:35Z `1559317385754972241`)_

For myself, I'm big on tacit understanding and being hands-on.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:48:03Z (`1559321780412358839`)

> ↳ replying to w: That flowchart you sent is a good start. I don't really subscribe to "learning crates"; e.g. someone might say you need 

Okay! So, I will just stick to it. Learn it. Build projects. As here are better people than me here they will keep the Deno Runtime secure. Right? And I can open PRs, I will get reviews and I will learn and start again. Iterate again. Meanwhile building my own things and taking feedback from that as well?

_(2026-10-12T21:48:11Z `1559321813006295181`)_

Okay! I can do that. Scientific method.


**w** — 2026-10-12T21:49:13Z (`1559322073548062882`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Okay! So, I will just stick to it. Learn it. Build projects. As here are better people than me here they will keep the D

That's the OSS development platonic ideal in a nutshell 🙂


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:49:30Z (`1559322146751123557`)

> ↳ replying to w: That's the OSS development platonic ideal in a nutshell 🙂

I see 😂 

Reinventing how to reinvent the wheel 🛞


**hajime_san** — 2026-10-17T11:09:12Z (`1560972948204949655`)

Since it built on V8, Rust is merely one tool in the process; ultimately, you must learn about V8 itself.
I recommend reading the implementation of Blink—which, like Deno, embeds V8. Although the Chromium project is a large, complex C++-based codebase, you shouldn't be intimidated; by breaking it down into smaller parts, you can grasp both the big picture and the implementation details.
For example, here is the implementation that provides the global object `window.atob()`:
https://source.chromium.org/chromium/chromium/src/+/0ddd6f67cfa199e4105020149bf5ee8ec7e4f537:third_party/blink/renderer/core/frame/universal_global_scope.cc;l=40-62


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T00:53:28Z (`1561180384035868723`)

> ↳ replying to hajime_san: Since it built on V8, Rust is merely one tool in the process; ultimately, you must learn about V8 itself. I recommend re

Learning V8 is not easy. That's what I was thinking. 
See, V8 is made by Google, cracked engineers working on it. Right? Decades of work put into it. It's I guess it got WASM + JS code. ~2 million lines of C++, Google's standard C++. Blink is good. Chromium is build on top of V8. I am doubting that I have the resolve to stick to it. It will take months to get through this. Right?

_(2026-10-18T00:53:37Z `1561180419519680694`)_

Isn't there any better way to do it?


**w** — 2026-10-18T01:55:20Z (`1561195952067317760`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Learning V8 is not easy. That's what I was thinking.  See, V8 is made by Google, cracked engineers working on it. Right?

Learning the _relevant_ parts of v8 to working with _most_ of Deno/Dodo is pretty achievable, all things considered. Cracked engineers tend to make things that have cleaner separations, and that end up being _easier_ to understand. It's not so important to understand it front-to-back.  If you can make heads or tails of everything happening in https://v8.dev/docs/embed, you're off to a pretty good start.
[embed] Getting started with embedding V8 · V8 This document introduces some key V8 concepts and provides a “hello world” example to get you started with V8 code.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:57:39Z (`1561196534148767765`)

> ↳ replying to w: Learning the _relevant_ parts of v8 to working with _most_ of Deno/Dodo is pretty achievable, all things considered. Cra

I see. So you suggest me which one? 
1. Deep dive into the codebase?
2. Or start somewhere like this Embedding V8 and then move ahead with it? Slowly implementation ad-hoc "patches" to Dodo the same way Deno team did?


**w** — 2026-10-18T02:12:28Z (`1561200262079578274`)

Either is valid. What this project probably _doesn't have_, at least yet, is anyone to say "Sandeep, please do X.". OTOH it does seem to have some patient and knowledgeable folks who I'd bet would be happy to help you think your way through any bits of work you chose to bite off.  My earlier learnings were done with a ton of brute force, I'd have been working my way through the past several of months of Deno PRs trying to reverse engineer my way into Bart's head and source diving my way around until I had my bearings. The more you do that, the shallower you need to go to understand implementations/motivations. And, OTOH, I feel like suggesting you do that is terrible advice 😅


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:15:33Z (`1561201039078858895`)

> ↳ replying to w: Either is valid. What this project probably _doesn't have_, at least yet, is anyone to say "Sandeep, please do X.". OTOH

Then let me think on it.

_(2026-10-18T02:15:50Z `1561201111149453394`)_

I will come back to you with my thinking then.

_(2026-10-18T18:52:48Z `1561452005011235011`)_

> ↳ replying to w: Learning the _relevant_ parts of v8 to working with _most_ of Deno/Dodo is pretty achievable, all things considered. Cra

Okay! I have understood it then. Well, when I was thinking about reading the entire V8 source code, then said to me "ain't nobody got time for that". Saying me to treat Blink as a manual of "how the giants do this" and then I can use Rust to embed the engine into the Dodo core. Right? Rust is just the wrapper. Right? In open source, nobody is going to hold your hand. There is no syllabus. You have to look at the repo, find a bug, and say: "I'm going to fix this." I need to take incentive on my own, ship something and own it. End to end. Such that I can be a small cog in the giant wheel, right? 

But what I do need is a bit of nudge. I will pick something up, and I need people (at least in this thread) to nudge me to make me do good in selected scope. 

Then from here I got 3 routes to go: 
1. I pick the embedding V8, can stick with it. 
2. Read the Deno PRs and then reverse engineer things up from there. 
3. Pick something small. I work on it, read relevant things, and then when i stuck I ask for help, right?


**w** — 2026-10-18T19:09:33Z (`1561456219049295943`)

I'd do some of 1., just decide on a good stopping point when you find it, but that's a good prerequisite to doing anything -- e.g. you might have noticed a few folks here just happened to do that on day 1 instinctively. And 3. if you have something in mind, and 2. if you need to "find" a "3"

---

## Dodo Bencho's (thread 1559657749892300934)

**w** — 2026-10-13T20:03:04Z, edited 2026-10-13T20:03:37Z (`1559657749892300934`)

Given the initial effort to monorepoize deno, I'm unsure where dodo is headed on the spectrum of ground-up rewrite vs continuation of deno.

Given the stated goal of modularity with compatibility, we should probably start paying close attention to performance and get some baselines.

Looks like the recent history of benchmark results wrote to a proprietary denoland.grafana.net board, and ancient history lives at https://deno.com/benchmarks.

Any reason I _shouldn't_ work on a PR that gets deno's existing benches showing for dodo using something like https://github.com/marketplace/actions/continuous-benchmark ?


**daniellacosse** — 2026-10-13T20:06:27Z, edited 2026-10-13T20:06:41Z (`1559658599960285265`)

Only thing i can think is if <@178483185468833793> 's work somehow overlaps, like in the tests he's been getting to run


**davey** — 2026-10-13T20:15:52Z (`1559660971486879757`)

Love the idea. 

Will we get skewed results if existing benchmarks ran on non free tier runners?

On one of my projects I've got a PR check that will fail and comment if a benchmark slips by x%. Potentially a good way to catch accidental regressions.


**CaptainLach** — 2026-10-13T20:16:24Z (`1559661106807570613`)

Nope, should not overlap


**davey** — 2026-10-13T20:17:54Z (`1559661483930161244`)

Potential downside would be if we were going to use GH pages for a dodo homepage or docs. Can the benchmarks be set to a path?


**w** — 2026-10-13T20:18:18Z (`1559661583154548789`)

yeah, i'd opt for that myself -- benches or benchmarks 🤷‍♂️


**davey** — 2026-10-13T20:18:54Z (`1559661735978475584`)

Nice, benches sounds good


**w** — 2026-10-13T20:19:14Z (`1559661816995516511`)

i've found free runners _can_ be noisy with benches, but they're still noisy within reason; +/- 7% isn't unusual though

_(2026-10-13T20:20:15Z `1559662073389252720`)_

but if you introduce a meaningful regression, it's still generally apparent even through the noise

_(2026-10-13T20:21:59Z `1559662508518805544`)_

can always bring in [Gungraun](https://github.com/gungraun/gungraun) / run multiple trials and go with min() rather than avg() too if straight lines are a priority
[embed] GitHub - gungraun/gungraun: High-precision, one-shot and consistent... High-precision, one-shot and consistent benchmarking framework/harness for Rust. All Valgrind tools at your fingertips. - gungraun/gungraun


**davey** — 2026-10-13T20:23:16Z (`1559662833699131422`)

My threshold is at 25% . In case you wanted some inspo ... Comment on a PR https://github.com/smallhoursorg/hotsauce/pull/103#issuecomment-5838806888 and workflow https://github.com/smallhoursorg/hotsauce/blob/main/.github/workflows/bench.yml

_(2026-10-13T20:24:04Z `1559663036078227489`)_

That worked well enough for me to catch a few regressions early.


**w** — 2026-10-14T03:44:09Z (`1559773784461017110`)

https://github.com/are-we-dodo-yet/dodo/commit/60dd84a5a0
[embed] bench: don't send data to grafana (#16324) · are-we-dodo-yet/dodo@... ci / bench release ubuntu-20.04-xl (pull_request) went from 24m to 23m

_(2026-10-14T03:44:16Z `1559773815851057233`)_

looks like I misspoke, grafana's been dead for four years

_(2026-10-14T03:45:01Z `1559774004963713024`)_

meanwhile https://deno.land/benchmarks is up to date as of last week

_(2026-10-14T03:45:31Z `1559774128779567164`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1559657749892300934/1559774128502866000/image.png?ex=6ad63b1b&is=6ad4e99b&hm=d651d23a79c059dfbc52d48ca58f0a4a387d81dd190419b34276351831130306&)

_(2026-10-14T03:45:35Z `1559774147205136456`)_

well, looks like the readme misspoke

_(2026-10-14T03:45:38Z `1559774156869083187`)_

but still


**daniellacosse** — 2026-10-14T15:57:55Z, edited 2026-10-14T16:00:05Z (`1559958441433366611`)

hm, i find this page _slightly_ unclear - like, how big is "workers_large_message" exactly? how large we talkin' here?

_(2026-10-14T15:59:15Z `1559958778391306332`)_

and are these all including cold startup or no? 80ms to encode some text seems really slow, and i know deno is faster than that

_(2026-10-14T16:00:40Z, edited 2026-10-14T16:13:50Z `1559959136702177290`)_

also they're not breaking it down by percentile, that matters too. if p99 is fairly tame, that's a great talking point - means the system is more predictable (i guess that's your earlier point)


**w** — 2026-10-14T17:24:19Z (`1559980187733463041`)

Yeah, and there are many many little benches in the project that aren't showing here.

_(2026-10-14T17:27:12Z `1559980913599709295`)_

So far I have a bench suite _running_ with almost every bench under the sun in the project included, and a workflow file to write pages, but I think it's still a bit of a mess, and using those benches as a starting point isn't going to be _that_ helpful for avoiding regressions if the extensions system gets flipped on its head either


**daniellacosse** — 2026-10-14T17:28:14Z (`1559981173097111744`)

True, cuz if anything extensions will add to startup i presume, but otherwise it's just moving code around

_(2026-10-14T17:28:32Z `1559981249513259261`)_

Maybe we focus in on the benches that matter for that, if any?

_(2026-10-14T17:28:50Z, edited 2026-10-14T17:37:00Z `1559981322942939167`)_

I do think coming back to this may make sense once we start thinking about promoting Dodo


**w** — 2026-10-14T21:27:59Z (`1560041507673874614`)

it could, what I'm most curious about is whether there are some benefits currently being realized through LTO and having everything in one build that end up lost

---

## Continue developing Deno vs adding best features to Node.js (thread 1560790338480906290)

**Matthew** — 2026-10-16T23:03:34Z (`1560790338480906290`)

Would it be better to continue developing Deno or just to add all of the best features from Deno to Node.js?


**daniellacosse** — 2026-10-16T23:54:56Z (`1560803265753522187`)

I think there's a certain opinionatedness to Deno's entire stack that wouldn't work in Node.js

_(2026-10-16T23:57:11Z, edited 2026-10-17T00:09:02Z `1560803829769834577`)_

BTW, saw your convo in the Open JSF slack. I'll post that here for reference

_(2026-10-16T23:57:35Z `1560803930479525968`)_

[attachment] Screenshot_2026-10-16_at_19.57.21.png (https://cdn.discordapp.com/attachments/1560790338480906290/1560803929732948048/Screenshot_2026-10-16_at_19.57.21.png?ex=6ad605af&is=6ad4b42f&hm=49e2e8aa2c1a447c326b07635a2e61cc162bef01af178c69b52ad7224abebfb1&)
[attachment] Screenshot_2026-10-16_at_19.57.30.png (https://cdn.discordapp.com/attachments/1560790338480906290/1560803930152247356/Screenshot_2026-10-16_at_19.57.30.png?ex=6ad605af&is=6ad4b42f&hm=9f3510a3f5bb2e23c6e81e6142ba9ae58ae57b49619cc08510d5a5f5a86e76be&)

_(2026-10-17T00:21:12Z `1560809875414720604`)_

these guys seem fun at parties lol

_(2026-10-17T00:26:20Z, edited 2026-10-17T00:59:09Z `1560811167134261300`)_

btw "you'll help many orders of magnitude more people" is probably code for "you'll help big tech, yummy yummy, free labor" - i've been on the other side, this is how they actually think about OSS

_(2026-10-17T00:30:00Z, edited 2026-10-17T00:59:56Z `1560812087490510920`)_

there _is_ an argument for both developing Deno _and_ continuing to add its best features to Node. Because not every feature will be admitted and whatever form it takes will be more enterprise-y, while Deno (Dodo) can remain a more streamlined, "indie" tool with cohesive vision. These are different scales with different ecosystems and usage patterns.

_(2026-10-17T00:30:34Z `1560812230897836155`)_

it's not zero sum


**Matthew** — 2026-10-17T03:11:25Z (`1560852711983939605`)

The downside I see of having more of the best Deno features in Node is that it would provide less of a reason for people/companies to switch to Deno which means fewer users and probably less contributors.

_(2026-10-17T03:12:36Z `1560853010446290945`)_

Although if all of the features of Deno got merged into Node.js everyone could just switch back to Node and it wouldn't matter that Deno gets abandoned.

_(2026-10-17T03:13:54Z, edited 2026-10-17T03:13:58Z `1560853334599008379`)_

The thing to be worried about would be half way where enough features get added to Node that people are satisfied and don't use Deno but not enough to fully replace all of the benefits of Deno.


**daniellacosse** — 2026-10-17T03:15:35Z, edited 2026-10-17T03:15:53Z (`1560853757477003355`)

Deno is more than just a feature checklist

_(2026-10-17T03:16:01Z `1560853867938316301`)_

Is what I'm trying to say


**Matthew** — 2026-10-17T03:22:07Z (`1560855402042753135`)

> ↳ replying to daniellacosse: Deno is more than just a feature checklist

How?


**daniellacosse** — 2026-10-17T03:25:19Z, edited 2026-10-17T03:29:15Z (`1560856209924296747`)

It aims to make development streamlined and delightful, in a way that Node can't because it has to target enterprise

Enterprise doesn't really care about DX, they can staff around it. The more features and options you have the harder it is to ensure a good DX: it's an unfortunate tradeoff. And why I think there's a bit of a false equivalency between Deno and Node in the current discourse


**netop://ウィビ** — 2026-10-17T07:57:39Z (`1560924743937302569`)

I would never switch back to Node. What a nightmare of bullshit configs and troubleshooting why Rollup doesn't work with a specific point release of TypeScript. And dealing with npm?! NO THANKS.

But hey, masochists exist. I'm not gonna yuck your yum.

_(2026-10-17T07:58:21Z `1560924922023247923`)_

Node is McDonald's. Deno is a bit classier IMHO.


**Matthew** — 2026-10-17T21:32:03Z (`1561129692449210519`)

Is there any way that the projects could merge? Where Node.js could just have a Deno mode where it changes all of the defaults to act like Deno and a Node mode where it works like normal Node?


**daniellacosse** — 2026-10-17T21:43:21Z (`1561132538599186503`)

I don't think so? I mean, it seemed that the Open JSR guys were only open to _some_ features
