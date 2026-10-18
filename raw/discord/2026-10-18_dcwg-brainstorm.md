---
title: "Discord #brainstorm — 2026-10-18"
source: "Discord REST API, channel 1558965777850302546, UTC timestamps"
channel_type: text
author:
  - "Sandeep Kumar Kuanar✌🏼"
  - "Cyan"
  - "andy"
  - "daniellacosse"
  - "CaptainLach"
  - "netop://ウィビ"
  - "w"
created: 2026-10-18
description: "Append-only capture of #brainstorm from 2026-10-18T01:04:27Z to 2026-10-18T13:14:07Z, pulled from the Discord REST API. 288 messages, 7 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#brainstorm` in the Deno Core Working Group Discord, 2026-10-18T01:04:27Z to 2026-10-18T13:14:07Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:04:27Z (`1561183146899411035`)

Uhhmmm, a general, more philosophical kind of thought

_(2026-10-18T01:07:02Z `1561183794805866528`)_

Why did Node survive? I still don't get. Deno came prior to Bun. Bun was made by one person. Deno was made by Ryan himself who have Node. Thus arranging the letters alphabetically. Deno was secure, brought a lot of good things to the table built in. But then, why did it start to pick after 2.0? After the Node compatibility was announced? What happened? What did Node do right that Deno didn't? I am relatively new to this, much less experience in programming, so that's why I am asking this question.

_(2026-10-18T01:07:12Z `1561183836854030418`)_

I am open for discussion!


