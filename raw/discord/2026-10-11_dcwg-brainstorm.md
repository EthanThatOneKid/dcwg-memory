---
title: "Discord #brainstorm — 2026-10-11"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "andy"
  - "daniellacosse"
  - "netop://ウィビ"
  - "Ethan:Print\"Ethan\";:GoTo Ethan"
  - "Romuald Quantin"
  - "strmnn"
  - "r n"
  - "CCXLV"
  - "Max P."
  - "Flying Mindz | Jannick"
  - "Broglah"
  - "davey"
  - "CaptainLach"
  - "m1m1"
  - "w"
  - "Stag Math"
  - "Sandeep Kumar Kuanar✌🏼"
  - "killioiden"
  - "visualbam"
  - "Cyan"
  - "Lorondos"
  - "paula"
  - "eg"
  - "rabbit_rabbit"
  - "0xulotl"
created: 2026-10-11
description: "Append-only capture of #brainstorm from 2026-10-11T22:13:34Z to 2026-10-17T12:18:35Z, pulled from the Discord REST API. 594 messages, 25 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-11T22:13:34Z to 2026-10-17T12:18:35Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
**andy** — 2026-10-11T22:13:34Z (`1558965816328851527`)

this channel is for suggesting architecture ideas

_(2026-10-11T22:14:01Z `1558965926588842046`)_

people have suggested that we want a minimal core with the ability for plugins, so it could act like deno, or whatever your heart desires

_(2026-10-11T22:15:06Z `1558966199788765345`)_

this is probably quite a controversial idea, but I believe that doing plugins and stuff in rust will be a bit of a pain, I think it would be interesting to do it in C#, it's
- actually pretty fast
- a very nice language nowadays
- has amazing support for dynamically loading code
- allows for rapid prototyping'

_(2026-10-11T22:15:10Z `1558966218252095521`)_

use thumbs up dumbs down reactions

_(2026-10-11T22:15:26Z `1558966285008637983`)_

and ofc feel free to propose your own ideas

_(2026-10-11T22:16:09Z `1558966465506316371`)_

or maybe Go?

_(2026-10-11T22:17:57Z `1558966917383987291`)_

Rust is also possible, but Rust can be slow to write in, though maybe better in the long run?


**daniellacosse** — 2026-10-11T22:18:08Z, edited 2026-10-11T22:18:27Z (`1558966965522006027`)

i was going to actually prototype an extension system, so I can attempt that and report back


**andy** — 2026-10-11T22:18:54Z (`1558967157122015315`)

actually wait why don't we do a prototyping challenge, where we give everybody like a week to make a minimal prototype of what they think the runtime could look like, and we see what works well and what doesnt

_(2026-10-11T22:19:15Z `1558967243407368355`)_

thoughts?


**daniellacosse** — 2026-10-11T22:19:16Z (`1558967247962116127`)

i'm hesitant to rewrite everything tbh 😅

_(2026-10-11T22:19:32Z `1558967314857066559`)_

but i think like sketches of what it could look like might be nice, yeah


**andy** — 2026-10-11T22:19:40Z (`1558967350961635351`)

> ↳ replying to daniellacosse: i'm hesitant to rewrite everything tbh 😅

i am too, but also, deno's codebase is a bit strangely architected, given that they didn't have the benefit of hindsight of the scope they wanted


**daniellacosse** — 2026-10-11T22:20:48Z (`1558967637487132767`)

also a big requirement for me is the cross-compilation. i've been able to compile rusty_v8 to ios and others and was working on a cross-platform solution I actually liked


**andy** — 2026-10-11T22:21:06Z (`1558967709776089139`)

> ↳ replying to andy: i am too, but also, deno's codebase is a bit strangely architected, given that they didn't have the benefit of hindsight

but again, what matters is what the community wants, not me

_(2026-10-11T22:21:21Z `1558967774657904652`)_

> ↳ replying to daniellacosse: also a big requirement for me is the cross-compilation. i've been able to compile rusty_v8 to ios and others and was wor

true
-# C# is actually quite portable :P


**daniellacosse** — 2026-10-11T22:21:28Z (`1558967804580077669`)

not saying no rust, go would also fit that bill

_(2026-10-11T22:21:39Z `1558967849446539378`)_

and yeah IDK much about C#


**andy** — 2026-10-11T22:22:17Z (`1558968006959431812`)

C# is very simple but also provides a lot of help to developers, that's what's awesome about it


**daniellacosse** — 2026-10-11T22:23:34Z (`1558968331988373505`)

that said I just really worry about a rewrite eating up our enthusiasm. my approach would be to start by seeing what we can do to absorb the existing codebase first and get a really lay of what the most common pain points across everyone is/are


**andy** — 2026-10-11T22:23:52Z (`1558968408907849739`)

that is very true!


**daniellacosse** — 2026-10-11T22:24:32Z (`1558968576663101532`)

capturing everyone's creative energy is very important though, so idk. it's a balance

_(2026-10-11T22:27:15Z, edited 2026-10-11T22:28:21Z `1558969257759477782`)_

> ↳ replying to andy: actually wait why don't we do a prototyping challenge, where we give everybody like a week to make a minimal prototype o

I think this could be really good; but needs a bit more planning. I can't quite do this immediate week - let's see what other people think/if they could commit to such a thing


**andy** — 2026-10-11T22:27:42Z (`1558969370250707075`)

ah, yeah, i guess most people don't have way too much time on their hands


**daniellacosse** — 2026-10-11T22:28:06Z (`1558969470557495410`)

normally i do but not this week, my parents are visiting and the house needs a lot of work 😭


**andy** — 2026-10-11T22:30:18Z (`1558970024817983629`)

actually wait what if extensions are just also written in typescript


**netop://ウィビ** — 2026-10-11T22:30:46Z (`1558970144837869710`)

I love that idea


**daniellacosse** — 2026-10-11T22:31:04Z (`1558970218607288331`)

i don't know if you could always do that - like webgpu support would i believe need to rely on something like `wgpu`? but if possible that would be great


**andy** — 2026-10-11T22:31:09Z (`1558970241298735175`)

i'm gonna start prototyping this in an unofficial capacity


**netop://ウィビ** — 2026-10-11T22:31:14Z (`1558970262525837378`)

Just depends on what the extension architecture looks like. If you're bringing back WebGPU, Rust might be necessary.

_(2026-10-11T22:31:30Z `1558970326522667100`)_

So, I'd try to support TS and Rust


**daniellacosse** — 2026-10-11T22:31:37Z (`1558970357602586764`)

yeah, typescript won't hit all targets, but i'd definitely support bo- th yeah


**andy** — 2026-10-11T22:31:42Z (`1558970378976632867`)

> ↳ replying to daniellacosse: i don't know if you could always do that - like webgpu support would i believe need to rely on something like `wgpu`? bu

yeah, that's what the core is for, but the core is just giving extensions access to the V8 isolate that user code runs in, and native things like wgpu


**daniellacosse** — 2026-10-11T22:32:23Z, edited 2026-10-11T22:32:30Z (`1558970548480909384`)

ahh, I think we've hit an important thing here - agreeing what the core should contain. i actually don't think wgpu should be in the core, but i could be convinced

_(2026-10-11T22:32:42Z, edited 2026-10-11T22:33:09Z `1558970631637172266`)_

not every app needs webgpu and wouldn't it be nice to just not include that in your bin


**andy** — 2026-10-11T22:33:19Z (`1558970784586928210`)

we could also provide utilities for loading and invoking shared objects/dlls/dylibs to extensions


**daniellacosse** — 2026-10-11T22:33:34Z (`1558970848512311327`)

yeah we for sure should make it as easy as possible to author extensions

_(2026-10-11T22:33:41Z `1558970879403229226`)_

and typescript is a great way to do that


**andy** — 2026-10-11T22:33:56Z (`1558970942359732387`)

though to keep the core minimal, extensions will have a build step to bundle them up and stuff i think


**daniellacosse** — 2026-10-11T22:33:56Z (`1558970942607331410`)

but wouldn't hit everything sadly

_(2026-10-11T22:34:01Z `1558970961875701894`)_

yeah

_(2026-10-11T22:35:40Z `1558971374754725990`)_

> ↳ replying to daniellacosse: ahh, I think we've hit an important thing here - agreeing what the core should contain. i actually don't think wgpu shou

in my prototype i was gonna be extremely aggressive, like, even `console` is an extension


**andy** — 2026-10-11T22:36:03Z (`1558971474046623825`)

i think console ships with V8 no?


**daniellacosse** — 2026-10-11T22:36:11Z (`1558971504690073724`)

it does not, actually!


**andy** — 2026-10-11T22:36:14Z (`1558971520527892583`)

ah

_(2026-10-11T22:36:17Z `1558971530103365705`)_

i did not know that!


**daniellacosse** — 2026-10-11T22:36:44Z (`1558971646876983346`)

yeah i learned that yesterday: https://github.com/cutout-studios/runtime/blob/main/core/lib.rs

_(2026-10-11T22:37:15Z `1558971774421565491`)_

so imagine being able to pull in, say, `sentry_console` over the std one for some reason

_(2026-10-11T22:38:03Z, edited 2026-10-11T22:38:12Z `1558971976549269595`)_

it's cuz V8 doesn't actually have a stdout

_(2026-10-11T22:38:43Z, edited 2026-10-11T22:39:39Z `1558972144933802014`)_

`to_rust_string_lossy` lets you bridge v8's memory to the rust code: https://github.com/cutout-studios/runtime/blob/main/core/lib.rs#L75


**andy** — 2026-10-11T22:38:47Z (`1558972159060353035`)

true


**daniellacosse** — 2026-10-11T22:39:19Z (`1558972293579931830`)

> ↳ replying to daniellacosse: in my prototype i was gonna be extremely aggressive, like, even `console` is an extension

however - i don't know if that level of aggression is the right approach overall haha


**andy** — 2026-10-11T22:40:13Z (`1558972521083043954`)

i mean, implementing console as an extension would be a good exercise of how well the extensions system actually works


**daniellacosse** — 2026-10-11T22:40:21Z, edited 2026-10-11T22:40:34Z (`1558972557397463091`)

yeah, exactly my thought

_(2026-10-11T22:41:12Z, edited 2026-10-11T22:41:44Z `1558972770094948385`)_

but the actual better dx may be to support something like `--ext=recommended` by default


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-11T22:42:10Z (`1558973013863440425`)

What I’m hearing might be reimplementations of Deno core rather than a fork of what already exists. As I understand, that’s one potential avenue. I think there are a few of them we’ve discussed including handing off Deno to the community like Luca did with Fresh.


**andy** — 2026-10-11T22:42:18Z, edited 2026-10-11T22:42:32Z (`1558973044116955139`)

i think it should act like deno by default, and then it should be `--preset=none --exts=a,b,c` to opt out

_(2026-10-11T22:43:01Z `1558973227236335758`)_

and of course there would be `--no-exts=a,b,c` as well if you just want to remove specific extensions


