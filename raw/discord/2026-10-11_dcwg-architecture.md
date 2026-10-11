---
title: "Deno Core Working Group Discord, architecture ideas — 2026-10-11"
source: "Discord — client transcript pasted by Ethan Davidson"
author:
  - "andy"
  - "daniellacosse (Daniel LaCosse)"
  - "netop://ウィビ (Paul Anthony Webb)"
  - "Ethan:Print\"Ethan\";:GoTo Ethan (Ethan Davidson)"
created: 2026-10-11
description: "Append-only capture of the architecture-ideas channel on 2026-10-11: a minimal core with opt-in extensions, C# or Go or Rust for the host, extensions authored in TypeScript, console as an extension, and the fork-versus-rewrite order of operations."
tags:
  - "deno"
  - "fork"
  - "dcwg"
  - "discord"
  - "architecture"
---

Append-only capture of an architecture channel in the Deno Core Working Group
Discord, 3:13 PM to 3:45 PM on 2026-10-11, as pasted by Ethan. The block below is
reproduced verbatim from the client, including its typos and stray lines; the
channel label is not in the paste, only `andy`'s line saying the channel is for
architecture ideas. Times and handles are as the client displayed them, and the
timezone is not captured and is not inferred.

---

andy — 3:13 PM

this channel is for suggesting architecture ideas

people have suggested that we want a minimal core with the ability for plugins, so it could act like deno, or whatever your heart desires

this is probably quite a controversial idea, but I believe that doing plugins and stuff in rust will be a bit of a pain, I think it would be interesting to do it in C#, it's

actually pretty fast

a very nice language nowadays

has amazing support for dynamically loading code

allows for rapid prototyping'

use thumbs up dumbs down reactions

and ofc feel free to propose your own ideas

or maybe Go?

Rust is also possible, but Rust can be slow to write in, though maybe better in the long run?

daniellacosse \[xout\],  — 3:18 PM

i was going to actually prototype an extension system, so I can attempt that and report back 

andy — 3:18 PM

actually wait why don't we do a prototyping challenge, where we give everybody like a week to make a minimal prototype of what they think the runtime could look like, and we see what works well and what doesnt

thoughts?

daniellacosse \[xout\],  — 3:19 PM

i'm hesitant to rewrite everything tbh 😅

but i think like sketches of what it could look like might be nice, yeah

 \[xout\], 

andy — 3:19 PM

i am too, but also, deno's codebase is a bit strangely architected, given that they didn't have the benefit of hindsight of the scope they wanted

daniellacosse \[xout\],  — 3:20 PM

also a big requirement for me is the cross-compilation. i've been able to compile rusty_v8 to ios and others and was working on a cross-platform solution I actually liked

andy — 3:21 PM

but again, what matters is what the community wants, not me

 \[xout\], 

andy — 3:21 PM

true

C# is actually quite portable :P

daniellacosse \[xout\],  — 3:21 PM

not saying no rust, go would also fit that bill

and yeah IDK much about C#

andy — 3:22 PM

C# is very simple but also provides a lot of help to developers, that's what's awesome about it

daniellacosse \[xout\],  — 3:23 PM

that said I just really worry about a rewrite eating up our enthusiasm. my approach would be to start by seeing what we can do to absorb the existing codebase first and get a really lay of what the most common pain points across everyone is/are

andy — 3:23 PM

that is very true!

daniellacosse \[xout\],  — 3:24 PM

capturing everyone's creative energy is very important though, so idk. it's a balance

daniellacosse \[xout\],  — 3:27 PM

I think this could be really good; but needs a bit more planning. I can't quite do this immediate week - let's see what other people think/if they could commit to such a thing 

andy — 3:27 PM

ah, yeah, i guess most people don't have way too much time on their hands

daniellacosse \[xout\],  — 3:28 PM

normally i do but not this week, my parents are visiting and the house needs a lot of work 😭

andy — 3:30 PM

