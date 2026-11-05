---
title: "Discord #propose — 2026-11-04"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "daniellacosse"
  - "davey"
  - "andy"
  - "CaptainLach"
created: 2026-11-04
description: "Append-only capture of #propose from 2026-11-04T18:50:49Z to 2026-11-05T16:25:09Z, pulled from the Discord REST API. 28 messages, 4 participants, across 1 thread."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-11-04T18:50:49Z to 2026-11-05T16:25:09Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## per-package (module-level) permissions (thread 1562324423615184897)

**daniellacosse** — 2026-11-04T18:50:49Z, edited 2026-11-04T18:57:39Z (`1567612100937908275`)

ah, okay, so i'm playing around with `with` now to understand what you mean. It's weird

import example from "./example.json" with { type: "text" };

works! I log `"{}"`

import example from "./example.json" with { type: "json" };

works! I can log `{}`

import example1 from "./example.json" with { type: "text" };
import example2 from "./example.json" with { type: "json" };

does not work - I get:

"error: Expected a JavaScript or TypeScript module, but identified a Json module. Consider importing Json modules with an import attribute with the type of "json"."

this is a very confusing and bad error and is why I didn't realize it worked the way it does

_(2026-11-04T18:52:05Z, edited 2026-11-04T19:08:03Z `1567612420091023411`)_

> ↳ replying to CaptainLach: You can't really have per-module permissions, you don't even have a place to put permissions for module in, and no real 

Another way to do this though would be to do something similar to the webworkers api, where you do like a `Deno.isolateModule()` (or we just tell ppl to use a webworker)

_(2026-11-04T18:53:03Z, edited 2026-11-04T18:53:14Z `1567612661435338813`)_

I kind of think that `isolateModule` would be more able to live alongside per-package permissions. Per-package permissions I think covers maybe 90%+ of use cases.

_(2026-11-04T18:55:30Z `1567613277524070425`)_

I don't think Deno supports `?raw` right

_(2026-11-04T18:57:01Z `1567613658798882966`)_

Doesn't seem like it; so query params wouldn't be an option

_(2026-11-04T19:01:02Z `1567614673325531289`)_

per-package, I think just extending imports would be fine? I think this has been proposed

```
"imports": {
  "local:serve": {
    module: "runtime:serve",
    permissions: {
      net: "[::1]"
    }
  },
  "ext:serve": "runtime:serve"
}
```

_(2026-11-04T19:02:04Z `1567614930692087809`)_

this is really just as good as per-module

_(2026-11-04T19:04:52Z `1567615637834965157`)_

it's just not dynamic in the way something like `isolateModules` could be


**davey** — 2026-11-04T20:12:54Z, edited 2026-11-04T20:22:17Z (`1567632758854123653`)

> ↳ replying to daniellacosse: per-package, I think just extending imports would be fine? I think this has been proposed  ``` "imports": {   "local:ser

I like the look of this.

There is another approach were a 3rd party package hardcodes their required (and optional) permissions. On install the dev is prompted to accept, on upgrade the user is prompted on drift. And the agreed permissions are stored in deno.json or the lock file.

Edit: I've realised we don't need to reinvent the wheel here, prompts could be exactly how Deno does it now for the root module.

I can't tell if this is cursed. But done right it would allow somewhere like jsr to show the permissions that a package needs - from code as the source of truth.


**daniellacosse** — 2026-11-04T23:21:33Z, edited 2026-11-04T23:32:52Z (`1567680233229000717`)

> ↳ replying to davey: I like the look of this.  There is another approach were a 3rd party package hardcodes their required (and optional) per

What you're describing is I think a slightly different feature? For declaring producer-side intent, versus consumer-side allows. Apologies if I misunderstood the need here

_(2026-11-04T23:21:44Z, edited 2026-11-04T23:32:58Z `1567680277608923178`)_

These things can of course co-exist

_(2026-11-04T23:24:54Z `1567681074463510720`)_

I think consumer-side is probably the first thing we'd try (quickest impact) then producer-side?

_(2026-11-04T23:28:37Z, edited 2026-11-04T23:36:38Z `1567682010384965673`)_

That said, <@1136701682131144714> also mentioned the idea of writing accepted permissions to your deno.json; that would be another way to achieve the same effect, without needing to implement any kind of producer-side manifest

_(2026-11-04T23:28:54Z, edited 2026-11-04T23:32:16Z `1567682081868349481`)_

An explicit manifest would still be useful as JSR metadata, though: but it can, of course, lie


**andy** — 2026-11-04T23:41:01Z (`1567685132268085360`)

anyways i think per package permissions might actually be somewhat doable

_(2026-11-04T23:41:06Z `1567685154309279847`)_

if we introduce a step when we load a module

_(2026-11-04T23:41:11Z `1567685172105847056`)_

after typescript transpilation

_(2026-11-04T23:42:26Z, edited 2026-11-04T23:43:14Z `1567685486800011326`)_

where we replace references to the deno global to a call to a function with a random name per location, and when the function is called, it makes sure that the location (line, file) it was invoked from is correct

_(2026-11-04T23:42:37Z `1567685535374377131`)_

sure, it makes window["Deno"] impossible

_(2026-11-04T23:43:07Z `1567685657785278485`)_

but also i reckon that it would be nearly impossible to bypass, as the name is never known, it changes every time, and the function is location-specific


**CaptainLach** — 2026-11-04T23:43:40Z (`1567685797711188019`)

> ↳ replying to andy: where we replace references to the deno global to a call to a function with a random name per location, and when the fun

I would prefer if we just hook import of runtime package for all packages, and then only add a Deno import override


**andy** — 2026-11-04T23:45:01Z (`1567686137575899139`)

it's also possible to just do a local variable scoped to the module, but then, bundled code all has the same privileges, meanwhile with this method we can understand sourcemaps


**CaptainLach** — 2026-11-04T23:45:18Z (`1567686208795050119`)

This way it works exclusively on the level of synthetic modules and module graph level, with a dumb transpiler that is not aware of permission system, which seems to be a more reasonable way to handle this

_(2026-11-04T23:46:10Z `1567686426131304631`)_

> ↳ replying to andy: it's also possible to just do a local variable scoped to the module, but then, bundled code all has the same privileges,

Oh, I don't think it can be solved reasonably in bundled code 😄


**andy** — 2026-11-04T23:46:22Z (`1567686479159890032`)

true


**CaptainLach** — 2026-11-04T23:48:47Z (`1567687086977323009`)

I mean, you can reasonably make every package use its own Deno_19023809123809128390123890 global (And I'm pretty sure it is possible to enumerate local vars using with(new Proxy(...)){}), and then store permissions exposed for every of such object, but it seems that's the solution in search for a problem, why would you bundle such code in the first place...

_(2026-11-05T05:53:32Z `1567778878351478825`)_

Was trying to do a quick demo on how permission system might look - found out module.registerHooks which is the only way to do this from js allows you to skip imports of the referenced module
https://github.com/are-we-dodo-yet/dodo/pull/18
[embed] fix: op_import_sync_with_source skips loading file imports by Certa... Why?

What?

References


**daniellacosse** — 2026-11-05T16:25:09Z (`1567937828338405522`)

looks good, small nit you can ignore
