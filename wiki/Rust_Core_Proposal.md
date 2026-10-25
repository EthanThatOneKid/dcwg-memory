---
"@type": schema:TechArticle
schema:name: Rust core rewrite proposal
schema:description: The 2026-10-12 #propose thread formalizing a minimal Rust loader core with TypeScript extensions, the Zig prototype and dodo-x repository it produced, and the bindings work that followed.
wazoo:source: dcwg
wazoo:thread: "1559219836297547847"
wiki:priority: high
---

# Rust core rewrite proposal

`andy` opened this post on 2026-10-12 by formalizing an idea he described as pretty popular, and it is the thread that turned the architecture discussion into a repository. The proposal is a very minimal Rust-based loader for the runtime that handles permission management and inter-component communication, with a component for user code (a JavaScript context) and several components for extensions (more JavaScript contexts). Extensions would be able to load system libraries and interface with them directly, and inject setup code into the user code process. They would also have a build step to bundle them, to keep the Rust core truly tiny, and an extension would probably handle the CLI entrypoint.

This is the same shape the group had argued about the day before, in [Runtime architecture proposals](Runtime_Architecture_Proposals.md), with one difference that matters: this version names Rust for the core and TypeScript for the extensions, where the earlier thread had C# on the table for the host language and no decision.

## The objection, and the answer to it

`Flying Mindz | Jannick` made the only objection in the thread, and it is not technical: "On a technical level I can't argue. But I do not see how a technical shift or rewrite helps us solve the actual problem."

`andy`'s answer is what the proposal is really for. It lets the group solve the problem of everyone having different wants for what dodo should be, by allowing for customization. He also conceded the rewrite concern rather than defending it: they should definitely have a fork as a safety net, and maybe switch to a rewrite as a sort of "dodo v2", because in the long run Deno's codebase has a very strange architecture. `daniellacosse` separated the two halves of the objection, reading it as being about the rewrite rather than the modularity, and noted that forking is definitely the fastest way to get their footing without ruling out other options. `netop://ウィビ` echoed support for a rewrite on 2026-10-18, calling it a "good idea" because Deno, "as great as it is, is the result of YEARS of work that, like any codebase, has accumulated technical debt." `netop://ウィビ` added that a rewrite could "keep compatibility and score better on benchmarks, easy."

`daniellacosse` also connected the proposal to the monorepo effort: getting everything into the same repository so it is not a tangled mess aligns with this, and once well organized, supporting extensions becomes a lot easier and seems necessary besides.

## The prototype went to Zig, not Rust

`andy` said he would prototype the initial version in another language, still using V8, to understand V8 before eventually moving to Rust, given his inexperience with Rust and V8. Asked what redoing the bindings is like, his first answer was that the borrow checker was being mean to him. He then chose Zig, for three reasons he gave on 2026-10-13: it does not fight you about memory management and just kind of trusts you, it has a really nice build system, and partly to gently poke fun at Bun. On 2026-10-18, `andy` reiterated strong support for a rewrite but expressed dislike for Zig as a language, finding it "annoying" and "painful," noting its "poopy" LSP support and "confusing" build system, despite acknowledging its fast compile times.

`Cyan` also raised concerns about Rust compilation time on 2026-10-18, claiming it takes "1 hour" for CI compared to approximately six minutes for V8 and only a few seconds for the Zig portion of his own personal runtime. `Cyan` further stated that his personal runtime implements cross-language link-time optimization (LTO) with Zig, noting that Bun's claim about Rust being good for LTO while Zig cannot do it is "definitely false".

`CaptainLach` pushed back on the reasoning rather than the choice: Rust does not fight with you, it just keeps you from shooting yourself in the foot ever again, and the same problems would exist in Zig but would be invisible until some point. `daniellacosse` called that totally accurate and still endorsed the detour, on the grounds that direct V8 understanding is valuable and that getting `andy` there faster is good, adding that he would prefer everyone get better at Rust but that is the next push after the initial fork is stable.

The choice is worth recording because it is the second time the host language question has been answered by prototyping rather than argument, and this time it was answered with a third language that was not in the original list.

## What the prototype produced

The thread is the record of a working prototype rather than a plan, and the dates are the useful part.

| Date       | What was reported                                                                            |
| ---------- | -------------------------------------------------------------------------------------------- |
| 2026-10-15 | Custom Rust functions working, with a screenshot                                             |
| 2026-10-15 | An extremely bare-bones event loop                                                           |
| 2026-10-16 | The repository published as `are-we-dodo-yet/dodo-x`, described by `andy` as very incomplete |
| 2026-10-16 | The extensions SDK CLI working, with running extensions at runtime as the next step          |
| 2026-10-18 | No progress expected for a few days, because `andy` is playing Silksong                      |

`daniellacosse` asked how the cold start was on 2026-10-15 and `andy` said he had not checked yet. He also stopped tinkering with his own implementation because `andy` had been killing it, and suggested an informal presentation on what `andy` has learned once he feels good about it, which `andy` agreed to.

