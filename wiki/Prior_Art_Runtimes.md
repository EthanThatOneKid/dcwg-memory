---
"@type": schema:TechArticle
schema:name: Prior art for a minimal-core runtime
schema:description: The projects that already implement a minimal core with opt-in extensions, checked against live repositories on 2026-10-11, covering Andromeda and Nova, LLRT, WinterJS, workerd, Bun, and the C# hosting precedent.
wazoo:source: dcwg
wiki:priority: high
---

th a Rust `mod.rs` and a TypeScript file beside it; `crates` is the CLI and tooling. The workspace `Cargo.toml` enables extensions as features (`canvas`, `crypto`, `storage`, `serve`) in exactly the style `andy` described with `--exts=`, and its dependency list includes `libloading`, which is how a Rust host loads code dynamically.[^1]

Its extension set is `broadcast_channel`, `cache_storage`, `canvas`, `console`, `cron`, `crypto`, `fetch`, `ffi`, `file`, `http`, `local_storage`, `net`, `sqlite`, `streams`, `time`, `url`, `web`, `webidl`, `window`, `workers`. Deno's own `ext/` holds 31 directories including `console`, `webgpu`, `kv`, `canvas`, `cron`, `ffi`, `node`, `node_sqlite`, and `telemetry`. The overlap is not a coincidence: a modular runtime built by people who use Deno converges on Deno's extension list, which is the strongest form of the argument that this architecture is not a new idea but the existing idea, made loadable.[^2]

What Andromeda is not is a Deno replacement, and the reason is its engine. Its `Cargo.toml` pins `nova_vm` from `trynova/nova` and names no `v8`, no `deno_core`, and no other engine, so it does not execute V8-hosted Deno code. Nova's own crate documentation describes an interpreter-oriented engine that prioritizes embedding and ergonomics over raw speed and does not implement the entire language, naming the absence of WebAssembly.[^3]

## What the projects cost and what they produced

| Project                  | Host language | Engine         | Position                                           | Read 2026-10-11                                                                                  |
| ------------------------ | ------------- | -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `tryandromeda/andromeda` | Rust          | Nova (own)     | Minimal core, opt-in extensions                    | 844 stars, 27 forks, 24 open issues, created 2024-07-20, last push 2026-06-15                    |
| `trynova/nova`           | Rust          | n/a            | The engine under Andromeda                         | 1,952 stars, 81 forks, 44 open issues, 30 contributors, created 2022-08-24, last push 2026-09-09 |
| `awslabs/llrt`           | Rust          | QuickJS        | Serverless-first, deliberately narrow              | 8,812 stars, pushed 2026-10-11                                                                   |
| `wasmerio/winterjs`      | Rust          | SpiderMonkey   | WinterCG-compatible web runtime                    | 3,186 stars, last push 2026-03-17                                                                |
| `cloudflare/workerd`     | C++           | V8             | The runtime the Deno acquisition consolidates onto | 8,918 stars, pushed 2026-10-11                                                                   |
| `oven-sh/bun`            | Rust          | JavaScriptCore | Node-compatible, all-in-one                        | 96,197 stars, pushed 2026-10-11                                                                  |
| `denoland/deno`          | Rust          | V8             | 31 extensions, compiled in                         | see [Deno](Deno.md)                                                                              |

andy noted concerns about Bun's rewrite: while it may fix crashes, it does not fix logic bugs (especially in the bundler) and has many unsafe blocks, making it not very idiomatic (andy, 2026-10-15).

Three things are worth pulling out of that table.

**Every core is a systems language.** GitHub's language breakdown for Bun, the fastest-moving runtime in the group, currently reports 51.0 MB of Rust against 12.1 MB of C++ and 6.4 MB of TypeScript.[^4] The proposal to host the core in C# would be the first of its kind in this table.