**daniellacosse** — 2026-10-11T22:44:13Z, edited 2026-10-11T22:52:00Z (`1558973528907190303`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: What I’m hearing might be reimplementations of Deno core rather than a fork of what already exists. As I understand, tha

for me the waterfall is:

- the community gets access to deno and all the stuff to continue mantaining it as is - ✨ *ideal* ✨
- we create a deno fork and maybe dress it up a little bit, it's only natural
- a rewrite, if maintaining the fork proves too difficult


**andy** — 2026-10-11T22:45:02Z, edited 2026-10-11T22:45:22Z (`1558973732117151846`)

i think this one year where the deno team maintains their version will be enough time to make a rewrite ready to hand-off from deno, but we will see, if need be, we can just fork a few weeks before when deno loses support


**daniellacosse** — 2026-10-11T22:45:39Z (`1558973887839207666`)

well, it should probably be sooner so there's enough overlap for people to consider the switch, rather than just leave deno entirely

_(2026-10-11T22:45:47Z `1558973924493099019`)_

that's tricky though


**andy** — 2026-10-11T22:45:50Z (`1558973936761569291`)

true


**daniellacosse** — 2026-10-12T02:09:07Z (`1559025094729146432`)

\[no text content]

_(2026-10-12T02:09:08Z, edited 2026-10-12T02:09:27Z `1559025096084160584`)_

probably worth pushing this discord when people express frustration where we can


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-12T02:11:25Z (`1559025672125681734`)

I put together my own knowledge base to better wrap my mind around what’s going on 

https://ethanthatonekid.github.io/dcwg-memory/

_(2026-10-12T02:13:07Z `1559026097717518337`)_

I’ll keep it up to date with the assistance of ai


**daniellacosse** — 2026-10-12T02:18:17Z, edited 2026-10-12T02:41:35Z (`1559027401013600348`)

fyi a lot of the links go to I assume a private repo (they're public now, thank you!!)


**netop://ウィビ** — 2026-10-12T02:55:40Z (`1559036806412894319`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: I put together my own knowledge base to better wrap my mind around what’s going on   https://ethanthatonekid.github.io/d

Oh there’s an Ende page! Got a correction to make: Disc is my database, forked from Gel. THAT team went to Vercel.

_(2026-10-12T02:58:46Z, edited 2026-10-12T02:58:55Z `1559037588654784653`)_

I’m commissioning an artist friend for a logo and the early sketches look great.


**daniellacosse** — 2026-10-12T03:02:28Z (`1559038518473261139`)

> ↳ replying to netop://ウィビ: Oh there’s an Ende page! Got a correction to make: Disc is my database, forked from Gel. THAT team went to Vercel.

ill need to read through your work thusfar when i have a moment


**Romuald Quantin** — 2026-10-12T08:45:27Z (`1559124832883310662`)

Shouldn't all that be taken by https://openjsf.org/ ?
[embed] A safe and modern home for JavaScript technologies | OpenJS Foundation OpenJS promotes the widespread adoption and continued development of key JavaScript solutions worldwide.


**strmnn** — 2026-10-12T13:44:13Z (`1559200021508006041`)

this isn't my discord but i also agree that the main focus should first maybe be forking as-is and going from there

_(2026-10-12T13:45:34Z `1559200359053000735`)_

also i'm using my own vite-8 fresh fork for quite some time now, maybe its helpful: https://github.com/nnmrts/fresh/tree/vite-8
[embed] GitHub - nnmrts/fresh at vite-8 The next-gen web framework. Contribute to nnmrts/fresh development by creating an account on GitHub.

_(2026-10-12T13:47:06Z `1559200745176305665`)_

imo a big selling point of deno/the eventual fork of deno could be `deno desktop`

last time i checked, all alternatives still rely on electron, right?

_(2026-10-12T13:47:23Z `1559200816282337353`)_

or some weird unmaintained tauri thing i guess


**r n** — 2026-10-12T13:47:43Z (`1559200903331057764`)

> ↳ replying to strmnn: imo a big selling point of deno/the eventual fork of deno could be `deno desktop`  last time i checked, all alternatives

https://blackboard.sh/electrobun/
[embed] Electrobun - Build ultra fast, tiny, cross-platform desktop apps Electrobun 2.0 — desktop apps in TypeScript, Zig, Rust, Go, or Odin. System webview or Chromium. Apps measured in megabytes, not hundreds.

_(2026-10-12T13:48:10Z `1559201013175685171`)_

I personally haven't found a drop-in replacement for `deno desktop` because it doesn't care about your codebase


**CCXLV** — 2026-10-12T13:53:51Z, edited 2026-10-12T13:54:27Z (`1559202447224995962`)

> ↳ replying to Romuald Quantin: Shouldn't all that be taken by https://openjsf.org/ ?

I don't think they would bless the "community" to continue the development. Somebody like that should work on it in my opinion. It would be a tough road to work on a fork or a rewrite even. Funding will be difficult, quality will most likely be pretty fragile and the user base (if it will have any) will be far more pessimistic than they were about Deno

_(2026-10-12T13:55:00Z `1559202734022856835`)_

that's just my honest opinion

_(2026-10-12T13:58:12Z `1559203538062680116`)_

Deno wasn't just some random project, in the long run, had they continued actively developing it, it definitely would have replaced nodejs, so there are far more things to consider if you guys actually want to maintain Deno

_(2026-10-12T13:59:44Z `1559203924265803778`)_

and there's competition too, basically against organizations and foundations who do have funding and teams capable of continuing the development


**Max P.** — 2026-10-12T13:59:59Z (`1559203988178469027`)

> ↳ replying to Romuald Quantin: Shouldn't all that be taken by https://openjsf.org/ ?

I think it might be worth reaching out to the OpenJS Foundation at this early stage, just to explore whether they'd be interested in supporting a community-led continuation of Deno.

We currently lack a formal organization, which could become an issue when it comes to governance, funding, trademarks, and potentially taking over project infrastructure.

OpenJS already provides this kind of organizational framework for projects like Node.js and Electron.

I'm not suggesting we apply for membership right now, but simply have an informal conversation to see whether they'd be open to helping us establish a sustainable structure.

What do you think?


**CCXLV** — 2026-10-12T14:01:15Z, edited 2026-10-12T14:02:14Z (`1559204308069654610`)

Maybe a fork would be a much better option at this time, than actually wanting/aiming to maintain the actual project


**Flying Mindz | Jannick** — 2026-10-12T14:04:54Z (`1559205226534404211`)

> ↳ replying to Max P.: I think it might be worth reaching out to the OpenJS Foundation at this early stage, just to explore whether they'd be i

Taking care of the organisational part first makes sense in my opinion. A fork with fancy new tech and features will not do us any good if the organisational framework is missing. I too would probably be the person to directly jump into the code, but for such a big and established project and a scrambling community, we need structure if we want to achieve anything stable.


**CCXLV** — 2026-10-12T14:06:36Z (`1559205654605070380`)

maybe with a fixed team too at the beginning working on the fork

_(2026-10-12T14:06:40Z `1559205672149848095`)_

roles and stuff

_(2026-10-12T14:08:06Z `1559206031089868883`)_

then when the fork gets recognized, gets a community then asking for the ownership would be much easier than directly aiming for it in the first place


**Max P.** — 2026-10-12T14:09:19Z (`1559206337760460831`)

Credibility is a major concern here.

Keeping Deno alive with just a handful of people, only for it to see little adoption and eventually fade away, is very different from maintaining it within a credible and sustainable organizational framework.

From my perspective, the latter would be the better approach.


**r n** — 2026-10-12T14:09:55Z (`1559206488478715935`)

deno is already heavily supported by agentic development so that's not the biggest problem


**CCXLV** — 2026-10-12T14:10:53Z (`1559206731223928906`)

> ↳ replying to r n: deno is already heavily supported by agentic development so that's not the biggest problem

I don't think so, is it?


**r n** — 2026-10-12T14:11:00Z (`1559206762697990156`)

> ↳ replying to CCXLV: I don't think so, is it?

yes


**CCXLV** — 2026-10-12T14:11:20Z (`1559206844247838792`)

also directly doing the development with agents, that project wont have a bright future imo


**Flying Mindz | Jannick** — 2026-10-12T14:11:58Z (`1559207004202082447`)

> ↳ replying to Max P.: Credibility is a major concern here.  Keeping Deno alive with just a handful of people, only for it to see little adopti

Agreed. People will ask “who took over the project? Who makes sure that releases are safe and tested? Who owns the code? Who makes decisions?”

Trust is critical


**r n** — 2026-10-12T14:12:03Z (`1559207025190109305`)

`https://github.com/lunadogbot` that's just one of his bot accounts used for agentic development


**CCXLV** — 2026-10-12T14:12:03Z (`1559207027241123925`)

> ↳ replying to r n: yes

i don't think so...


**r n** — 2026-10-12T14:12:26Z (`1559207121059455037`)

look at the issues the account has worked on


**CCXLV** — 2026-10-12T14:13:07Z (`1559207295039185047`)

hasn't done anything in the last 6 months


**r n** — 2026-10-12T14:13:26Z (`1559207372994514985`)

as I said, that's just **one** of this accounts


**CCXLV** — 2026-10-12T14:13:32Z (`1559207399578013778`)

and mostly it's just docs stuff


**Max P.** — 2026-10-12T14:16:25Z (`1559208122504183871`)

> ↳ replying to r n: deno is already heavily supported by agentic development so that's not the biggest problem

AI agents can certainly help reduce the development workload, but they don't replace experienced maintainers who can understand, review, and take responsibility for the code. We also need to avoid generating large amounts of code that nobody can realistically maintain in the long run. Reliable agentic development workflows require proper oversight, infrastructure, and funding. Ultimately, our ability to maintain and understand the code must keep pace with our ability to produce it.


**r n** — 2026-10-12T14:19:34Z, edited 2026-10-12T14:19:48Z (`1559208915634233417`)

> ↳ replying to Max P.: AI agents can certainly help reduce the development workload, but they don't replace experienced maintainers who can und

I agree with you, but have fun with it nowadays. Pretty sure that most people/newly devs don't want to spent that amount of time on OS projects (anymore).


**CCXLV** — 2026-10-12T14:28:53Z (`1559211259792990319`)

> ↳ replying to r n: I agree with you, but have fun with it nowadays. Pretty sure that most people/newly devs don't want to spent that amount

they don't have to

_(2026-10-12T14:29:31Z `1559211422389637252`)_

if they don't want to spend time work on an OSS project why use agents to "contribute"


**Broglah** — 2026-10-12T14:34:04Z (`1559212566574530664`)

Most importantly, ai agentic workflows are only as good as the intent that's entered.


**andy** — 2026-10-12T14:55:02Z (`1559217840823861259`)

> ↳ replying to r n: deno is already heavily supported by agentic development so that's not the biggest problem

honestly, i think it is a bit of a problem, because towards the end, deno got a bit unstable (nowhere near as unstable as bun, granted), especially on the `deno desktop` side of things

_(2026-10-12T14:55:29Z `1559217955219443863`)_

also we need to think about maintainability into the far-far future

_(2026-10-12T14:55:54Z `1559218060878151832`)_

so i think it's better to err on the strict side of no-AI, and then gradually become less and less restrictive as we gain confidence


**Broglah** — 2026-10-12T14:56:50Z (`1559218296983912490`)

Nah, ai is probably better than majority of devs tbh, you just need a human barrier to check it's work on PRs

_(2026-10-12T14:57:15Z `1559218398464974950`)_

And humans guiding direction of the project as a whole


**andy** — 2026-10-12T14:58:28Z (`1559218706939252827`)

> ↳ replying to Broglah: Nah, ai is probably better than majority of devs tbh, you just need a human barrier to check it's work on PRs

I've heard that claim a lot, I'm not confident about it, every time I try to work with AI I end up going 'this is exceedingly dumb and unmaintainable', which could just be a me problem

_(2026-10-12T14:58:59Z `1559218836333535405`)_

also there's just an aspect of I do coding because I find it fun, and I don't find AI fun because it does most of the work for you


**Broglah** — 2026-10-12T15:02:31Z (`1559219727589580883`)

[attachment] signal-2026-10-11-20-48-38-742.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559219727572795522/signal-2026-10-11-20-48-38-742.png?ex=6ad4df87&is=6ad38e07&hm=653d61ca19f9d08ce62cbf5f413f9988b0c29ff63ff0c68a41fd3b82308bdd2e&)

_(2026-10-12T15:02:43Z `1559219774637215816`)_

This is a good take on ai


**andy** — 2026-10-12T15:04:03Z (`1559220110730727456`)

I have worked with good models lol, also I'm not sure I trust Andrej Karpathy's take, given that he works at OAI, introducing some bias

_(2026-10-12T15:04:44Z `1559220282533613731`)_

I think at the start we shouldn't rely on AI, let the collective knowledge of the community guide it

_(2026-10-12T15:05:04Z `1559220367896354929`)_

If you vibe-code a runtime, you get Bun, and Bun is so unstable. :)


**CCXLV** — 2026-10-12T15:11:30Z (`1559221984997539840`)

This guy put it really well in the Deno server
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559221984456482836/image.png?ex=6ad4e1a2&is=6ad39022&hm=c572a4b31b77162667517111e4a23afcd78f99f37f52b4d29f6712291e72832d&)


**andy** — 2026-10-12T15:14:44Z (`1559222798944309271`)

> ↳ replying to CCXLV: This guy put it really well in the Deno server

I agree with the message, although maybe not the tone


**netop://ウィビ** — 2026-10-12T15:31:30Z (`1559227021517652171`)

> ↳ replying to CCXLV: This guy put it really well in the Deno server

Thought this was my screenshot because I used the same emoji reactions LOL


**davey** — 2026-10-12T15:32:13Z (`1559227199276711937`)

IMO agentic dev on a Deno fork will be easy to mess up. I'd suggest it is used by an experienced swe in rust/runtimes. With AI + human review.


**netop://ウィビ** — 2026-10-12T15:32:49Z (`1559227349994569805`)

SMH y'all are saying this with "dumb coder" in mind


**davey** — 2026-10-12T15:33:26Z (`1559227504638828686`)

Wrt sustainability, this is probably the boring part but makes sense to work on up front.


**CaptainLach** — 2026-10-12T15:34:23Z, edited 2026-10-12T15:35:18Z (`1559227744250888268`)

> ↳ replying to strmnn: also i'm using my own vite-8 fresh fork for quite some time now, maybe its helpful: https://github.com/nnmrts/fresh/tree

I also had my own fork of fresh, with the focus on being more friendly to deno ecosystem, e.g it allows to avoid node_modules, and does not use vite weird node-centric transpilation passes at all (instead it uses webpack with the intention to move to rs-pack, and transpiles everything using deno itself), the server is being run using deno without any transpilation:
https://github.com/CertainLach/freshpack

It also was more optimized wrt caching, because it was using content-addressed chunks based on https://github.com/freshframework/fresh/pull/3779
Every update only changes a couple of files in the bundle instead of forcing the clients to redownload font files etc

Multiple internal portals on my work are based on it


**davey** — 2026-10-12T15:35:48Z (`1559228101160865884`)

Also trust, Deno Inc had their reputation to lose. What about with a fork, we would be trusting a small and new group with running binaries on our devices and servers. How can we grow the trust and have security policies in place to prevent malicious actors?


**Broglah** — 2026-10-12T15:37:02Z, edited 2026-10-12T15:37:32Z (`1559228411359006733`)

Same as any Corp does, you gate the binaries behind release gates.


**davey** — 2026-10-12T15:38:38Z (`1559228814557712495`)

And who sets the gates? The project lead/admin? Then they are the one we trust right?

_(2026-10-12T15:40:13Z `1559229213574438944`)_

I'm not trying to be contrary for the sake of it. The chan if trust would be key, especially given that Deno attracts devs that care about security.


**CaptainLach** — 2026-10-12T15:40:22Z (`1559229252208173218`)

> ↳ replying to netop://ウィビ: SMH y'all are saying this with "dumb coder" in mind

LLMs might work somehow when you are already know everything about the codebase, this isn't about intellegence, it is about wisdom and familiarity with the codebase
Unless it is done by someone from the past core team it is very hard to expect that the author has considered everything, llm output is subtly broken too often to not overlook


**netop://ウィビ** — 2026-10-12T15:41:06Z (`1559229437298352139`)

> ↳ replying to CaptainLach: LLMs might work somehow when you are already know everything about the codebase, this isn't about intellegence, it is ab

Planning goes a long way, as well as doing things in chunks.

_(2026-10-12T15:41:16Z `1559229476498579518`)_

And LOTS of tests


**r n** — 2026-10-12T15:42:15Z (`1559229726692876343`)

I don't think that this one will be the only fork of deno then

_(2026-10-12T15:42:41Z `1559229833433710675`)_

it's so stupid discussing it in a private discord instead of the official one


**CaptainLach** — 2026-10-12T15:42:44Z (`1559229845349601422`)

> ↳ replying to netop://ウィビ: Planning goes a long way, as well as doing things in chunks.

Still, it is not a replacement for someone who has real experience with such large codebase. Some extension crates - sure, but not the core runtime


**netop://ウィビ** — 2026-10-12T15:43:15Z (`1559229978111905884`)

<:BlobShrug:857383422540644352>

_(2026-10-12T15:44:29Z `1559230285067845774`)_

Good luck finding a Rust god who cares enough about Deno to pick up the Slack with a fork. I'm not waiting around for that. I've got 15+ years of coding experience, most of it in front-end technologies and TypeScript. I can figure shit out.

_(2026-10-12T15:45:04Z `1559230433487749231`)_

This also isn't my first rodeo. Forking an existing project used by millions for my own purposes has turned out great.


**r n** — 2026-10-12T15:45:12Z (`1559230466735870013`)

and this is the reason why anyone should switch to this project?

_(2026-10-12T15:45:17Z, edited 2026-10-12T15:46:33Z `1559230487036428523`)_

well do it, have fun. there is a difference between knowing the language while building something and "figuring it out"


**strmnn** — 2026-10-12T15:45:34Z (`1559230559836704819`)

lets rewrite deno in


deno


**netop://ウィビ** — 2026-10-12T15:46:23Z (`1559230765072519310`)

Wringing our hands and stuck in analysis paralysis is a choice but I'm not gonna yuck anyone's yum

_(2026-10-12T15:46:44Z `1559230853085790209`)_

May the best fork win! We got a year


**CaptainLach** — 2026-10-12T15:47:17Z (`1559230993330602087`)

I'm willing to be a reviewer for any future-deno-fork contributions, I'm not considering myself a god, but I do care about Deno, and have some experience with the codebase as I used deno_core as a library. I do not consider it safe to use llm for contributions myself tho


**strmnn** — 2026-10-12T15:49:13Z (`1559231477151961171`)

i'm sadly a complete rust noob - but i used deno extensively...if it was a video game, i'd have like 20k hours in it

so if anyone needs feedback on what made deno so good or just history to learn from, hmu lol

_(2026-10-12T15:50:42Z `1559231851397390541`)_

i like that this discord exists and try to be optimistic, but at the same time lets be honest, the most realistic outcome is a couple of solo devs making half popular forks until we all accept theres only node again in a year or two...

_(2026-10-12T15:52:57Z `1559232418379206799`)_

a neat part of deno as a runtime, imo, came from them being part of that ecmascript committee where you pay like thousands of $ to be able to take part in their meetings...i hope cloudflare at least continues some of that work


**davey** — 2026-10-12T15:53:40Z (`1559232599795179623`)

Well, there is a world where one or 2 find a modest userbase. Who are content with the pace that a small (spare time) team can move at.


**strmnn** — 2026-10-12T15:53:53Z (`1559232651821580529`)

> ↳ replying to strmnn: a neat part of deno as a runtime, imo, came from them being part of that ecmascript committee where you pay like thousan

