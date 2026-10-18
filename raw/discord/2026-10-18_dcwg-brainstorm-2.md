---
title: "Discord #brainstorm — 2026-10-18"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "daniellacosse"
  - "w"
  - "CaptainLach"
created: 2026-10-18
description: "Append-only capture of #brainstorm from 2026-10-18T19:13:27Z to 2026-10-18T19:25:54Z, pulled from the Discord REST API. 12 messages, 3 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-18T19:13:27Z to 2026-10-18T19:25:54Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**daniellacosse** — 2026-10-18T19:13:27Z (`1561457200470302862`)

here's a somewhat imperfect analogy that might make some sense - I think Node.js is to the Unreal Engine what Dodo/Deno can be to Unity

_(2026-10-18T19:14:59Z `1561457587092848754`)_

which, speaking of, if we wanted to eventually add support for things like consoles we'd definitely need a legal entity that can sign the appropriate NDAs

_(2026-10-18T19:15:19Z `1561457673755430953`)_

though with all the reverse engineering going around who knows if consoles are gonna be around in a couple years


**w** — 2026-10-18T19:20:35Z (`1561458998467764327`)

> ↳ replying to daniellacosse: which, speaking of, if we wanted to eventually add support for things like consoles we'd definitely need a legal entity 

how do NDAs and MIT licenses comingle? 😅


**daniellacosse** — 2026-10-18T19:21:52Z, edited 2026-10-18T19:22:23Z (`1561459321848725555`)

the proper extension would have to be opaque to the dev, in our private repo. it's how unity does it i think


**w** — 2026-10-18T19:22:32Z (`1561459486340812921`)

ah, is that the way we'd wand to be embedded/used as a runtime?


**daniellacosse** — 2026-10-18T19:22:51Z, edited 2026-10-18T19:23:06Z (`1561459566716395651`)

it could be one way - and would have to be the way we'd do it in this hypothetical


**w** — 2026-10-18T19:23:11Z (`1561459653421039772`)

> ↳ replying to daniellacosse: here's a somewhat imperfect analogy that might make some sense - I think Node.js is to the Unreal Engine what Dodo/Deno 

let me take the same type of analogy and flip it - what if node.js is to unity what dodo/deno is to godot? that's closer to my mental model right now


**daniellacosse** — 2026-10-18T19:24:26Z (`1561459966181638329`)

yes! that's probably more accurate


**CaptainLach** — 2026-10-18T19:24:33Z (`1561459994652577893`)

> ↳ replying to w: how do NDAs and MIT licenses comingle? 😅

MIT allows anyone to create a proprietary version of the code, and in case of deno - deno compile and others already download binary blob which can be built however deno authors want

_(2026-10-18T19:25:27Z `1561460221271085138`)_

Btw, I haven't found the built-in switch to use deno with javascriptcore, but I have checked it manually - and it works perfectly fine

_(2026-10-18T19:25:54Z `1561460334164709390`)_

Now we can cheat in some benchmarks just as bun do
