---
title: "Discord #general — 2026-11-07"
source: "Discord REST API, channel 1558888938842624093, UTC timestamps"
channel_type: text
author:
  - "lambdacalc"
  - "Summer"
  - "SpaceMonkey"
created: 2026-11-07
description: "Append-only capture of #general from 2026-11-07T18:31:02Z to 2026-11-08T14:39:18Z, pulled from the Discord REST API. 18 messages, 3 participants."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#general` in the Deno Core Working Group Discord, 2026-11-07T18:31:02Z to 2026-11-08T14:39:18Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire.

---
\[system] 7 — 2026-11-07T18:31:02Z

**Summer** — 2026-11-08T02:19:49Z (`1568812256806838457`)

https://goldstein.lol/posts/deno-security/
> funnily enough, I didn’t even think that this issue would be there when I poked at Deno for the first time
🙂‍↕️

_(2026-11-08T02:21:26Z `1568812664287797451`)_

I don't think there is a single permission flag for deno that doesn't have a secret undocumented footgun understanding of security

_(2026-11-08T02:22:17Z `1568812880323682360`)_

I think --no-prompt (for every future runtime at least) should actually lock things down with landlock/pledge/namespaces at least


**SpaceMonkey** — 2026-11-08T13:52:09Z, edited 2026-11-08T14:09:23Z (`1568986487897460900`)

> ↳ replying to Summer: https://goldstein.lol/posts/deno-security/ > funnily enough, I didn’t even think that this issue would be there when I p

Claude agrees with you even more than the post...
```I mostly agree with Summer, and the last line is the sharpest thing anyone has said about this.

"Every flag has an undocumented footgun": overstated, but they are right about the direction. A few flags really do hand over more than their name says:
- --allow-run: full trust, effectively.
- --allow-ffi: full trust.
- --allow-write: write access to ~/.bashrc, deno.json or node_modules turns into running code.
- --allow-env: exposes secrets, and can change how libc behaves.
- --allow-net: includes localhost, so code can reach local services and cloud metadata endpoints.

Deno's docs do warn about run and ffi, so not every one is undocumented. But the implications of write, env and net aren't spelled out anywhere a typical user would notice.

"--no-prompt should lock things down at the OS level": this is the key insight, and it's more precise than the blog post. Landlock, pledge, seccomp and Seatbelt can only ever narrow what a process may do; once applied, nothing can widen it. Prompting needs the opposite: granting a new permission mid-run. So prompting is fundamentally at odds with kernel enforceme permission set is fixed at startup, which is exactly when it can be compiled into kernel.```

_(2026-11-08T13:55:32Z `1568987339525464166`)_

That was the beginning of a Claude Code session... I manage a fork of Deno for my Denext application framework. I'm going to address this in a future update.

_(2026-11-08T13:56:40Z `1568987624889126914`)_

Anyone interested in a beefier Deno, but not my framework, can still use the pimped-out Deno I do... I don't distribute it outside Denext, but you can always build your own...  https://github.com/Brainwires/deno


**Summer** — 2026-11-08T14:10:23Z (`1568991076931473481`)

> ↳ replying to SpaceMonkey: Claude agrees with you even more than the post... ```I mostly agree with Summer, and the last line is the sharpest thing

https://discord.com/channels/1558888938251223050/1559276145835253921/1564562339317940357 its more these issues

_(2026-11-08T14:11:30Z `1568991358620926127`)_

net allow/deny used to act weird when combined with proxies

_(2026-11-08T14:13:15Z `1568991798582448129`)_

there is no way to introspect what possible categories of permissions there are in deno, so its impossible to make a worker thread with a reduced subset of permissions safely

_(2026-11-08T14:15:52Z `1568992459927715903`)_

every aspect of deno's security shirks best practices, or even just like... practices full stop


**SpaceMonkey** — 2026-11-08T14:18:54Z (`1568993221499949090`)

Fair. The core problem is that the permission flags are checks inside Deno's own APIs, not a sandbox. Anything that reaches the OS another way (FFI, a subprocess, a native addon) isn't held to them, and the docs never said that plainly. Here's how we're tackling it in denext's runtime:

**Kernel enforcement.** Landlock/seccomp on Linux, Seatbelt on macOS, AppContainer + job objects on Windows later. Those can only narrow, never widen, so it switches on automatically whenever the permission set is fixed: `--no-prompt`, no TTY, compiled binaries, packaged desktop apps. Prompting stays the interactive guardrail mode. We already run npm lifecycle scripts jailed this way, so it's an extension, not a rewrite.

**Footguns you listed, all queued:**
- allow scopes checked against the resolved symlink target (deny scopes already are)
- the permission broker hands back an open fd/handle instead of yes/no (TOCTOU)
- `Deno.permissions.names` + deny-by-default worker permissions, so reduced workers are actually safe
- net allow/deny with proxies audited and documented (proxy env vars are already snapshotted before user code)
- terminal state reset before the prompt (stdin is already flushed)
- opt-in clean environment for `--allow-run`, which is spelled out as full trust

**Docs.** Rewording everything to "least-privilege guardrails" until the kernel mode is on, with a footgun list (run/ffi = full trust, writing config files, localhost via net).

Private vulnerability reporting is on for the runtime: <https://github.com/Brainwires/deno/security/advisories/new>. If you find more, I'd genuinely like to hear about it there.

_(2026-11-08T14:19:41Z `1568993417348780147`)_

AI wrote that; it understands your concerns better than I can directly. 🙂


**Summer** — 2026-11-08T14:23:21Z (`1568994340242595921`)

* [Traversal-resistant file APIs / Go's `openRoot`](<https://github.com/denoland/deno/discussions/36651>)
* [Desktop: Allow verifying sender of messages over desktop bindings for security](<https://github.com/denoland/deno/issues/36861>)
* [Desktop: Expose an equivielent of `'will-navigate'` event with `preventDefault` support for security](<https://github.com/denoland/deno/issues/36860>)

_(2026-11-08T14:23:39Z `1568994415194931242`)_

and pls no more llm paste to me, sorry


**SpaceMonkey** — 2026-11-08T14:27:57Z, edited 2026-11-08T14:28:15Z (`1568995499552546967`)

Sure, you can talk to my dumb ass instead (compared to AI). 😄

I'll review your links. Just trying to help everyone out. 
I have autism, and I am not the best at typing... I've also been working all night, and my brain is in power-saving mode right now.


**Summer** — 2026-11-08T14:38:03Z (`1568998039694348380`)

I was born always being right so having a robot  acknowledge that while knowing that the robot will forget my majestic rightness within seconds doesn't do much for me


**SpaceMonkey** — 2026-11-08T14:39:18Z (`1568998354136862853`)

> ↳ replying to Summer: * [Traversal-resistant file APIs / Go's `openRoot`](<https://github.com/denoland/deno/discussions/36651>) * [Desktop: Al

We'll do all three, no problem... Action runners are a b1tch (already backlogged), but I should have it done in a couple weeks (AI's guess). 🙂
