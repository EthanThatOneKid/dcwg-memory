---
'@type': schema:TechArticle
schema:name: Ende vs Dodo
schema:description: Why Ende and Dodo are not competing runtimes. Ende is a fork with an owner, a registered namespace, and a published roadmap; Dodo is a name the group liked for a compatibility fork that nobody has started.
wazoo:source: dcwg
wiki:priority: high
---

# Ende vs Dodo

These are not two forks. They are a project and a preference. [[Ende_Runtime]] is a fork with a named maintainer, a registered namespace, and a published roadmap that strips Deno down. Dodo is a name that came up once in the channel, for a fork that keeps Deno as it is, and nobody has started it. Comparing them as rival runtimes is the category error; comparing the two positions on compatibility is the useful comparison.

## What each one actually is

|                   | Ende                                                                                      | Dodo                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| What it is        | A fork with a published roadmap                                                           | A name floated in chat, with no project behind it                                                |
| Origin            | [WM-105, "Beginning of the Ende"](https://blog.webb.page/WM-105), shared into the channel | One message from `daniellacosse` at 10:23 AM on 2026-10-11                                       |
| Owner             | Paul Anthony Webb (`netop://ウィビ`)                                                      | Nobody                                                                                           |
| Scope             | Keeps the namespace, drops Node compatibility, Deno Deploy, KV, and Jupyter               | Keeps Deno as it is: LTS, security patches, the permission model, with extensions like KV later  |
| Namespace claimed | GitHub org `theende` and JSR scope `ende` on 2026-10-10, plus `ende.sh`                   | Nothing. JSR scope `dodo` is free; GitHub `dodo`, npm `dodo`, and crates.io `dodo` are all taken |
| Public code       | None. Development happens on the author's own infrastructure at `eol.sh`                  | None                                                                                             |
| Timeline          | Soft launch in December 2026, the author's own schedule                                   | None                                                                                             |

## The axis that separates them

The two positions differ on four things, and only the first one is architectural.

| Question                      | Ende                                               | The Dodo position                                           |
| ----------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| Node and npm compatibility    | Dropped. The post argues it was an adoption tactic | Kept. `andy` called Buffers and CommonJS worth reaching for |
| Feature surface               | Deploy, KV, and Jupyter removed                    | Kept, or kept as opt-in modules                             |
| The namespace and binary name | Keeps the namespace so imports resolve             | Keeps Deno drop-in, so the same namespace                   |
| Who carries maintenance       | One named maintainer, today                        | Unassigned                                                  |

Both want the same `deno` namespace, and only one fork can hold the `deno` binary name. That is where the two would actually collide, and it is a question for [[Deno_Runtime_Handoff]] rather than for the fork designs.

## Naming: what each name buys

`daniellacosse` floated Dodo, and the channel liked it. The arguments given were that it is an extinct bird, that birds evolved from dinosaurs, that the bird resembles the Deno dinosaur, and that `do {} do {}` loosely suggests concurrency. The only stated requirement was that the name be short, and Dodo is. Its weakness is availability: the GitHub handle `dodo` has belonged to an unrelated account since 2009, and npm and crates.io both already have a `dodo`. JSR's `dodo` scope is the one natural home still unclaimed.

Ende's argument is that it reads clean and means "end" in German. `Ende_Runtime` records the one correction: the published post justifies the name by calling it an anagram of Deno, which the letters do not support (`endo` is the anagram), and Ethan pointed that out in the channel. Ende's namespace is already claimed despite the same kind of collisions, which is the difference between a project and a candidate.

## Which one the group asked for

The log's stated preference is the Dodo position, not the Ende roadmap. `davey` asked for Deno unchanged, LTS, with security patches and the permission model intact, and said that permission model alone would decide his vote. Ethan said the same thing in fewer words. `andy` called Deno compatibility a must and named Buffers and CommonJS as the parts of Node compatibility worth keeping. Nobody in the capture asked for Node compatibility to be removed, and the one person who uses KV said so.

So the position with the votes has no name, no repository, no owner, and no namespace, while the stripped fork has all four. `Stag Math` read the channel as two parties with two runtimes; what exists is one person with a plan and a group with a preference.

## What this page does not claim

- That Dodo is a project. It is a name in one capture, and the page records its position rather than its existence.
- That Ende's roadmap is implemented. Every item is a stated plan; there is no public repository to check it against.
- That the compatibility fork is a separate project rather than a configuration of Ende, which is the open question `Deno_Fork_Options` leaves.
