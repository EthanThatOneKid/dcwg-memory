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

## Dodo's Emerging Identity and Philosophy

Participants articulated a more defined vision for the Dodo compatibility fork during discussions.

`Sandeep Kumar Kuanar✌🏼` proposed Dodo's core philosophy as a "core LEGO brick" runtime that allows users to "assemble" what they need, including Node or Bun compatibility, and provides pre-built solutions for common tasks tailored to specific target audiences.

`daniellacosse` expressed the belief that Dodo should aim for "a full, streamlined, batteries-included development experience for small teams," similar to Laravel for PHP or Ruby on Rails for Ruby, but specifically with TypeScript and code that can run "everywhere at face value." He emphasized that Deno's "best in class" developer experience is a primary concern for Dodo's target user market, which he feels is not adequately served by Node.

`w` envisioned Dodo's architecture as `cli <-> core <-> runtime <-> v8`, with the `core` designed to be "very friendly to embedders," noting that embedding is his "raison d'etre" for participating.

`daniellacosse` further elaborated on Dodo's core identity, stressing an emphasis on "predictability and determinism," which he stated underpins security, web standards, and developer experience. The ultimate goal is achieving cross-platform execution, envisioning a world where simple scripts can be written in 30 minutes and trusted to run in a terminal, on an iPad, or even (as a stretch goal) on a Nintendo Switch. He acknowledged iOS's JIT limitations but mentioned having "written xplat in go" and possessing a prototype that "beats react in jitless."

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

## Open questions

- Whether the compatibility fork is a separate project or a configuration of Ende, now that a plugin ecosystem is on the table. See [Runtime architecture proposals](Runtime_Architecture_Proposals.md).
- Who maintains the compatibility fork if `netop://ウィビ` is maintaining the stripped one, since nobody in the log volunteered.
- Whether the fork keeps Deno's compiled-in extension set or adopts the loadable one argued about later the same day. [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md) covers who has already built the latter.

## Related

- [Fork sustainability](Fork_Sustainability.md): the funding question, raised the day after the naming thread.
- [Deno versus Node features](Deno_vs_Node_Features.md): the later argument about whether a distinct runtime is the point.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): where the rewrite option went after this thread.
