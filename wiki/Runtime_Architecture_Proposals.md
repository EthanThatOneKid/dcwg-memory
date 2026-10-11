---
'@type': schema:TechArticle
schema:name: Runtime architecture proposals
schema:description: The 2026-10-11 architecture thread: a minimal core with opt-in extensions, the host-language question (C#, Go, Rust), extensions authored in TypeScript, console as an extension, and the fork-versus-rewrite order of operations.
wazoo:source: dcwg
wiki:priority: high
---

# Runtime architecture proposals

The second capture from 2026-10-11, `raw/discord/2026-10-11_dcwg-architecture.md`, is an architecture channel from 3:13 PM to 3:45 PM. It is the first time the group argued about what the runtime is made of rather than what it is called, and nothing in it was decided.

## The proposal on the table

`andy` opened the channel with a shape: a minimal core plus plugins, where the core is "just giving extensions access to the V8 isolate that user code runs in, and native things like wgpu". Deno compatibility becomes a configuration of that core rather than its definition, expressed as flags that `andy` specified at the end of the thread: `--preset=none --exts=a,b,c` to opt in, `--no-exts=a,b,c` to remove specific extensions, and Deno-like behavior by default.

## The host language question

`andy` argued for C#: fast, pleasant to write today, with "amazing support for dynamically loading code", and good for prototyping. Rust he described as slower to write but perhaps better in the long run, and he raised Go as another option. `daniellacosse` said Go would also fit and that he does not know much C#. The question produced no decision and no comparison of consequences.

The one hard requirement stated in the thread came from `daniellacosse` and it is a build problem rather than a language preference: cross-compilation. He said he had already compiled `rusty_v8` to iOS and others and was working on a cross-platform solution he liked.

## Extensions in TypeScript

`andy` proposed that extensions also be written in TypeScript, which `netop://ウィビ` endorsed. `daniellacosse` qualified it in the same minute: TypeScript will not reach every target, since something like WebGPU would still need `wgpu`, so he would support both TypeScript and Rust. `netop://ウィビ` reached the same conclusion. `andy` added that extensions will likely carry a build step to keep the core minimal, and that the core can expose utilities for loading and invoking shared objects, DLLs, and dylibs.

The core boundary was then argued directly. `daniellacosse` said "i actually don't think wgpu should be in the core, but i could be convinced", on the grounds that not every application needs WebGPU and a smaller binary is worth something. That is the only concrete boundary anyone defended in the thread.

## Console as an extension

`daniellacosse` said his prototype would be "extremely aggressive, like, even console is an extension", with the example of swapping in a `sentry_console` implementation. `andy` assumed `console` ships with V8 and `daniellacosse` corrected him, citing his own source file.

He is right, and the nuance is worth recording because the mistake is the common one. `console` is not part of V8's embedder API; an embedder supplies it, V8's own developer shell supplies a version, and every runtime ships its own (Deno's lives in `ext/console`, alongside 30 sibling extensions). V8 has no stdout to write to, which is exactly why the binding exists.[^1]

`andy`'s response was that implementing `console` as an extension is a fair test of whether an extension system works at all. `daniellacosse` agreed and then doubted the developer experience it implies, arriving at the flag `andy` adopted: "the actual better dx may be to support something like --ext=recommended by default".

## The waterfall, and the disagreement about timing

`daniellacosse` stated the order of preference explicitly:

1. The community gets Deno and the means to maintain it as it is. "✨ ideal ✨"
1. A fork of Deno, possibly dressed up a little.
1. A rewrite, if maintaining the fork proves too difficult.

The disagreement is about when to start, not about the order. `andy` argued the one year of upstream maintenance is enough runway to have a rewrite ready to hand off from Deno, with a fork of the final release as the fallback if it is not. `daniellacosse` argued for starting sooner so that there is enough overlap for people to choose the fork rather than simply leave Deno when support ends.

`daniellacosse` also gave the reason he does not want a rewrite now: the enthusiasm cost of eating the project's energy, and the value of first absorbing the existing codebase and establishing "what the most common pain points across everyone is/are". `andy`'s counter-argument is architectural, that Deno's codebase is "a bit strangely architected, given that they didn't have the benefit of hindsight of the scope they wanted".

Ethan's read in the channel was that this sounded like reimplementations of Deno core rather than a fork of what exists, and he pointed back at the handoff option, the route Luca Casonato took with Fresh.

## The rewrite is already being prototyped

`daniellacosse` said he was going to prototype an extension system, and the repository is public: `cutout-studios/runtime`, created 2026-10-10, seven files at the time of reading (a CLI, `core/lib.rs`, `test.ts`, and Cargo files). Its README calls it "an experimental no-frills replacement for the now maintenance-mode Deno" and then says the thing that matters here: "If the community rallies around a stable fork, this project may no longer be necessary." Its open TODOs include defining `RuntimePlugin` with collision guards.[^2]

So the rewrite is being prototyped first, by the participant who ordered the options fork-first. That is a hedge rather than a contradiction, and it is a useful one: it puts a working V8 embedding and a plugin boundary in the room at low cost while the fork question is still open.

## What was actually agreed

Only two things: that extensions should be authorable in TypeScript and Rust, and that the core should act like Deno by default with ways to strip it down. Both were proposals that nobody opposed, not decisions, and there is no owner, no design document, and no repository for either.

## Open questions

- What belongs in the core. `wgpu` and `console` were the only candidates argued about, and neither was settled.
- Which language the host is written in. Three were proposed and none was eliminated on stated grounds.
- Whether extensions load at runtime or bundle at build time. `andy` proposed a build step, `daniellacosse`'s prototype proposes a plugin boundary, and the two are different systems.
- Whether the one-week prototype challenge happens. `andy` proposed it, `daniellacosse` said this particular week is impossible for him and asked whether others could commit, and `andy` said he would start prototyping in an unofficial capacity.
- Whether any of this is worth doing at all, in light of what already exists. See [[Prior_Art_Runtimes]].

## Related

- [[Prior_Art_Runtimes]]: the existing runtimes that already implement this design.
- [[Deno_Fork_Options]]: the fork scope and naming thread from the same day.
- [[Deno_Core_Working_Group]]: who is in the room.

## Sources

[^1]: [denoland/deno `ext/`](https://github.com/denoland/deno/tree/main/ext) for the 31 shipped extensions including `console` and `webgpu`, and [tryandromeda/andromeda](https://github.com/tryandromeda/andromeda) for a `console` extension in a runtime that is not V8, both read 2026-10-11.

[^2]: [cutout-studios/runtime](https://github.com/cutout-studios/runtime): file list, README, and the `RuntimePlugin` TODO, read 2026-10-11.
