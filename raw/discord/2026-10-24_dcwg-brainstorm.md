---
title: "Discord #brainstorm — 2026-10-24"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "CaptainLach"
  - "netop://ウィビ"
  - "lishaduck"
  - "daniellacosse"
created: 2026-10-24
description: "Append-only capture of #brainstorm from 2026-10-24T21:26:22Z to 2026-10-25T00:30:03Z, pulled from the Discord REST API. 71 messages, 4 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-24T21:26:22Z to 2026-10-25T00:30:03Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**CaptainLach** — 2026-10-24T21:26:22Z (`1563664980853653595`)

> ↳ replying to netop://ウィビ: Would this be useful to any efforts? https://porffor.dev

There is a v8x PR for it


**netop://ウィビ** — 2026-10-24T21:30:03Z (`1563665907308437621`)

I see there’s Node dependencies in there so it seemed relevant!


**lishaduck** — 2026-10-24T21:55:04Z (`1563672203591942175`)

> ↳ replying to CaptainLach: There is a v8x PR for it

Huh... that's actually really neat


**daniellacosse** — 2026-10-24T23:30:14Z (`1563696152551886969`)

> ↳ replying to netop://ウィビ: Would this be useful to any efforts? https://porffor.dev

this might potentially be a thing that helps with JIT?


**netop://ウィビ** — 2026-10-24T23:37:14Z (`1563697913874616386`)

> ↳ replying to daniellacosse: this might potentially be a thing that helps with JIT?

I have no idea, I'm not that smart. Just seems like another backend to me

_(2026-10-24T23:37:18Z `1563697927782666250`)_

https://deno.com/blog/roll-your-own-javascript-runtime
[embed] Roll your own JavaScript runtime | Deno A walk-through of creating a CLI that executes JavaScript files.


**daniellacosse** — 2026-10-24T23:39:31Z, edited 2026-10-24T23:40:38Z (`1563698486380204213`)

> ↳ replying to netop://ウィビ: https://deno.com/blog/roll-your-own-javascript-runtime

an example i threw together while learning: https://github.com/cutout-studios/runtime/blob/main/core/lib.rs
[embed] runtime/core/lib.rs at main · cutout-studios/runtime Contribute to cutout-studios/runtime development by creating an account on GitHub.

_(2026-10-24T23:40:00Z `1563698608543375393`)_

it is not _not_ doable


**CaptainLach** — 2026-10-24T23:40:15Z (`1563698670493372458`)

> ↳ replying to netop://ウィビ: https://deno.com/blog/roll-your-own-javascript-runtime

It is very limited, there is no typescript transpilation and a lot of stuff

_(2026-10-24T23:40:39Z `1563698773706805350`)_

https://github.com/denoland/v8x/pull/76
[embed] feat: porffor backend by littledivy · Pull Request #76 · denoland... Adds src/porffor/, a fourth backend. Draft-quality scaffold, not a working engine — 75 symbols implemented, 745 still stubbed.
Why this one is different
JSC, QuickJS and Hermes are interpreters: ha...

_(2026-10-24T23:41:05Z `1563698880091127901`)_

It doesn't work

_(2026-10-24T23:41:26Z `1563698969731797113`)_

But the idea is that deno compile could use porffor, and then in runtime it executes the code that was compiled

_(2026-10-24T23:41:34Z `1563699002015350887`)_

But it is not really any good

_(2026-10-24T23:41:45Z `1563699051268939827`)_

It produces C code, yes, but in many cases this code is suboptimal


**daniellacosse** — 2026-10-24T23:42:07Z (`1563699141677158621`)

> ↳ replying to CaptainLach: It produces C code, yes, but in many cases this code is suboptimal

worse than jitless?


**CaptainLach** — 2026-10-24T23:42:31Z (`1563699243749875804`)

It depends

_(2026-10-24T23:42:49Z `1563699318731313283`)_

It produces a lot of code, so it might be much worse for cache


**daniellacosse** — 2026-10-24T23:42:55Z, edited 2026-10-24T23:43:03Z (`1563699344954101851`)

if it's comparable then yeah, the complexity would be unnecessary


**CaptainLach** — 2026-10-24T23:43:35Z, edited 2026-10-24T23:43:49Z (`1563699512105640041`)

x86 is pretty good at branch prediction, so interpreter over small bytecode can work faster than just a lot of code with dubious type-based switching


**daniellacosse** — 2026-10-24T23:43:51Z, edited 2026-10-24T23:43:58Z (`1563699575930363997`)

