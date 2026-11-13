---
"@type": schema:TechArticle
schema:name: Deno fork options and naming
schema:description: The two-fork thesis, the naming candidates weighed on 2026-10-11 (Ende, dodo, endo, noend, Pteryx), and what the group agreed a fork must preserve.
wazoo:source: dcwg
wiki:priority: high
---

# Deno fork options and naming

The working group's first substantive thread was not governance but identity: what a fork is called, and how much of Deno it keeps. Both questions turned out to be the same question, because the name a fork can use depends on whether it is continuing Deno or replacing it. See [Deno runtime handoff](Deno_Runtime_Handoff.md) for the terms that govern that.

## The two-fork thesis

`netop://ウィビ` proposed that there should be at least two forks, and the log shows the group converging on exactly that split:

| Fork               | Keeps                                                     | Drops                                   | Who                          |
| ------------------ | --------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| Compatibility fork | Deno as it is, enough to run and compile backend services | Nothing that people use                 | The group's default position |
| Stripped fork      | The namespace, for compatibility                          | KV, Deploy, Node compatibility, Jupyter | `netop://ウィビ`             |

The compatibility fork is the one with a constituency. `davey` asked for Deno unchanged, LTS, with security patches and the permission model alive, and said the permission model alone would decide his vote. Ethan said the same thing in fewer words. `andy` wants Deno compatibility to be a must, with features added over time, and named Buffers and CommonJS interop as the parts of Node compatibility worth keeping. `Stag Math` uses KV, though only on disk.

The stripped fork is where the disagreement is. `netop://ウィビ` wants to strip everything, keeps only the namespace for compatibility, and considers Node compatibility a historical adoption tactic rather than a feature. `daniellacosse` offered the synthesis: a core runtime with KV, Deploy, and Node compatibility as modules you turn on per project, which `netop://ウィビ` said matches the plugin ecosystem he was already planning.

## KV as a standalone library

On 2026-11-05 `paula` asked in `#brainstorm` whether Deno KV does anything special besides using `node:v8` serialize and deserialize with a SQLite backend, and suggested it would be nice to have as a JSR library if possible. `CaptainLach` answered that the API is quite nice for what it does, but that the open-source backend implementation is not, and said he would like a FoundationDB implementation of it at some point. That is a third shape for KV's future — neither kept in a fork nor dropped with it, but extracted as a library — and it is the participants' suggestion, not a plan anyone has committed to. See [Ende vs Dodo](Ende_vs_Dodo.md) for where KV stands in each fork.

On 2026-11-08 `CaptainLach` reported in `#brainstorm` that while fuzzing he had found `v8_valueserializer` does not always output the same values as the V8 implementation, breaking the v8x roundtrip in some cases. His example: serializing an array with a deleted element — `const a = []; a[5] = 1; delete a[5];` — should produce an array of five holes after a roundtrip, but the denokv serializer produced an empty array instead. He said he had forked denokv to fix that. `daniellacosse` asked which cases are affected and whether they should wrap it and fix them. The fix had not been reported as landed as of the capture.

## Dodo's Emerging Identity and Philosophy

Participants articulated a more defined vision for the Dodo compatibility fork during discussions.

`Sandeep Kumar Kuanar✌🏼` proposed Dodo's core philosophy as a "core LEGO brick" runtime that allows users to "assemble" what they need, including Node or Bun compatibility, and provides pre-built solutions for common tasks tailored to specific target audiences.

`daniellacosse` expressed the belief that Dodo should aim for "a full, streamlined, batteries-included development experience for small teams," similar to Laravel for PHP or Ruby on Rails for Ruby, but specifically with TypeScript and code that can run "everywhere at face value." He emphasized that Deno's "best in class" developer experience is a primary concern for Dodo's target user market, which he feels is not adequately served by Node.

`w` envisioned Dodo's architecture as `cli <-> core <-> runtime <-> v8`, with the `core` designed to be "very friendly to embedders," noting that embedding is his "raison d'etre" for participating.