but i'm also so fucking done putting trust into corps 💀


**davey** — 2026-10-12T15:53:55Z (`1559232661283938426`)

That could run for years


**m1m1** — 2026-10-12T15:56:38Z (`1559233343852257373`)

Beside addressing  already spotted issues what improvements are needed to make deno usable in the long term ? What it is lacking the most ?


**r n** — 2026-10-12T15:57:34Z (`1559233580050161687`)

> ↳ replying to m1m1: Beside addressing  already spotted issues what improvements are needed to make deno usable in the long term ? What it is

Getting different things finally stable


**Broglah** — 2026-10-12T15:57:45Z (`1559233624899846255`)

Is the fork setup on github?


**CaptainLach** — 2026-10-12T15:58:05Z (`1559233710279237664`)

There is no fork yet


**Broglah** — 2026-10-12T15:59:38Z (`1559234099041017890`)

[attachment] image0.gif (https://cdn.discordapp.com/attachments/1558965777850302546/1559234099095412776/image0.gif?ex=6ad4ecea&is=6ad39b6a&hm=ff4a4c65056b95ab0e25e29e80abfeb6cf0b15d3019edffbad48a4dcdc609953&)


**CaptainLach** — 2026-10-12T16:00:54Z (`1559234420014317639`)

> ↳ replying to m1m1: Beside addressing  already spotted issues what improvements are needed to make deno usable in the long term ? What it is

There are many annoying bugs in deno, and fixing some of them will require restructuring the codebase, because a lot of stuff is structured very weirdly, perhaps because of proprietary parts such as deno deploy


**Broglah** — 2026-10-12T16:00:58Z (`1559234435633778689`)

Be good to get nightly builds and then a stable branch too.


**strmnn** — 2026-10-12T16:02:20Z (`1559234778367131668`)

> ↳ replying to CaptainLach: There are many annoying bugs in deno, and fixing some of them will require restructuring the codebase, because a lot of 

do we have a list? can we make one?

_(2026-10-12T16:04:21Z `1559235287559835809`)_

a good starting point might be these four filters:

https://github.com/denoland/deno/issues?q=is:issue+state:open+sort:reactions-+1-desc
https://github.com/denoland/deno/issues?q=is:issue+state:open+sort:comments-desc
https://github.com/denoland/deno/issues?q=is:issue+state:open+label:bug+sort:reactions-+1-desc
https://github.com/denoland/deno/issues?q=is:issue+state:open+label:bug+sort:comments-desc


**CaptainLach** — 2026-10-12T16:04:28Z (`1559235316467114097`)

> ↳ replying to CaptainLach: There are many annoying bugs in deno, and fixing some of them will require restructuring the codebase, because a lot of 

I have multiple things I was unable to contribute properly, because they affect multiple repos, all of them are published weirdly and downloaded as binary blobs in the main one
E.g I wanted deno graph to be able to walk css to be able to publish such stuff to jsr (not the best example of stuff that everyone needs, still it was something I wanted for fresh), but it comes to deno repo from multiple sources, e.g from crates.io and jsr.io, and it was just impossible to link correctly


**strmnn** — 2026-10-12T16:05:14Z (`1559235507714789398`)

> ↳ replying to CaptainLach: I have multiple things I was unable to contribute properly, because they affect multiple repos, all of them are publishe

oh dang...yeah theres a couple of those...similar to how deno_doc is some separate repo


**CaptainLach** — 2026-10-12T16:06:09Z (`1559235739496087633`)

And while it is fine to have such stuff in dedicated repos, it makes submitting changes for review very challenging for non-staff


**strmnn** — 2026-10-12T16:06:15Z (`1559235763193905183`)

yeah

_(2026-10-12T16:06:21Z `1559235791262056479`)_

or stuff like <https://github.com/denoland/deno_media_type>


**CaptainLach** — 2026-10-12T16:07:31Z (`1559236085219983513`)

So while counterintuitive to go to monorepos, I think the first thing deno fork needs to do is to simplify external contributions by bringing core repos together


**netop://ウィビ** — 2026-10-12T16:07:36Z (`1559236106283782168`)

> ↳ replying to strmnn: i like that this discord exists and try to be optimistic, but at the same time lets be honest, the most realistic outcom

I'm stubborn af, I'd support my measly single-user fork.

_(2026-10-12T16:08:06Z `1559236229390803037`)_

Yeah the Deno orgs's repo collection is a MESS


**strmnn** — 2026-10-12T16:08:09Z (`1559236244507197530`)

oh shit i forgot about <https://github.com/denoland/rusty_v8>

_(2026-10-12T16:08:28Z `1559236322881839126`)_

i feel like theres only five people on the planet who understand rusty_v8


**CaptainLach** — 2026-10-12T16:08:31Z (`1559236336387367124`)

rusty_v8 is fine to be separated I think, because it is pretty low-level, and cloudflare wants to use it anyway


**strmnn** — 2026-10-12T16:08:57Z (`1559236443237519491`)

> ↳ replying to CaptainLach: rusty_v8 is fine to be separated I think, because it is pretty low-level, and cloudflare wants to use it anyway

but they might make it closed source <:glorpsuffer:1333124482541551647>


**CaptainLach** — 2026-10-12T16:10:08Z (`1559236743222272193`)

That would be very annoying, but unless their commitment to maintain deno for one year is futile it should be fine as long as deno fork will arise 😄


**netop://ウィビ** — 2026-10-12T16:11:43Z (`1559237141761101887`)

Any code that references the Deno namespace internally should be rolled into Deno proper


**strmnn** — 2026-10-12T16:12:08Z (`1559237245771190403`)

theres also a bit of hope that some main people from the deno team will just continue, at least partially, working on deno...because unless i missed it, theres no mention of where the actual workers of the deno team will go after the acquisition


**netop://ウィビ** — 2026-10-12T16:12:34Z (`1559237355611754539`)

Um...aren't they ALL going to Cloudflare?


**strmnn** — 2026-10-12T16:12:59Z (`1559237458565009469`)

idk, as i said, i mightve missed parts of it, but most acquisitions also come with layoffs


**CaptainLach** — 2026-10-12T16:13:00Z (`1559237464638492714`)

I think not all of them, because many were laid off earlier


**netop://ウィビ** — 2026-10-12T16:13:09Z (`1559237503209185392`)

SMDH SHEESH

_(2026-10-12T16:13:28Z `1559237580636291115`)_

Well if I'm laid off I'm not coming back to work for free LOL


**strmnn** — 2026-10-12T16:13:40Z (`1559237630648909885`)

unless you really believed in it


**netop://ウィビ** — 2026-10-12T16:13:44Z (`1559237649317761137`)

Right


**CaptainLach** — 2026-10-12T16:14:09Z (`1559237750903939294`)

I think some of them were using deno after the laid off, I see dsherret contributions for example


**strmnn** — 2026-10-12T16:14:15Z (`1559237779647373453`)

and it doesn't have to be for free...i would subscribe to a patreon of og people like lucacasonato or kitsonk


**netop://ウィビ** — 2026-10-12T16:14:43Z (`1559237895926317089`)

So, effectively, free


**strmnn** — 2026-10-12T16:14:55Z (`1559237945096142959`)

yes <a:glitchglorp:1465010667202416845>

_(2026-10-12T16:15:05Z `1559237987643039746`)_

freeno

_(2026-10-12T16:18:05Z `1559238743163142228`)_

is there some collaborative way to just start a kinda decentralized project on github? because everyone of us here could open up a deno fork org and invite some people but at the end of the day, someone will always be the admin

_(2026-10-12T16:18:30Z `1559238848838373447`)_

(doesnt have to be github but i'd prefer it because of actions)


**daniellacosse** — 2026-10-12T16:19:32Z (`1559239109111844865`)

Seems you can make an org with multiple owners?


**CaptainLach** — 2026-10-12T16:19:33Z (`1559239112949629200`)

I would like for someone with the existing contributions to do so

I can do it, and I'm willing to start on merging a lot of stuff into monorepo already


**strmnn** — 2026-10-12T16:20:04Z (`1559239242503430296`)

or the best thing to do rn is to just wait and see if any of the deno team will react/blogpost something, idk

_(2026-10-12T16:20:53Z `1559239448095621254`)_

> ↳ replying to CaptainLach: I would like for someone with the existing contributions to do so  I can do it, and I'm willing to start on merging a lo

sure, go for it, but please dont have a motorcycle accident, then be in prison, and then ask for donos in the npm postinstall <a:WAYTOOGLORP:1346401924735565844>


**CaptainLach** — 2026-10-12T16:22:54Z (`1559239953941139467`)

I just want to setup a base for a fork so there is already a better start for accepting contributions for other past contributors than to fork everything themselves
No changes of my own for now


**strmnn** — 2026-10-12T16:23:23Z (`1559240077308076123`)

yeah jokes aside, someone with a lot of contributions is a good choice, if its you then its you


**daniellacosse** — 2026-10-12T16:23:36Z (`1559240130118549615`)

> ↳ replying to strmnn: yeah jokes aside, someone with a lot of contributions is a good choice, if its you then its you

seconded


**CaptainLach** — 2026-10-12T16:24:24Z (`1559240332854689875`)

I don't have a lots of submitted contributions, but I had experienced pain from trying to do more


**strmnn** — 2026-10-12T16:24:38Z (`1559240392136728639`)

even better

_(2026-10-12T16:24:52Z `1559240450446200842`)_

tbh we shouldve seen it coming
[attachment] CleanShot_2026-10-12_at_18.24.482x.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559240450085224468/CleanShot_2026-10-12_at_18.24.482x.png?ex=6ad4f2d4&is=6ad3a154&hm=34fd8d4111e89689a4f6e3bc37a03e2d7835f35c1e34dcf73457c9d27346a194&)


**r n** — 2026-10-12T16:25:26Z (`1559240592733642804`)

yes. they haven't published a new build for almost 4 weeks

_(2026-10-12T16:25:52Z `1559240699332001803`)_

which was kinda odd compared to the previous frequency


**strmnn** — 2026-10-12T16:27:55Z (`1559241218557354135`)

the goat bartlomieju is also joining cloudflare as it seems....seems to be one of the main guys behind that worker thing

_(2026-10-12T16:28:07Z `1559241266976264224`)_

wtf even is celld 😭

_(2026-10-12T16:29:56Z `1559241726739357747`)_

ok claude please now say it in non-claudish
[attachment] CleanShot_2026-10-12_at_18.28.492x.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559241726474977420/CleanShot_2026-10-12_at_18.28.492x.png?ex=6ad44b44&is=6ad2f9c4&hm=a71eb9259643912ee0cfe79acf2e8f13c88b3e7d57d11951afdf4e76439fb719&)

_(2026-10-12T16:30:22Z `1559241833077538837`)_

anyways, <@178483185468833793> send your org/fork/repo in here if you are ready, i am hyped


**CaptainLach** — 2026-10-12T16:40:31Z (`1559244390210338917`)

Working on merging everything and applying basic fixups so it can build first
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559244389237133414/image.png?ex=6ad44dbf&is=6ad2fc3f&hm=2a65c408985b971ed0767b4edf53f558f85210fb70890e597bca09a0fbfc835d&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559244389866274938/image.png?ex=6ad44dbf&is=6ad2fc3f&hm=7f942a206f9e0995e479f87363e8b0525dd37fa84046e6421be2d47243638bd8&)

_(2026-10-12T17:17:03Z `1559253580664545340`)_

Managed to get it to build with graph merged. Packages such as @deno/loader etc are not available for build yet, but that would be my next step to ensure there is no external dependencies, and any changes can be done without cross-repo review:
https://github.com/are-we-dodo-yet/dodo
[embed] GitHub - are-we-dodo-yet/dodo: Deno fork, untangling mess Deno fork, untangling mess. Contribute to are-we-dodo-yet/dodo development by creating an account on GitHub.

_(2026-10-12T17:18:52Z `1559254039995355218`)_

I'm trying to do minimal changes for now,

"Add 'aux/...'" commits are coming from git subtree, and their content should match original repos exactly, "refactor: merge X" commits coming after are fixups to make everything build. The change history is preserved during this merge.
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559254040007934052/image.png?ex=6ad456bc&is=6ad3053c&hm=9d7685ea190107db2210b5d90a62e7972d88019b53b642087e6429561e2f68a6&)


**andy** — 2026-10-12T17:49:56Z (`1559261857301266493`)

neat!

_(2026-10-12T17:50:18Z `1559261951530639401`)_

add me to the are-we-dodo-yet organization, my username is andylovescode on GH


**w** — 2026-10-12T17:50:33Z (`1559262014269034547`)

can you add me as well? wbk


**andy** — 2026-10-12T17:50:41Z (`1559262046430961675`)

also <@178483185468833793> you're getting modded for high activity and enthusiasm

_(2026-10-12T17:50:52Z `1559262092396200037`)_

as in you have perms to moderate now


**daniellacosse** — 2026-10-12T17:51:15Z, edited 2026-10-12T17:51:24Z (`1559262187590000691`)

same name on gh: <@400711308141658112>


**CaptainLach** — 2026-10-12T17:52:27Z (`1559262492872548373`)

> ↳ replying to andy: add me to the are-we-dodo-yet organization, my username is andylovescode on GH

Sent you an invite

For now the main branch is not locked, please avoid pushing directly into it, after I finish the current restructuring I'll lock it and will submit all the changes through PRs


**andy** — 2026-10-12T17:52:46Z (`1559262569460400179`)

yep

_(2026-10-12T17:53:01Z `1559262633968926801`)_

i dont plan to touch the fork too much, i'm asynchronously working on a rewrite and we can compare which approach we feel is better


**CaptainLach** — 2026-10-12T17:53:01Z (`1559262634145218713`)

Also I might do some force-pushes sometimes for now


**Max P.** — 2026-10-12T18:02:58Z (`1559265136211136525`)

<@178483185468833793> Could you add me to the `are-we-dodo-yet` organization as well? My GitHub username is `0xMax42`.


**CaptainLach** — 2026-10-12T18:08:21Z, edited 2026-10-12T18:08:58Z (`1559266492879474810`)

Set up the branch protection (right now only I can push to trunk), added 0xMax42, wbk and daniellacosse
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559266492564897832/image.png?ex=6ad46255&is=6ad310d5&hm=a39d8698778c953a7217c31d0b66196f1ede42d347933cca7c445434fd864dd0&)


**Max P.** — 2026-10-12T18:08:22Z (`1559266495945506970`)

<@178483185468833793> Thx!


**daniellacosse** — 2026-10-12T18:09:00Z (`1559266656163860716`)

bless u sir


**CaptainLach** — 2026-10-12T18:09:12Z (`1559266704284979231`)

Btw, the repo is public, for some reason github doesn't showing it


**w** — 2026-10-12T18:10:01Z (`1559266911081209982`)

I see it unauthed


**Stag Math** — 2026-10-12T18:22:29Z (`1559270049687015574`)

oh shoot i need to get working on those logo concepts haha
it's very exciting to see this coming together!!


**Broglah** — 2026-10-12T18:29:53Z (`1559271909668163585`)

Awesome 🎉


**strmnn** — 2026-10-12T18:33:27Z (`1559272808112988162`)

lets goooo, i'm nnmrts on github (same profile pic) but i dont need to be part of the org, i can do PRs anyway