perhaps perhaps worth a test at some point, but i wouldn't prioritize it very highly if you're unsure about it obviously


**CaptainLach** — 2026-10-24T23:44:56Z (`1563699850342699021`)

> ↳ replying to CaptainLach: x86 is pretty good at branch prediction, so interpreter over small bytecode can work faster than just a lot of code with

Small optimized interpreter + small optimized bytecode vs a lot of dumb machine code


**daniellacosse** — 2026-10-24T23:45:08Z (`1563699900716294185`)

that does sound smart

_(2026-10-24T23:51:41Z, edited 2026-10-24T23:51:57Z `1563701549472022619`)_

may or may not follow through but i started sketching out a webgpu model runner fyi


**CaptainLach** — 2026-10-24T23:53:09Z (`1563701917828382774`)

IMO you should just move inference to a different process

_(2026-10-24T23:53:31Z `1563702009951949004`)_

Because inference is heavy and can be easily isolated to a different machine otherwise


**daniellacosse** — 2026-10-24T23:54:03Z (`1563702142731161733`)

yeah, you're probably right. but i also have some other things i want to experiment with

_(2026-10-24T23:54:10Z `1563702172351201332`)_

like dynamically loading and unloading experts


**CaptainLach** — 2026-10-24T23:54:13Z (`1563702188243558401`)

Also for LLMs there aren't good kernels for webgpu

_(2026-10-24T23:54:33Z `1563702271789891697`)_

The best here is burn.dev, but it is using full wgpu, and not the browser subset

_(2026-10-24T23:54:54Z `1563702358909788345`)_

Webgpu is fine for onnx and stuff


**daniellacosse** — 2026-10-24T23:57:02Z (`1563702895818571916`)

as an aside, we might want to consider an OPFS extension: https://www.npmjs.com/package/happy-opfs

_(2026-10-24T23:58:37Z `1563703292952055829`)_

possibly even as an alternative to @std/fs


**CaptainLach** — 2026-10-25T00:00:07Z (`1563703673102540856`)

Onnx is fun
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1563703672402350201/image.png?ex=6ade9807&is=6add4687&hm=2d88ffb36cb6d86e6d1b98f4d26c917e9781f6ef742c7d020265ca6ced4ac93e&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1563703672817455134/image.png?ex=6ade9807&is=6add4687&hm=3a88f5e8e13484e2bb81f928322d5ef2b70279efaf8c8457911a5f7aa9310f74&)

_(2026-10-25T00:00:35Z `1563703787795910799`)_

> ↳ replying to daniellacosse: as an aside, we might want to consider an OPFS extension: https://www.npmjs.com/package/happy-opfs

Imo object storage is better for the end users most of the time D:


**daniellacosse** — 2026-10-25T00:00:50Z (`1563703852841181357`)

it's more about portability


**CaptainLach** — 2026-10-25T00:01:12Z, edited 2026-10-25T00:03:51Z (`1563703942787891302`)

Object storage is more portable

_(2026-10-25T00:01:26Z `1563704003689451601`)_

Because FS implies file locking and a lot of stuff that is broken most of the time


**daniellacosse** — 2026-10-25T00:04:14Z (`1563704708814606357`)

OPFS is isolated and local


**CaptainLach** — 2026-10-25T00:04:30Z (`1563704776544362568`)

You can implement object storage on top of FS

_(2026-10-25T00:04:38Z `1563704808391581799`)_

You can't implement FS on top of object storage


**daniellacosse** — 2026-10-25T00:04:51Z (`1563704861520953416`)

i guess, but then that's more code to ship to the browser


**CaptainLach** — 2026-10-25T00:06:55Z (`1563705382579478561`)

There is indexeddb 😄

_(2026-10-25T00:07:18Z `1563705480801689721`)_

Huh?


**daniellacosse** — 2026-10-25T00:07:20Z, edited 2026-10-25T00:07:28Z (`1563705486426251427`)

> ↳ replying to CaptainLach: There is indexeddb 😄

that's slow as hell 😭


**CaptainLach** — 2026-10-25T00:07:46Z (`1563705596501434520`)

Why?

_(2026-10-25T00:07:55Z `1563705633793122345`)_

Wdym?

_(2026-10-25T00:08:01Z `1563705657654251641`)_

It is not slower than raw fs

_(2026-10-25T00:08:25Z `1563705762134495384`)_

