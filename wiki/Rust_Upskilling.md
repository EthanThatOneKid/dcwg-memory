---
"@type": schema:TechArticle
schema:name: Rust upskilling for the fork
schema:description: The 2026-10-12 #propose thread on how the group should collectively learn Rust and V8, the self-reported skill levels, the hackathon proposal, and the advice on how to learn the relevant parts of an embedded engine.
wazoo:source: dcwg
wazoo:thread: "1559251707228192778"
wiki:priority: high
---

# Rust upskilling for the fork

`daniellacosse` opened this post on 2026-10-12, after the fork direction was set, with the problem the fork creates: many people had mentioned that their experience with Rust is limited, himself included, and he asked how the group can collectively upskill. His own position is that he is not completely green, having read the book and done a tutorial, and that he is prototyping a separate runtime both as a hedge and as a learning experience, which left him unsure where to go next.

## The proposals

Three things were proposed and none was rejected.

An async hackathon on top of `andy`'s fork, which `daniellacosse` suggested would also get more people familiar with the codebase. `w` liked the hackathon idea and added that the group could come up with a list of concepts that, holistically, matter for grokking the codebase. `andy` had already committed to working on a rewrite asynchronously while others adapt the current Deno codebase, with the group convening later to decide which approach is better.

A register of who knows Rust and the codebase well, which `daniellacosse` proposed should be noted in the server somehow. Nothing came of it in this thread, and the question of who knows what is answered below only because the skill survey happened in passing.

Writing your own runtime as an exercise. `CaptainLach` called this useful, with the warning that it is more annoying than it might seem because of version mismatches, and `w` agreed there is a lot that needs to be in lock step. `CaptainLach` gave the same reason he gives elsewhere for making Deno a monorepo.

## The skill survey

Nobody administered one, but the thread produced self-reported levels, and they are the most concrete data in it.

| Handle                    | Self-reported level                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `w`                       | Read the book, roughly 500k lines written across personal and professional work over eight or nine years, and usually able to tell when he is using the wrong idiom |
| `daniellacosse`           | Read the book, done a tutorial, prototyping a runtime, "not completely green, but mostly"                                                                           |
| `Sandeep Kumar Kuanar✌🏼` | Nineteen chapters of the book and nearly all of Rustlings, two months of Rust, two years of programming, a physics undergraduate, otherwise "a complete beginner"   |
| `CaptainLach`             | No self-assessment given; gave technical advice throughout                                                                                                          |

Two qualifications from the thread are worth keeping. `w` said that "expert in Rust is a very high bar" and that he would not claim it, and that he does not think many people would. And he told `Sandeep Kumar Kuanar✌🏼` that enough hunger is kind of enough, as long as someone around is motivated enough to provide the right mentorship, while also saying that many of the decisions being made at this stage are probably going to be judged more by taste than by functionality.

## The extensions-versus-bindings question

This is the part of the thread with technical content beyond learning, and it is unresolved.

`w` proposed a litmus test: solve for how much of a nightmare dynamic libraries are in Rust. He suggested that gating extensions on feature flags but statically compiling them in might be pretty easy, and that if extensions are dynamic, adopting a C ABI with some sort of manifest eventually gets you a `napi`, or at least replicates a big chunk of one. His argument for the comparison is that `rusty_v8` is not so bad, so something like `napi` that moves in lock step with it has value.

`CaptainLach` offered the cheaper alternative: consider whether some things really need to be a proper Deno extension, or whether it would be enough to improve the ergonomics of writing `Deno.dlsym`-based code. `daniellacosse` called that kind of a product decision and said the group is not at that layer yet.

`daniellacosse` also disclosed that his prototype uses `rusty_v8` directly, which he said has committed LTS unlike `deno_core`, and said he would review `napi` on `w`'s pointer.

## The maintenance argument for TypeScript