`daniellacosse` further elaborated on Dodo's core identity, stressing an emphasis on "predictability and determinism," which he stated underpins security, web standards, and developer experience. The ultimate goal is achieving cross-platform execution, envisioning a world where simple scripts can be written in 30 minutes and trusted to run in a terminal, on an iPad, or even (as a stretch goal) on a Nintendo Switch. He acknowledged iOS's JIT limitations but mentioned having "written xplat in go" and possessing a prototype that "beats react in jitless."

## Dodo's JavaScript and TypeScript surface, and the Denext offer (2026-11-10)

`killioiden` asked in `#general` on 2026-11-10 whether Dodo's implementation of JavaScript and TypeScript will be the same as Deno's, pointing to small differences between Node.js and Deno JavaScript such as sloppy imports and the `override` keyword. `Summer` answered that the only import approach listed for Dodo at the moment is a request to support `bun:<package-name>`, to make it easier to use code authored for Bun, and that for JavaScript and TypeScript in general it was safe to assume Deno's browser-equivalent JavaScript would not change, noting that one of Deno's big uses is yt-dlp executing browser JavaScript. That is her assumption, not a decision the group took.

`SpaceMonkey` then made an offer from his own fork. He said his fork of Deno for Denext, at `Brainwires/deno` on branch `train/denext18`, will soon support all of Node 26, and that he is targeting passing all of Node's runtime test suite: currently at 72%, with 16–18% of the suite out of reach by design. He said he has 308 patches, up 22 in two days, documented in [DENEXT.md](https://github.com/Brainwires/deno/blob/train/denext18/DENEXT.md). He proposed that Dodo use the work he has done by cherry-picking from his fork, based on the project's shared needs, and acknowledged that some in the group do not fully trust his AI-driven, AI-audited, rapid development approach. Those figures are his claims as of 2026-11-10, not checked here.

`daniellacosse` asked him to start by curating a list of changes he thinks align with the community's vision for Dodo, so the group could decide which are applicable and review the pull requests, as long as they are not large changes. `SpaceMonkey` agreed and asked where Dodo project goals are kept; `daniellacosse` pointed to the `#roadmap` channel and said he would update it. `SpaceMonkey` posted his list as a [gist](https://gist.github.com/nightness/8f9f592795a13fdaf4d8a40f8de6533f), noting a couple of entries still look large, and that he is currently on the Go-based TypeScript 7 but wants to switch to `pingdotgg/ts-rust` once it is more mature. `daniellacosse` updated the `#roadmap` channel post later that day and asked how everyone felt about it; `𐑛𐑦𐑕𐑣𐑸𐑯𐑦 | 最不調和の伝播者 | 異議の元素` raised no objections, and nobody else answered in the capture. See [Dodo project roadmap](Project_Roadmap.md).

The same thread restated what the group's users want from Dodo. `hazel` said, as only a user, that she likes how Deno works right now and would like something that just continues to work, with Node compatibility, the Deno standard library, and the `deno install`, `run`, and `add` commands. `daniellacosse` replied that is mostly where Dodo wants to land. `Summer` added a smaller wish: she would like Deno to allow full header control for `fetch`, since it mandates the user-agent header; `SpaceMonkey` said he had added that to the project board, with a few headers restricted for security reasons.

## Naming candidates

| Name   | CLI     | Argument for                                                                                          | Argument against                                              |
| ------ | ------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Ende   | `ende`  | German for "end"; extinct-sounding; not an anagram of Deno                                            | Nothing obvious to an English speaker                         |
| dodo   | `dodo`  | Extinct bird, birds evolved from dinosaurs, the bird resembles the Deno dino, `do {} while` resonance | None raised; `daniellacosse` only asked that it stay short    |
| endo   | `endo`  | Endoskeleton: the bones of Deno with new skin                                                         | An anagram of Deno, and exoskeleton is the more familiar word |
| noend  | `noend` | Clear intent                                                                                          | On the nose                                                   |
| Pteryx | `ptx`   | Extinct creature, short command                                                                       | Considered earlier and dropped                                |