Unless you skip fsync on raw fs, but you can reduce durability in indexeddb as well


**daniellacosse** — 2026-10-25T00:08:40Z (`1563705824583487549`)

it's not very intuitive to use either in my experience


**CaptainLach** — 2026-10-25T00:09:01Z (`1563705909799026749`)

...maybe

_(2026-10-25T00:11:32Z `1563706544317792378`)_

...At the same time, many users don't understand how do you work with FS either

_(2026-10-25T00:12:39Z `1563706826267304047`)_

Just recently spotify had died on me, because it was dying on launch trying to read JSON file that was truncated for some reason, because they didn't use atomic write trick (Write into a new file, and then rename it to the target, instead of writing directly to file)

_(2026-10-25T00:13:15Z `1563706975781388349`)_

At the same time with object storage users can prevent many of such problems, because the semantics is more clear


**daniellacosse** — 2026-10-25T00:13:40Z (`1563707081834369055`)

> ↳ replying to CaptainLach: Wdym?

i'm looking it up, it's been maybe 7 years since i used indexeddb, it's possible it's more optimized now


**CaptainLach** — 2026-10-25T00:13:54Z (`1563707141569773750`)

It was never really slow

_(2026-10-25T00:14:35Z `1563707310738645083`)_

Unless you compare indexeddb with durability and fs without fsync


**daniellacosse** — 2026-10-25T00:17:25Z, edited 2026-10-25T00:17:30Z (`1563708024038887565`)

> ↳ replying to CaptainLach: It was never really slow

didn't it/doesn't it do a structured clone, or something?


**CaptainLach** — 2026-10-25T00:18:01Z (`1563708177877442613`)

> ↳ replying to daniellacosse: didn't it/doesn't it do a structured clone, or something?

Not for typed arrays and stuff like that


**daniellacosse** — 2026-10-25T00:18:17Z (`1563708245011337280`)

maybe that's why i was experiencing slowness

_(2026-10-25T00:18:41Z, edited 2026-10-25T00:18:45Z `1563708344915726368`)_

it was a long time ago


**CaptainLach** — 2026-10-25T00:18:42Z (`1563708346174017717`)

...but I mean, with FS you convert such stuff to json/others

_(2026-10-25T00:19:23Z `1563708519663018145`)_

Are you sure you were waiting for fsync when using fs?)


**daniellacosse** — 2026-10-25T00:21:12Z (`1563708977819160617`)

not sure

_(2026-10-25T00:22:06Z `1563709205846954096`)_

i think serialization is a lot faster than structured clone tho

that said i definitely didn't know about typed arrays and stuff back then


**CaptainLach** — 2026-10-25T00:22:39Z (`1563709342664892419`)

It depends, but yes, JSON.stringify is very optimized in v8


**daniellacosse** — 2026-10-25T00:23:52Z (`1563709650451562498`)

anyway the aside isn't really important, if we decide we're really big on supporting all the web standards apis we'd have to do it regardless

_(2026-10-25T00:25:17Z, edited 2026-10-25T00:32:02Z `1563710004098502809`)_

> ↳ replying to CaptainLach: Also for LLMs there aren't good kernels for webgpu

yeah, that's what i'm sketching, and i'm aware that's ambitious so no commitments

definitely can live in a separate process. i'm just annoyed by having to run my inference in the open and everything else in a container

_(2026-10-25T00:25:39Z `1563710098499444818`)_

two v8s? fine


**netop://ウィビ** — 2026-10-25T00:29:37Z (`1563711095405809685`)

> ↳ replying to daniellacosse: as an aside, we might want to consider an OPFS extension: https://www.npmjs.com/package/happy-opfs

> The OPFS offers low-level, byte-by-byte file access, which is private to the origin of the page and not visible to the user. As a result, **it doesn't require the same series of security checks and permission grants and is therefore faster than File System Access API calls**. It also has a set of synchronous calls available (other File System API calls are asynchronous) that can be run inside web workers only so as not to block the main thread.
https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
[embed] Origin private file system - Web APIs | MDN The origin private file system (OPFS) is a storage endpoint provided as part of the File System API, which is private to the origin of the page and not visible to the user like the regular file system. It provides access to a special kind of file that is highly optimized for performance and offers in-place write access to its content.

_(2026-10-25T00:29:40Z `1563711106512453633`)_

Very nice


**daniellacosse** — 2026-10-25T00:30:03Z (`1563711205342970018`)

yeah my experience with OPFS has been great so far 🤷