**CaptainLach** — 2026-10-12T18:35:06Z, edited 2026-10-12T18:35:09Z (`1559273224049533082`)

Added anyway, members don't have any capabilities other than working in different branches


**davey** — 2026-10-12T18:38:58Z (`1559274197081915523`)

Would it be helpful to have some workflow to track upstream activity, that would generate a PR to keep the monorepo in sync for the next 12 months?

_(2026-10-12T18:39:31Z `1559274334097375245`)_

May be able to raise a PR to do that, earthlingdavey on GH.


**CaptainLach** — 2026-10-12T18:43:19Z (`1559275292973858848`)

Please, github actions make me cry, but I would not be able to switch repo to nix for the sake of other contributors 😄


**Max P.** — 2026-10-12T18:53:39Z (`1559277890829418638`)

I'd be happy to help with the GitHub Actions workflows as well. I won't have time today, but I can take a look tomorrow and contribute.

<@371201159630815234>, if you start working on this, just let me know which branch you're using, and I'll take a look and see where I can help.


**CaptainLach** — 2026-10-12T18:55:10Z (`1559278274255917227`)

I will add my own runners a bit later, as I'm not sure if github free tier can handle that


**strmnn** — 2026-10-12T18:58:26Z (`1559279095148183694`)

i have github pro and enterprise, so lmk if something is slow/crashing

_(2026-10-12T18:59:52Z `1559279455992680539`)_

i think we could technically move the org to my enterprise thingy without having to change urls and whatnot but lets just wait with that


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:07:21Z (`1559281339851870221`)

Okay! Uhmm, is Deno going down? Like please can anyone take sometime and explain me this situation?

_(2026-10-12T19:07:44Z `1559281438350643251`)_

I love Deno. I have been keeping an eye on this for over 2 years now.

_(2026-10-12T19:08:44Z `1559281688779952271`)_

I am currently learning Rust. Just the basics. Like it's been only 2 months of part-time learning.

_(2026-10-12T19:09:11Z `1559281800893964382`)_

I know very basic C++. I can try to learn more. But first we need to have a plan of forking this.

_(2026-10-12T19:09:53Z `1559281976706605119`)_

Has anyone looked into this? What happens if the original team leaves the project? Please can everyone jump in and explain me parts of it.


