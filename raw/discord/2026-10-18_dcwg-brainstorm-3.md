---
title: "Discord #brainstorm — 2026-10-18"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "w"
  - "CaptainLach"
  - "daniellacosse"
created: 2026-10-18
description: "Append-only capture of #brainstorm from 2026-10-18T19:27:40Z to 2026-10-18T19:39:58Z, pulled from the Discord REST API. 14 messages, 3 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-18T19:27:40Z to 2026-10-18T19:39:58Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**w** — 2026-10-18T19:27:40Z (`1561460779834810469`)

> ↳ replying to CaptainLach: Btw, I haven't found the built-in switch to use deno with javascriptcore, but I have checked it manually - and it works 

not knowledgeable here, but is this a path to jit on ios?


**CaptainLach** — 2026-10-18T19:27:48Z (`1561460815570411531`)

Nope


**daniellacosse** — 2026-10-18T19:27:51Z (`1561460827327037541`)

unfortunately not


**CaptainLach** — 2026-10-18T19:28:06Z (`1561460889763455116`)

What's this
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561460889419259904/image.png?ex=6ad66f46&is=6ad51dc6&hm=5f196600a9b4caaf21d4b87f7c80dbd088339191fdae86c7e9dc840e9588d63f&)


**daniellacosse** — 2026-10-18T19:28:33Z (`1561461001814286408`)

i _actually_ think WebGPU compute shaders are the way to unlock ios performance 😏


**CaptainLach** — 2026-10-18T19:28:48Z (`1561461066485989479`)

> ↳ replying to w: not knowledgeable here, but is this a path to jit on ios?

In case of deno mobile the frontend might be JIT accelerated, but the backend would be not


**w** — 2026-10-18T19:29:28Z (`1561461232480030774`)

> ↳ replying to CaptainLach: What's this

hah, hey there newcomer!


**CaptainLach** — 2026-10-18T19:30:11Z (`1561461414064033927`)

> ↳ replying to daniellacosse: i _actually_ think WebGPU compute shaders are the way to unlock ios performance 😏

We would need to check if metal works in such contexts

_(2026-10-18T19:30:43Z `1561461546847309965`)_

(js to spir-v compiler when)


**daniellacosse** — 2026-10-18T19:31:50Z (`1561461827710492703`)

> ↳ replying to CaptainLach: We would need to check if metal works in such contexts

I'm fairly sure it does, but I intend to build a prototype around this as soon as I can

_(2026-10-18T19:32:58Z, edited 2026-10-18T19:34:06Z `1561462112444747886`)_

this is the headless entrypoint I think: https://developer.apple.com/documentation/metal/mtlcreatesystemdefaultdevice()
[embed] MTLCreateSystemDefaultDevice() | Apple Developer Documentation Returns the device instance Metal selects as the default.


**CaptainLach** — 2026-10-18T19:36:24Z (`1561462979436744806`)

Does wgpu support it?


**daniellacosse** — 2026-10-18T19:37:34Z (`1561463272119738408`)

believe so! https://github.com/gfx-rs/wgpu/blob/e084b66aab767940ff1236604d194c9e1c2844b0/wgpu-hal/src/metal/device.rs#L1446
[embed] wgpu/wgpu-hal/src/metal/device.rs at e084b66aab767940ff1236604d194c... A cross-platform, safe, pure-Rust graphics API. Contribute to gfx-rs/wgpu development by creating an account on GitHub.

_(2026-10-18T19:39:58Z `1561463874576711832`)_

(fyi, I'll be pretty busy tomorrow and a bit the following day, then my schedule opens up for a bit)