The short-name constraint was the only hard requirement anyone stated, and it held: every candidate is one syllable or one short word, and each has a CLI command that is the same word.

One correction is worth keeping, because it is the only check anyone ran on the naming logic. The published Ende post justifies the name by calling "Ende" an anagram of "Deno"; Ethan pointed out in the channel that the letters only work for `endo`, and that `Ende` was chosen anyway because it reads cleaner and means "end" in German. The anagram argument in the post is wrong; the name is not.

## What the group agreed a fork must preserve

1. The permission model, which `davey` called the deciding factor and which is the one feature with no equivalent elsewhere.
2. Deno compatibility, at least enough to run and compile backend services.
3. LTS behavior: no feature churn, just security patches.
4. The namespace, so existing imports keep resolving.

## The concrete outcome

`netop://ウィビ` shipped first, with [Ende](Ende_Runtime.md), a drop-in fork with no Node compatibility. While `dodo` has emerged as the favored name for a compatibility fork, with an evolving identity and philosophical direction, it still lacks a dedicated repository and owner as of the 2026-10-18 capture. See [Ende vs Dodo](Ende_vs_Dodo.md) for the two positions side by side.

## An earlier fork: Den

On 2026-11-06 `netop://ウィビ` noted in `#general` that he had become aware of another Deno fork, "much earlier than ours": [stevefan1999-personal/den](https://github.com/stevefan1999-personal/den), described on the repository as "Den - One word less than Deno!" The GitHub API read on 2026-11-07 confirms the timing: the repository was created 2023-04-08, is written in Rust, had 17 stars, and was last pushed 2026-09-25.[^1] It predates the working group's forks by about three and a half years, so the group's naming debate and its forks were not the first attempt at a Deno fork. Nothing in the capture says what Den keeps or drops, or whether the group has looked at it further.

## Another fork: OpenDeno

On 2026-11-11 `SpaceMonkey` shared a Reddit post about Dodo in `#general`; a reply in it spoke of "OpenDeno", which `SpaceMonkey` said was news to him and suggested the group investigate. `netop://ウィビ` answered that OpenDeno was created three days earlier, at [kanryu/opendeno-servo-boa](https://github.com/kanryu/opendeno-servo-boa), described in its embed as "An experimental Rust browser prototype combining Servo's HTML rendering engine with Boa for sandboxed Deno-style script execution." Nothing in the capture says whether the group looked at it further.

`SpaceMonkey` then added his own assessment in the same thread: OpenDeno had only two commits and was failing its CI checks, so he was "not too worried", and proposed trying to win its authors over to Dodo and get them to abandon their fork in favour of Dodo. `netop://ウィビ` answered that Dodo's CI was not passing either — the record on pull request 17 that day was 23 checks failing; see [CI and release cadence](CI_and_Release_Cadence.md) — and took the opposite view: "I think there should be MORE forks tbh. May the best one win." The commit and CI counts are the participants' claims as of 2026-11-11, not checked here.

## Open questions

- Whether the compatibility fork is a separate project or a configuration of Ende, now that a plugin ecosystem is on the table. See [Runtime architecture proposals](Runtime_Architecture_Proposals.md).
- Who maintains the compatibility fork if `netop://ウィビ` is maintaining the stripped one, since nobody in the log volunteered.
- Whether the fork keeps Deno's compiled-in extension set or adopts the loadable one argued about later the same day. [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md) covers who has already built the latter.

## Sources

[^1]: GitHub API, read 2026-11-07: `stevefan1999-personal/den` (created 2023-04-08, Rust, 17 stars, last pushed 2026-09-25).

## Related

- [Fork sustainability](Fork_Sustainability.md): the funding question, raised the day after the naming thread.
- [Deno versus Node features](Deno_vs_Node_Features.md): the later argument about whether a distinct runtime is the point.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): where the rewrite option went after this thread.