Read through the GitHub API on 2026-10-18, `are-we-dodo-yet/dodo-x` is public, primary language Rust, created 2026-10-15, last pushed 2026-10-15, one star, described as "an experment with a modular architecture for dodo".[^1]

## The naming objection

`CaptainLach` asked on 2026-10-17 whether the experiment should be renamed from `dodo-x`, to avoid confusing people. His reason is specific: as long as it is unable to use extensions from dodo or Deno itself, he does not think it should hold that name. `andy` asked what he had in mind, and no name was proposed.

The objection is fair and it is the same one the group applied to naming the fork itself: a name implies compatibility, and this prototype does not have it.

## The bindings work

`CaptainLach` took on the extension-authoring side, and his report on 2026-10-18 is the most concrete technical contribution in the thread. Deno has a built-in FFI, which he has used in several projects, but what the project really should have is `deno_bindgen`. That repository is very old and does not work, and how it did work was very wrong. There was a fork, `kzha0/deno-bindgen2`, which did work, but in his assessment the code is "utter ass". He has forked it to `are-we-dodo-yet/dodo-bindgen`, which read through the GitHub API on 2026-10-18 is public, primary language Rust, created 2026-10-18, last pushed 2026-10-18.[^2]

On 2026-10-18, `CaptainLach` reported writing a small `ffmpeg` wrapper using an unreleased version of `dodo-bindgen`, demonstrating its ability to expose Rust implementations to TypeScript, including asynchronous functions. He later released the updated `dodo-bindgen` to `are-we-dodo-yet/dodo-bindgen` on the same day.[^3] `Cyan` also stated on 2026-10-18 that he "already made both Zig and Rust use the same binding" and would upload his version soon to `origine-js/origine`.[^4]

`CaptainLach`'s plan for `dodo-bindgen` is to replace the `-rust-ir` crate and source code parsing with a uniffi-like approach, where macros generate symbols in the binary that can be extracted and parsed to produce usable code. That is a design decision, not a cleanup, and it is the one place in this capture where someone states what they intend to build and why.

## Where it stands

A prototype (`dodo-x`) exists and is public, an extensions SDK CLI works, runtime extension loading is the next step and is paused, and `dodo-bindgen` exists with a stated design. The core language question that the earlier thread left open was settled by `andy` prototyping in Zig with an eventual move to Rust, which is a plan rather than a decision anyone else endorsed.

On 2026-10-18, `daniellacosse` outlined a long-term rewrite strategy: first, "lock down some kind of C ABI in the current codebase" to enable incremental rewrites of "various modules/extensions in whatever, even golang," while rigorously ensuring "xplat" (cross-platform) compatibility. He suggested that `Cyan` and `andy` collaborate on `dodo-x` (are-we-dodo-yet/dodo-x) to produce a "proposed spec and proof of concept," emphasizing the necessity of "proper mechanisms to ensure we catch any regressions" before any rewrite.

Nobody has reviewed the `dodo-x` prototype, and the group has not convened to compare the rewrite against adapting the current Deno codebase, which was `andy`'s own proposal for how the two tracks would be judged.

## Open questions

- Whether `dodo-x` keeps its name, which `CaptainLach` argues it should not while it cannot load dodo or Deno extensions.
- Whether the rewrite or the fork wins, which `andy` proposed deciding after both have had time.
- The path for the extension system (dynamic with a C ABI, as proposed by `daniellacosse`, or statically compiled, which `CaptainLach`'s initial bindings work implies).
- Whether anyone but `andy`, `CaptainLach`, and `Cyan` (with his `origine-js/origine` project) is working in these repositories, since no other contributor appears in the thread.

## Related

- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the thread this one formalizes, including the C#, Go, and Rust host-language question.
- [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md): the existing runtimes that implement this design, checked against their repositories.
- [Rust upskilling for the fork](Rust_Upskilling.md): the bindings and dynamic-linking question argued in more depth, and the group's skill levels.
- [Benchmarking dodo](Dodo_Benchmarks.md): the measurement work that would quantify what the modular design costs.
- [Deno fork options and naming](Deno_Fork_Options.md): the fork scope that this proposal is the alternative to.

## Sources

[^1]: [`are-we-dodo-yet/dodo-x`](https://github.com/are-we-dodo-yet/dodo-x), read through the GitHub API on 2026-10-18.

[^2]: [`are-we-dodo-yet/dodo-bindgen`](https://github.com/are-we-dodo-yet/dodo-bindgen), read through the GitHub API on 2026-10-18, along with the two repositories `CaptainLach` cited as its ancestors, [`denoland/deno_bindgen`](https://github.com/denoland/deno_bindgen) and [`kzha0/deno-bindgen2`](https://github.com/kzha0/deno-bindgen2).

[^3]: [`are-we-dodo-yet/dodo-bindgen`](https://github.com/are-we-dodo-yet/dodo-bindgen), released on 2026-10-18.

[^4]: [`origine-js/origine`](https://github.com/origine-js/origine), noted by `Cyan` on 2026-10-18 as his personal runtime.
