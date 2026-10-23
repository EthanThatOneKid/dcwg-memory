---
title: "Discord #propose — 2026-10-22"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "netop://ウィビ"
  - "daniellacosse"
  - "andy"
  - "w"
  - "lishaduck"
created: 2026-10-22
description: "Append-only capture of #propose from 2026-10-22T21:41:36Z to 2026-10-23T18:06:37Z, pulled from the Discord REST API. 139 messages, 5 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-22T21:41:36Z to 2026-10-23T18:06:37Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## Sandboxed extension boundary (thread 1562944037135196211)

**netop://ウィビ** — 2026-10-22T21:41:36Z, edited 2026-10-22T23:56:02Z (`1562944037135196211`)

I had a convo with Claude in the Ende codebase about how an extensions API might look in practice.

[Overview](https://claude.ai/artifact/VxmXx6dwyzMuyp7rdKCHWf#d5908dda-7a0c.md7k080p7zb.69) / [ELI5 version](https://claude.ai/artifact/Jv1PXitVohu3uEBCDcwq13#73c81c15-31f5.m00mbw1va5h.49)

Note that this doesn't fully bring back Node compat in Ende because there's several layers to that.

If you cannot access the links, the PDF exports are here: https://discord.com/channels/1558888938251223050/1562944037135196211/1562977710224052267
[embed] Sandboxed Extension Boundary for Deno Forks Editable docs — documents, reports, plans, memos, briefs that people and Claude read and edit together; export to .docx, PDF or Markdown to download or print. Content is written through the Claude Docs connector, not as files.
[embed] Extension Boundary, Explained Simply Editable docs — documents, reports, plans, memos, briefs that people and Claude read and edit together; export to .docx, PDF or Markdown to download or print. Content is written through the Claude Docs connector, not as files.


**daniellacosse** — 2026-10-22T23:27:30Z (`1562970686522261658`)

any way you can post a file or something, you have to log into claude to see those

_(2026-10-22T23:29:05Z `1562971084494602283`)_

also i think <@1506979094099656714> might be interested in this


**netop://ウィビ** — 2026-10-22T23:55:24Z (`1562977710224052267`)

Weird, I set those links to public. Ah well.
[attachment] Sandboxed_Extension_Boundary_for_Deno_Forks.pdf (https://cdn.discordapp.com/attachments/1562944037135196211/1562977709993361478/Sandboxed_Extension_Boundary_for_Deno_Forks.pdf?ex=6adc9cac&is=6adb4b2c&hm=593e350007de3594f182d3e468ae2f2dfe8b9b71cc7b214a814992cf58aa8664&)
[attachment] Extension_Boundary_Explained_Simply.pdf (https://cdn.discordapp.com/attachments/1562944037135196211/1562977710299676693/Extension_Boundary_Explained_Simply.pdf?ex=6adc9cac&is=6adb4b2c&hm=84a126210cbccab014f94ed18e2a725728187a739d29690c1d93c71809fe18d9&)


**daniellacosse** — 2026-10-23T00:09:24Z, edited 2026-10-23T00:11:38Z (`1562981233707720789`)

at first glance i don't know if this covers everything people were discussing, like https://discord.com/channels/1558888938251223050/1560437111633617080/1560851532445130804

it gets a bit more complicated, but to hit all targets a "lower-level" extension specifically for Deno/Dodo could wrap one of these universal extensions

_(2026-10-23T00:10:29Z, edited 2026-10-23T00:15:26Z `1562981505783955518`)_

once <@1136701682131144714> 's prototype is done, I think we should hold a design meeting where we can discuss the tradeoffs of all the pieces and approaches we've conjured

_(2026-10-23T00:13:15Z, edited 2026-10-23T00:31:01Z `1562982198876053505`)_

**i really like the potential of enforcing permissions per extension**, like you load an extension that gives partial node support but you say that extension can't write to disk, or something? which may be a feasible middle ground to the sadly infeasible per-module permissions

_(2026-10-23T00:16:40Z `1562983060868169820`)_

even though we're still waiting on bart it would be great to enter that conversation with full clarity on what extendibility could look like

_(2026-10-23T00:25:52Z, edited 2026-10-23T00:30:17Z `1562985375620796508`)_

> ↳ replying to daniellacosse: at first glance i don't know if this covers everything people were discussing, like https://discord.com/channels/1558888

also pinging <@184349064161132563> for awareness since i cited him


**andy** — 2026-10-23T00:59:31Z (`1562993842481926287`)

> ↳ replying to daniellacosse: **i really like the potential of enforcing permissions per extension**, like you load an extension that gives partial no

permissions per extension is nearly impossible

_(2026-10-23T00:59:57Z `1562993953647759361`)_

for extensions to have a prelude setting up their globals in javascript code, they have to be able to inject javascript

_(2026-10-23T01:00:22Z `1562994058119352401`)_

which means they must at least have the privileges of the user code

_(2026-10-23T01:00:54Z `1562994190344781895`)_

and additionally, if an extension wanted to, they could probably find weird bugs in various native system functions allowing them, with enough effort, to corrupt memory and escalate

_(2026-10-23T01:00:58Z `1562994209315758081`)_

extensions are assumed to be fully trusted

_(2026-10-23T01:01:03Z `1562994232044814428`)_

they are the gatekeepers of permission

_(2026-10-23T01:01:51Z `1562994432217845841`)_

extensions just have too many very common things they do that could potentially give them absurd privileges, that telling the developer that they are sandboxed is just a straight-up lie

_(2026-10-23T01:02:00Z `1562994470176428074`)_

there will almost definitely be SO many sandbox escapes


**daniellacosse** — 2026-10-23T01:04:49Z, edited 2026-10-23T01:05:37Z (`1562995176580841494`)

right, for native extensions - but <@125029111839064065> 's proposal to is to isolate each extension in a separate wasi sandbox

_(2026-10-23T01:05:32Z `1562995356445311108`)_

if i'm understanding correctly?


**andy** — 2026-10-23T01:06:30Z (`1562995599618351107`)

> ↳ replying to daniellacosse: right, for native extensions - but <@125029111839064065> 's proposal to is to isolate each extension in a separate wasi 

what's the point of that, a wasm only extension that cant do anything is useless


**daniellacosse** — 2026-10-23T01:12:44Z (`1562997169907302480`)

according to the proposal it should be able to do things
[attachment] Screenshot_2026-10-22_at_21.12.37.png (https://cdn.discordapp.com/attachments/1562944037135196211/1562997169550663750/Screenshot_2026-10-22_at_21.12.37.png?ex=6adcaecc&is=6adb5d4c&hm=9d3033b39cfd911fdc75d5331d345c50027b3ccbdd7110a20f4e8960703a8c1e&)

_(2026-10-23T01:15:06Z `1562997765867446303`)_

but definitely not everything, hence my point earlier about the native layer - but then that gets messy and complicated, because as you point out, the native layer can't be per-extension permission'd

_(2026-10-23T01:16:43Z, edited 2026-10-23T01:19:11Z `1562998171062239305`)_

i think it would be helpful to take inventory of all the extension methods we've discussed up until this point and their tradeoffs


**andy** — 2026-10-23T01:23:42Z (`1562999929645957261`)

okay but then the core is big and bloated again

_(2026-10-23T01:23:48Z `1562999956921389118`)_

because we have to provide all these methods to extensions


**netop://ウィビ** — 2026-10-23T01:24:17Z (`1563000078262608004`)

"all these methods" isn't bloat


**andy** — 2026-10-23T01:24:31Z (`1563000135573839966`)

> ↳ replying to netop://ウィビ: "all these methods" isn't bloat

not bloated, i suppose

_(2026-10-23T01:24:32Z `1563000141634478176`)_

but still big


**netop://ウィビ** — 2026-10-23T01:24:42Z (`1563000183724179550`)

Well...how else is this supposed to work?


**andy** — 2026-10-23T01:24:44Z (`1563000188333989959`)

we want extensions to have most of the control


**netop://ウィビ** — 2026-10-23T01:24:58Z (`1563000247804891157`)

Extensions need something to hook into...


**andy** — 2026-10-23T01:25:47Z (`1563000455745769553`)

> ↳ replying to netop://ウィビ: Well...how else is this supposed to work?

something like
```
extensionsRuntime.nativeCall({
  library: "kernel32.dll",
  method: "WriteFile"
  arguments: [...]
});
```


**netop://ウィビ** — 2026-10-23T01:26:46Z (`1563000700286533774`)

> ↳ replying to andy: something like ``` extensionsRuntime.nativeCall({   library: "kernel32.dll",   method: "WriteFile"   arguments: [...] })

I'm sure when you work backwards to figuring out how that's gonna hook into Dodo, you'll have something like what I proposed.


**andy** — 2026-10-23T01:29:01Z, edited 2026-10-23T01:29:13Z (`1563001268790890577`)

nah, because extensions aren't given many system functions via rust operations (which will end up being a fuck ton because operating systems are complicated), rather they're just given one basic function that allows direct calls to system libraries


**daniellacosse** — 2026-10-23T01:30:49Z (`1563001719221391471`)

i'm suggesting something I don't 100% understand but would it be at all possible to, instead of adding the overhead of bridging between v8 and wasmtime, just stand up an entirely new v8 instance and IPC between them? i know there's that limitation with the v8 heap, I wonder if JSC is different...

_(2026-10-23T01:30:58Z, edited 2026-10-23T01:31:04Z `1563001758811299851`)_

i imagine memory-wise that's worse

_(2026-10-23T01:31:29Z `1563001890499723286`)_

if it's even possible


**andy** — 2026-10-23T01:31:32Z (`1563001902080458793`)

> ↳ replying to daniellacosse: i'm suggesting something I don't 100% understand but would it be at all possible to, instead of adding the overhead of b

there shouldn't be a problem with that, v8 supports wasm just fine im pretty sure


**daniellacosse** — 2026-10-23T01:36:46Z, edited 2026-10-23T01:36:52Z (`1563003218143871047`)

i think jsc is more memory efficient than v8 so spinning one instance per extension in that world seems... not terrible

but idk. kinda product-y - is per-extension permission worth the extra memory footprint and complexity of such a system, i don't know

_(2026-10-23T01:37:04Z, edited 2026-10-23T01:37:08Z `1563003294199185531`)_

people want more granular controls, for sure


**andy** — 2026-10-23T01:37:13Z (`1563003332836982825`)

again there's the issue of preludes

_(2026-10-23T01:37:27Z `1563003389976248395`)_

(extensions extending the global object in javascript land)


**daniellacosse** — 2026-10-23T01:37:27Z (`1563003391922274376`)

right


**netop://ウィビ** — 2026-10-23T01:38:26Z (`1563003638253879387`)

Just need to balance making extensions useful without enabling machine takeover from rogue code

_(2026-10-23T01:39:26Z `1563003890184495108`)_

What I absolutely agree with from the documents is to have an agnostic name for whatever we call this and a neutral repo/org for it.


**andy** — 2026-10-23T01:39:57Z (`1563004018244976731`)

generally people shouldn't be adding too many extensions, most extensions should be built in (officially supported), and the very few extensions used should be for things that aren't built in should be thoroughly vetted


**netop://ウィビ** — 2026-10-23T01:40:19Z (`1563004112042336409`)

"should" doing a lot of heavy lifting there


**daniellacosse** — 2026-10-23T01:40:39Z (`1563004197488558103`)

> ↳ replying to andy: (extensions extending the global object in javascript land)

just so i understand - can't the main process not just IPC to the other isolate under the hoad

like you call `fetch` - then the main v8 makes an IPC to the v8 with net permissions, for instance


**andy** — 2026-10-23T01:40:54Z (`1563004259300155555`)

if a user wants to make bad decisions, they can, `--allow-all` still exists anyways

_(2026-10-23T01:41:03Z `1563004296755282012`)_

> ↳ replying to daniellacosse: just so i understand - can't the main process not just IPC to the other isolate under the hoad  like you call `fetch` - 

where does fetch get declared? :^)

_(2026-10-23T01:41:33Z `1563004424102748284`)_

we're trying to provide sensible security defaults, but we do still expect some care from users, dodo is not a magic bullet


**daniellacosse** — 2026-10-23T01:42:17Z (`1563004604847886427`)

> ↳ replying to andy: where does fetch get declared? :^)

i'm not sure what you're getting at here. in main it's a proxy stub, in the other environment it's the actual implementation


**andy** — 2026-10-23T01:43:17Z (`1563004860574601261`)

> ↳ replying to daniellacosse: i'm not sure what you're getting at here. in main it's a proxy stub, in the other environment it's the actual implementa

okay but generally there's a lot of data that doesn't nicely pass over IPC, it's nice to be able to just declare a thin layer on the user-code side

_(2026-10-23T01:43:29Z `1563004907362193430`)_

also i feel like extensions have a higher standard of trust than libraries

_(2026-10-23T01:43:33Z `1563004923614855241`)_

and libraries can run in user-code land

_(2026-10-23T01:43:34Z `1563004928799019009`)_

so why not


**daniellacosse** — 2026-10-23T01:45:26Z (`1563005400738046003`)

> ↳ replying to andy: okay but generally there's a lot of data that doesn't nicely pass over IPC, it's nice to be able to just declare a thin 

yeah so it's a trade-off. doable, but super annoying. and is it worth it? i dunno

_(2026-10-23T01:46:25Z `1563005647690145985`)_

to your point extensions are like... probably a more important security boundary than libs. but libs have less trust overall so are probably more likely wanted to be run isolated

_(2026-10-23T01:55:26Z, edited 2026-10-23T01:56:08Z `1563007914392952832`)_

> ↳ replying to andy: and libraries can run in user-code land

libs do depend on extensions, fwiw. took me a sec to understand what you meant. you trust the 'fetch' extension but not the lib to not call 'fetch(sendallmymoneytograndma.com)'

_(2026-10-23T01:55:43Z, edited 2026-10-23T02:15:56Z `1563007989122600991`)_

still, that's a different layer that wouldn't be solved by this. sorry, just catching up to you

_(2026-10-23T01:57:57Z, edited 2026-10-23T01:58:49Z `1563008550026870827`)_

so it seems that sandboxing matters if we really wanna promote community extensions, otherwise it's a nice to have?

_(2026-10-23T02:16:34Z `1563013235576406080`)_

and... in the event that a foundation with funding does _not_ materialize in the near future, unfortunately i lean more in the "community extensions" direction

_(2026-10-23T02:16:46Z `1563013286096666647`)_

*checks watch to see if it's bart'o'clock yet*

_(2026-10-23T02:17:07Z, edited 2026-10-23T02:17:49Z `1563013373275414539`)_

frankly my current vibe is that, most likely, even if we do get one, it will be kinda life-support-y

_(2026-10-23T02:17:21Z `1563013429697191951`)_

but we'll see


**w** — 2026-10-23T02:23:47Z (`1563015052624269374`)

> ↳ replying to daniellacosse: if it's even possible

this is kind of what you have to do, it's what I do in my little mud client

_(2026-10-23T02:25:27Z `1563015469089169411`)_

per-extension sandboxing would be _so_ difficult to do.  what happens when extension A is called from extension B with a callback function, does it get extension A's permissions or extension B's?


**daniellacosse** — 2026-10-23T02:25:57Z (`1563015594318762015`)

yeah that's true, i was only considering the naive case


**w** — 2026-10-23T02:26:15Z (`1563015672034754561`)

the IPC isn't that bad if you have extensions cooperating in something actor model-esque

_(2026-10-23T02:26:30Z `1563015733766524969`)_

but everything going cross-isolate has to go through the structured clone algorithm

_(2026-10-23T02:26:45Z `1563015796706254879`)_

which just a'int great for general purpose flow


**daniellacosse** — 2026-10-23T02:27:54Z, edited 2026-10-23T02:30:08Z (`1563016087057211463`)

> ↳ replying to w: per-extension sandboxing would be _so_ difficult to do.  what happens when extension A is called from extension B with a

in my head i was thinking such a callback function would still live in the "main" process? but that might not always be the case

_(2026-10-23T02:29:54Z `1563016590180491285`)_

either way, as we've designed ourselves from impossible to very difficult, it comes down to - would something like this be essential? and with untrusted extensions? probably?


**w** — 2026-10-23T02:30:27Z (`1563016729913720933`)

with a concept of untrusted extensions -- yeah, probably


**daniellacosse** — 2026-10-23T02:32:34Z (`1563017260816277686`)

there's a saying in business that what's difficult is also your moat


**w** — 2026-10-23T02:32:59Z (`1563017367334944768`)

i'm squirming in my chair with the whole "is this necessary?" question

_(2026-10-23T02:35:34Z `1563018016747298870`)_

frankly, i'm not even 100% convinced on dynamic extensibility -- the cold start time savings I saw from using a prebuilt snapshot is both recent and large

_(2026-10-23T02:36:13Z `1563018178572062881`)_

that's probably something that could be worked around with fingerprinting and caching heap snapshots, but it'd also be tricky


**daniellacosse** — 2026-10-23T02:36:39Z (`1563018287691075634`)

for me it's sorta part of the embedibility direction. i ran into this when trying to compile deno for ios. you can do it for core, but then some extensions are easy to compile, some aren't


**w** — 2026-10-23T02:36:49Z (`1563018331974275084`)

yeah, that tracks


**daniellacosse** — 2026-10-23T02:37:06Z (`1563018400547078215`)

it's faster to get to embedibility if you can just drop the extensions that are hard


**w** — 2026-10-23T02:37:06Z (`1563018403483222047`)

otoh something nix-like in conjunction with something deno compile-like _might_ have legs?


**daniellacosse** — 2026-10-23T02:37:59Z (`1563018622576754833`)

but is it faster to just make all the existing extensions embedible?

_(2026-10-23T02:38:06Z `1563018652993982537`)_

well actually


**w** — 2026-10-23T02:38:10Z (`1563018671692062741`)

maybe


**daniellacosse** — 2026-10-23T02:38:10Z (`1563018671956426803`)

i take that back

_(2026-10-23T02:38:21Z `1563018715296047136`)_

each ios app has to declare the features it wants to use

_(2026-10-23T02:38:59Z `1563018876680405064`)_

hell is it called again... provisioning profile!

_(2026-10-23T02:39:18Z `1563018957349199943`)_

and so if you compile all the extensions and ship them all in your ios app, you have to then declare literally every feature in your provisioning profile

_(2026-10-23T02:39:26Z `1563018991172063316`)_

which like... is a good way to get apple to not accept your app


**w** — 2026-10-23T02:39:48Z (`1563019082557562983`)

I don't know where we still sit on package manifests, but it would be easy to fall back to a sensible default of "everything and the kitchen sink is included", and let packages override that with a list of what they want


**daniellacosse** — 2026-10-23T02:40:06Z (`1563019158176661587`)

we've discussed that somewhere, and yeah I'm for that

_(2026-10-23T02:41:20Z `1563019466080526337`)_

that said, i worry about the memory pressure in ios juggling all these isolates


**w** — 2026-10-23T02:41:36Z (`1563019535769145355`)

ehh i don't think that's too too much

_(2026-10-23T02:41:55Z `1563019614441578560`)_

on desktops it's somewhere in the realm of 10mb of heap per


**daniellacosse** — 2026-10-23T02:42:07Z (`1563019664223764562`)

jsc is even less, its 2-5 per i read

_(2026-10-23T02:42:16Z `1563019700454301789`)_

so yeah maybe it's fine


**w** — 2026-10-23T02:43:10Z (`1563019926577483817`)

yeah, 10mb is what i measured in heap usage adding isolates to fully initialized deno with all exts

_(2026-10-23T02:43:28Z `1563020003089846313`)_

so, if we're cutting back on exts, more of a ceiling anyway

_(2026-10-23T02:46:30Z `1563020767673978984`)_

also, off topic, but i have some cover-my-salary-for-the-year type work going on this/early next week -- i won't be able to be very present here until next Wednesday or so, so expect me to be a little less engaged than I initially was -- I'll be back around


**daniellacosse** — 2026-10-23T02:46:48Z (`1563020844761088131`)

> ↳ replying to w: frankly, i'm not even 100% convinced on dynamic extensibility -- the cold start time savings I saw from using a prebuilt

a middle ground that... i'm not sure would work is to just publish a separate, static, "mobile" build

_(2026-10-23T02:46:55Z `1563020872070070353`)_

that cuts a lot of things out


**w** — 2026-10-23T02:47:19Z (`1563020975098822709`)

> ↳ replying to daniellacosse: a middle ground that... i'm not sure would work is to just publish a separate, static, "mobile" build

i kind of like this a lot

_(2026-10-23T02:47:29Z `1563021014957555745`)_

it also makes, e.g., a switch target _much_ more concrete

_(2026-10-23T02:47:36Z `1563021043721961585`)_

makes targets tangible


**daniellacosse** — 2026-10-23T02:48:19Z (`1563021222990708768`)

> ↳ replying to w: also, off topic, but i have some cover-my-salary-for-the-year type work going on this/early next week -- i won't be able

np, i'm personally in a bit of a holding pattern until we hear back, which will probably be a few days I'm assuming

_(2026-10-23T02:48:37Z `1563021301151699075`)_

but i'm around ofc and happy to pair on whatever

_(2026-10-23T02:49:38Z `1563021556270243875`)_

> ↳ replying to w: i kind of like this a lot

and even if the dynamic thing eventually makes sense, this does kinda get us to embedibility sooner, which I'm realizing is probably a key sell to bring people back

_(2026-10-23T02:49:59Z, edited 2026-10-23T02:50:05Z `1563021642848931873`)_

people come back, we get funding, then we tackle the harder problems


**w** — 2026-10-23T02:53:05Z (`1563022424767996027`)

embeddability + permissions could be the thing, for sure -- plus it feels pretty late in the game not to have a js-ecosystem answer to lua with its standard library

_(2026-10-23T02:53:37Z, edited 2026-10-23T02:53:42Z `1563022560084369439`)_

embedding node isn't safe, embedding v8 by itself gives you no useful library


**daniellacosse** — 2026-10-23T02:54:24Z, edited 2026-10-23T02:54:35Z (`1563022757338415117`)

if other people are into this i can look into it a bit more and propose something concrete


**w** — 2026-10-23T02:54:57Z (`1563022894718525595`)

in particular that's why i like node compat, i think of it at least as an analog to a non-blocking alternative to lua's stdlib

_(2026-10-23T02:55:09Z `1563022945323061271`)_

with permissions to boot


**andy** — 2026-10-23T04:03:36Z (`1563040170108784692`)

> ↳ replying to daniellacosse: so it seems that sandboxing matters if we really wanna promote community extensions, otherwise it's a nice to have?

i don't think we want to promote community extensions

_(2026-10-23T04:03:46Z `1563040213704380417`)_

community extensions should be a stop-gap for until they get merged into the builtins


**daniellacosse** — 2026-10-23T17:18:59Z, edited 2026-10-23T17:26:46Z (`1563240333733527594`)

hm, let's step back for a second then and just confirm what we want extensions for. in my head it was

- embeddability (see above) - esp. of web servers. both in the ability to better manage provisioning profiles and also just keeping binaries as small as necessary
- distributing/reducing maintenance cost (community extensions)
- custom runtimes (replace console with sentry_console: so also kinda a community extension thing but i guess 3p extensions really)

what else?

_(2026-10-23T17:26:05Z, edited 2026-10-23T17:26:23Z `1563242121375260873`)_

ah, in the custom runtimes/embeddability bin, certain extensions would have to be closed source given certain APIs are not open, so there's that

also _maybe_ someone would want to pin a certain extension to a certain version? but idk

_(2026-10-23T17:27:38Z, edited 2026-10-23T17:28:35Z `1563242510606930092`)_

> ↳ replying to andy: community extensions should be a stop-gap for until they get merged into the builtins

how would we feel about signed extensions, then? with an option to override and run "untrusted" ones at one's own risk

_(2026-10-23T17:34:29Z, edited 2026-10-23T17:34:35Z `1563244237204496550`)_

that would certainly not be good enough for all but it might be good enough for many

_(2026-10-23T17:34:57Z `1563244353286307922`)_

good enough for many = raise money = make it good enough for all

_(2026-10-23T17:35:07Z `1563244395187408992`)_

that's just kind of where my head's at rn lmao


**netop://ウィビ** — 2026-10-23T17:44:54Z (`1563246858342502531`)

The more I think about this, the more I wonder why do extensions at all? People would just write JSR modules


**lishaduck** — 2026-10-23T17:44:56Z (`1563246865108172932`)

> ↳ replying to daniellacosse: good enough for many = raise money = make it good enough for all

So signing wold be paid?


**netop://ウィビ** — 2026-10-23T17:44:59Z (`1563246876805828649`)

Or use something else


**daniellacosse** — 2026-10-23T17:45:28Z (`1563247001775247501`)

> ↳ replying to lishaduck: So signing wold be paid?

could be! i was more thinking more people who use it, the more potential donors, but that's an angle


**netop://ウィビ** — 2026-10-23T17:45:29Z (`1563247005961027665`)

I saw an example of someone using atProto to sign software

_(2026-10-23T17:49:11Z `1563247936647725089`)_

Damn, not sure if I bookmarked it.


**daniellacosse** — 2026-10-23T17:53:50Z (`1563249105713758269`)

> ↳ replying to netop://ウィビ: The more I think about this, the more I wonder why do extensions at all? People would just write JSR modules

JSR doesn't have access to native

_(2026-10-23T17:54:20Z `1563249230984777769`)_

but maybe we could give it access


**netop://ウィビ** — 2026-10-23T17:54:20Z (`1563249232104661234`)

> ↳ replying to daniellacosse: JSR doesn't have access to native

That's why I followed up with "Or use something else"

_(2026-10-23T17:55:13Z `1563249454981845084`)_

I was chatting with DeepSeek and at some point, Ende is just...done. After I implement what's in my (short) roadmap, it's really just maintenance.

_(2026-10-23T17:56:17Z `1563249723048067153`)_

So, as far as getting a huge user base, that's most likely not going to happen (no Node/npm) and most people aren't security-conscious. That leaves enterprise.

_(2026-10-23T17:56:22Z `1563249743331729541`)_

And weirdos like me

_(2026-10-23T17:57:02Z `1563249909812175071`)_

I didn't realize how many layers Node hooked into!


**daniellacosse** — 2026-10-23T17:57:34Z (`1563250043006222466`)

It would be great if you could enumerate them at some point


**netop://ウィビ** — 2026-10-23T17:57:57Z (`1563250143493488804`)

The PDFs I linked do


**daniellacosse** — 2026-10-23T17:58:08Z (`1563250185684131893`)

ah, wasn't sure if there was something more

_(2026-10-23T18:06:37Z, edited 2026-10-23T18:06:56Z `1563252321394237591`)_

if we do do extensions (dodo mention!) those are yeah, the seams we'd need to consider
