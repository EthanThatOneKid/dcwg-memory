---
title: "Discord #propose — 2026-10-18"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "Sandeep Kumar Kuanar✌🏼"
  - "lowlight"
  - "daniellacosse"
  - "CaptainLach"
  - "w"
  - "netop://ウィビ"
  - "Ooker"
  - "andy"
  - "Pierrot"
  - "Leokuma"
created: 2026-10-18
description: "Append-only capture of #propose from 2026-10-18T21:18:23Z to 2026-10-19T17:43:09Z, pulled from the Discord REST API. 100 messages, 10 participants, across 4 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-18T21:18:23Z to 2026-10-19T17:43:09Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## [REWRITE] Rust-Core and Typescript Extensions (thread 1559219836297547847)

**Leokuma** — 2026-10-19T16:21:28Z (`1561776307061133434`)

The idea is to remove `Deno.dlopen()` and replace it with this bindgen? Or to have both?


**CaptainLach** — 2026-10-19T16:21:51Z (`1561776407103807530`)

This bindgen is using Deno.dlopen

_(2026-10-19T16:22:34Z `1561776585789546508`)_

It just simplifies its usage, it creates idiomatic typescript wrappers for you


**Leokuma** — 2026-10-19T16:22:46Z (`1561776635596902431`)

Awesome


**CaptainLach** — 2026-10-19T16:24:19Z (`1561777026585858171`)