**Cyan** — 2026-10-18T01:21:19Z (`1561187390822023281`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Why did Node survive? I still don't get. Deno came prior to Bun. Bun was made by one person. Deno was made by Ryan himse

It came first, it dominated the ecosystem, people are lazy to migrate


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:21:54Z (`1561187538398347375`)

> ↳ replying to Cyan: It came first, it dominated the ecosystem, people are lazy to migrate

I was thinking the same. It came first. But it's somehow just sticky.

_(2026-10-18T01:22:18Z `1561187639309107241`)_

Like, it's obviously a supply chain attack nightmare at this point, right?


**andy** — 2026-10-18T01:22:30Z (`1561187688978190367`)

node survived because legacy


**Cyan** — 2026-10-18T01:22:57Z (`1561187803453325333`)

If you need to replace node, you would make it a drop in replacement so people can just switch

_(2026-10-18T01:23:47Z `1561188013286096967`)_

But Deno only starts to realize Node compatibility is important after Deno 2.0


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:25:25Z (`1561188421374840935`)

> ↳ replying to andy: node survived because legacy

Sure! I am not denying it. True. But hey, there is something more. I wasn't there when the Node was brought. But all that I can see into this is 
1. Node gave a minimal JS kernel directly at devs terminal, right? 
2. It allowed people to build infra and their own packages around it. 
3. Even if a competition like Deno comes along, they won't budge. Because they invested in the ecosystem they have built into and maybe they are just lazy to change because for them "Node is good enough". The words by Ryan Dahl as well.


**andy** — 2026-10-18T01:25:50Z (`1561188526677295205`)

i wouldn't call it minimal but...


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:25:57Z (`1561188558679842867`)

> ↳ replying to Cyan: If you need to replace node, you would make it a drop in replacement so people can just switch

True. But do you think people switch? If they would have, Deno would be a success? Right?

_(2026-10-18T01:26:16Z, edited 2026-10-18T01:26:24Z `1561188635217371207`)_

> ↳ replying to andy: i wouldn't call it minimal but...

yeah! its now massive


**Cyan** — 2026-10-18T01:26:32Z (`1561188705455054940`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: True. But do you think people switch? If they would have, Deno would be a success? Right?

Yeah, but they won’t

_(2026-10-18T01:27:10Z, edited 2026-10-18T01:27:46Z `1561188861386825775`)_

The enterprise continues to rely on Java 8 and Node.js 18.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:27:12Z (`1561188873059700737`)

> ↳ replying to Cyan: Yeah, but they won’t

So, what can we learn from this? To be implemented in our Dodo and Ende projects such that they both don't end-up the same way?

_(2026-10-18T01:27:21Z `1561188910510641279`)_

> ↳ replying to Cyan: The enterprise continues to rely on Java 8 and Node.js 18.

There is still COBOL bro!

_(2026-10-18T01:27:26Z `1561188930093715598`)_

Fortran?

_(2026-10-18T01:27:56Z `1561189056929472574`)_

But, then as there is majority cake in Node, people go to Node to have a share.

_(2026-10-18T01:28:24Z `1561189174915371019`)_

Can we make this switch easier? From Node to Dodo? To Ende? If yes, how?


**Cyan** — 2026-10-18T01:28:41Z (`1561189245627011123`)

> ↳ replying to Cyan: The enterprise continues to rely on Java 8 and Node.js 18.

And a new runtime came, it’s cool but they have to change a lot of things

_(2026-10-18T01:28:45Z `1561189260630040640`)_

To make it work

_(2026-10-18T01:29:02Z `1561189331480346635`)_

Cause, the Node compatibility is crap


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:29:06Z (`1561189348202778769`)

> ↳ replying to Cyan: And a new runtime came, it’s cool but they have to change a lot of things

yeah, their entire infra maybe.

_(2026-10-18T01:29:13Z `1561189377793728644`)_

> ↳ replying to Cyan: Cause, the Node compatibility is crap

Because Node is Sand


**Cyan** — 2026-10-18T01:29:18Z (`1561189402045321379`)

Why would they spend money on something that’s unnecessary


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:29:22Z (`1561189416016551937`)

Sand keeps shifting with worms in them

_(2026-10-18T01:29:57Z `1561189563844665506`)_

> ↳ replying to Cyan: Why would they spend money on something that’s unnecessary

True. Valid. But then, Why would anyone bother about the "fork" when the original didn't survive?

_(2026-10-18T01:31:00Z `1561189827976765543`)_

I am not attacking the purpose. But I am curious about what is driving this change? For me it's pure love for Deno. I want to maintain it just for the love of the game.


**Cyan** — 2026-10-18T01:31:01Z (`1561189833362243655`)

There’s no clear benefit for the permission system for most people, it’s cool but more annoying


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:31:39Z (`1561189991130865827`)

> ↳ replying to Cyan: There’s no clear benefit for the permission system for most people, it’s cool but more annoying

Yeah. True. Extra flags? More docs hoping instead of `--force`? Right?


**Cyan** — 2026-10-18T01:31:45Z (`1561190014908375122`)

It might be good like oh it could prevent attacks


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:32:38Z (`1561190238196596759`)

> ↳ replying to Cyan: It might be good like oh it could prevent attacks

but they most of the people don't care about CVEs or vulnerabilities or slow interfaces. Salary, and maybe legacy stability is all that they care about.


**Cyan** — 2026-10-18T01:32:45Z (`1561190269326729356`)

https://claude.com/resources/articles/auto-mode-default-in-claude-code
[embed] Auto mode is now the default in Claude Code for Pro, Max, and Team ... Claude Code will soon run auto mode by default for Pro, Max, and Team plans, enabling longer-running autonomous work, and catching more dangerous commands.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:32:51Z (`1561190293855010949`)

Then how would this project survive?


**Cyan** — 2026-10-18T01:33:17Z (`1561190404341104751`)

And it became useless when it became approval/alarm fatigue


**daniellacosse** — 2026-10-18T01:33:40Z (`1561190500923474033`)

I think that Node and Deno are different products, actually.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:33:44Z (`1561190514844246057`)

> ↳ replying to Cyan: https://claude.com/resources/articles/auto-mode-default-in-claude-code

basically we are just a proxy.


**Cyan** — 2026-10-18T01:33:57Z (`1561190572243427471`)

Some kind of automatic detection should be in place

_(2026-10-18T01:34:45Z `1561190769715318814`)_

filtering out some malicious behavior automatically


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:35:06Z (`1561190858856861878`)

> ↳ replying to daniellacosse: I think that Node and Deno are different products, actually.

True, Sir. But I personally, my objection stands on what they sell? Node is stable, legacy, MERN stack, community driven. Then Deno? Strict, Pragmatic, TS out of the box, and many many more things. Then why?


**andy** — 2026-10-18T01:35:16Z (`1561190901085110293`)

> ↳ replying to Cyan: There’s no clear benefit for the permission system for most people, it’s cool but more annoying

i wouldn't use --allow-all if one of the permission options was "allow and save to deno.json"


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:35:33Z (`1561190972547924040`)

> ↳ replying to Cyan: filtering out some malicious behavior automatically

For Dodo, right?


**Cyan** — 2026-10-18T01:35:34Z (`1561190975798517771`)

It’s I used Deno and it stopped the attack
Not Oh I see the prompt it’s sus but I accidentally approved it

_(2026-10-18T01:35:51Z `1561191049408421929`)_

> ↳ replying to andy: i wouldn't use --allow-all if one of the permission options was "allow and save to deno.json"

Yeah but approving manually is annoying


**daniellacosse** — 2026-10-18T01:36:02Z (`1561191096086691904`)

Security is always annoying


**Cyan** — 2026-10-18T01:36:06Z (`1561191110267641979`)

Thinking about what should be given to it is also annoying


**andy** — 2026-10-18T01:36:15Z (`1561191150839267370`)

> ↳ replying to Cyan: Yeah but approving manually is annoying

not particularly


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:36:16Z (`1561191151598444547`)

> ↳ replying to Cyan: It’s I used Deno and it stopped the attack Not Oh I see the prompt it’s sus but I accidentally approved it

yeah, but again, for normies it's another "step" so to say


**Cyan** — 2026-10-18T01:36:19Z (`1561191164135079988`)

And the permission prompt break the output


**daniellacosse** — 2026-10-18T01:36:58Z (`1561191328690348063`)

> ↳ replying to daniellacosse: Security is always annoying

However, I agree that the experience could be improved


**Cyan** — 2026-10-18T01:37:16Z (`1561191406331236432`)

> ↳ replying to andy: not particularly

Do you allow env access to COLOR
Do you allow env access to FORCE_COLOR
Do you allow env access to TERM


**andy** — 2026-10-18T01:37:33Z (`1561191474639540376`)

yeah those should be allowed by default


**CaptainLach** — 2026-10-18T01:37:49Z (`1561191544344809614`)

There is an issue for allowing some env vars by default


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:37:52Z (`1561191556952760441`)

Then why would anyone choose us? I know why I choose Deno though → "Personal projects". Scripts where I build something for me. Like a Password manager, an ASCII utility tool, etc.


**Cyan** — 2026-10-18T01:38:17Z, edited 2026-10-18T01:38:20Z (`1561191660673703999`)

And when Bun came


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:38:23Z (`1561191684623044819`)

> ↳ replying to Cyan: Do you allow env access to COLOR Do you allow env access to FORCE_COLOR Do you allow env access to TERM

most people then don't know what all this means.

_(2026-10-18T01:38:33Z `1561191729091055639`)_

> ↳ replying to Cyan: And when Bun came

Yeah, it was just "faster Node"


**Cyan** — 2026-10-18T01:38:42Z (`1561191767380992111`)

> ↳ replying to Cyan: And when Bun came

Better Node compatibility, better performance, more built in tools


**CaptainLach** — 2026-10-18T01:38:48Z (`1561191789136842824`)

The bigger problem for me was LD_ vars, which are used for jack stuff (linux audio stack), which was making deno require to run everything with -A


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:38:49Z (`1561191796481069097`)

Like a wrapper around Node


**CaptainLach** — 2026-10-18T01:39:02Z (`1561191848108621865`)

There should be nothing that would require to use -A


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:39:03Z (`1561191855692189802`)

> ↳ replying to CaptainLach: The bigger problem for me was LD_ vars, which are used for jack stuff (linux audio stack), which was making deno require

I see


**Cyan** — 2026-10-18T01:39:10Z, edited 2026-10-18T01:39:21Z (`1561191884846665819`)

> ↳ replying to Cyan: Better Node compatibility, better performance, more built in tools

Ignoring all the bugs before Bun 1.2


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:39:18Z (`1561191918577258669`)

> ↳ replying to Cyan: Ignoring all the bugs before Bun 1.2

Hmmmmm


**Cyan** — 2026-10-18T01:39:37Z (`1561191995190550529`)

It’s fluent, it’s just replacing node with bun

_(2026-10-18T01:39:42Z `1561192016682156122`)_

People switch to it

_(2026-10-18T01:39:52Z `1561192057735749644`)_

It works great most of the time

_(2026-10-18T01:39:59Z `1561192087901175899`)_

And they would stick to it


**andy** — 2026-10-18T01:40:10Z (`1561192133480685680`)

i dont trust bun to stick around either, and i dont trust it to stay stable


**Cyan** — 2026-10-18T01:40:38Z (`1561192251223318539`)

> ↳ replying to andy: i dont trust bun to stick around either, and i dont trust it to stay stable

Yeah I don’t trust Anthropic

_(2026-10-18T01:40:49Z `1561192299365400658`)_

But they already use Bun as their Claude Code runtime


**andy** — 2026-10-18T01:41:10Z (`1561192385810272331`)

> ↳ replying to Cyan: But they already use Bun as their Claude Code runtime

they could just drop it and switch to node, or an electron app, or rewrite it in rust


**Cyan** — 2026-10-18T01:41:14Z (`1561192402616717448`)

They will probably keep Bun alive

_(2026-10-18T01:41:20Z `1561192430424817665`)_

> ↳ replying to andy: they could just drop it and switch to node, or an electron app, or rewrite it in rust

Nah


**daniellacosse** — 2026-10-18T01:41:29Z (`1561192466227658894`)

> ↳ replying to Cyan: They will probably keep Bun alive

Unless they die

_(2026-10-18T01:41:41Z `1561192517788241952`)_

which, their financials are not looking great lol


**andy** — 2026-10-18T01:41:45Z (`1561192531281322117`)

> ↳ replying to Cyan: They will probably keep Bun alive

why would they keep an entire runtime maintained for one CLI app


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:41:49Z (`1561192549538856961`)

> ↳ replying to andy: i dont trust bun to stick around either, and i dont trust it to stay stable

it would get absorbed into Anthropic's products.


**Cyan** — 2026-10-18T01:41:52Z (`1561192564227448934`)

The Bun shipped features for agents after the acquisition


**CaptainLach** — 2026-10-18T01:42:09Z (`1561192633471082499`)

Didn't help deno with sandboxes


**Cyan** — 2026-10-18T01:42:10Z (`1561192637434826825`)

Like Bun.Webview, Bun.Image, Bun.whatever it is

_(2026-10-18T01:42:24Z `1561192696226381914`)_

It’s for Claude


**daniellacosse** — 2026-10-18T01:43:01Z (`1561192851730206823`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: True, Sir. But I personally, my objection stands on what they sell? Node is stable, legacy, MERN stack, community driven

the best tool doesn't always win, that's life. a product's success is 50% the product and 50% marketing, and I don't think Deno did a very good job of that


**CaptainLach** — 2026-10-18T01:43:13Z (`1561192902502129815`)

All of those features with agents, can we just make the thing good for everyone


**daniellacosse** — 2026-10-18T01:43:20Z (`1561192930092392459`)

part of good marketing is knowing who to target


**CaptainLach** — 2026-10-18T01:43:32Z (`1561192981233672333`)

I hate that some sites implement stuff for llms while throwing out basic accessibility


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:43:53Z (`1561193070274281523`)

> ↳ replying to daniellacosse: the best tool doesn't always win, that's life. a product's success is 50% the product and 50% marketing, and I don't thi

True,


**daniellacosse** — 2026-10-18T01:44:16Z (`1561193164822552577`)

Node vs. Deno was a david vs. goliath situation

_(2026-10-18T01:44:41Z `1561193272485871697`)_

most companies don't do that - they target a more niche audience and grow from there


**CaptainLach** — 2026-10-18T01:44:43Z (`1561193280819957842`)

Deno marketing was good, what I think went wrong is their product


**Cyan** — 2026-10-18T01:45:00Z (`1561193352660123719`)

> ↳ replying to Cyan: Like Bun.Webview, Bun.Image, Bun.whatever it is

And Bun.* APIs are faster than any existing npm packages


**CaptainLach** — 2026-10-18T01:45:16Z (`1561193417495543911`)

There was no incentive to use Deno deploy for me and many others


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:45:26Z (`1561193461581873223`)

> ↳ replying to daniellacosse: part of good marketing is knowing who to target

I am asking that and the following 
1. What should be the core philosophy? 
2. How to make migrations smooth? 
3. What can we do to provide this "community" sense for our fork closer to what Node does with NPM.

_(2026-10-18T01:45:34Z `1561193493177565295`)_

> ↳ replying to daniellacosse: Node vs. Deno was a david vs. goliath situation

Yeah

_(2026-10-18T01:45:41Z `1561193522793681017`)_

> ↳ replying to daniellacosse: most companies don't do that - they target a more niche audience and grow from there

Hmmm


**daniellacosse** — 2026-10-18T01:45:59Z (`1561193599297654865`)

I think actually trying to replace Node is a death march


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:46:00Z (`1561193602791514233`)

> ↳ replying to CaptainLach: There was no incentive to use Deno deploy for me and many others

Yeah. There was already Vercel.

_(2026-10-18T01:46:06Z `1561193628120907797`)_

> ↳ replying to daniellacosse: I think actually trying to replace Node is a death march

Yeah

_(2026-10-18T01:46:16Z `1561193670064087222`)_

True. Then what is what are doing?

_(2026-10-18T01:46:25Z `1561193706068119673`)_

Truly doing with this project?

_(2026-10-18T01:46:43Z `1561193785256312924`)_

Once we have an answer. Rest is easy.


**Cyan** — 2026-10-18T01:47:02Z (`1561193862527975525`)

Creating the last runtime you will ever need


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:47:38Z (`1561194014261125242`)

> ↳ replying to Cyan: Creating the last runtime you will ever need

True. Node is consistently proving this.


**Cyan** — 2026-10-18T01:47:46Z, edited 2026-10-18T01:47:53Z (`1561194047681339504`)

What if we have a runtime, whose the user could ship their own runtime with JS or something else


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:47:50Z (`1561194065083498648`)

We can't fight it.


**daniellacosse** — 2026-10-18T01:48:10Z (`1561194147090538497`)

I'd argue it's about creating a full, streamlined, batteries-included development experience for small teams.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:48:15Z (`1561194168972214304`)

> ↳ replying to Cyan: What if we have a runtime, whose the user could ship their own runtime with JS or something else

Exact idea of Node?

_(2026-10-18T01:48:44Z `1561194289914978365`)_

> ↳ replying to daniellacosse: I'd argue it's about creating a full, streamlined, batteries-included development experience for small teams.

Like Laravel for PHP? Or Ruby on Rails for Ruby?


**Cyan** — 2026-10-18T01:48:50Z (`1561194315240185867`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Exact idea of Node?

It's more like you can build Node compat yourself, or even Bun compat, or something else

_(2026-10-18T01:49:09Z `1561194397163458652`)_

> ↳ replying to daniellacosse: I'd argue it's about creating a full, streamlined, batteries-included development experience for small teams.

So adding more things to `Deno.*`?


**daniellacosse** — 2026-10-18T01:49:25Z (`1561194464100352092`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Like Laravel for PHP? Or Ruby on Rails for Ruby?

Sure, but Typescript, and the code you write can basically run everywhere at face value

_(2026-10-18T01:49:40Z `1561194525215686717`)_

Javascript i believe still remains the world's most popular language

_(2026-10-18T01:49:45Z `1561194545360805925`)_

most used, at least


**CaptainLach** — 2026-10-18T01:50:17Z (`1561194679041659001`)

deno-bindgen revive looks great
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561194677833699328/image.png?ex=6ad62018&is=6ad4ce98&hm=e43e036dd24dd1cf35b4392fd682d43d021267b7e50c73e4eb3a1b761ca98e51&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561194678295068775/image.png?ex=6ad62018&is=6ad4ce98&hm=160ef05c542b8693b6115d09a7a12f583ecc32abdc9248d0990797072fb4a3ca&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561194678764699719/image.png?ex=6ad62019&is=6ad4ce99&hm=a6e747abf7a95603faa96f6d5dcedf3e1b779071337d3d68ac26108653484033&)

_(2026-10-18T01:50:31Z `1561194739741630475`)_

Oh, its 3:50AM

_(2026-10-18T01:50:32Z `1561194743331946567`)_

Goodnight


**daniellacosse** — 2026-10-18T01:50:43Z (`1561194788655468627`)

> ↳ replying to CaptainLach: Goodnight

yeah please don't burn yourself out


**Cyan** — 2026-10-18T01:50:47Z (`1561194808587067503`)

> ↳ replying to Cyan: What if we have a runtime, whose the user could ship their own runtime with JS or something else

[attachment] Screenshot_2026-10-18_09.49.522x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1561194808201056486/Screenshot_2026-10-18_09.49.522x.webp?ex=6ad62037&is=6ad4ceb7&hm=44726463d9e808225f192650195cf1f5ae360df228766a49d84c4afce0d47a9b&)


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:51:12Z (`1561194912618258615`)

> ↳ replying to Cyan: It's more like you can build Node compat yourself, or even Bun compat, or something else

Like a core LEGO brick where you can then "assemble" what you need. There are some primitives by us. The community. People don't need to use that. We got Node, they can import that. Use that instead. If they need something like say "an email micro-service to send emails to a bunch of user in a job-queue on a particular data and time" we would already have something for them, they can then either use the API or build their own.

_(2026-10-18T01:51:43Z `1561195040766955633`)_

A core product, being the "runtime" that can handle delivery to their "specific" target audience?


**CaptainLach** — 2026-10-18T01:52:03Z (`1561195126129172575`)

Deno sucks at embedding and I would like to improve this while we increase modularity


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:52:24Z (`1561195213978869781`)

Iterates faster and have minimal overhead in switching. Maybe some CI to just replace Node with Dodo progressively? Pragmatically?

_(2026-10-18T01:52:48Z `1561195313136410818`)_

> ↳ replying to CaptainLach: Deno sucks at embedding and I would like to improve this while we increase modularity

That's true. I will try to help as well.


**daniellacosse** — 2026-10-18T01:52:48Z, edited 2026-10-18T01:53:00Z (`1561195316060102737`)

Again, I think trying to replace Node explicitly will require us to make decisions that sacrifice the developer experience


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:53:07Z (`1561195395596423213`)

> ↳ replying to daniellacosse: Javascript i believe still remains the world's most popular language

Yeah.


**daniellacosse** — 2026-10-18T01:53:08Z (`1561195398897602651`)

As node compat kinda did to Deno in the first place


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:53:34Z (`1561195507143942246`)

> ↳ replying to CaptainLach: Goodnight

Good night

_(2026-10-18T01:53:45Z `1561195554216738837`)_

> ↳ replying to daniellacosse: Again, I think trying to replace Node explicitly will require us to make decisions that sacrifice the developer experien

Okay


**Cyan** — 2026-10-18T01:53:46Z (`1561195558692200449`)

im thinking of an init.js
it create scopes (isolated v8 Context) with custom import map, resolver, globals, etc


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:53:52Z (`1561195581844623381`)

> ↳ replying to daniellacosse: As node compat kinda did to Deno in the first place

okay


**daniellacosse** — 2026-10-18T01:54:01Z (`1561195622306939053`)

Deno's DX is best in class imo - our target user market cares about this most of all


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:54:07Z (`1561195645757292545`)

> ↳ replying to Cyan: im thinking of an init.js it create scopes (isolated v8 Context) with custom import map, resolver, globals, etc

Overhead?


**daniellacosse** — 2026-10-18T01:54:16Z (`1561195681782304788`)

And it's the one that's not really being served by Node


**Cyan** — 2026-10-18T01:54:23Z (`1561195712581206150`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Overhead?

javascript kinda slow?


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:54:46Z (`1561195810522144768`)

> ↳ replying to daniellacosse: Deno's DX is best in class imo - our target user market cares about this most of all

Yes. The reason I use it in my personal projects but Node is widespread, then somehow we are stuck with it.

_(2026-10-18T01:54:59Z `1561195862946881598`)_

> ↳ replying to Cyan: javascript kinda slow?

Yeah. For GC.

_(2026-10-18T01:55:08Z `1561195900775170079`)_

And 0 == "0"?


**Cyan** — 2026-10-18T01:55:12Z (`1561195918353760328`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Yeah. For GC.

but node.js is full of javascript

_(2026-10-18T01:55:27Z, edited 2026-10-18T01:55:32Z `1561195980420948069`)_

and performance is still good enough


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T01:55:30Z (`1561195992416649357`)

> ↳ replying to Cyan: but node.js is full of javascript

Okay, then what are you getting at?

_(2026-10-18T01:55:54Z `1561196093323354244`)_

> ↳ replying to Cyan: and performance is still good enough

We need that then? Good enough primitive? And a freedom to build the rest around it?


**Cyan** — 2026-10-18T01:56:03Z (`1561196133362040893`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: We need that then? Good enough primitive? And a freedom to build the rest around it?

yeah ig

_(2026-10-18T01:56:15Z `1561196182468829256`)_

im not sure it will replace node compat or i will ship node compat with it by default


**daniellacosse** — 2026-10-18T01:58:20Z (`1561196704802410557`)

> ↳ replying to CaptainLach: Deno sucks at embedding and I would like to improve this while we increase modularity

and they sorta go hand in hand!


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:01:57Z (`1561197616652361823`)

> ↳ replying to Cyan: im not sure it will replace node compat or i will ship node compat with it by default

Same. But again. We don't **need** to have the philosophy sorted on Day 1. 
But we need some kind of direction, right? I mean, sure we are here not to save Deno, but to engineer a better product that can withstand this pressure from Legacy code and make it's own niche. Like C is still there, but few still use ASM, still use Python and JS. Everything have to C ABI, but still we write binding in different languages. 

See, the problem is not following what Bun or Deno did. It's thinking about the identity we wanna base Dodo & Ende on. We can have personal motives. Like I wanna use Dodo for this "app" that I am using, but then what goes to Dodo from my side? Maybe the solution I came up with? As Additions to the core?

_(2026-10-18T02:03:01Z `1561197885914222704`)_

> ↳ replying to daniellacosse: and they sorta go hand in hand!

Is it? I am not sure how. Though it's plausible. We can wander off into Dodo mobile perfecting for IOS, but the core is still bare?


**netop://ウィビ** — 2026-10-18T02:03:33Z (`1561198019976888351`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Same. But again. We don't **need** to have the philosophy sorted on Day 1.  But we need some kind of direction, right? I

The "identity" of Ende has been decided


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:04:12Z (`1561198184049410119`)

> ↳ replying to netop://ウィビ: The "identity" of Ende has been decided

Yeah. For security purists? Right?


**netop://ウィビ** — 2026-10-18T02:04:30Z (`1561198259051954349`)

For people who don't want all the extra stuff

_(2026-10-18T02:05:00Z `1561198382612226069`)_

It does one thing and one thing well. Be a foundation for TypeScript apps.


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:05:03Z (`1561198397438959728`)

> ↳ replying to netop://ウィビ: For people who don't want all the extra stuff

okay. good.

_(2026-10-18T02:05:22Z `1561198475369259119`)_

> ↳ replying to netop://ウィビ: It does one thing and one thing well. Be a foundation for TypeScript apps.

A very good goal indeed.

_(2026-10-18T02:06:12Z, edited 2026-10-18T02:07:57Z `1561198684383879260`)_

Just like people reach out to Python for Data Analysis, people reach out to Ende and its offering for TS apps?


**Cyan** — 2026-10-18T02:06:42Z (`1561198812415135836`)

Jupyter Notebook support ig


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:07:35Z (`1561199033857605675`)

> ↳ replying to Cyan: Jupyter Notebook support ig

For who?


**Cyan** — 2026-10-18T02:08:11Z (`1561199186030887053`)

> ↳ replying to Cyan: Jupyter Notebook support ig

Deno has it iirc


**daniellacosse** — 2026-10-18T02:10:19Z (`1561199721832382515`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Same. But again. We don't **need** to have the philosophy sorted on Day 1.  But we need some kind of direction, right? I

What do you think Dodo's identity should be?

_(2026-10-18T02:11:41Z `1561200065060798485`)_

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Is it? I am not sure how. Though it's plausible. We can wander off into Dodo mobile perfecting for IOS, but the core is 

If you can pick and choose which extensions to load (KV, notebook support, etc), you can drop the ones you don't need, or the ones that are harder to embed


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:12:18Z (`1561200223169155157`)

> ↳ replying to daniellacosse: What do you think Dodo's identity should be?

Okay. Hard one, But I will try. Give me sometime, I will come back to it.


**daniellacosse** — 2026-10-18T02:12:45Z (`1561200333739532289`)

I have my own belief but it seems I am struggling to communicate it, so I would love to hear it from y'all


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:12:51Z (`1561200360851513495`)

> ↳ replying to daniellacosse: If you can pick and choose which extensions to load (KV, notebook support, etc), you can drop the ones you don't need, o

Yeah! Sure. Good. But then, what should be the "core" of Dodo?

_(2026-10-18T02:13:03Z `1561200411166253137`)_

> ↳ replying to daniellacosse: I have my own belief but it seems I am struggling to communicate it, so I would love to hear it from y'all

True!

_(2026-10-18T02:13:21Z `1561200484524630097`)_

We can all communicate that in some thread.


**daniellacosse** — 2026-10-18T02:13:29Z (`1561200519928881193`)

\[no text content]

_(2026-10-18T02:13:49Z, edited 2026-10-18T02:15:33Z `1561200604737446059`)_

I think that's as good a definition of the core as any, personally


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:19:13Z (`1561201962567991297`)

> ↳ replying to daniellacosse: I think that's as good a definition of the core as any, personally

True. Not the Linter, or the benchmarker or the package manager itself, an embed-able runtime, flexible enough to smartly adapt based on the end-user? Like Tauri but for Webapps. Anything else can be added on top of the base we have. Frosting on it. People may bring their own solutions that may reside on JSR managed by Cloudflare or our own alternative from Dodo like the Nest we were talking about.


**w** — 2026-10-18T02:19:46Z (`1561202099306500168`)

Also struggling to communicate this, but here's my best shot: Deno is cli <-> runtime <-> v8; I'd like Dodo to crawl its way towards cli <-> core <-> runtime <-> v8.  I don't know what that shape is if you're not squinting.

_(2026-10-18T02:20:43Z `1561202339208101991`)_

And like <@178483185468833793>touched on, I'd like that core to be very friendly to embedders (greedily -- embedding is _my_ raison d'etre here)


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:22:38Z (`1561202823209951336`)

> ↳ replying to w: Also struggling to communicate this, but here's my best shot: Deno is cli <-> runtime <-> v8; I'd like Dodo to crawl its

This is a good identity.


**w** — 2026-10-18T02:23:04Z (`1561202931859202101`)

Oh man I just saw his good night message - I hope discord pings aren't gonna wake that guy 😅


**daniellacosse** — 2026-10-18T02:23:32Z, edited 2026-10-18T02:24:37Z (`1561203049857286226`)

i feel like the dude was awake for almost 24 hours 😵‍💫 the good news is we can all start onboarding now

_(2026-10-18T02:27:49Z `1561204124698017813`)_

> ↳ replying to w: Also struggling to communicate this, but here's my best shot: Deno is cli <-> runtime <-> v8; I'd like Dodo to crawl its

and from me, orthogonal to this - an emphasis on predictability and determinism.

_(2026-10-18T02:28:13Z `1561204227726909522`)_

security, web standards, developer experience - they're all rooted in this


**w** — 2026-10-18T02:28:26Z (`1561204282424950836`)

agreed


**Cyan** — 2026-10-18T02:29:35Z (`1561204569390981173`)

[attachment] Screenshot_2026-10-18_10.29.102x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1561204569336324096/Screenshot_2026-10-18_10.29.102x.webp?ex=6ad6294f&is=6ad4d7cf&hm=8c88cc20b114df72568fa4fa2607ef9743db6ae74947509cb3d6a964dfa36fdb&)


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:33:16Z (`1561205498747822161`)

> ↳ replying to Cyan: 

sick IDE though.


**Cyan** — 2026-10-18T02:33:50Z (`1561205641576579073`)

7ms startup time btw, around the same to bun tho, altho the runtime is minimal


**w** — 2026-10-18T02:34:14Z (`1561205740969132043`)

Yeah it's a nice cold start time, but I'm not too clear on what we're looking at


**Cyan** — 2026-10-18T02:34:16Z, edited 2026-10-18T02:34:23Z (`1561205748778799185`)

so it's also smaller
[attachment] Screenshot_2026-10-18_10.34.062x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1561205748468416562/Screenshot_2026-10-18_10.34.062x.webp?ex=6ad62a68&is=6ad4d8e8&hm=75f128fed49d05d0f0f08d718525a192583c1b7f8c78e9e92d0b6ed30611fa6a&)

_(2026-10-18T02:34:27Z `1561205795234783374`)_

since there's nothing in it ig


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:34:37Z (`1561205839438684221`)

> ↳ replying to daniellacosse: security, web standards, developer experience - they're all rooted in this

And then, we focus on delivering that. 
We can then choose the right programming language for each use case. For each interop.

_(2026-10-18T02:35:50Z `1561206143114678384`)_

> ↳ replying to Cyan: 7ms startup time btw, around the same to bun tho, altho the runtime is minimal

Did you build this? Like is it Dodo/Ende or your personal thing?


**Cyan** — 2026-10-18T02:36:15Z (`1561206250425819308`)

> ↳ replying to Sandeep Kumar Kuanar✌🏼: Did you build this? Like is it Dodo/Ende or your personal thing?

My personal thing


**Sandeep Kumar Kuanar✌🏼** — 2026-10-18T02:36:42Z (`1561206363181293631`)

> ↳ replying to Cyan: My personal thing

GOATed 🔥


**Cyan** — 2026-10-18T02:37:07Z (`1561206468315840594`)

I guess the build time is faster compared to dcore?

_(2026-10-18T02:37:48Z `1561206639678333030`)_

In release mode the engine is also link to the runtime with LTO

_(2026-10-18T02:38:40Z `1561206856473509920`)_

Bun’s oh Rust so good cuz it LTO but Zig can’t so it go faster after the rewrite claim is definitely false

_(2026-10-18T02:39:56Z, edited 2026-10-18T02:39:59Z `1561207174917791855`)_

And it also do ICF, ICU compression

_(2026-10-18T02:40:26Z `1561207303405961257`)_

For some reason Bun decided it’s good to do it in Rust but not in Zig

_(2026-10-18T02:41:39Z `1561207605869809695`)_

> Rust supports cross-language link-time optimization between C/C++ and Rust, which enables inlining across programming languages (how cool is that!!).

My runtime also does that but with Zig, how cool is that lol


**w** — 2026-10-18T02:43:10Z (`1561207987815583815`)

> ↳ replying to Cyan: > Rust supports cross-language link-time optimization between C/C++ and Rust, which enables inlining across programming 

needs more !! :p


**Cyan** — 2026-10-18T02:43:16Z (`1561208012738273341`)

I guess they’re not dumb, so maybe they’re evil


**daniellacosse** — 2026-10-18T02:48:19Z (`1561209285478719568`)

andy is team rewrite, part of me thinks to do it in zig would be fn hilarious and could possibly go viral

the adult in me wants to do the responsible thing and maintain continuity tho


**w** — 2026-10-18T02:48:47Z (`1561209404219727923`)

> ↳ replying to daniellacosse: security, web standards, developer experience - they're all rooted in this

this is closer to a good identity -- it's just _also_ Deno's identity.  I don't think modularity is _enough_ of a differentiator, and there's going to be some real work to make anything modular win (e.g. prebuilt snapshots are _pretty good_ and we could easily be competing with them) -- have any thoughts on the direction you'd want to steer dx/standards support (or, where it's not overlapping dx, ease of standards support)/security?


**Cyan** — 2026-10-18T02:49:15Z (`1561209521790128200`)

> ↳ replying to daniellacosse: andy is team rewrite, part of me thinks to do it in zig would be fn hilarious and could possibly go viral  the adult in 

Rust compilation time sucks

_(2026-10-18T02:50:09Z `1561209747112333375`)_

You can’t ship fast when the CI takes 1 hour

_(2026-10-18T02:51:27Z `1561210075350048799`)_

(Another reason is GitHub CI machines is insanely slow iirc?)


**w** — 2026-10-18T02:53:29Z (`1561210586191233105`)

they're not fast by any measure


**Cyan** — 2026-10-18T02:53:50Z (`1561210671725809769`)

> ↳ replying to w: they're not fast by any measure

Yeah


**daniellacosse** — 2026-10-18T03:06:50Z, edited 2026-10-18T03:07:48Z (`1561213946864869509`)

> ↳ replying to w: this is closer to a good identity -- it's just _also_ Deno's identity.  I don't think modularity is _enough_ of a differ

this is intentional - I'm sort of threading the needle of why I believe we're all here. and yeah, modularity is just good engineering. the intent is to largely maintain course in the current term for those who loved Deno because Deno is no more

I'd say the natural conclusion of predictability is achieving it cross-platform. Desktop was already reaching for that, and we feel it too with our shared desire for embedibility.

_(2026-10-18T03:09:26Z, edited 2026-10-18T03:10:53Z `1561214598202400839`)_

I can see everything stacking up to that: a world where you can write a simple script in 30m you trust can be run in your terminal or on your friggin ipad

_(2026-10-18T03:10:15Z `1561214804176150681`)_

or on your nintendo switch for chrissake (stretch goal)

_(2026-10-18T03:10:27Z `1561214854759583745`)_

(they keep those apis under NDA)


**Cyan** — 2026-10-18T03:11:46Z (`1561215186935873609`)

> ↳ replying to daniellacosse: I can see everything stacking up to that: a world where you can write a simple script in 30m you trust can be run in you

You can't JIT on iOS <:xwhoami:1167679154888650792>


**daniellacosse** — 2026-10-18T03:11:55Z (`1561215225334730856`)

i know


**w** — 2026-10-18T03:11:59Z (`1561215241298256014`)

Do you think it's our job to have _any sort_ of answer for the void left by deno deploy/fresh?  I never came near this part of deno, but I've gotten the impression that for some people it's _why_ they consider deno's dx good


**Cyan** — 2026-10-18T03:12:04Z (`1561215262554853467`)

and if you don't use WebKit, Apple will ban you


**daniellacosse** — 2026-10-18T03:12:09Z (`1561215284080152637`)

i know

_(2026-10-18T03:12:34Z `1561215387536851117`)_

i've written xplat in go


**Cyan** — 2026-10-18T03:12:47Z (`1561215443992190997`)

> ↳ replying to w: Do you think it's our job to have _any sort_ of answer for the void left by deno deploy/fresh?  I never came near this p

it cost money


**daniellacosse** — 2026-10-18T03:12:53Z (`1561215466385575978`)

jitless hasn't stopped me before

_(2026-10-18T03:13:32Z, edited 2026-10-18T03:13:52Z `1561215631699873812`)_

> ↳ replying to w: Do you think it's our job to have _any sort_ of answer for the void left by deno deploy/fresh?  I never came near this p

i actually have an idea for a framework that I think leverages deno _more_ but it's not fully thought through. I was in the process of designing it when this whole thing happened

_(2026-10-18T03:14:14Z `1561215805985783860`)_

idk about deploy though. I feel like that's a saturated space

_(2026-10-18T03:14:18Z `1561215825686298796`)_

maybe

_(2026-10-18T03:15:26Z `1561216108709814425`)_

> ↳ replying to daniellacosse: i actually have an idea for a framework that I think leverages deno _more_ but it's not fully thought through. I was in 

I'm working on posting something to propose, it's like 70% written


**w** — 2026-10-18T03:15:34Z (`1561216141022597201`)

idk either - i don't think replacing it is feasible - i don't think there's anything quite equivalent - and i hate the idea of blessing something _worse_ behind a friendly cli


**daniellacosse** — 2026-10-18T03:17:25Z (`1561216608247095388`)

> ↳ replying to Cyan: You can't JIT on iOS <:xwhoami:1167679154888650792>

i've a prototype that beats react in jitless


**w** — 2026-10-18T03:18:13Z (`1561216809624146121`)

I'm curious to see it.  The only playing I've done with jsx is _so_ cursed.

_(2026-10-18T03:19:03Z `1561217018437443675`)_

My little mud client goes a little too hard with its own module loader, and allows things like 

```tsx
import someShader from "./myshader.wgsl";

echo(<TextEffect shader={someShader}>Hello world</TextEffect>);
```


**daniellacosse** — 2026-10-18T03:19:21Z (`1561217095218241537`)

I'm a little sensitive about it given its incompleteness, but I'm open to us all co-designing if we like the general vibe of it


**w** — 2026-10-18T03:19:50Z (`1561217214802042993`)

cool explosions, though
[attachment] i.gif (https://cdn.discordapp.com/attachments/1558965777850302546/1561217214772809798/i.gif?ex=6ad63516&is=6ad4e396&hm=1162845d07c8e9a64a2880007bbc29d075e2dc398f7a2945274c4f5ff81d97aa&)


**daniellacosse** — 2026-10-18T03:20:25Z (`1561217361611063308`)

i just learned WGPU for js13k, I adore it


**w** — 2026-10-18T03:21:29Z (`1561217633960071291`)

ooh, nice -- I've only really gotten into it over the past month myself


**daniellacosse** — 2026-10-18T03:25:20Z (`1561218599480205355`)

it ran like butter on fifteen year old hardware. had me daydreaming about gpu-accelerated data stores for a couple weeks

_(2026-10-18T03:25:31Z `1561218647911833651`)_

one thing at a time...


**w** — 2026-10-18T03:28:24Z, edited 2026-10-18T03:28:36Z (`1561219373383942186`)

Hah, I'm having a similar experience; my gamedev background is almost 0. Once I took on maintenance of an already-built unity game for a university center. I'm really just making text fire lightning bolts -- it's not _that_ intensive -- but I didn't expect every device I threw it at to have sub-1ms draw calls

_(2026-10-18T03:30:21Z `1561219861676564501`)_

I think it'd be fun to try to extend SGR with some semantic transitions/effects - I wouldn't mind some of this stuff in a terminal emulator


**daniellacosse** — 2026-10-18T03:34:08Z (`1561220815696171039`)

yes please, let's completely return to monke

_(2026-10-18T03:34:28Z `1561220899774922883`)_

TUI to the max


**w** — 2026-10-18T03:37:23Z (`1561221635497795655`)

I love the idea of this, but I can't survive like that long-term

_(2026-10-18T03:37:29Z `1561221660332396568`)_

Too much commitment


**daniellacosse** — 2026-10-18T03:37:51Z (`1561221749356498995`)

a girl can dream


**w** — 2026-10-18T03:39:14Z (`1561222100281196646`)

http://sw.kovidgoyal.net/kitty/custom-shaders/ Kitty does some cool stuff here too -- but it's more whimsical terminal theme and less shader-rich text


**netop://ウィビ** — 2026-10-18T04:41:50Z (`1561237851918696459`)

> ↳ replying to daniellacosse: andy is team rewrite, part of me thinks to do it in zig would be fn hilarious and could possibly go viral  the adult in 

I think a rewrite is a good idea. Deno, as great as it is, is the result of YEARS of work that, like any codebase, has accumulated technical debt. You could rewrite and keep compatibility and score better on benchmarks, easy.


**andy** — 2026-10-18T04:42:16Z (`1561237961381515325`)

> ↳ replying to daniellacosse: andy is team rewrite, part of me thinks to do it in zig would be fn hilarious and could possibly go viral  the adult in 

i am very team rewrite, zig is kinda annoying tho 😭

_(2026-10-18T04:42:23Z `1561237990066622475`)_

the prototype was gonna be in zig

_(2026-10-18T04:42:26Z `1561238003534528527`)_

but zig painful

_(2026-10-18T04:42:43Z `1561238073571016807`)_

> ↳ replying to Cyan: Rust compilation time sucks

is there anyway for CI to share caches between runs


**Cyan** — 2026-10-18T04:43:03Z (`1561238158103023759`)

> ↳ replying to andy: is there anyway for CI to share caches between runs

there's like @actions/cache iirc

_(2026-10-18T04:43:19Z `1561238227531210843`)_

but cache poison?


**andy** — 2026-10-18T04:43:39Z (`1561238310993789122`)

that has literally never ever happened to me with rust

_(2026-10-18T04:43:43Z `1561238326080704595`)_

rust's caching is very good

_(2026-10-18T04:43:48Z `1561238347345559645`)_

and either way we can always clear the cache


**Cyan** — 2026-10-18T04:43:58Z, edited 2026-10-18T04:44:03Z (`1561238391465574462`)

> ↳ replying to andy: is there anyway for CI to share caches between runs

building v8 on my machine takes ~6 minutes (performance mode, fans max out) and the zig part is only a few seconds


**andy** — 2026-10-18T04:44:29Z (`1561238519035203625`)

well yeah, v8 is kinda fucking massive


**Cyan** — 2026-10-18T04:44:37Z, edited 2026-10-18T04:45:15Z (`1561238551188869263`)

> ↳ replying to andy: and either way we can always clear the cache

you won't know when someone poison it, it gets buried, until next release someone's credentials got stolen etc


**andy** — 2026-10-18T04:44:37Z (`1561238553713844296`)

and i know zig has fast compile times

_(2026-10-18T04:44:47Z `1561238595661070439`)_

i just don't like it as a language

_(2026-10-18T04:45:32Z `1561238782815117352`)_

https://github.blog/changelog/2026-09-10-control-github-actions-cache-access-with-cache-mode/
also why not just everything not merged is read-only cache
[embed] Control GitHub Actions cache access with cache-mode - GitHub Changelog You can now use cache-mode to apply least-privilege access to the GitHub Actions cache at the workflow or job level. By granting each workflow or job only the cache access…


**Cyan** — 2026-10-18T04:46:28Z, edited 2026-10-18T04:48:18Z (`1561239018551902259`)

> ↳ replying to andy: i just don't like it as a language

Rust is great, for Zig it feel like it's fine for me

_(2026-10-18T04:55:05Z `1561241188135084103`)_

Zig is pretty verbose and it's kinda annoying sometimes, but it's still very nice to use


**andy** — 2026-10-18T05:00:42Z (`1561242599392673863`)

zig's build system is kinda annoying, and there's not a ton of support for it

_(2026-10-18T05:00:47Z `1561242623530897479`)_

also it's LSP support is poopy


**Cyan** — 2026-10-18T05:20:20Z (`1561247540085526630`)

> ↳ replying to andy: also it's LSP support is poopy

ZLS 0.17.0 is still not released yet

_(2026-10-18T05:20:26Z `1561247567076007977`)_

so i manually built it lol

_(2026-10-18T05:20:39Z `1561247622147219477`)_

> ↳ replying to andy: zig's build system is kinda annoying, and there's not a ton of support for it

the Build System is actually good ig?


**andy** — 2026-10-18T05:20:59Z, edited 2026-10-18T05:21:01Z (`1561247703156133901`)

the build system is powerful

_(2026-10-18T05:21:03Z `1561247721153630250`)_

but very confusing imo


**Cyan** — 2026-10-18T05:21:27Z (`1561247823834382430`)

> ↳ replying to andy: but very confusing imo

it took me a while to figure it out but yeah it makes sense

_(2026-10-18T05:21:42Z `1561247886140903425`)_

> ↳ replying to andy: also it's LSP support is poopy

LSP is kinda hard since comptime

_(2026-10-18T05:21:45Z `1561247899222941777`)_

but things improved a lot

_(2026-10-18T05:22:01Z `1561247964595228744`)_

i haven't seen zls panicking since 0.16.0

_(2026-10-18T05:23:12Z `1561248261568725063`)_

it works most of the time

_(2026-10-18T05:24:11Z `1561248508411908096`)_

[attachment] Screenshot_2026-10-18_13.23.532x.webp (https://cdn.discordapp.com/attachments/1558965777850302546/1561248508109914222/Screenshot_2026-10-18_13.23.532x.webp?ex=6ad5a97a&is=6ad457fa&hm=7f4088d313c281c29f07dbaa85e0b743fc70bb80a1495d4de84a0f147618a4bf&)


**daniellacosse** — 2026-10-18T08:44:17Z, edited 2026-10-18T09:04:59Z (`1561298865905336391`)

> ↳ replying to andy: i am very team rewrite, zig is kinda annoying tho 😭

I could be convinced longer term if we're able to first lock down some kind of C ABI in the current codebase. That way we could rewrite various modules/extensions incrementally in whatever, even golang - tho for me ensuring we don't break xplat is a must. I think we have the collective power to do so it just needs to be done in a coordinated way

_(2026-10-18T08:44:55Z, edited 2026-10-18T09:03:54Z `1561299026538799205`)_

> ↳ replying to andy: https://github.blog/changelog/2026-09-10-control-github-actions-cache-access-with-cache-mode/ also why not just everythi

On top of caching we should experiment with self-hosting the runner - a few-dozen-dollar a month box could go a long way. Still haven't heard from Bart. Will make a point to apply to OSC and GitHub Sponsors soon (I was hoping for a build first)


**Cyan** — 2026-10-18T10:45:53Z, edited 2026-10-18T10:46:15Z (`1561329466930765826`)

> ↳ replying to daniellacosse: I could be convinced longer term if we're able to first lock down some kind of C ABI in the current codebase. That way w

i already made both Zig and Rust use the same binding


**daniellacosse** — 2026-10-18T11:10:48Z, edited 2026-10-18T11:25:10Z (`1561335737931137025`)

> ↳ replying to Cyan: i already made both Zig and Rust use the same binding

maybe u and andy can collab on [dodo-x](https://github.com/are-we-dodo-yet/dodo-x) ? get together a proposed spec and proof of concept we can all go over together?

_(2026-10-18T11:12:13Z `1561336097206698015`)_

another thing that's probably obvious but worth stating explicitly: before any rewrite we need to make sure we have proper mechanisms to ensure we catch any regressions, should be a part of any proposal you draft


**Cyan** — 2026-10-18T11:27:01Z (`1561339822415679542`)

i would upload my version soon


**CaptainLach** — 2026-10-18T12:08:37Z (`1561350290148560946`)

Wrote a small wrapper over ffmpeg using unreleased version of dodo-bindgen
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561350289842249818/image.png?ex=6ad60845&is=6ad4b6c5&hm=aaf8371efba4af6b6337efad66a80064e41c036ac9e910623d9f7835365af44f&)

_(2026-10-18T12:09:17Z `1561350459094999163`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561350458751193219/image.png?ex=6ad6086d&is=6ad4b6ed&hm=07c43822430dde4b2e9b26ec4855a4ab93bd3fa8d2723ffb3e0d5fcc06e6d38c&)

_(2026-10-18T12:09:51Z `1561350600212488350`)_

...There is nothing else, #[dodo_bindgen] just exposed this implementation in Rust to typescript

_(2026-10-18T12:11:21Z `1561350975589974106`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561350975195971635/image.png?ex=6ad608e8&is=6ad4b768&hm=b184a159db32629b6a2b13798d66eee507cd01cb0968b7df2f4d72e3b23611f8&)

_(2026-10-18T12:12:26Z `1561351250279268362`)_

[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561351249159266445/image.png?ex=6ad6092a&is=6ad4b7aa&hm=1f4b0206f879c4802091535e423fe38bd0bb28bf05587892f174f4b515a806df&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561351249557721168/image.png?ex=6ad6092a&is=6ad4b7aa&hm=f04661c6d9dcd762ef10b5e4a1f7eb317b65b01012fad4a869681ededb4fb69c&)
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561351249876750478/image.png?ex=6ad6092a&is=6ad4b7aa&hm=bc36303a25fe527c659dfc0cd8dd4eb5b567ae6066da5b76141801d3969655f5&)

_(2026-10-18T12:14:28Z `1561351761602674811`)_

Of course there is typescript code generated, but it is functionally invisible
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561351761438974062/image.png?ex=6ad609a4&is=6ad4b824&hm=61d6ca4e11e610e2d579ef1c77c1cb7c8cdb8c16ecebd69817385b007a2ae46c&)

_(2026-10-18T12:15:36Z `1561352048773963848`)_

Also with async
[attachment] image.png (https://cdn.discordapp.com/attachments/1558965777850302546/1561352048488747089/image.png?ex=6ad609e8&is=6ad4b868&hm=d716aa2e6bbce554f6c386e001ee4ba035ee79ed0cad1ae86b41b645143cf59f&)


**Cyan** — 2026-10-18T12:24:02Z (`1561354170039148665`)

wait my repo is sha256

_(2026-10-18T12:24:07Z `1561354190763073588`)_

github crap doesn't support sha256

_(2026-10-18T12:24:25Z `1561354266696884225`)_

<:openeyecryinglaughing:513630205731143691>


**CaptainLach** — 2026-10-18T12:27:25Z (`1561355022237958291`)

Isn't there a mapping sha1<=>sha256 stored in git anyway?


**Cyan** — 2026-10-18T12:27:35Z (`1561355061752234107`)

> ↳ replying to CaptainLach: Isn't there a mapping sha1<=>sha256 stored in git anyway?

idk

_(2026-10-18T12:27:37Z `1561355073056149577`)_

but it doesn't push


**CaptainLach** — 2026-10-18T12:49:52Z (`1561360668467138651`)

Released the updated dodo-bindgen!
https://github.com/are-we-dodo-yet/dodo-bindgen
[embed] GitHub - are-we-dodo-yet/dodo-bindgen Contribute to are-we-dodo-yet/dodo-bindgen development by creating an account on GitHub.


**Cyan** — 2026-10-18T12:55:49Z (`1561362169575116932`)

> ↳ replying to Cyan: i would upload my version soon

https://github.com/origine-js/origine


**CaptainLach** — 2026-10-18T13:08:41Z (`1561365407632326657`)

The repo is private


**Cyan** — 2026-10-18T13:14:07Z (`1561366771665993869`)

> ↳ replying to CaptainLach: The repo is private

fixed
