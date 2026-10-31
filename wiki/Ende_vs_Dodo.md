---
"@type": schema:TechArticle
schema:name: Ende vs Dodo
schema:description: Why Ende and Dodo are not competing runtimes. Ende is a fork with an owner, a registered namespace, and a published roadmap; Dodo is a name the group liked for a compatibility fork that nobody has started.
wazoo:source: dcwg
wiki:priority: high
---

# Ende vs Dodo

These are not two forks. They are a project and a preference. [Ende](Ende_Runtime.md) is a fork with a named maintainer, a registered namespace, and a published roadmap that strips Deno down. Dodo is a name that came up once in the channel, for a fork that keeps Deno as it is, and nobody has started it. Comparing them as rival runtimes is the category error; comparing the two positions on compatibility is the useful comparison.

## What each one actually is

|                   | Ende                                                                                      | Dodo                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What it is        | A fork with a published roadmap                                                           | A name floated in chat, with no project behind it, but noted to be tied for the 5th most-starred fork with 9 stars (2026-10-13T22:30:39Z `daniellacosse`) |
| Origin            | [WM-105, "Beginning of the Ende"](https://blog.webb.page/WM-105), shared into the channel | One message from `daniellacosse` at 10:23 AM on 2026-10-11                                                                                                |
| Owner             | Paul Anthony Webb (`netop://ウィビ`)                                                      | Nobody                                                                                                                                                    |
| Scope             | Keeps the namespace, drops Node compatibility, Deno Deploy, KV, and Jupyter               | Keeps Deno as it is: LTS, security patches, the permission model, with extensions like KV later                                                           |
| Namespace claimed | GitHub org `theende` and JSR scope `ende` on 2026-10-10, plus `ende.sh`                   | Nothing. JSR scope `dodo` is free; GitHub `dodo`, npm `dodo`, and crates.io `dodo` are all taken                                                          |
| Default branch    | `main` (assumed)                                                                          | Experimented with `trunk` (renamed from `main`), but switched back to `main` (2026-10-14T20:08:57Z `CaptainLach`)                                         |
| Public code       | `theende/ende` and `theende/std`, public since 2026-10-13; first release `v2026.10.14`    | `are-we-dodo-yet/dodo` (created 2026-10-12) and the `dodo-x` prototype, with no runnable build as of 2026-10-28                                           |
| Timeline          | Released; the December soft launch in the 2026-10-11 post was overtaken                   | Awaiting a reply the group refers to as Bart's; see [Dodo project roadmap](Project_Roadmap.md)                                                            |

## What changed after this page was first written

The comparison above describes the position on 2026-10-13. Several of its premises have since changed, and the sections below are kept as the record of that position. Dates are UTC.

- **Ende is now a released project.** Its repositories were public from 2026-10-13 and its first release, `v2026.10.14`, was announced on 2026-10-17. See [Ende](Ende_Runtime.md).
- **Dodo is now more than a name.** The organization `are-we-dodo-yet` has a `dodo` repository (created 2026-10-12, 75 stars on 2026-10-29), a `dodo-x` prototype, and a published [roadmap](Project_Roadmap.md). As of 2026-10-28 `daniellacosse` said Dodo had no build yet and was waiting on a reply the group calls Bart's. The star counts were read from the GitHub API on 2026-10-29: 116 for `theende/ende` against 75 for `are-we-dodo-yet/dodo`, and `daniellacosse` guessed on 2026-10-21 that Ende had more stars than Dodo.
- **How the two relate, in `daniellacosse`'s words (2026-10-14, `#dodoer`).** Asked by `Sandeep Kumar Kuanar✌🏼` whether they are the same, he said Dodo is a more "traditional" fork that aims to be fully backwards compatible and carry Deno's original philosophy forward, while Ende is a "sister" fork that aims to be much more streamlined and opinionated. He added, in spoiler text meant not to be shared with `netop://ウィビ`, that he hoped Dodo could eventually be structured to cover the Ende use case too. `andy` said that is more or less his goal with the modular core. The same exchange: `andy` said "dodoer" is not a team name, just a funny word.
- **A possible spin-off.** On 2026-10-21 `daniellacosse` said that, depending on what happens next, it might make sense for Ende to spin off its own place, because if a foundation is secured Dodo "doesn't really need to exist." `netop://ウィビ` asked whether enough people care about Ende, and, once `daniellacosse` mentioned the star count, said "I'll get on that this weekend I guess." Nothing was decided.
- **Convergence.** `daniellacosse` said on 2026-10-23 that it is cool to see everyone coming to agreement independently, and clarified on 2026-10-28 that the community seems split on Node support, with an emerging consensus on embeddability.

## The axis that separates them

The two positions differ on four things, and only the first one is architectural.

| Question                      | Ende                                               | The Dodo position                                           |
| ----------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Node and npm compatibility    | Dropped. The post argues it was an adoption tactic | Kept. `andy` called Buffers and CommonJS worth reaching for |
| Feature surface               | Deploy, KV, and Jupyter removed                    | Kept, or kept as opt-in modules                             |
| The namespace and binary name | Keeps the namespace so imports resolve             | Keeps Deno drop-in, so the same namespace                   |
| Who carries maintenance       | One named maintainer, today                        | Unassigned                                                  |

Both want the same `deno` namespace, and only one fork can hold the `deno` binary name. That is where the two would actually collide, and it is a question for [Deno runtime handoff](Deno_Runtime_Handoff.md) rather than for the fork designs.

## Naming: what each name buys

`daniellacosse` floated Dodo, and the channel liked it. The arguments given were that it is an extinct bird, that birds evolved from dinosaurs, that the bird resembles the Deno dinosaur, and that `do {} do {}` loosely suggests concurrency. The only stated requirement was that the name be short, and Dodo is. Its weakness is availability: the GitHub handle `dodo` has belonged to an unrelated account since 2009, and npm and crates.io both already have a `dodo`. JSR's `dodo` scope is the one natural home still unclaimed.

Ende's argument is that it reads clean and means "end" in German. `Ende_Runtime` records the one correction: the published post justifies the name by calling it an anagram of Deno, which the letters do not support (`endo` is the anagram), and Ethan pointed that out in the channel. Ende's namespace is already claimed despite the same kind of collisions, which is the difference between a project and a candidate.

## Which one the group asked for

The log's stated preference is the Dodo position, not the Ende roadmap. `davey` asked for Deno unchanged, LTS, with security patches and the permission model intact, and said that permission model alone would decide his vote. Ethan said the same thing in fewer words. `andy` called Deno compatibility a must and named Buffers and CommonJS as the parts of Node compatibility worth keeping. Nobody in the capture asked for Node compatibility to be removed, and the one person who uses KV said so.

So the position with the votes has no name, no repository, no owner, and no namespace, while the stripped fork has all four. `Stag Math` read the channel as two parties with two runtimes; what exists is one person with a plan and a group with a preference.

## What this page does not claim

- That Dodo was a project on 2026-10-13. At that date it was a name in one capture. The section above records that it has since gained a repository and a roadmap, with no runnable build as of 2026-10-28.
- That Ende's roadmap is fully implemented. Removal of Node compatibility, Deploy, KV, and Jupyter shipped in `v2026.10.14`; the rest of the roadmap is not shown to have shipped. The repository is public and can be checked.
- That the compatibility fork is a separate project rather than a configuration of Ende, which is the open question `Deno_Fork_Options` leaves.