**Andromeda is the cost datum.** Twenty-three months of a modular Rust runtime with a plugin system and a purpose-built engine has produced a real project with 844 stars and has not produced a Deno. Nova has been going since 2022 and is not yet fast or complete. Against that, `andy`'s timetable of one year to have a rewrite ready to hand off from Deno has no example behind it.

**The two nearest neighbours are narrowed projects, not replacements.** LLRT is a Rust runtime on a small embeddable engine that is explicit about being lightweight and experimental rather than general-purpose. WinterJS is a cross-runtime web runtime on SpiderMonkey whose last push is seven months old.[^4]

## The C# idea has precedent outside this space

Hosting JavaScript from C# is a solved problem in .NET. `microsoft/ClearScript` (2,033 stars, last push 2026-09-04) exists to add scripting to .NET applications and supports V8 on Windows, Linux, and macOS; `sebastienros/jint` (4,735 stars, pushed 2026-10-11) is a JavaScript interpreter written in C#. Both are maintained.[^5]

So the mechanism `andy` wants is available, and the cost is not the language but the layer underneath it. `deno_core` ops, `rusty_v8`, `wgpu`, and the Rust half of every extension in Deno's `ext/` are Rust, so a C# host means rewriting that layer or crossing an FFI boundary into it, and the one requirement stated as hard in the same thread (cross-compilation, with iOS already working for `rusty_v8`) is a Rust build-matrix problem that a C# host does not remove.

## What is genuinely not prior art

1. **The starting position.** Every project in the table above is greenfield or on a different engine. None starts from Deno's codebase, Deno's permission model, or Deno's user base, and none has the option of a handoff conversation with the current maintainers, which is the one asset the group has that Andromeda never did. See [Deno runtime handoff](Deno_Runtime_Handoff.md).
1. **The permission model.** `davey` called it the deciding feature and `w` is depending on it inside a game client. Nothing in the table offers an equivalent.
1. **Extensions that load after the binary exists.** Andromeda and Deno both fix their extension set at build time. Loading an extension into an already-built runtime, in the style `andy` and `daniellacosse` discussed, is the only part of the proposal with no direct implementation to point at, and it is a smaller claim than "minimal core with extensions", because the second half of that sentence is the state of the art.

## Where this points

The architecture proposals are not substantially different from Andromeda's published design, and Andromeda is the closest match precisely because it built this architecture first and in public. The parts with no direct equivalent are the runtime-loadable extension boundary and the TypeScript and C# authoring targets, and neither requires replacing a V8 runtime, since both are things a fork can add later. The strongest argument for that order is `daniellacosse`'s, and the strongest argument against the one-year rewrite timetable is in the Andromeda and Nova dates above.

## Sources

Each footnote names what it was read for, and every source was read on 2026-10-11.

[^4]: Repository metadata read through the GitHub API: [awslabs/llrt](https://github.com/awslabs/llrt), [wasmerio/winterjs](https://github.com/wasmerio/winterjs), [cloudflare/workerd](https://github.com/cloudflare/workerd), [oven-sh/bun](https://github.com/oven-sh/bun), and the Bun language breakdown.

[^1]: [tryandromeda/andromeda](https://github.com/tryandromeda/andromeda) and its [documentation](https://tryandromeda.dev/docs/index): crate layout, `crates/runtime/src/ext/` contents, the extension list, and the root `Cargo.toml` workspace dependencies and feature pins.

[^2]: [denoland/deno `ext/`](https://github.com/denoland/deno/tree/main/ext): the 31 shipped extensions, including `console`, `webgpu`, and `kv`.

[^3]: [trynova/nova](https://github.com/trynova/nova) and the [nova_vm crate](https://crates.io/crates/nova_vm) page: engine scope, design priorities, and missing features.

[^5]: [microsoft/ClearScript](https://github.com/microsoft/ClearScript) and [sebastienros/jint](https://github.com/sebastienros/jint): the .NET hosting precedent.

## Related

- [Rust core rewrite proposal](Rust_Core_Proposal.md): the proposal to build a new runtime on `rusty_v8` rather than on `deno_core`, and what happened to it.