actually wait what if extensions are just also written in typescript

netop://ウィビ — 3:30 PM

I love that idea

daniellacosse \[xout\],  — 3:31 PM

i don't know if you could always do that - like webgpu support would i believe need to rely on something like wgpu? but if possible that would be great

andy — 3:31 PM

i'm gonna start prototyping this in an unofficial capacity

netop://ウィビ — 3:31 PM

Just depends on what the extension architecture looks like. If you're bringing back WebGPU, Rust might be necessary.

So, I'd try to support TS and Rust

daniellacosse \[xout\],  — 3:31 PM

yeah, typescript won't hit all targets, but i'd definitely support bo- th yeah

 \[xout\], 

andy — 3:31 PM

yeah, that's what the core is for, but the core is just giving extensions access to the V8 isolate that user code runs in, and native things like wgpu

daniellacosse \[xout\],  — 3:32 PM

ahh, I think we've hit an important thing here - agreeing what the core should contain. i actually don't think wgpu should be in the core, but i could be convinced 

not every app needs webgpu and wouldn't it be nice to just not include that in your bin 

andy — 3:33 PM

we could also provide utilities for loading and invoking shared objects/dlls/dylibs to extensions

daniellacosse \[xout\],  — 3:33 PM

yeah we for sure should make it as easy as possible to author extensions

and typescript is a great way to do that

andy — 3:33 PM

though to keep the core minimal, extensions will have a build step to bundle them up and stuff i think

daniellacosse \[xout\],  — 3:33 PM

but wouldn't hit everything sadly

yeah

 \[xout\], 

daniellacosse \[xout\],  — 3:35 PM

in my prototype i was gonna be extremely aggressive, like, even console is an extension

andy — 3:36 PM

i think console ships with V8 no?

daniellacosse \[xout\],  — 3:36 PM

it does not, actually!

andy — 3:36 PM

ah

i did not know that!

daniellacosse \[xout\],  — 3:36 PM

yeah i learned that yesterday: https://github.com/cutout-studios/runtime/blob/main/core/lib.rs

so imagine being able to pull in, say, sentry_console over the std one for some reason

it's cuz V8 doesn't actually have a stdout 

to_rust_string_lossy lets you bridge v8's memory to the rust code: https://github.com/cutout-studios/runtime/blob/main/core/lib.rs#L75 

andy — 3:38 PM

true

 \[xout\], 

daniellacosse \[xout\],  — 3:39 PM

however - i don't know if that level of aggression is the right approach overall haha

andy — 3:40 PM

i mean, implementing console as an extension would be a good exercise of how well the extensions system actually works

daniellacosse \[xout\],  — 3:40 PM

yeah, exactly my thought 

but the actual better dx may be to support something like --ext=recommended by default 

Ethan:Print"Ethan";:GoTo Ethan — 3:42 PM

What I’m hearing might be reimplementations of Deno core rather than a fork of what already exists. As I understand, that’s one potential avenue. I think there are a few of them we’ve discussed including handing off Deno to the community like Luca did with Fresh.

andy — 3:42 PM

i think it should act like deno by default, and then it should be --preset=none --exts=a,b,c to opt out 

and of course there would be --no-exts=a,b,c as well if you just want to remove specific extensions

daniellacosse \[xout\],  — 3:44 PM

for me the waterfall is:

the community gets access to deno and all the stuff to continue mantaining it as is - ✨ ideal ✨

we create a deno fork and maybe dress it up a little bit, it's only natural

a rewrite, if maintaining the fork proves too difficult

andy — 3:45 PM

i think this one year where the deno team maintains their version will be enough time to make a rewrite ready to hand-off from deno, but we will see, if need be, we can just fork a few weeks before when deno loses support 

daniellacosse \[xout\],  — 3:45 PM

well, it should probably be sooner so there's enough overlap for people to consider the switch, rather than just leave deno entirely

that's tricky though

andy — 3:45 PM

true