E.g
This is a basic example, as it also supports async (on typescript side, on the rust side it spawns a thread) and other stuff
[attachment] image.png (https://cdn.discordapp.com/attachments/1559219836297547847/1561777026149384262/image.png?ex=6ad795b3&is=6ad64433&hm=dcc2fc150ed5637f559157ee6322608d9a6ded2c2183eb7266c4ae8f8c35d717&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1559219836297547847/1561777026690457631/image.png?ex=6ad795b3&is=6ad64433&hm=b3b3a976f5ac99caa03528a5e683a4d6ee23853adbbc2cf5abfe20d9177577e5&)

_(2026-10-19T16:24:59Z `1561777192680034384`)_

It was originally based on https://github.com/kzha0/deno-bindgen2, but I have remade most of its stuff
[embed] GitHub - kzha0/deno-bindgen2: An FFI bindings generator for Deno An FFI bindings generator for Deno. Contribute to kzha0/deno-bindgen2 development by creating an account on GitHub.

_(2026-10-19T16:27:12Z `1561777753479454842`)_

E.g the original was trying to parse the Rust source code and was doing everything on syntax level, which isn't great for anything non-trivial
dodo-bindgen is instead using traits to store the static method description metadata in the binary


**Leokuma** — 2026-10-19T16:29:15Z (`1561778266338238556`)

I'm not a Rust pro, but that sounds good indeed 😅

---

## Dodo Bencho's (thread 1559657749892300934)

**w** — 2026-10-18T22:58:33Z (`1561513852145897483`)

can <@178483185468833793> give glance at https://github.com/are-we-dodo-yet/dodo/pull/11 when he gets a chance? aside from adding a minute or so to ci, I think it should be fine


**CaptainLach** — 2026-10-18T23:02:15Z (`1561514783096705125`)

I'll take a look at it tomorrow, but I'm not that familiar with actions to properly review...
Can we just test it, I'll create a gh-pages branch, and you replace isMainBranch with check for the feature/bench-daskboard branch or something, so we can get our first result from this PR before merge?

_(2026-10-18T23:02:31Z `1561514849509314581`)_

Or, if you tested it in your repo, can I look at it tomorrow?


**w** — 2026-10-18T23:14:03Z (`1561517749451366502`)

I'll see about testing it in my repo -- I just ran each of the steps locally, manually; tomorrow works

---

## Continue developing Deno vs adding best features to Node.js (thread 1560790338480906290)

**lowlight** — 2026-10-18T21:34:14Z (`1561492632788672529`)

to add to what have been already said, it's impossible to have a "deno mode" in node unfortunately. i've looked into it, and just for instance, sandboxing in node is impossible without a huge change in architecture

everything is running directly in v8, whereas deno has v8 bindings to be able to intercept all syscalls to make proper sandboxing

so the "permissions system" that node has is basically useless. i feel like they just implemented it to just say "we have that too ! " but if you look at their official docs they say:

> The permission model implements a "seat belt" approach, which prevents trusted code from unintentionally changing files or using resources that access has not explicitly been granted to. It does not provide security guarantees in the presence of malicious code. Malicious code can bypass the permission model and execute arbitrary code without the restrictions imposed by the permission model.

the whole goal of permissions/sandboxing is that you cannot escape it (or if you can it's a bug, not "by design")

which is why they can't support url imports. without sandboxing, it's insane to run raw external scripts (but tbh even external packages), with one this becomes a non issue. someone tries to harvest your data ? just deny it

in an era where everyone vibe codes and sometimes don't even read the code, idk how everyones put so much trust into each other tbh. sure you have to put some trust somewhere, but it's easier to trust a few persons that a thousand one

for some reason, node seems to copy what bun/deno innovated with, but "half-ass" it (with all the respect). even the native typescript support is just type stripping

tbh I agree it's too bad we have maintain 2 runtimes that are so similar, but i feel like it'll be impossible to convince the node maintainer on such points because the philosophy between both communities diverge


**netop://ウィビ** — 2026-10-19T01:29:44Z (`1561551898727940139`)

> ↳ replying to lowlight: to add to what have been already said, it's impossible to have a "deno mode" in node unfortunately. i've looked into it,

Excellent points all around, so when people say "just use Node," I don't consider them serious people.


**Ooker** — 2026-10-19T03:58:22Z (`1561589303753314356`)

Would that model from node be called as security theater? https://en.wikipedia.org/wiki/Security_theater
[embed] https://en.wikipedia.org/wiki/Security_theater

_(2026-10-19T04:03:19Z, edited 2026-10-19T04:04:09Z `1561590547481886884`)_

> ↳ replying to lowlight: to add to what have been already said, it's impossible to have a "deno mode" in node unfortunately. i've looked into it,

I wonder what those OpenJS guys would say about this? Apparently this a feature node can never implement

_(2026-10-19T17:43:09Z `1561796863793963199`)_

I wonder how people handle security in Node. Sure, juniors may not appreciate this well, but once people have awareness of this problem, then why don't they seek for a better runtime? Assuming they have responsibility and don't push the risk to the users, then the only reason I can think of is that they do have solution for this

---

## Proposal: Dodo's identity & The Economic Reality (thread 1561488644219478176)

**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T21:18:23Z, edited 2026-10-18T21:25:16Z (`1561488644219478176`)

I’ve been churning on the brainstorm thread, and I want to propose a unified identity for Dodo that addresses the contradictions we're facing. We need to decide who we are, because we cannot be everything to everyone.

1. The Identity: "Tauri for Web Apps" (The Embedders)
We are not a Node killer. We are a foundational, embeddable runtime. As <@184349064161132563>  mentioned, the path is cli <-> core <-> runtime <-> v8. We strip out the batteries (linter, formatter) and become the ultimate engine for tools like Tauri, desktop apps, and local-first tools.

2. The Contradiction: Modularity vs. DX
<@400711308141658112>  mentioned 'batteries-included' for small teams, while <@1090647469701992569>  and I talked about 'LEGO bricks'. These are two different architectures. I propose the 'LEGO' approach: Dodo's core is tiny and modular. If <@400711308141658112>  wants to build the 'batteries-included' framework on top of it, that is a separate layer, not the core.

3. The Missing Link: The Deploy Void & JITless
If we embed everywhere, how do people host? We don't need to fight Vercel. But we need a story. Furthermore, Cyan pointed out we can't JIT on iOS/Switch. What is our strategy there?

4. The Economic Engine
How do we keep the maintainers paid so this doesn't die of burnout in 18 months? Do we monetize embeddability for enterprise (like Tauri does), or do we build a hosted service?

_(2026-10-18T21:21:11Z `1561489347226640574`)_

TL;DR: the PDF file is your "White Paper"
[attachment] Dodo_and_Ende.pdf (https://cdn.discordapp.com/attachments/1561488644219478176/1561489346731708546/Dodo_and_Ende.pdf?ex=6ad73287&is=6ad5e107&hm=454a0007c182a3e31c222e43dd91f478230a94c4ad75742bedafdf9f2eee68ab&)


**daniellacosse** — 2026-10-18T21:44:10Z (`1561495130492641352`)

wow sandeep, this is above and beyond - let me go through and answer some of your questions and react as i read

_(2026-10-18T21:45:38Z, edited 2026-10-18T21:56:26Z `1561495501399003167`)_

for jitless, I have two prongs in mind - one, a system that is simply lightweight enough that jitless doesn't matter, and two, offloading things to webgpu compute shaders where it makes sense. i am working towards a proposal here that's about 70% drafted

_(2026-10-18T21:50:11Z, edited 2026-10-18T22:11:38Z `1561496643902373940`)_

for monetization - there are a bunch of different models we can explore, but i do think hosting is probably moot given the market saturation and necessary upfront capital required. some random initial ideas:

if we create an organization that can sign console ndas, we can pirvately add support to for those consoles to wgpu and charge per build or something (basically lease api access). can't OSS this anyway. this feels risky given recent events and turns us into a game development company basically, which is not what i think we want

we literally can just accept donations. this may simply work, given there are organizations dependent on deno who may be able to be convinced given they were just burned by _not_ supporting deno. i doubt this could make anyone a salaried employee, but i could see offering generous bounties for issue resolution, similar to how other foundations do it. this might be most compatible with a "we have hundreds of contributors that can give a couple hours a week" style operation

we can offer support and/or expertise in the platform, working with clients to use or switch to deno (when it makes sense for them). basically becoming a consulting firm. but then that distracts from developing the actual tools of course

or some combination of the above, or something else!

that all said, the best business model comes from actually going out and talking with perspective customers, which we haven't really done yet. this is high on my mind, though. often your ideas of how to monetize properly _comes_ from talking to them.

_(2026-10-18T21:51:08Z, edited 2026-10-18T22:00:51Z `1561496885339099239`)_

"People don't buy LEGO bricks; they buy the LEGO set." - but also, the set contains the bricks. If people didn't want the bricks they would just buy action figures. Knowing that you can turn your brain off and build the set as instructed, while still having the potential to just do whatever you want, is a large part of the appeal

_(2026-10-18T21:52:22Z, edited 2026-10-18T21:52:30Z `1561497195969118280`)_

"We are so focused on the engine (Dodo) that we are ignoring the road (Deploy)." I do think this is correct - hard to know what the road looks like while the engine is still being built

_(2026-10-18T21:53:01Z `1561497360188833944`)_

This doesn't mean we're being myopic! We just don't have enough information to navigate properly yet

_(2026-10-18T21:53:13Z `1561497407286677565`)_

Cart before the horse, if you will

_(2026-10-18T21:54:39Z, edited 2026-10-18T22:01:17Z `1561497770781577338`)_

> ↳ replying to daniellacosse: for monetization - there are a bunch of different models we can explore, but i do think hosting is probably moot given t

I will also add, and this is a lesson I've learned over and over - once you start taking someone's money and _especially_ large investments, the project is no longer yours, it effectively becomes theirs. This principle is precisely what was at play in Deno's demise in the first place

_(2026-10-18T21:58:58Z, edited 2026-10-18T22:07:28Z `1561498856942993491`)_

We need to make sure that funders _actually want what we want, too_. Maybe it's crowdfunding

_(2026-10-18T22:06:20Z, edited 2026-10-18T22:06:42Z `1561500710414192662`)_

oh also i might slightly amend "cli <-> core <-> runtime <-> v8" to possibly be "cli <-> core <-> TS runtime <-> engine"

_(2026-10-18T22:10:27Z `1561501745622810776`)_

but feel free to disagree <@184349064161132563>

_(2026-10-18T22:11:58Z, edited 2026-10-18T22:12:10Z `1561502127090835547`)_

ultimately too, I believe raising money requires trust we need to build first

_(2026-10-18T22:12:43Z, edited 2026-10-18T22:12:58Z `1561502314395734088`)_

oh, and - I still think we're in range of like, bart suddenly deciding "okay actually, let's make Deno a foundation now" so that's still a variable at play


**CaptainLach** — 2026-10-18T22:15:09Z (`1561502930086002741`)

What's the point in foundation if there is no developers on deno's side, a lot of work in their repos was performed by their employees


**daniellacosse** — 2026-10-18T22:15:28Z (`1561503007537893408`)

so in my head, strategically I'm thinking - let's show people we can make a build and that it works with their existing stack, let's show them we're committed, let's get ourselves situated and then... if a few months go by and nothing happens with Deno, it's not "saved", now we can start swooping in potentially


**CaptainLach** — 2026-10-18T22:15:31Z (`1561503021890805781`)

I don't think we can expect anything like that from anyone but cloudflare


**daniellacosse** — 2026-10-18T22:16:30Z (`1561503267517632533`)

> ↳ replying to CaptainLach: What's the point in foundation if there is no developers on deno's side, a lot of work in their repos was performed by t

foundations can definitely hire employees; what makes sense depends on the funding structure ig

_(2026-10-18T22:16:54Z `1561503368986230857`)_

they at a minimum need a board anyway


**CaptainLach** — 2026-10-18T22:17:37Z (`1561503547953127466`)

But given the current position of deno, hiring employees doesn't seem to make sense

_(2026-10-18T22:17:59Z `1561503640827592745`)_

They should've created a foundation before selling out the team to cloudflare 😄


**daniellacosse** — 2026-10-18T22:18:08Z (`1561503677452394517`)

I mean totally, I agree

_(2026-10-18T22:18:38Z `1561503806875893801`)_

> ↳ replying to daniellacosse: so in my head, strategically I'm thinking - let's show people we can make a build and that it works with their existing 

Like, I'm pretty sure this isn't happening, but it's definitely not completely certain yet imo


**w** — 2026-10-18T22:20:35Z (`1561504295935934595`)

Also, I think there's a chicken and egg problem here, to be taken seriously as sort of a phoenix project borne out of something that hasn't even officially died yet, it's only scheduled to, I don't think we cultivate a userbase unless we're making moves that are compatible with the idea of being rolled into a foundation

_(2026-10-18T22:20:54Z `1561504375002632246`)_

Or some section of people just won't take the project seriously

_(2026-10-18T22:22:04Z `1561504670466310245`)_

But I really dread the idea of being rolled into a foundation, myself. Deno hacking has historically where I go to _relax_ when I'm not doing things for money 😅  donations bring obligations, corporate masters or not


**daniellacosse** — 2026-10-18T22:22:29Z (`1561504776024236035`)

> ↳ replying to w: But I really dread the idea of being rolled into a foundation, myself. Deno hacking has historically where I go to _rela

Yes, 100% agree.

_(2026-10-18T22:22:40Z `1561504820337319997`)_

However, not everyone has the luxury

_(2026-10-18T22:23:10Z `1561504944807215177`)_

It's tricky.


**w** — 2026-10-18T22:23:49Z (`1561505111279280152`)

Yeah, there's no "each of us kicks in $20 for this or that" model to answer deploy


**CaptainLach** — 2026-10-18T22:24:12Z (`1561505204657061999`)

At the same time it is possible to make deno mostly maintain itself by delegating more work to the external libraries


**daniellacosse** — 2026-10-18T22:24:47Z (`1561505352040718359`)

Yes, that will definitely help

_(2026-10-18T22:25:20Z, edited 2026-10-18T22:25:26Z `1561505490712657934`)_

There's the "bringing costs down" and "raising funds" levers, that's the former, and it's what we can do right now, and we're doing it


**CaptainLach** — 2026-10-18T22:26:04Z, edited 2026-10-18T22:26:26Z (`1561505673953681489`)

E.g replace some backends of laufey with tauri, leave only CEF here
Rewrite the cryptography to a higher-level libraries
The most expensive part of deno codebase as far as I can see is node compat, because it exposes many hazmat APIs which need to be constantly up to date...


**daniellacosse** — 2026-10-18T22:26:37Z (`1561505815951708273`)

i wonder how much we can raise to maintain node compat explicitly

_(2026-10-18T22:26:41Z `1561505831034298470`)_

that's interesting

_(2026-10-18T22:26:57Z `1561505896226365471`)_

it _is_ the sort of "value prop" of the thing


**CaptainLach** — 2026-10-18T22:27:25Z (`1561506016036917335`)

Many node ecosystem libraries can be much efficiently replaced with bindings to the rust ecosystem, which is in my opinion much more mature in some aspects

_(2026-10-18T22:27:37Z `1561506067450568716`)_

Have you tried to use google cloud libraries? D:


**w** — 2026-10-18T22:29:16Z (`1561506481281433703`)

> ↳ replying to daniellacosse: i wonder how much we can raise to maintain node compat explicitly

I think we can wait and see as long as we don't break too much; the maintenance burden might not be _that_ much of a bear.

_(2026-10-18T22:29:31Z `1561506542702952510`)_

Node isn't exactly moving at lightning speed


**daniellacosse** — 2026-10-18T22:29:43Z, edited 2026-10-18T22:29:47Z (`1561506595030962177`)

> ↳ replying to w: I think we can wait and see as long as we don't break too much; the maintenance burden might not be _that_ much of a bea

yeah - to be clear, I was and am very wait and see, but I also want to take Sandeep's concerns seriously

_(2026-10-18T22:30:31Z `1561506794088439839`)_

funny vision - i'm imagining a silly donation page where all our different extensions are broken out, and people can donate to support specific extensions directly - like node compat

_(2026-10-18T22:30:56Z `1561506898770137301`)_

something to that effect


**CaptainLach** — 2026-10-18T22:31:15Z, edited 2026-10-18T22:31:22Z (`1561506981758369865`)

With hazmat APIs we unfortunately need to take maintenance seriously, because it is a huge source of vulnerabilities

_(2026-10-18T22:34:05Z `1561507691631739011`)_

I fricking love google APIs
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561507690440691723/image.png?ex=6ad7439c&is=6ad5f21c&hm=6dc0b2e1f0a8359c837f6caea8681b893a05e8ed886958bf03eb7fdfdca4fcb4&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561507690746748948/image.png?ex=6ad7439c&is=6ad5f21c&hm=4a7a983f1ca16a83ec574a365a7f2bfcc5770ff526942d3349ca2bdd2a340cf6&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561507691073900554/image.png?ex=6ad7439c&is=6ad5f21c&hm=fa75b1f6184bcd328c904e26662170552fd3dd359fdeb0f8ccddf66a2935c75b&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561507691363442809/image.png?ex=6ad7439d&is=6ad5f21d&hm=cffbf4f7efc7716b8690af9fd69e18f23cf0665be38508b0b0ca1e9257474287&)

_(2026-10-18T22:34:47Z `1561507868312604855`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561507868044173332/image.png?ex=6ad743c7&is=6ad5f247&hm=941a7c180ffcf564c8d30da9dba46f511fa0194f8623aac8e343e969e57cc7b5&)

_(2026-10-18T22:34:57Z `1561507910800908409`)_

You would think this is an output of codegenerator


**daniellacosse** — 2026-10-18T22:35:09Z (`1561507962285981789`)

this.makes.sense.somehow.just.trust.me.its.extensible


**CaptainLach** — 2026-10-18T22:35:33Z (`1561508061137346652`)

No codegenerator in the world produces code this bad, it is being transformed specially for google speech libraries


**w** — 2026-10-18T22:36:26Z (`1561508286409347193`)

> ↳ replying to CaptainLach: No codegenerator in the world produces code this bad, it is being transformed specially for google speech libraries

You think? I literally assumed this came out of protoc

_(2026-10-18T22:36:36Z `1561508325542068246`)_

it doesn't exactly produce gems


**CaptainLach** — 2026-10-18T22:36:57Z (`1561508415354703893`)

I mean many reasons it is such garbage is because of grpc, but unfortunately they do a lot to produce typings that are exactly this bad

_(2026-10-18T22:38:31Z `1561508807664861324`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561508807371137065/image.png?ex=6ad744a7&is=6ad5f327&hm=f8db81f43216fbbbd8475603dae20c9a29ba92043ba1937b3a5e30d12cfd177f&)

_(2026-10-18T22:39:07Z `1561508958655479819`)_

https://github.com/googleapis/google-cloud-node/blob/500bfad9949e1760701997d902431a2f25dd7ae0/packages/google-cloud-speech/src/v2/speech_client.ts
[embed] google-cloud-node/packages/google-cloud-speech/src/v2/speech_client... Google Cloud Client Library for Node.js. Contribute to googleapis/google-cloud-node development by creating an account on GitHub.

_(2026-10-18T22:41:14Z `1561509492275806279`)_

I just don't believe you can generate code this bad
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561509491923755089/image.png?ex=6ad7454a&is=6ad5f3ca&hm=4400de375cf1106a7fc00dcf36519dc975ddba0658a4aca88676513114f256af&)

_(2026-10-18T22:46:29Z `1561510814999908394`)_

Sorry, I was wrong, it is autogenerated


**daniellacosse** — 2026-10-18T22:46:38Z (`1561510853529043026`)

thank goodness (?) lol


**CaptainLach** — 2026-10-18T22:47:00Z (`1561510945505677353`)

https://github.com/googleapis/gapic-generator-typescript/blob/main/templates/esm/typescript_gapic/esm/src/%24version/%24service_client.ts.njk
[attachment] image.png (https://cdn.discordapp.com/attachments/1561488644219478176/1561510945145102447/image.png?ex=6ad746a4&is=6ad5f524&hm=7f96109dac28d6aedf42aef8aee73af46769948440b23224c4557ef475ed7508&)


**daniellacosse** — 2026-10-18T22:48:07Z (`1561511225840631932`)

ah, of course


**w** — 2026-10-18T22:49:07Z (`1561511475556786228`)

> ↳ replying to daniellacosse: ah, of course

not my reaction at all 😂


**daniellacosse** — 2026-10-18T22:49:26Z (`1561511557266149451`)

hmm yes. how else would you do it, really? /s


**w** — 2026-10-18T22:50:05Z (`1561511721888251915`)

yeah i mean

_(2026-10-18T22:50:09Z `1561511737591861324`)_

it had me at .ts.njk


**CaptainLach** — 2026-10-18T22:50:21Z (`1561511785129967672`)

Makes sense google people invented helm, where they use go templates to produce yaml


**daniellacosse** — 2026-10-18T22:51:37Z (`1561512106489151529`)

> ↳ replying to w: it had me at .ts.njk

it's the most readable file i've ever seen in my life


**w** — 2026-10-18T22:51:57Z (`1561512189418803281`)

in theory i can see how this would be better than walking an AST and pumping lines into an output stream

_(2026-10-18T22:52:01Z `1561512204673614007`)_

in practice, ...


**CaptainLach** — 2026-10-18T22:52:35Z (`1561512350329339925`)

There are proper quasiquoting libraries for any language

_(2026-10-18T22:52:50Z `1561512411221991528`)_

Actually we need #offtop channel


**daniellacosse** — 2026-10-18T22:53:14Z, edited 2026-10-18T22:53:22Z (`1561512514158731436`)

yeah - andy is worried about having too many but i think that's fine


**w** — 2026-10-18T22:53:27Z, edited 2026-10-18T22:53:53Z (`1561512566872612946`)

more on off topic topics btw, just so you realize, only andy, daniel, and lach can respond to messages in <#1560371841325858927>

_(2026-10-18T22:53:38Z `1561512614801055786`)_

i'm happy watching you go, but it's just you guys over there :p


**daniellacosse** — 2026-10-18T22:54:26Z (`1561512813653131445`)

hm, it seems the permissions weren't synced

_(2026-10-18T22:54:33Z `1561512843919097867`)_

which is a thing in discord apparently

_(2026-10-18T22:54:35Z `1561512851095421099`)_

maybe now?


**w** — 2026-10-18T22:54:41Z (`1561512878131904637`)

👍


**CaptainLach** — 2026-10-18T22:55:45Z (`1561513147494440981`)

I think it is just andy only intended it for notifications, but yeah, it is good for meta discussions


**andy** — 2026-10-19T04:41:39Z (`1561600194045284404`)

i didn't actually make the github channel lol, but yeah, discussions about changes should probably go somewhere better so that changes don't get lost in a sea of discussion


**daniellacosse** — 2026-10-19T05:35:03Z (`1561613632821927978`)

i did, i just didn't realize you had to sync permissions


**Pierrot** — 2026-10-19T13:40:05Z (`1561735694811004931`)

> ↳ replying to daniellacosse: oh also i might slightly amend "cli <-> core <-> runtime <-> v8" to possibly be "cli <-> core <-> TS runtime <-> engine"

Ah, I initially worried dodo's going to abandon embedding when the rewrite proposal came in.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-19T14:07:58Z (`1561742714238799915`)

Ayo! This thread has gained traction! 

I will take my time and read and review all of this.