**w** — 2026-10-12T19:10:28Z (`1559282124111220817`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Has anyone looked into this? What happens if the original team leaves the project? Please can everyone jump in and expla

First I'd suggest you check the history of this Discord.  A lot of this is up in the air, and a lot of us are scrambling to establish scope.

_(2026-10-12T19:10:48Z `1559282206357196881`)_

Lots of people in here are using Deno in different ways, for different things, with different levels of expertise and involvement.


**strmnn** — 2026-10-12T19:11:03Z (`1559282272488783995`)

<@1258271039679369237> 
<https://deno.com/blog/cloudflare>
<https://blog.cloudflare.com/deno-joins-cloudflare/>


**CaptainLach** — 2026-10-12T19:11:05Z (`1559282280491384895`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Okay! Uhmm, is Deno going down? Like please can anyone take sometime and explain me this situation?

Afaik deno was not profitable, their team developed a thing that works like cloudflare workers, and then cloudflare bought the team, they don't need deno with it

_(2026-10-12T19:12:43Z, edited 2026-10-12T19:13:40Z `1559282691508019262`)_

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Has anyone looked into this? What happens if the original team leaves the project? Please can everyone jump in and expla

For now I decided to do something, and make a version of deno codebase that is easier to contribute to: the original structure of deno was a dozen of standalone repos, and any change had to go through all of them, it was too hard to make any contribution that touched multiple repos.

As far as I understand, that was done for the purpose of reusing such components in proprietary codebase based on deno, i.e deno deploy. With no original team working on this, this separation is pointless, and I thought that the first step should be to simplify that and the release processes


**w** — 2026-10-12T19:14:09Z (`1559283053048631379`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Has anyone looked into this? What happens if the original team leaves the project? Please can everyone jump in and expla

Speaking generally, either the project dies, or it moves into a foundation (remember when Node.js used to be part of Joyent? -- similar process to that, but without industry juggernaut support), or one or more other projects pick the bones and spawn new projects from it.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:14:22Z (`1559283106836516910`)

> ↳ replying to w: First I'd suggest you check the history of this Discord.  A lot of this is up in the air, and a lot of us are scrambling

Okay. I wil take my time and read them. I will find time.


**w** — 2026-10-12T19:14:28Z (`1559283131830509669`)

Most of the productive conversations here have been around bone picking


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:14:39Z (`1559283175195156491`)

> ↳ replying to strmnn: <@1258271039679369237>  <https://deno.com/blog/cloudflare> <https://blog.cloudflare.com/deno-joins-cloudflare/>

oh, I will read them in detail.

_(2026-10-12T19:15:41Z `1559283438090199122`)_

> ↳ replying to CaptainLach: Afaik deno was not profitable, their team developed a thing that works like cloudflare workers, and then cloudflare boug

I see. Okay. So if we pull Deno, we take a sinking ship. Keep that in mind. Some awesome programmers have left the ship. 
This should be cautious button.

_(2026-10-12T19:16:42Z `1559283694072500417`)_

> ↳ replying to CaptainLach: For now I decided to do something, and make a version of deno codebase that is easier to contribute to: the original str

I see. 
Okay! Good point. Do you wanna build it on GitHub or take it to somewhere like Codeberg or even Forge?


**CaptainLach** — 2026-10-12T19:16:49Z (`1559283721054720112`)

As long as someone wants to maintain demo for the sake of their own products, and not trying to make deno itself profitable, I think the fork has all the chances to live


**strmnn** — 2026-10-12T19:16:52Z (`1559283734639943681`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Okay. I wil take my time and read them. I will find time.

this (in my eyes weird) tweet, posted 10 days ago by ry, also explains a lot: <https://x.com/rough__sea/status/2105853283617440032>

> once you see it, you'll realize there's no point to traditional javascript runtimes in serving applications - only for build processes (eg bundling) and scripting.

TLDR: the people who made Deno now make fancy other things I don't understand which are seemingly only relevant to fortune 500 companies but there's still like a bunch of people depending on and/or believing in Deno as a thing itself, so here we are


**CaptainLach** — 2026-10-12T19:18:51Z (`1559284235720720574`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I see.  Okay! Good point. Do you wanna build it on GitHub or take it to somewhere like Codeberg or even Forge?

If we want to make it easier to contribute to, I don't think it should live somewhere else than github at this moment
https://github.com/are-we-dodo-yet/dodo

I would like to move everything somewhere else (In fact, I moved many of my projects to private gerrit with the git UI I built on my own: https://git.delta.rocks), but it would make it much harder to get contributors
[embed] GitHub - are-we-dodo-yet/dodo: Deno fork, untangling mess Deno fork, untangling mess. Contribute to are-we-dodo-yet/dodo development by creating an account on GitHub.


**w** — 2026-10-12T19:19:00Z (`1559284269770088579`)

If I were trying to build a profitable startup out of a js runtime, I can absolutely understand the position of "celld/wasm is the future, a generic OS-integrating runtime can only cannibalize it"


**strmnn** — 2026-10-12T19:19:55Z (`1559284500851196026`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I see.  Okay! Good point. Do you wanna build it on GitHub or take it to somewhere like Codeberg or even Forge?

I wish it wasn't like this, but I'd advise against hosting a community fork - that ideally should get more contributors -  somewhere else than on GitHub


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:20:19Z (`1559284603682824257`)

> ↳ replying to w: Speaking generally, either the project dies, or it moves into a foundation (remember when Node.js used to be part of Joy

Yeah. This is complex to understand for me. But I can see what you mean. Yeah.

_(2026-10-12T19:20:32Z `1559284655864414409`)_

> ↳ replying to w: Most of the productive conversations here have been around bone picking

I see.


**davey** — 2026-10-12T19:20:38Z, edited 2026-10-12T19:21:08Z (`1559284683601354763`)

> ↳ replying to CaptainLach: I will add my own runners a bit later, as I'm not sure if github free tier can handle that

Public repos get a decent free tier, my suggestion, assume they will be capable, until they aren't .


**w** — 2026-10-12T19:20:49Z (`1559284731051253816`)

IMO right now the best interests of ende/dodo/whatever it's called are served by creating the fewest pain points for the most people likely to contribute -- which means lowest common denominator everything -- discord, github, accessible over "better"


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:21:25Z (`1559284879970144319`)

> ↳ replying to strmnn: this (in my eyes weird) tweet, posted 10 days ago by ry, also explains a lot: <https://x.com/rough__sea/status/210585328

I see. Damn. I see. But both are important, right? Try to build a product, and positioning it?

_(2026-10-12T19:22:09Z `1559285063374479361`)_

> ↳ replying to CaptainLach: If we want to make it easier to contribute to, I don't think it should live somewhere else than github at this moment ht

I will contribute. I will learn and contribute.

_(2026-10-12T19:22:30Z `1559285152364896297`)_

I don't wanna see it die. Bro. This is the reason I started learning Rust to be honest.

_(2026-10-12T19:22:53Z `1559285248808714361`)_

> ↳ replying to strmnn: I wish it wasn't like this, but I'd advise against hosting a community fork - that ideally should get more contributors 

Okay, good that we did this discussion

_(2026-10-12T19:23:23Z `1559285374554087615`)_

> ↳ replying to w: IMO right now the best interests of ende/dodo/whatever it's called are served by creating the fewest pain points for the

This is best keep the name? Or make it OpenDeno?


**davey** — 2026-10-12T19:23:34Z (`1559285420095705099`)

> ↳ replying to Max P.: I'd be happy to help with the GitHub Actions workflows as well. I won't have time today, but I can take a look tomorrow 

Will likely be midday UK tomorrow. So no rush here. Happy for a voice chat if you want to bounce ideas


**strmnn** — 2026-10-12T19:24:04Z (`1559285547565060238`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I see. Damn. I see. But both are important, right? Try to build a product, and positioning it?

idk man, i have no idea of what the market for what is anymore...look at the doomers on the deno/javascript/programming subreddits, they all keep saying deno was dead a year ago...but it's very much alive for the suits that underpaid me at my last job at which i made countless deno tools

_(2026-10-12T19:24:12Z `1559285579076734997`)_

the one good thing coming out of this


**CaptainLach** — 2026-10-12T19:25:28Z (`1559285899735474309`)

I think the thing worth considering here is promoting a ways to donate to dodo, so the companies/users that are using it can donate directly, instead of making deno deploy cloud the only way to make it profitable


**w** — 2026-10-12T19:25:38Z (`1559285940948705401`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: This is best keep the name? Or make it OpenDeno?

There are two projects evolving, one's tentatively codenamed ende, one's tentatively codenamed dodo.  Deno is going to continue for another year.  Both forks seem to me like a radical enough departure that, if they cultivate enough work to even be relevant a year from now, adopting the proper "Deno" name a year from now could be a weird proposition.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:27:58Z (`1559286526737653801`)

> ↳ replying to davey: Will likely be midday UK tomorrow. So no rush here. Happy for a voice chat if you want to bounce ideas

I will join as well. I am from India. And, if ya all decide on a call, do let me know.

_(2026-10-12T19:28:36Z `1559286686326988882`)_

> ↳ replying to strmnn: the one good thing coming out of this

what is it? strman


**CaptainLach** — 2026-10-12T19:29:08Z, edited 2026-10-12T19:29:25Z (`1559286823904219218`)

> Both forks seem to me like a radical enough departure that
For now, the goal I personally see for dodo is to cleanup the stuff that no one can really use, i.e stuff that was intended for keeping deno deploy proprietary, and is not really needed for anything else.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:29:20Z (`1559286870729564201`)

> ↳ replying to CaptainLach: I think the thing worth considering here is promoting a ways to donate to dodo, so the companies/users that are using it

Yeah. I see. Uhmmm, we can email people right? Can we email good people who know how to handle this?


**strmnn** — 2026-10-12T19:29:20Z (`1559286872692494389`)

> ↳ replying to w: There are two projects evolving, one's tentatively codenamed ende, one's tentatively codenamed dodo.  Deno is going to c

what are the different concepts? i dont wanna start drama on the first day but maybe there's a "middle ground"?


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:29:50Z (`1559286997606998158`)

> ↳ replying to w: There are two projects evolving, one's tentatively codenamed ende, one's tentatively codenamed dodo.  Deno is going to c

Okay


**strmnn** — 2026-10-12T19:29:57Z (`1559287029010006159`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: what is it? strman

my former employers being stuck with a dead runtime <:glorpEZ:1285570969754402826>


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:31:15Z (`1559287352889835571`)

> ↳ replying to CaptainLach: > Both forks seem to me like a radical enough departure that For now, the goal I personally see for dodo is to cleanup t

okay, hold on. . . there is a lot going on here. 
uhmmmm, can @everyone please make their own docs on this? like thoughts on how to keep Deno sustainable from now?

_(2026-10-12T19:31:21Z `1559287377904668754`)_

> ↳ replying to strmnn: my former employers being stuck with a dead runtime <:glorpEZ:1285570969754402826>

Good.

_(2026-10-12T19:31:24Z `1559287393599754360`)_

We have hope.


**strmnn** — 2026-10-12T19:32:05Z (`1559287565587054668`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: okay, hold on. . . there is a lot going on here.  uhmmmm, can @everyone please make their own docs on this? like thought

i believe most (including myself) don't have fully developed (?) thoughts about all this


**CaptainLach** — 2026-10-12T19:32:42Z (`1559287717576183931`)

The first step should be to gain contributors who already use deno in prod and don't want to switch to node/bun, and can do bare minimum to keep it up to date with v8 updates


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:32:42Z (`1559287719073415290`)

> ↳ replying to strmnn: i believe most (including myself) don't have fully developed (?) thoughts about all this

then it's a good time. I will write something.

_(2026-10-12T19:32:57Z `1559287781157511172`)_

> ↳ replying to CaptainLach: The first step should be to gain contributors who already use deno in prod and don't want to switch to node/bun, and can

Yeah!

_(2026-10-12T19:33:00Z `1559287796684955649`)_

Good point.


**CaptainLach** — 2026-10-12T19:33:25Z (`1559287900754018347`)

After that I think we should setup opencollective and some issues can have bounties on them idk


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:35:30Z (`1559288424970719303`)

> ↳ replying to CaptainLach: After that I think we should setup opencollective and some issues can have bounties on them idk

I see.


**w** — 2026-10-12T19:35:54Z (`1559288526288191631`)

> ↳ replying to CaptainLach: > Both forks seem to me like a radical enough departure that For now, the goal I personally see for dodo is to cleanup t

Yeah, I can see that, I can see maintaining future compatibility with rusty_v8/v8 bindings beyond security patches, I can see expanded web api support (i have my own Web Audio API ext I have a couple hundred hours into which I don't want to die either), I can see node compatibility brought forward, I can see permissions cleaned up a bit, I can see some attention towards the issues on deno's issue tracker.

I can see a migration path for people using deno deploy, but I think it's worth waiting to see if any bigger players shake something loose here, maybe supabase or fresh or even cloudflare comes up with something.

Deno KV I struggle to form an opinion on.  Same, for me, with deno compile, deno desktop. I'd bet these are important to _someone_, though.

I can't see stewardship of jsr:@std, but I can see ensuring compatibility with it.

.. this is getting long, but I think establishing scope would go a long way for different people finding different ways to contribute.  I have a strong desire to help, but I struggle to find a self-directed way to do so without stepping on anyone's toes.

Maybe the UK midday call tomorrow is a good time and place for that?

_(2026-10-12T19:37:37Z `1559288955638124699`)_

(also, wrangling everything into a monorepo is a great first step, big applause for taking that on)


**CaptainLach** — 2026-10-12T19:37:38Z (`1559288961778589867`)

> i have my own Web Audio API ext I have a couple hundred hours into which I don't want to die either
I would love to see that! I wanted this for a long time, but in the end was just spawning ffmpeg/liquidsoap subprocesses D:


**strmnn** — 2026-10-12T19:38:48Z (`1559289256185299086`)

Gamepad API + `deno desktop` - boom we are the next trillion dollar game engine

_(2026-10-12T19:39:11Z `1559289349844242595`)_

jk, but gamepad api would still be nice


**CaptainLach** — 2026-10-12T19:39:57Z (`1559289542383767643`)

I wonder if stuff like that can be reused from servo


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T19:40:17Z (`1559289629889532006`)

> ↳ replying to strmnn: Gamepad API + `deno desktop` - boom we are the next trillion dollar game engine

yeah, like that idea


**strmnn** — 2026-10-12T19:40:34Z (`1559289700412428430`)

there's a lot of web apis that are only supported in browsers but would actually be even more useful on servers and/or desktop apps written in js


**davey** — 2026-10-12T19:40:35Z (`1559289705206513776`)

<@184349064161132563> I was initially thinking a call just to talk workflows for syncing upstream. But would also 100% be up for joining a bigger picture call, I just couldnt lead or contribute much to that.


**w** — 2026-10-12T19:41:38Z (`1559289969221050420`)

> ↳ replying to CaptainLach: > i have my own Web Audio API ext I have a couple hundred hours into which I don't want to die either I would love to se

It's overly-LLM'd right now, and also reliant on an overly-LLM'd fork of orottier/web-audio-api-rs -- the grand vision here is a rewrite -- but it is usable.  https://github.com/smudgy-mud/deno_audio


**daniellacosse** — 2026-10-12T19:54:22Z (`1559293172927037502`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: okay, hold on. . . there is a lot going on here.  uhmmmm, can @everyone please make their own docs on this? like thought

<@1446955102706471002> started taking/synthesizing notes:  https://ethanthatonekid.github.io/dcwg-memory/

_(2026-10-12T19:55:51Z `1559293545930817667`)_

> ↳ replying to strmnn: what are the different concepts? i dont wanna start drama on the first day but maybe there's a "middle ground"?

here's the best breakdown as i can sort of summarize:

- ende started as basically a stripping down of deno to only its useful core
- dodo is intended to be basically a drop-in replacement led by the community. and the first step there, as <@178483185468833793> has pointed out, is de-commercializing it

_(2026-10-12T19:56:49Z `1559293789682802770`)_

personally, I would love to see the mono-repoization also decouple the extensions and make them pluggable. then it does become sort of a middle ground

_(2026-10-12T19:57:44Z, edited 2026-10-12T20:13:22Z `1559294021359239199`)_

where you can pick and choose the extensions you want - none,  like ende, or things like Deno KV, etc: expounded by <@1136701682131144714>  here: https://discord.com/channels/1558888938251223050/1559219836297547847/1559219836297547847

_(2026-10-12T19:58:20Z `1559294170475139183`)_

strategically this could also spread out the maintenance burden and potentially get other orgs bought in with their own extensions, but that's way down the line

_(2026-10-12T20:02:26Z, edited 2026-10-12T20:12:16Z `1559295202253078610`)_

> ↳ replying to CaptainLach: After that I think we should setup opencollective and some issues can have bounties on them idk

I'd say the two things keeping this effort from being legitimate/taken seriously are yeah, funding, and some sort of official buy-in or endorsement from the previous devs

_(2026-10-12T20:04:24Z, edited 2026-10-12T20:16:26Z `1559295698363621480`)_

> ↳ replying to w: Yeah, I can see that, I can see maintaining future compatibility with rusty_v8/v8 bindings beyond security patches, I ca

react to this if you'd like to schedule an initial call so we can really nail down the alignment? if enough interest I'll start a poll to pick the best time

_(2026-10-12T20:09:50Z `1559297066453172245`)_

> ↳ replying to daniellacosse: here's the best breakdown as i can sort of summarize:  - ende started as basically a stripping down of deno to only its 

more on ende in <#1559276145835253921>


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-12T20:28:31Z (`1559301766019944449`)

> ↳ replying to daniellacosse: <@1446955102706471002> started taking/synthesizing notes:  https://ethanthatonekid.github.io/dcwg-memory/

Is it ok with u and the server members if I set up an automation to scrape the daily activity to keep the wiki up to date?

_(2026-10-12T20:28:44Z `1559301820411547834`)_

I can implement that this week if you’re comfortable with that.


**daniellacosse** — 2026-10-12T20:29:04Z (`1559301906348646461`)

I think we'd probably want to note that in the rules <@1136701682131144714>

_(2026-10-12T20:29:44Z `1559302074322124871`)_

Just so people are aware it's happening?

Or maybe we can have it only target certain channels, I think that would also help


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-12T20:31:43Z (`1559302572974538843`)

Additionally we can facilitate access to the server via answeroverflow.com so anyone can hook into certain channels as context for llms

Alternatively I’m comfortable manually curating the wiki and open source contributions as well 🙂


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T20:49:52Z (`1559307137791041648`)

> ↳ replying to daniellacosse: <@1446955102706471002> started taking/synthesizing notes:  https://ethanthatonekid.github.io/dcwg-memory/

Good!

_(2026-10-12T20:50:04Z `1559307188432937043`)_

I am proud of you guyzz


**killioiden** — 2026-10-12T20:50:46Z (`1559307363964686357`)

so guys whats this fork gonna be called


**daniellacosse** — 2026-10-12T20:59:04Z (`1559309452451119226`)

> ↳ replying to killioiden: so guys whats this fork gonna be called

dodo is the leading candidate rn


**killioiden** — 2026-10-12T20:59:16Z (`1559309505093967883`)

so what is ende then?


**daniellacosse** — 2026-10-12T20:59:42Z (`1559309612082008245`)

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559309611713175682/image.png?ex=6ad48a7e&is=6ad338fe&hm=90b614df20ce3fd870262ba9f1ac1402afa66526c5bdc5785335ebd1effcb43f&)


**killioiden** — 2026-10-12T20:59:57Z (`1559309674841374802`)

> ↳ replying to daniellacosse: 

might run into copyright issue but idk


**CaptainLach** — 2026-10-12T21:00:06Z (`1559309713655603334`)

> ↳ replying to killioiden: so what is ende then?

Another fork, with other goals: <#1559276145835253921>


**killioiden** — 2026-10-12T21:00:11Z (`1559309734778249267`)

ah


**daniellacosse** — 2026-10-12T21:01:26Z (`1559310050244173897`)

> ↳ replying to daniellacosse: 

(credit to <@277618935300358144> )


**killioiden** — 2026-10-12T21:01:59Z (`1559310186483552380`)

tbh I think the letters should completely be mixed up, if we do another deno anagram its just gonna sound weird and all the same

_(2026-10-12T21:02:46Z `1559310383762776176`)_

4 letters sure, i think thats optimal


**daniellacosse** — 2026-10-12T21:02:54Z (`1559310420404342877`)

i personally like that about dodo: it clearly breaks the anagram thing while still paying omage


**killioiden** — 2026-10-12T21:03:12Z (`1559310495410950185`)

eh

_(2026-10-12T21:03:17Z `1559310516491526295`)_

its getting too similar

_(2026-10-12T21:04:43Z `1559310876719321131`)_

damn ende is a really good name


**daniellacosse** — 2026-10-12T21:05:04Z (`1559310965340766219`)

i feel like a complete break is a hard sell/thing to get people rallied around


**killioiden** — 2026-10-12T21:05:07Z (`1559310978124873825`)

what if we just name it

_(2026-10-12T21:05:09Z `1559310983938445334`)_

Cat

_(2026-10-12T21:05:21Z `1559311034278223973`)_

`Cat.creatSync()`

_(2026-10-12T21:05:23Z `1559311044252278946`)_

yeah i cna see that


**daniellacosse** — 2026-10-12T21:05:27Z (`1559311062195642462`)

yeah! ende is good too. still pays omage


**killioiden** — 2026-10-12T21:07:20Z (`1559311533769756784`)

if you care so much about omage i think edon or oden are better

_(2026-10-12T21:07:32Z `1559311584483086370`)_

odin

_(2026-10-12T21:07:46Z `1559311645824786463`)_

> ↳ replying to killioiden: odin

could make a logo with a hammer / lightning or something

_(2026-10-12T21:07:51Z `1559311664480911361`)_

to symbolize speed


**visualbam** — 2026-10-12T21:07:56Z, edited 2026-10-12T21:08:23Z (`1559311684529815673`)

<@1136701682131144714> <@400711308141658112> Here's a branding package. Use the `mark_dark_filled.png` for discord server icon. Until something better or name comes along
[attachment] asset-contact-sheet.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559311683607076904/asset-contact-sheet.png?ex=6ad48c6b&is=6ad33aeb&hm=f944fc5ff0c0bb5b221891480e08d30ef118de78d5b81008af20eef1962c44a1&)
[attachment] Dodo_Logo_Assets.zip (https://cdn.discordapp.com/attachments/1558965777850302546/1559311683934097559/Dodo_Logo_Assets.zip?ex=6ad48c6c&is=6ad33aec&hm=5a7420ea4ced3c97356b5c9837a02eef756b8fe8ccd1a56c8595592fa497f74b&)
[attachment] mark_dark_filled.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559311684219183215/mark_dark_filled.png?ex=6ad48c6c&is=6ad33aec&hm=35977c9100b94bfd87a033b9c04bd5c3527df4bde8310d1cbee25ddaec7ea911&)


**killioiden** — 2026-10-12T21:07:56Z, edited 2026-10-12T21:08:20Z (`1559311686807068774`)

flashiness


**Broglah** — 2026-10-12T21:08:27Z (`1559311814779469976`)

Have a dead deno in the background


**killioiden** — 2026-10-12T21:10:06Z (`1559312229432557652`)

> ↳ replying to killioiden: could make a logo with a hammer / lightning or something

im by no means a graphic designer but i think a white hammer with its handle turning into a lightning bolt on black background could be fire


**CaptainLach** — 2026-10-12T21:10:06Z (`1559312231685034077`)

> ↳ replying to visualbam: <@1136701682131144714> <@400711308141658112> Here's a branding package. Use the `mark_dark_filled.png` for discord serve

Can you clarify the license for those logos?


**daniellacosse** — 2026-10-12T21:11:09Z (`1559312493510270989`)

> ↳ replying to CaptainLach: Can you clarify the license for those logos?

ah yes, laws 😅 good callout


**CaptainLach** — 2026-10-12T21:11:55Z (`1559312687526191128`)

> ↳ replying to killioiden: could make a logo with a hammer / lightning or something

For me, deno was never about the execution speed, its still the same JS, on the same v8 engine... It was just much friendlier


**killioiden** — 2026-10-12T21:12:09Z (`1559312746452091054`)

fijr

_(2026-10-12T21:12:17Z `1559312780912361614`)_

friendly interactive javascript runtime

_(2026-10-12T21:12:37Z `1559312865343574098`)_

first

_(2026-10-12T21:12:55Z `1559312940233138177`)_

Friendly Interactive Runtime for TypeScript

_(2026-10-12T21:12:59Z `1559312957161083041`)_

thank me later


**CaptainLach** — 2026-10-12T21:15:55Z (`1559313695459516497`)

It was more than just separation, but I have finally made deno testsuite work on my machine, horray

_(2026-10-12T21:16:05Z `1559313735586422956`)_

I think I'm done with forcepushes for now

_(2026-10-12T21:17:22Z `1559314059202142330`)_

It feels like no one was running those tests locally, otherwise I have no idea how some tests worked with more than one thread


**visualbam** — 2026-10-12T21:20:05Z, edited 2026-10-12T21:22:05Z (`1559314743548973200`)

> ↳ replying to CaptainLach: Can you clarify the license for those logos?

Pretty sure they’re MIT. They’re ending support and moving on. First they would need to have a serious issue with a different logo paying homage to theirs. Second, they would just ask us not to use it first if it was an issue. Third, there’s parody protection. (Not a blanket but it probably applies here 🙂 )


**CaptainLach** — 2026-10-12T21:27:27Z (`1559316597233946829`)

> ↳ replying to CaptainLach: I think I'm done with forcepushes for now

Actually, no, I forgot I wanted to minimize the reformat...

_(2026-10-12T21:32:18Z `1559317819576029245`)_

> ↳ replying to visualbam: Pretty sure they’re MIT. They’re ending support and moving on. First they would need to have a serious issue with a diff

I'm talking about dodo icons, not deno 😄

_(2026-10-12T21:32:58Z `1559317986924302457`)_

Oh, you mean you're giving them under MIT?


**visualbam** — 2026-10-12T21:33:09Z (`1559318032931754075`)

> ↳ replying to CaptainLach: I'm talking about dodo icons, not deno 😄

Ohhh sorry, thought you were worried about the similarity.

_(2026-10-12T21:38:08Z `1559319284876845157`)_

> ↳ replying to CaptainLach: Oh, you mean you're giving them under MIT?

Yeah I was thinking MIT would be fine


**Broglah** — 2026-10-12T21:45:06Z (`1559321038355955723`)

[attachment] Dodo_Takeover_1.mp4 (https://cdn.discordapp.com/attachments/1558965777850302546/1559321038007967815/Dodo_Takeover_1.mp4?ex=6ad49522&is=6ad343a2&hm=17cc7b63e9f7a0c05e269d7d2afbcd49b9a0483a584068edd3f24dd8e3b4cb8e&)


**visualbam** — 2026-10-12T21:48:37Z (`1559321924604002457`)

> ↳ replying to Broglah: 

You're amazing 😂


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T21:49:11Z (`1559322065901854731`)

> ↳ replying to Broglah: 

Hot damn


**CaptainLach** — 2026-10-12T22:08:54Z (`1559327030406021191`)

Given how much the full testsuite takes on my machine, I doubt github free tier would be enough 😄
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559327030091325631/image.png?ex=6ad49ab6&is=6ad34936&hm=5e3431c3e15e57e1e60d7bda0bf84f4cc41676e408f6bdb04a5f30ee8ede53b1&)


**Sandeep Kumar Kuanar✌🏼** — 2026-10-12T22:09:17Z (`1559327123590881283`)

> ↳ replying to CaptainLach: Given how much the full testsuite takes on my machine, I doubt github free tier would be enough 😄

Oh my god


**CaptainLach** — 2026-10-12T22:09:45Z (`1559327243346649228`)

On the other hand, interestingly, it seems that many of those tests are not being ran on github at all


**w** — 2026-10-12T22:10:44Z (`1559327491263565835`)

> ↳ replying to CaptainLach: Given how much the full testsuite takes on my machine, I doubt github free tier would be enough 😄

How long does the entire test run take with all guns a'blazing?


**andy** — 2026-10-12T22:11:30Z (`1559327683198844999`)

blacksmith?


**CaptainLach** — 2026-10-12T22:11:33Z (`1559327695223918686`)

Idk about the full test run yet, I'm still fixing some stuff to make it work in less perfect than github runners conditions

_(2026-10-12T22:13:15Z `1559328122636337172`)_

E.g it expects any gpu to produce the exact same image, and it never works that way, this is why such tech is being used for fingerprinting

https://github.com/are-we-dodo-yet/dodo/commit/60daa66c61e5220f4a3e5548a43be97c97d9ac33
[embed] test: gpu-agnostic image encoding · are-we-dodo-yet/dodo@60daa66 Signed-off-by: Yaroslav Bolyukin <iam@lach.pw>

_(2026-10-12T22:17:10Z `1559329108494655550`)_

Given that test runner includes some logic intended for claude (lol), it seems that many of those tests are only being ran when LLM decides to run them

_(2026-10-12T22:17:41Z `1559329238581117051`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559329238430257192/image.png?ex=6ad49cc5&is=6ad34b45&hm=f7820ad2e3fab95d179bf3c21f3c112b6d27d248db58772f83032bb6494577d1&)


**daniellacosse** — 2026-10-12T22:19:10Z (`1559329610913812493`)

is it possible to set things up such that we only run the tests assoc. with the code that changed?

_(2026-10-12T22:19:30Z `1559329695789486204`)_

with the full suite before release


**CaptainLach** — 2026-10-12T22:19:54Z (`1559329795865837689`)

> ↳ replying to CaptainLach: Idk about the full test run yet, I'm still fixing some stuff to make it work in less perfect than github runners conditi

Why are there tests that expects request to google over ipv6 to fail just because they are done using ipv6 D:
Have I setup ipv6 in my home just to make some tests fail D:

_(2026-10-12T22:20:34Z `1559329964191383654`)_

> ↳ replying to daniellacosse: is it possible to set things up such that we only run the tests assoc. with the code that changed?

I think here is already stuff for that, I'm just trying to run the whole testsuite

\[system] 18 — 2026-10-12T23:30:52Z
_(2026-10-12T23:53:11Z `1559353272467198024`)_

Ok, fixed enough for today, the spec testsuite is now much more reliable


**daniellacosse** — 2026-10-12T23:54:02Z (`1559353487601434705`)

i'll need to check out the diff of what you had to change


**CaptainLach** — 2026-10-12T23:55:38Z (`1559353887628984350`)

I did couple of opinionated changes in the process, but all of those changes were reviewed in private at my company, I can elaborate on them further

I guess the most affecting security-wise is this
https://github.com/are-we-dodo-yet/dodo/commit/f5eb4bcf4ea5429fafc761dab6e143cc748828b4
[embed] feat: allow plumbing LD_/DYLD_ flags unchanged from OS · are-we-do... Some environments expect those to be forwarded to the child processes,
and in the past, deno only allowed to have blanket permit on them,
while the values user has set for them should be trusted by...


**Cyan** — 2026-10-12T23:59:03Z (`1559354749826895914`)

hello~


**CaptainLach** — 2026-10-13T00:00:20Z, edited 2026-10-13T00:00:43Z (`1559355069575725097`)

The behavior before: when any of `LD_` flags are set, Deno is refusing to spawn subprocesses, because it is possible to create a file, point `LD_PRELOAD` or other on it, and then it would work as an arbitrary code execution

Because of that, deno always required -A flag to be passed, since it is impossible to predict what did the code set `LD_` flag for

The new behavior is - it is fine to forward `LD_` flags as-is, as long as they were not altered by the code, because in this case it was the user's environment intention to forward them, and it is pretty normal to have such flags present for e.g jack, nix development environments, and in many other setups

I wanted to just add more exclusions to the tests, but it would be futile anyway, because this behavior is expectation of the certain linker behavior, which is not for deno to decide

_(2026-10-13T00:01:41Z, edited 2026-10-13T00:01:50Z `1559355411717431377`)_

On the same note I just remembered that Nix has `NIX_LD_` env vars with the same behavior, and I think I should secure the old deno restriction for that

_(2026-10-13T00:06:14Z `1559356555630088252`)_

I also had to fix multiple deno test failures on the way, the most confusing for me is https://github.com/are-we-dodo-yet/dodo/commit/69a26c13e8d5bf00f0029146b4e1ceb322321454
[embed] fix: __reportException wiring · are-we-dodo-yet/dodo@69a26c1 Signed-off-by: Yaroslav Bolyukin <iam@lach.pw>

_(2026-10-13T00:07:01Z, edited 2026-10-13T00:08:02Z `1559356754066939955`)_

I had to backport some of this code from the older deno version, it did break the tests when it was removed, but this test was never ran in CI
Due to __reportException missing, failures in some stuff (e.g when the rejection is thrown from Socket#close()) were silently ignored

_(2026-10-13T00:08:33Z `1559357140068737117`)_

I guess they had some separate schedule for node-compat tests, maybe on a separate CI?..


**Cyan** — 2026-10-13T00:09:48Z (`1559357452196126782`)

Should we really do node compat <:xwhoami:1167679154888650792>


**andy** — 2026-10-13T00:10:07Z (`1559357533393657979`)

for dodo, yeah

_(2026-10-13T00:10:15Z `1559357565266296887`)_

dodo is supposed to be a drop-in replacement for deno


**Cyan** — 2026-10-13T00:11:05Z (`1559357778361983049`)

is the name final <:xthink:1168568210640085003>


**CaptainLach** — 2026-10-13T00:11:07Z (`1559357785047564370`)

Tbh, I don't care about it either, but I don't think this is right to blatantly drop it


**Cyan** — 2026-10-13T00:12:44Z (`1559358193052811368`)

> ↳ replying to CaptainLach: Tbh, I don't care about it either, but I don't think this is right to blatantly drop it

nah node compat is coupled with deno code it's hard to eliminate it lol


**andy** — 2026-10-13T00:13:14Z (`1559358319028863060`)

> ↳ replying to Cyan: is the name final <:xthink:1168568210640085003>

technically not but people quite like it

_(2026-10-13T00:13:31Z `1559358390671646721`)_

its probably going to stick


**CaptainLach** — 2026-10-13T00:13:35Z (`1559358407637598209`)

Deno team did solve the most issues within it, even though many of those issues were really libraries using node modules wrong, lol
I don't think it makes sense to expand compatibility, I think it would be better to decouple it more from the deno and fix some problems downstream, but it would be certainly bad to just drop it


**Cyan** — 2026-10-13T00:13:37Z (`1559358414352551956`)

[attachment] Screenshot_2026-10-13_08.13.312x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1559358414025658368/Screenshot_2026-10-13_08.13.312x.webp?ex=6ad4b7f1&is=6ad36671&hm=2ef23ea93cf427c0086c7f09260855a1e274965ef2e03bfe8d5f5732c2ea107c&)

_(2026-10-13T00:13:55Z `1559358491720810577`)_

ask deno to do nothing it do node ops


**CaptainLach** — 2026-10-13T00:14:34Z, edited 2026-10-13T00:14:53Z (`1559358653621075989`)

Also node compat is a great test for many of the deno own functions, since most of node compat is implemented on top of deno ops


**Cyan** — 2026-10-13T00:15:55Z (`1559358995083567167`)

do you consider achieving a good performance?

_(2026-10-13T00:16:21Z `1559359101438394470`)_

if so perhaps these node compat should not depend on a wrappers of `Deno.*` ops

_(2026-10-13T00:16:36Z, edited 2026-10-13T00:17:08Z `1559359165259063328`)_

some node compat stuff is wrappers on top of wrappers last time i checked, not sure if things changed


**CaptainLach** — 2026-10-13T00:17:09Z (`1559359305101221909`)

Ffs. I was wondering why windows test fail... AUX is a reserved device name on windows 😄

_(2026-10-13T00:18:56Z `1559359751383687269`)_

> ↳ replying to Cyan: if so perhaps these node compat should not depend on a wrappers of `Deno.*` ops

I don't think it affects node performance that much, unless one node.js op is implemented in terms of many deno ops, which can be optimized


**Cyan** — 2026-10-13T00:19:15Z (`1559359832367169577`)

it's not node.js op is implemented via deno ops

_(2026-10-13T00:19:37Z, edited 2026-10-13T00:19:50Z `1559359923064676483`)_

it's node compat code depends on a wrapper of Deno.* and itself is a wrapper of deno ops


**CaptainLach** — 2026-10-13T00:19:57Z (`1559360006631981198`)

That's what I said


**Cyan** — 2026-10-13T00:20:12Z (`1559360073330069506`)

are we talking about the same ops


**CaptainLach** — 2026-10-13T00:20:59Z (`1559360268553691167`)

I meant that node compat is mostly just reusing deno own ops/Deno.X wrappers/internals


**Cyan** — 2026-10-13T00:21:46Z (`1559360465379794955`)

> ↳ replying to CaptainLach: I meant that node compat is mostly just reusing deno own ops/Deno.X wrappers/internals

yeah, it's several layers of wrappers, pretty sure it's unnecessary and i don't believe `Deno.*` always work the same as node

_(2026-10-13T00:21:54Z `1559360500121215008`)_

and it needs to translate deno errors to node errors

_(2026-10-13T00:22:02Z `1559360534166638613`)_

using try catch or promise.catch etc


**CaptainLach** — 2026-10-13T00:22:04Z, edited 2026-10-13T00:22:23Z (`1559360542315913217`)

But it should not affect performance too much unless one node.js function has to call too many deno ops, in which case it makes sense to create a separate op which does everything in one call


**Cyan** — 2026-10-13T00:22:44Z (`1559360710172090369`)

> ↳ replying to Cyan: are we talking about the same ops

by ops i mean `deno_core` ops


**CaptainLach** — 2026-10-13T00:23:12Z, edited 2026-10-13T00:23:17Z (`1559360827092508734`)

Yes, I was talking about them, Deno.X calls are using the same ops too


**Cyan** — 2026-10-13T00:23:54Z (`1559361004268163133`)

> ↳ replying to CaptainLach: Yes, I was talking about them, Deno.X calls are using the same ops too

it needs to translate arguments, errors where it's unnecessary


**CaptainLach** — 2026-10-13T00:24:40Z (`1559361195822022670`)

In many cases it should still be much cheaper than the op call itself


**Cyan** — 2026-10-13T00:25:19Z (`1559361359542624319`)

> ↳ replying to CaptainLach: In many cases it should still be much cheaper than the op call itself

op call isn't that heavy


**CaptainLach** — 2026-10-13T00:25:22Z (`1559361371903365141`)

Also, the node.js implementation is not that great either in terms of performance tbh


**Cyan** — 2026-10-13T00:25:31Z, edited 2026-10-13T00:25:38Z (`1559361407496101909`)

compared to exceptions iirc


**CaptainLach** — 2026-10-13T00:25:52Z (`1559361496146907137`)

Ok, I think it should be considered on case to case basis anyway


**Cyan** — 2026-10-13T00:26:48Z, edited 2026-10-13T00:27:45Z (`1559361730860159049`)

im not sure if they have fixed that already

_(2026-10-13T00:26:57Z `1559361768814288927`)_

last time i checked it's Deno 2.6 or 2.7

_(2026-10-13T00:27:10Z, edited 2026-10-13T00:27:18Z `1559361825282330726`)_

since they used AI heavily (recently?)


**CaptainLach** — 2026-10-13T00:28:01Z (`1559362040467038280`)

I don't think much changed in regard to that


**Cyan** — 2026-10-13T00:33:54Z (`1559363520259162143`)

oh it has been rewritten to rust

_(2026-10-13T00:34:12Z `1559363593139658885`)_

the pipe wrap


**CaptainLach** — 2026-10-13T00:34:21Z (`1559363631974584464`)

They did rewrite some things to rust, and some things to typescript


**Cyan** — 2026-10-13T00:34:24Z (`1559363644612157580`)

[attachment] Screenshot_2026-10-13_08.34.152x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1559363644322746368/Screenshot_2026-10-13_08.34.152x.webp?ex=6ad4bcd0&is=6ad36b50&hm=ba5cfb74634580209e5da9306dfa0f92a820daf9c227c25ed833508808d1bae8&)

_(2026-10-13T00:36:19Z, edited 2026-10-13T00:36:46Z `1559364125870530632`)_

I guess with the ai tokens they might have rewritten many of them already


**CaptainLach** — 2026-10-13T02:38:31Z (`1559394880571048007`)

> ↳ replying to visualbam: Yeah I was thinking MIT would be fine

Created a repo for branding so it is possible to link to the new logo in the docs: https://github.com/are-we-dodo-yet/branding

+ Gave you write permissions
[embed] GitHub - are-we-dodo-yet/branding Contribute to are-we-dodo-yet/branding development by creating an account on GitHub.


**davey** — 2026-10-13T06:51:06Z (`1559458443528765561`)

> ↳ replying to CaptainLach: I did couple of opinionated changes in the process, but all of those changes were reviewed in private at my company, I c

Would it be worth recording choices like this is a decision log? Possibly checked into the repo?

_(2026-10-13T06:51:57Z `1559458658721472593`)_

Nice progress BTW 😎

_(2026-10-13T07:07:36Z, edited 2026-10-13T07:08:49Z `1559462598670553100`)_

> ↳ replying to CaptainLach: Given how much the full testsuite takes on my machine, I doubt github free tier would be enough 😄

Each one is a process? I wonder if we can do some batched parallelism. Like multiple runners , each with a chunk of the test suite.

And like mentioned, conditional suites based on changes?

_(2026-10-13T07:16:22Z `1559464804031397891`)_

Conditional based on logic, rather than llm sounds more reliable to me. Is there something in rust that can already do that?


**CaptainLach** — 2026-10-13T13:07:28Z (`1559553160983351418`)

I don't think there can be anything general for this sort of stuff. I have seen coverage-based tools than can do such incremental testing, but it would require huge changes to this test infra
I think there should just be a workflow that does all the tests on the merge queue (I'm not sure how github own merge queue would work for that, but Rust's old bors/Netflix Zuul work well for this task)


**daniellacosse** — 2026-10-13T13:55:34Z (`1559565263949533345`)

> ↳ replying to davey: Would it be worth recording choices like this is a decision log? Possibly checked into the repo?

i'm a bit busy this week otherwise i would: should make one of those .github org level repos and include yeah, a decision log and maybe a md file going over the current state of things. would be useful for new joiners


**CaptainLach** — 2026-10-13T13:57:07Z (`1559565655265513595`)

I would write description for stuff like that, yes. I haven't planned to do any behavior changes, but this change was warranted to make the full testsuite pass outside of github runners and isolated devcontainers


**daniellacosse** — 2026-10-13T13:58:41Z (`1559566049236492322`)

I think it can probably wait until after our first meeting anyway

_(2026-10-13T14:04:11Z `1559567431746322556`)_

> ↳ replying to Cyan: yeah, it's several layers of wrappers, pretty sure it's unnecessary and i don't believe `Deno.*` always work the same as

we should just make sure there isn't some underlying architectural reason for the wrappers before simplifying anything


**Cyan** — 2026-10-13T14:04:37Z (`1559567543889567757`)

> ↳ replying to daniellacosse: we should just make sure there isn't some underlying architectural reason for the wrappers before simplifying anything

because it's easier


**daniellacosse** — 2026-10-13T14:04:50Z (`1559567597865795655`)

but they were probably just hedging


**Cyan** — 2026-10-13T14:05:05Z, edited 2026-10-13T14:05:40Z (`1559567661623546000`)

> ↳ replying to Cyan: because it's easier

rewrite have lower costs since ai

_(2026-10-13T14:05:14Z `1559567696390000772`)_

so they have rewritten many of them


**daniellacosse** — 2026-10-13T14:06:08Z (`1559567924715585547`)

if it's just slop then yeah, burn it


**Cyan** — 2026-10-13T14:06:18Z (`1559567967358812181`)

and

_(2026-10-13T14:06:26Z `1559567998296133655`)_

it's also tech debt iirc

_(2026-10-13T14:06:38Z `1559568051568119929`)_

Deno used to *not* have node compat

_(2026-10-13T14:06:43Z `1559568069704286249`)_

and it's @std/node or something

_(2026-10-13T14:06:46Z `1559568084094951478`)_

which have to use Deno.*

_(2026-10-13T14:06:54Z `1559568117909426188`)_

and then it's get merged into the main deno

_(2026-10-13T14:07:09Z, edited 2026-10-13T14:07:41Z `1559568181482360883`)_

and it stayed there since then until they rewrote it via claude


**Lorondos** — 2026-10-13T16:01:10Z (`1559596873139101737`)

> ↳ replying to w: Yeah, I can see that, I can see maintaining future compatibility with rusty_v8/v8 bindings beyond security patches, I ca

I am that somebody on Deno Desktop 😅 , I am migrating a Java application to it and near the tail end of wrapping it up as it works pretty well (minor issue being application icons not working properly) other than that, working pretty well.

I was debating a few options, Electron, Tauri, Electrobun but then saw Deno was doing a desktop and thought it would be interesting to see how it works.


**daniellacosse** — 2026-10-13T16:04:33Z, edited 2026-10-13T16:06:40Z (`1559597726822563862`)

Deno was well positioned to become very cross platform friendly, and having done 5ish years of work in Capacitor/Electron/similar tools prior, I am quite excited to work on bringing deno desktop and mobile forward


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T17:05:10Z (`1559612978318413835`)

> ↳ replying to Lorondos: I am that somebody on Deno Desktop 😅 , I am migrating a Java application to it and near the tail end of wrapping it up 

I am using Tauri for one of my projects.


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T17:06:00Z, edited 2026-10-13T17:06:18Z (`1559613188918607990`)

+1 love Deno desktop, https://github.com/EthanThatOneKid/deno-desktop-tldraw
[embed] GitHub - EthanThatOneKid/deno-desktop-tldraw: Run tldraw (offline) ... Run tldraw (offline) in `deno desktop` apps. Contribute to EthanThatOneKid/deno-desktop-tldraw development by creating an account on GitHub.

_(2026-10-13T17:06:45Z `1559613375993094226`)_

Also using it to build my own knowledge management app like Obsidian.


**paula** — 2026-10-13T17:34:52Z (`1559620454723883160`)

im working on a game in typescript and i made a deno desktop app so i could guarantee webgpu support on every platform, its very buggy but it was simple and didnt bloat the project with electron


**netop://ウィビ** — 2026-10-13T17:36:23Z (`1559620837068374128`)

^ This is one of the many reasons why I consider the "just use Bun" folks unserious people

_(2026-10-13T17:36:35Z `1559620884094787665`)_

Deno is fantastic, warts and all.


**paula** — 2026-10-13T17:37:41Z (`1559621164517564427`)

i guess if anyone wants to see it you can, https://bworld.moder.fans/, it uses Deno.serve for serving the files to the client and also for websockets
my very first websockets project was actually a card game with deno


**eg** — 2026-10-13T17:51:29Z, edited 2026-10-13T17:54:35Z (`1559624635299922023`)

I’m not particularly knowledgeable about Bun, Node, Deno, and the differences between them, but whenever I build something with Deno, everything goes exactly as expected and it’s a blast to use. Lately, I’ve been writing all my scripts in Deno because it just works, it feels like the thing Python has been trying to be for 50 years but never quite managed to pull off

And I’ve always wanted to use tools like linters, testers, and formatters to their full potential; in Node, I would have had to memorize eight different documents across five separate config files for them, whereas in Deno, they just worked. Is there something I don't like? It's just one line of change in `deno.json` to fix that.


**paula** — 2026-10-13T17:53:43Z (`1559625196850253987`)

i started doing all my scripts in deno, faster to write and faster to run than python in my exprience


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T18:27:01Z (`1559633577820291186`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: Also using it to build my own knowledge management app like Obsidian.

Really?? 

I am going to work on something like that as well.


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T18:29:31Z (`1559634205988888629`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Really??   I am going to work on something like that as well.

Mine is definitely a wip 🙈

https://github.com/wazootech/wiki-desktop/
[embed] GitHub - wazootech/wiki-desktop: Wazoo Wiki deno desktop app — fr... Wazoo Wiki deno desktop app — from-scratch Deno desktop boilerplate. - wazootech/wiki-desktop


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T18:30:19Z (`1559634408183566357`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: Mine is definitely a wip 🙈  https://github.com/wazootech/wiki-desktop/

Pal? Handcrafted?

_(2026-10-13T18:30:45Z `1559634515973111939`)_

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: Mine is definitely a wip 🙈  https://github.com/wazootech/wiki-desktop/

It's okay bro. Mine is still in ideation phase

_(2026-10-13T18:31:03Z `1559634590837252218`)_

I will work on it soon after I finish learning basics of TS


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T18:32:21Z (`1559634921767698452`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Pal? Handcrafted?

It should be vanilla web tech on Deno desktop. It’s built on standards like https://github.com/wazootech/linked-markdown
[embed] GitHub - wazootech/linked-markdown: Linked Markdown specification, ... Linked Markdown specification, arXiv paper, and community materials - wazootech/linked-markdown


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T18:33:38Z (`1559635244699619388`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: It should be vanilla web tech on Deno desktop. It’s built on standards like https://github.com/wazootech/linked-markdown

Wrap them in a GUI somewhere in the side and it's a chef's kiss


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T18:35:12Z (`1559635638696026215`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: I will work on it soon after I finish learning basics of TS

Looking forward to ur implementation 🫡


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T18:37:58Z (`1559636335336362085`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: Looking forward to ur implementation 🫡

Sure. But, I don't know. I think I will probably hide the implementation of it using `todo!()` in Rust. It would be a public mirror the code and implementation is protected from AI scrapping. 

I am still not sure how to make it viable but I think I will figure out on the way


**Ethan:Print"Ethan";:GoTo Ethan** — 2026-10-13T18:40:56Z (`1559637081817620571`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Sure. But, I don't know. I think I will probably hide the implementation of it using `todo!()` in Rust. It would be a pu

hey u never know until u try it; that's good enough for me to build things lol


**Sandeep Kumar Kuanar✌🏼** — 2026-10-13T18:52:26Z (`1559639972942712915`)

True, true


**daniellacosse** — 2026-10-13T23:14:02Z (`1559705806709203036`)

changes to README run the entire CI pipeline, fyi
[attachment] Screenshot_2026-10-13_at_19.10.39.png (https://cdn.discordapp.com/attachments/1558965777850302546/1559705806591754291/Screenshot_2026-10-13_at_19.10.39.png?ex=6ad4a9fa&is=6ad3587a&hm=bd9b644a31d6527af3436ebbea3715d1010a98a01fb304389a2a8c6a8c7057f5&)


**CaptainLach** — 2026-10-13T23:19:12Z (`1559707109426470913`)

I have finished most of the decoupling of node layers, I'm not completely happy with the result as for now, but it already can run the stuff I want


**Cyan** — 2026-10-14T13:11:40Z (`1559916603007832105`)

Found my old v8 bindings for Zig (ported from rusty_v8)


**andy** — 2026-10-14T14:50:52Z (`1559941570608767109`)

> ↳ replying to Cyan: Found my old v8 bindings for Zig (ported from rusty_v8)

WAIT I HAVE BEEN DESPERATELY TRYING TO FIND NON-SHITTY V8 BINDINGS FOR ZIG PLEASE SEND ME THE LINK


**Cyan** — 2026-10-14T14:51:30Z (`1559941730260877534`)

> ↳ replying to andy: WAIT I HAVE BEEN DESPERATELY TRYING TO FIND NON-SHITTY V8 BINDINGS FOR ZIG PLEASE SEND ME THE LINK

uh i just use claude to port all missing bindings (i used to hand write them but that's too slow lol)

_(2026-10-14T14:51:49Z `1559941810137341965`)_

you also needs to download and build v8 yourself

_(2026-10-14T14:51:59Z, edited 2026-10-14T14:52:00Z `1559941850280759367`)_

which is a few GB iirc


**andy** — 2026-10-14T14:52:14Z (`1559941912759369752`)

oh nevermind then, part of my goal is avoiding manually compiling v8 lol


**Cyan** — 2026-10-14T14:53:20Z (`1559942188375351370`)

> ↳ replying to andy: oh nevermind then, part of my goal is avoiding manually compiling v8 lol

you have to compile v8

_(2026-10-14T14:53:42Z `1559942281849606187`)_

not stable so ofc no precompiled binaries

_(2026-10-14T14:54:21Z `1559942444089483265`)_

> ↳ replying to Cyan: you have to compile v8

maybe you can reuse rusty_v8's prebuilt binaries but perhaps some allocation api would be slightly different (Rust just a fn addr, but Zig have context etc)

_(2026-10-14T14:55:08Z `1559942645059420332`)_

also i mod v8 a little bit for my own usage


**Sandeep Kumar Kuanar✌🏼** — 2026-10-14T18:55:54Z (`1560003235065110711`)

> ↳ replying to davey: Each one is a process? I wonder if we can do some batched parallelism. Like multiple runners , each with a chunk of the 

Hell yeah! 
Good Idea.


**daniellacosse** — 2026-10-14T19:08:18Z (`1560006354310004810`)

\[no text content]

\[system] 6 — 2026-10-14T19:08:23Z

**w** — 2026-10-14T19:38:37Z (`1560013985783226449`)

> ↳ replying to daniellacosse: 

this might be tricky in dodo without restructuring the tests or mapping which tests apply to which crates -- the tests are largely their separate crates

_(2026-10-14T19:39:22Z `1560014173340045315`)_

and also largely typescript

_(2026-10-14T19:59:54Z `1560019341091667999`)_

> ↳ replying to daniellacosse: 

how long is too long, do you think, to wait for tests to finish when trunk's HEAD changes?


**daniellacosse** — 2026-10-14T20:12:08Z (`1560022420390285520`)

it's really about psychology - the shorter the better obviously, but if I know it's gonna take at least 30m for my suggestions against a PR to go green, I might as well go home for the day (jk)

5-10m feels more like "okay, I'll keep doing what I'm doing" wrt handling code reviews, but that's just me


**CaptainLach** — 2026-10-14T20:12:57Z (`1560022626406244423`)

Merge trains solve that, but it seems that github implementation is suboptimal in that regard


**w** — 2026-10-14T20:13:31Z (`1560022766286143560`)

yeah, the stacked prs afaik just run ci N times anyway


**CaptainLach** — 2026-10-14T20:14:08Z (`1560022922905522377`)

Stacked PRs is a different feature, merge trains are called merge queues in github


**w** — 2026-10-14T20:14:15Z (`1560022953742303314`)

oh! i'll have to look into that


**CaptainLach** — 2026-10-14T20:15:08Z (`1560023172584177788`)

Merge queue is supposed to stack multiple PRs on top of each other and run the CI on top, and in case of failure use some heuristic to reduce the amount of PRs in the queue to exclude the broken one


**w** — 2026-10-14T20:15:10Z (`1560023183548092478`)

got it - yeah - none of my orgs/repos have these turned out

_(2026-10-14T20:15:21Z `1560023229966450740`)_

so it's a true queue


**CaptainLach** — 2026-10-14T20:16:15Z (`1560023456765190237`)

Unfortunately, this heuristic is hard to get right, Rust bors had one well done, but since they switched from bors to github queues... Maybe it is possible to make it do good decisions?

_(2026-10-14T20:18:02Z `1560023901910601883`)_

Given that github/microsoft love to push copilot into everyone's throats, they could've made llm use the CI failure log to do this thing, but well, its not like they want to make copilot useful


**w** — 2026-10-14T20:19:04Z (`1560024164365111457`)

also, correct me if i'm wrong -- looking at the docs for the first time -- gh isn't reducing the work of running ci across N prs, it's just running ci in parallel and trying to increase throughput?

_(2026-10-14T20:19:54Z `1560024375061647492`)_

or is that moreso up to how CI is set up?


**CaptainLach** — 2026-10-14T20:20:15Z (`1560024462240260109`)

I'm pretty sure they do it like proper merge trains do, but I have never used this feature on github

_(2026-10-14T20:20:50Z `1560024608760008825`)_

> I'm pretty sure they do it like proper merge trains do

At least they can, I don't know if there is other modes of operation for that


**w** — 2026-10-14T20:20:59Z (`1560024646122999871`)

https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
[embed] Managing a merge queue - GitHub Docs You can increase development velocity with a merge queue for pull requests in your repository.

_(2026-10-14T20:21:05Z `1560024669762101301`)_

nods, docs do leave a lot to be desired here


**CaptainLach** — 2026-10-14T20:22:19Z (`1560024981121925123`)

Oh, I think I got it, it checks the PR status first, and then allows to run extra checks on the merge queue staged branch

_(2026-10-14T20:23:19Z `1560025233098809468`)_

So we can run quick checks on the PRs themselves, and then the expensive checks as a part of merge queue


**w** — 2026-10-14T20:24:14Z (`1560025465996054645`)

that might be the win

_(2026-10-14T20:28:22Z `1560026505017299155`)_

do you have any thoughts on how you'd structure quick checks?

_(2026-10-14T20:28:55Z `1560026643274403902`)_

might be able to get close to Daniel's idea if you tag test crates with the deno crates the tests are meant to apply to

_(2026-10-14T20:29:04Z `1560026680297394238`)_

either as deps or something else


**CaptainLach** — 2026-10-14T20:29:43Z (`1560026842520359096`)

`./x lint` is quick enough tbh, it verifies all the formatting and the validity of rust code (Since it runs clippy), it does not run the tests, which are slow even in CI, which doesn't run all of them


**w** — 2026-10-14T20:30:20Z (`1560026999303438367`)

aye, i started my first run of them locally about an hour ago, they're still going, and this machine is quite a bit nicer than an action runner


**Cyan** — 2026-10-14T23:59:30Z (`1560079638158508052`)

> ↳ replying to Cyan: uh i just use claude to port all missing bindings (i used to hand write them but that's too slow lol)

~~the startup time is around the same scale as bun, nothing, but also no snapshot~~
[attachment] Screenshot_2026-10-15_07.59.062x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1560079637218857094/Screenshot_2026-10-15_07.59.062x.webp?ex=6ad4b4a2&is=6ad36322&hm=8f40882f3de51fed77bf6e0239b091f344a5ae786a70ebf00aafef3003eb7e83&)


**andy** — 2026-10-15T05:08:38Z (`1560157435455344691`)

how do yall reckon i should implement synchronous api methods for modular core, given that i'd like to run other extensions while one javascript context is waiting for those extensions to reply


**w** — 2026-10-15T15:59:28Z (`1560321223018291341`)

if your api really needs to be sync, the work those other extensions are doing aught to be on another thread


**andy** — 2026-10-15T15:59:55Z (`1560321335199010879`)

> ↳ replying to w: if your api really needs to be sync, the work those other extensions are doing aught to be on another thread

that's not particularly feasible

_(2026-10-15T16:00:02Z `1560321364886290506`)_

i figured out how i plan to do it


**daniellacosse** — 2026-10-15T17:22:35Z (`1560342138116382812`)

do they need to be sync?

_(2026-10-15T17:24:58Z `1560342739273515070`)_

ideally things default async and we have a separate pool for sync


**andy** — 2026-10-15T17:59:09Z (`1560351341010886659`)

yeah i know

_(2026-10-15T17:59:14Z `1560351361235689483`)_

but like Deno.readTextSync exists

_(2026-10-15T17:59:15Z `1560351364842918041`)_

😭

_(2026-10-15T17:59:20Z `1560351386883985420`)_

it's stupid

_(2026-10-15T17:59:23Z `1560351399131217991`)_

its a bad idea

_(2026-10-15T17:59:28Z `1560351420593741918`)_

it should never, ever, ever be used

_(2026-10-15T17:59:31Z `1560351431784013865`)_

but it exists


**daniellacosse** — 2026-10-15T19:41:52Z, edited 2026-10-15T19:42:19Z (`1560377189990531113`)

okay so per the meeting, here are the milestones I've taken down.

## now
- runnable build
- osc application
- github project board to triage important deno issues

## near
- CI improvements
- decision on how to proceed with extensions
- take in security changes from deno

## far
- make our own security changes
- deno desktop/mobile

_(2026-10-15T19:42:34Z `1560377364863520939`)_

any adjustments?


**rabbit_rabbit** — 2026-10-15T20:04:03Z (`1560382772005175348`)

Not trying to be rude, but perhaps there's a better name for this project, if you intend to _not_ go extinct!


**andy** — 2026-10-15T20:04:13Z (`1560382814757851167`)

> ↳ replying to rabbit_rabbit: Not trying to be rude, but perhaps there's a better name for this project, if you intend to _not_ go extinct!

nah its funny


**rabbit_rabbit** — 2026-10-15T20:04:28Z (`1560382875642237070`)

I'll give you that!


**Sandeep Kumar Kuanar✌🏼** — 2026-10-15T20:05:06Z (`1560383037227933880`)

> ↳ replying to rabbit_rabbit: Not trying to be rude, but perhaps there's a better name for this project, if you intend to _not_ go extinct!

that's so good of a thought

_(2026-10-15T20:05:39Z `1560383175161811108`)_

we are kinda low on people, so we can have a competition once? where we loook for names to give this?


**andy** — 2026-10-15T20:05:59Z (`1560383258796236850`)

the name is kinda set in stone atp

_(2026-10-15T20:06:06Z `1560383289171251383`)_

we have a wonderful lil logo and everything


**Sandeep Kumar Kuanar✌🏼** — 2026-10-15T20:06:21Z (`1560383353121669213`)

I see. It's okay! I will role with this name, no worries


**daniellacosse** — 2026-10-15T23:31:01Z (`1560434858545778809`)

> ↳ replying to rabbit_rabbit: Not trying to be rude, but perhaps there's a better name for this project, if you intend to _not_ go extinct!

think of it as ironic

_(2026-10-15T23:36:45Z, edited 2026-10-15T23:36:50Z `1560436299431940127`)_

> ↳ replying to Sandeep Kumar Kuanar✌🏼: we are kinda low on people, so we can have a competition once? where we loook for names to give this?

I should point out that this discord has over 100 members already 😵‍💫


**w** — 2026-10-16T03:09:51Z (`1560489926662033511`)

By the way, in terms of prior art, are folks here familiar with https://github.com/rscarson/rustyscript ?  It's about a 12-18 months out of date, but at one point was moving up to date with deno -- inside of it is a half-reasonable attempt to decouple node support from deno's cli crate, with all of the extensions brought in closer to the runtime than the executable -- so it accomplishes _some_ of dodo's technical goals if you squint ... really hard

_(2026-10-16T03:10:41Z `1560490137828335678`)_

there might be some things in this worth doing/also some worth avoiding

_(2026-10-16T03:11:06Z `1560490243902283806`)_

https://github.com/rscarson/rustyscript/blob/master/src/ext/mod.rs

_(2026-10-16T03:11:14Z `1560490277993717791`)_

but it did succeed in feature flagging deno extensions


**0xulotl** — 2026-10-16T13:57:54Z (`1560653017299165290`)

> ↳ replying to w: By the way, in terms of prior art, are folks here familiar with https://github.com/rscarson/rustyscript ?  It's about a 

I use it, and it really needs some tlc

_(2026-10-16T13:58:47Z `1560653238301229128`)_

some dep it has is stuck on serde 1.219

_(2026-10-16T13:59:17Z `1560653363157139577`)_

there is a pr to fix it, but it’s been a long time since I’ve tested it


**daniellacosse** — 2026-10-16T15:28:47Z, edited 2026-10-16T15:28:53Z (`1560675887559483453`)

> ↳ replying to w: but it did succeed in feature flagging deno extensions

Ah, specifically here:

```rs
    /// Filesystem implementation for the `deno_fs` extension
    ///
    /// Requires the `fs` feature to be enabled
    #[cfg(feature = "fs")]
    #[cfg_attr(docsrs, doc(cfg(feature = "fs")))]
    pub filesystem: deno_fs::FileSystemRc,

    /// Shared in-memory broadcast channel for the `deno_broadcast_channel` extension
    /// Also used by `WebWorker` to communicate with the main thread, if node is enabled
    ///
    /// Requires the `broadcast_channel` feature to be enabled
    #[cfg(feature = "broadcast_channel")]
    #[cfg_attr(docsrs, doc(cfg(feature = "broadcast_channel")))]
    pub broadcast_channel: deno_web::InMemoryBroadcastChannel,
```


**CaptainLach** — 2026-10-16T15:56:24Z (`1560682835856199765`)

(Get the CI green again (from netop://ウィビ 's work) to begin accepting PRs)

Btw, I'll finish with CI on dodo today, there is only a couple of remaining issues which are most likely introduced by github free runners

For example, for autoselectfamily tests, it was previously using google public DNS, and it was failing for me locally because this test was expecting ipv6 to be unavailable.
I switched it to loopback connections to make this test work on both local machine and in CI, but on windows, the refusal somehow takes too long, and this test fails


**daniellacosse** — 2026-10-16T15:57:24Z, edited 2026-10-16T15:57:44Z (`1560683089435562068`)

Yeah, I saw that actually in my initial poking around - okay if you think you can get the CI green, by all means


**Cyan** — 2026-10-17T04:53:31Z (`1560878406160097311`)

> ↳ replying to andy: but like Deno.readTextSync exists

sync often work faster for smaller files, etc.

_(2026-10-17T04:53:34Z `1560878416302047274`)_

tho

_(2026-10-17T04:54:52Z `1560878745550848163`)_

async depends on dispatch to tokio, then os, then tokio wakes, then the deno_core event loop tick to resolve it, and then js microtasks


**andy** — 2026-10-17T05:12:20Z (`1560883139117846639`)

> ↳ replying to Cyan: sync often work faster for smaller files, etc.

barely


**Cyan** — 2026-10-17T05:12:35Z, edited 2026-10-17T05:12:39Z (`1560883204905369771`)

~~idk bun says that haven't verify that~~


**andy** — 2026-10-17T05:12:48Z (`1560883256637792319`)

yeah i don't trust the bun team


**Cyan** — 2026-10-17T05:12:54Z (`1560883282747596882`)

~~before anthropic acquisition btw~~


**andy** — 2026-10-17T05:13:18Z (`1560883383935041559`)

even before they were still kinda sloppy


**Cyan** — 2026-10-17T05:13:27Z (`1560883420459040880`)

> ↳ replying to andy: even before they were still kinda sloppy

true


**CaptainLach** — 2026-10-17T09:41:36Z (`1560950903685652623`)

> ↳ replying to Cyan: sync often work faster for smaller files, etc.

Always*

_(2026-10-17T09:41:54Z `1560950978310578299`)_

Because there is no async file io on linux/macos


**Cyan** — 2026-10-17T09:41:59Z (`1560951000779726902`)

> ↳ replying to CaptainLach: Because there is no async file io on linux/macos

nah

_(2026-10-17T09:42:07Z `1560951032673079377`)_

have you heard of io_uring and kqueue


**CaptainLach** — 2026-10-17T09:42:26Z, edited 2026-10-17T09:42:44Z (`1560951114818387999`)

I mean, there is io-uring, but tokio is just using sync calls on a dedicated threadpool


**Cyan** — 2026-10-17T09:42:38Z (`1560951161954242611`)

> ↳ replying to CaptainLach: I mean, there is io-uring, but tokio is just using sync calls on a dedicated threadpool

yeah, true

_(2026-10-17T09:43:10Z `1560951297258037339`)_

and epoll always say a file fd is readable & writable

_(2026-10-17T09:43:14Z `1560951314727440437`)_

which makes it useless


**CaptainLach** — 2026-10-17T09:44:01Z (`1560951510932787291`)

> ↳ replying to Cyan: and epoll always say a file fd is readable & writable

Because it is due to caches and stuff, io-uring is not readyness-based


**Cyan** — 2026-10-17T09:44:44Z (`1560951690147012639`)

> ↳ replying to CaptainLach: Because it is due to caches and stuff, io-uring is not readyness-based

fs is local, they are always ready to read, but your disk slows

_(2026-10-17T09:45:15Z `1560951822611513415`)_

for net, there's send window and buffering stuff, where you sometimes can't send before the remote acks

_(2026-10-17T09:45:29Z `1560951881063342081`)_

so the readiness model works


**CaptainLach** — 2026-10-17T09:45:57Z (`1560951998658912368`)

That's what I said, yes 🙂

_(2026-10-17T09:46:57Z `1560952251609251844`)_

> ↳ replying to Cyan: have you heard of io_uring and kqueue

And btw, kqueue is as useless as epoll

_(2026-10-17T09:47:52Z `1560952480790085723`)_

Tokio is sync on kqueue too


**Cyan** — 2026-10-17T09:49:43Z (`1560952944474591283`)

> ↳ replying to CaptainLach: And btw, kqueue is as useless as epoll

macOS uses GCD, which is still a thread pool for file io iirc

_(2026-10-17T09:49:50Z `1560952976661676144`)_

<:XayHeadEmpty_Cune:1249617485460930581>

_(2026-10-17T09:50:43Z `1560953198041112597`)_

but apple hardware is usually performant enough

_(2026-10-17T09:50:46Z `1560953212394147954`)_

tho


**CaptainLach** — 2026-10-17T09:51:06Z (`1560953292685578244`)

> ↳ replying to Cyan: macOS uses GCD, which is still a thread pool for file io iirc

I don't think tokio uses it
There is also POSIX AIO existing on both linux and macos with the same background threadpool implementation


**Cyan** — 2026-10-17T09:51:24Z (`1560953369563238452`)

> ↳ replying to CaptainLach: I don't think tokio uses it There is also POSIX AIO existing on both linux and macos with the same background threadpool

yeah, tokio just don't use it

_(2026-10-17T09:52:31Z `1560953652544544900`)_

there tokio_uring which provides file io using the io_uring backend iirc


**CaptainLach** — 2026-10-17T11:59:06Z (`1560985504588243044`)

Btw, noticed there is an another, windows-only CI failure, and it is caused by libz being updated during crate unification
https://github.com/rust-lang/libz-sys/issues/225
...Which is in turn caused by
https://github.com/rust-lang/cmake-rs/issues/277

Seems like the solution for everyone is to lock the libz crate on a 2 year old version...
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1560985504256757850/image.png?ex=6ad4b489&is=6ad36309&hm=b3bf3f378b6064fb691d7104100b9e2b014e035558f6446e5088a24d68e41f2a&)

_(2026-10-17T12:00:43Z `1560985912572256278`)_

What would be better, to depend on those two crates forks with the fix applied, or to switch zlib functions to miniz-oxide, which won't have any problems with linking at all, since it is pure rust?..

_(2026-10-17T12:05:02Z `1560987001334005812`)_

Oh, actually, miniz-oxide won't work here, as its api surface is incomplete for node compat implementation
https://github.com/Frommi/miniz_oxide/issues/139
[embed] Feature request: `set_dictionary` · Issue #139 · Frommi/miniz_oxide It would be nice to have the mentioned functionality in flate2 even when relying on pure Rust code. This got forwarded here from rust-lang/flate2-rs#358, see that for a bit more details.

_(2026-10-17T12:06:11Z `1560987287498657852`)_

zlib-rs looks more suitable here
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1560987287184080936/image.png?ex=6ad4b633&is=6ad364b3&hm=3a61db1b4015fdcd4b2718870285f31601c6f269abe663cf05d7c31392287b4f&)

_(2026-10-17T12:17:17Z `1560990081098186782`)_

Gotta love how stable github is
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1560990080804458566/image.png?ex=6ad4b8cd&is=6ad3674d&hm=ed82012b4681aad082f576448acfbf6ea793dc53075e3b341f0b309750623695&)

_(2026-10-17T12:18:35Z `1560990407918092490`)_

While switching to zlib-rs found out deno had UB here, neat

---

## LLM Notetaking (thread 1559302572974538843)

**daniellacosse** — 2026-10-12T23:30:51Z (`1559347653228109956`)

> ↳ replying to Ethan:Print"Ethan";:GoTo Ethan: Additionally we can facilitate access to the server via answeroverflow.com so anyone can hook into certain channels as c

\[no text content]

_(2026-10-12T23:30:52Z, edited 2026-10-12T23:31:24Z `1559347657913139372`)_

I think it's fine as long as your models don't use the messages for training

_(2026-10-12T23:31:07Z `1559347717241704501`)_

<#1558965777850302546> and <#1559218298128695386> are probably the channels to add


**CaptainLach** — 2026-10-12T23:32:57Z, edited 2026-10-12T23:33:05Z (`1559348181215481919`)

Actually it is pretty hard to train models like that nowadays, because there is too much contamination which causes model collapse and just more licensing concerns. OpenAI/Anthropic do not train anything on requests to them (at least, in theory, and according to their docs)

\[system] 4 — 2026-10-12T23:33:00Z

**daniellacosse** — 2026-10-12T23:33:41Z (`1559348365148426271`)

Ah, good to know


**CaptainLach** — 2026-10-12T23:35:29Z, edited 2026-10-12T23:35:41Z (`1559348819391422465`)

That's why they buy and burn books, they are not contaminated D:


**daniellacosse** — 2026-10-12T23:36:07Z (`1559348978154217526`)

Yeah...

A bit early for this, but eventually I'd like to float an LLM use policy. We'll see where things land.


**CaptainLach** — 2026-10-12T23:38:14Z (`1559349510361317467`)

I do have a notetaking bot of my own, but I'm too lazy to think how much would it take to adapt it to discord (It is matrix + telegram only ATM)

_(2026-10-12T23:39:04Z `1559349720051355718`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1559302572974538843/1559349719535190086/image.png?ex=6ad4afd8&is=6ad35e58&hm=4893c813baad275480c8c640d59609abedc719d99344b179d54b5ab0ca6a4b70&)


**daniellacosse** — 2026-10-12T23:39:12Z, edited 2026-10-12T23:42:43Z (`1559349752905072641`)

Yeah, I'd gently encourage you to continue focusing on setting the technical foundation 😅