`CaptainLach` raised an upstream precedent for stripping Rust out rather than adding it: Deno had already considered downgrading some parts to TypeScript to reduce maintenance, and had done it for KV.[^1] `w` agreed the low-maintenance argument is a good one but noted that `#[op2]` with `serde_v8` is slow in his experience, so the KV case may be a question of efficient V8 object primitives against less efficient Rust interop. `CaptainLach` asked whether that overhead matters when the intended target is the network, and `w` answered "nope", adding that he was surprised the KV API was op-supported to begin with.

That exchange is the thread's clearest statement of a design principle: the Rust boundary is worth paying for where the work is CPU-bound, and not where it is waiting on a network.

## How to learn the relevant parts of V8

`hajime_san` entered on 2026-10-17 with the framing that since the runtime is built on V8, Rust is merely one tool in the process, and that ultimately you must learn about V8 itself. His recommendation was to read the implementation of Blink, which embeds V8 the way Deno does, and specifically not to be intimidated by the size of Chromium, because breaking it into smaller parts makes both the big picture and the implementation details graspable. He gave the implementation of the global `window.atob()` as a worked example.

`Sandeep Kumar Kuanar✌🏼` pushed back with the scale objection: V8 is around two million lines of C++ written by Google, Blink is good but Chromium sits on top of V8, and he doubted he had the resolve to work through it over months, asking whether there is a better way.

`w`'s answer is the advice the thread is worth reading for. Learning the relevant parts of V8 for working with most of Deno or dodo is pretty achievable, because engineers who are good at this tend to make things with cleaner separations that end up being easier to understand, and it is not important to understand it front to back. He set a concrete entry point: if you can make heads or tails of everything in V8's own embedding guide, you are off to a pretty good start.

He also refused to prescribe crates. Asked for a list of subjects, he said the flowchart `Sandeep Kumar Kuanar✌🏼` had found is a good start, and that he does not subscribe to "learning crates", because someone telling you to learn `tokio` might mean learning its API, which you learn by reading, or might mean that cooperative multitasking needs to click for you, which you learn by doing. He described himself as big on tacit understanding and being hands-on.

The advice on where growth actually happens is the same as the group's earlier position on contribution: `w` said most personal growth happens when you open a pull request and get a real good critique, and described his own learning as brute force, working through months of Deno pull requests trying to reverse engineer his way into the maintainer's head. He then called suggesting that approach terrible advice.

`Sandeep Kumar Kuanar✌🏼` summarized his options as three routes: work through the embedding guide, read Deno pull requests and reverse engineer upward, or pick something small and ask for help when stuck. `w`'s answer was to do some of the first with a good stopping point decided in advance, the third if he already has something in mind, and the second if he needs to find a third.

## Where it stands

No hackathon was scheduled, no concept list was written, no skill register was created, and nobody was assigned anything. `w` also said plainly what the project does not have: someone to say "Sandeep, please do X". The learning question is answered in the thread and unowned, which is the same state as most of what the group has discussed.

## Open questions

- Whether the hackathon happens, and whether the concept list is written before it.
- Whether a skill register is kept anywhere, since knowing who can review what is a prerequisite for the mentorship `w` described.
- Whether extensions are dynamic with a C ABI or statically compiled, which decides how much of this learning is about dynamic linking.
- Who mentors, given that `w` named mentorship as the thing that makes hunger enough and nobody volunteered.

## Related

- [Rust core rewrite proposal](Rust_Core_Proposal.md): the rewrite this upskilling is for, including the choice of Zig over Rust for the first prototype.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the extension design that the bindings question here has to serve.
- [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md): the existing runtimes, several of which answer the dynamic-extension question already.
- [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md): the handles in this thread.
- [Benchmarking dodo](Dodo_Benchmarks.md): the other thread where `daniellacosse` asked `w` for measurements.

## Sources

[^1]: [denoland/deno pull request 33327](https://github.com/denoland/deno/pull/33327), "refactor(ext/kv): pure JS implementation of `Deno.openKv()` API", which `CaptainLach` linked as the upstream precedent. State read 2026-10-18.
