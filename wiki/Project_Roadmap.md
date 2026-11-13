---
"@type": schema:TechArticle
schema:name: Dodo project roadmap
schema:description: The now, near and far roadmap that daniellacosse posted to #roadmap on 2026-10-16 and last edited on 2026-10-28, with its owners, its out-of-scope list, and the triage board.
wazoo:source: dcwg
wiki:priority: high
---

# Dodo project roadmap

`daniellacosse` posted this roadmap to the `#roadmap` channel on 2026-10-16 (UTC) and edited it as late as 2026-10-28T03:05Z. The archive captured the text as it stood on 2026-10-29, so it shows the latest edit and not the original. Earlier edits are not in the record, and neither is the order in which items were added. It is a plan written by one participant, not a decision of the group.

## Now

- Get CI green again so the project can begin accepting pull requests. Marked in progress, assigned to one participant by Discord mention.
- Create a GitHub project board to triage important Deno issues. In progress, assigned to another participant.
- Set up a basic fundraising mechanism, "such as OSC" (the roadmap does not expand it), with the note "let's see if we can contact Bart first."
- Release a runnable build.

## Near

- Solidify the extensions proposal. In progress, assigned to a participant by mention.
- Dodo's team is equipped to take in security patches as Deno releases them.
- Dodo becomes the most-starred Deno fork.

## Far

- Become equipped to author its own security changes and dependency updates, such as V8 and TypeScript features.
- Dodo gets institutional buy-in.
- Found a sovereign Dodo Foundation for legal protection.
- Deno Desktop and Mobile.

## Out of scope for now

`daniellacosse` added on 2026-10-16:

- Deno Fresh, because "they're moving to npm support." See [Fresh framework migration](Fresh_Framework_Migration.md).
- `@std`, which he said is owned by the `#andromeda` and `#ende` channels. That is a pointer to a shared-ownership idea discussed in [JSR and the package registry](JSR_and_Package_Registry.md), not a settled arrangement.

On 2026-10-17 he posted the link to the triage board, still mostly empty at that point: the `are-we-dodo-yet` organization's project 2.

## Who the assignees are

The roadmap names owners only by Discord user id. The ids are not resolved in this capture. The ids of the first and third assignees appear, in other captures, in messages that `daniellacosse` and `davey` address to `CaptainLach` and `andy`, who then answer, which suggests those two handles. That is an inference from who replied, not something the roadmap says. The second assignee is unidentified.

## How it has aged

The roadmap predates much of the discussion recorded elsewhere. The extensions item is the subject of [Rust core rewrite proposal](Rust_Core_Proposal.md) and [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md), and the fundraising and foundation items depend on the reply the group is waiting for, recorded in [Sustaining the fork](Fork_Sustainability.md). "Most-starred Deno fork" can be checked against live numbers: on 2026-10-29 the GitHub API shows `are-we-dodo-yet/dodo` at 75 stars and `theende/ende` at 116, so the "near" goal is not met on that measure; see [Ende](Ende_Runtime.md).

On 2026-11-10 `daniellacosse` updated the `#roadmap` channel post and asked the group how they felt about it; no objections were recorded in the capture. He also described where the work stands: he is currently only able to give partial focus, so he is in a better position to coordinate and review code, while another participant, named only by Discord mention in the capture, knows the codebase and has been doing maintenance work. He said he is learning the codebase himself while renaming the binary and getting a release CI working, since the current one assumes access to URLs the project does not own. He added that all pull requests are welcome and he is happy to review anything, within reason. The update followed `SpaceMonkey`'s offer of his Denext fork's work for Dodo; see [Deno fork options and naming](Deno_Fork_Options.md).

On 2026-11-11 `andy` said in `#general` that he is probably not going to be super active in Dodo for a while, though he expects to be a lot more active around Christmas and Thanksgiving, and that he is busy rather than anything being wrong. `daniellacosse` answered that he himself has only been able to give roughly 25%, and expects that to be the case for the next 3–6 months, and that the community has to find a way to be resilient to what life throws at each contributor: "apes together strong."

On 2026-11-11 `daniellacosse` announced in `#news` that the `#roadmap` post had been updated again, and asked for feedback in `#brainstorm`. `lishaduck` replied there that he could not see at first glance what had changed, and asked whether the roadmap made sense somewhere other than Discord — GitHub, or anywhere with revision history. `daniellacosse` answered that in a way that was a good thing, and invited someone to populate a `.github` page so the roadmap could live on the organization's page (`are-we-dodo-yet`), linking an explainer on GitHub profile repositories and the `.github/profile` path. The repository was created the same evening: the GitHub API read on 2026-11-13 shows `are-we-dodo-yet/.github`, described as "About the Dodo Community", created 2026-11-11T18:52:06Z with a `profile/README.md`.[^2]

Later on 2026-11-11 `daniellacosse` asked in `#general` whether anyone could look into the release before he could get to it, and on 2026-11-12 he said he was working on the release.

## First step toward a build

The "release a runnable build" item had its first concrete step on 2026-10-30 (UTC). `daniellacosse` opened `are-we-dodo-yet/dodo` pull request 17, "chore: rename deno cli to dodo," whose description shows `./x build` now producing a `dodo` binary whose REPL prints "Dodo 2.9.7." He said the CI still needs fixing next, and told a newcomer who offered to maintain the standard library that the project is "a little stuck on not having a build for people to use" and that focus time is hard for him to find. On 2026-10-31 the GitHub API showed the pull request open and unmerged, 18 files changed, and the repository with no releases and 77 stars.[^1]

On 2026-11-01 (UTC) the newcomer from 2026-10-30, `Soluble State`, replied in `#brainstorm` that they would discuss it with their team members, take a look at pull request 17, and start exploring the codebase. `daniellacosse` said, to set expectations, that he was working on getting his time back.

## A WebRTC milestone, suggested 2026-11-10

On 2026-11-10 in `#brainstorm` `daniellacosse` said he can't host a local server because Deno doesn't implement WebRTC. `𐑛𐑦𐑕𐑣𐑸𐑥𐑦𐑯𐑦 | 最不調和の伝播者 | 異議の元素` replied that it sounds like a potential Dodo milestone. Nothing was decided, and WebRTC is not in the roadmap above.

## Related

- [Deno Core Working Group](Deno_Core_Working_Group.md): the group the roadmap is for.
- [Sustaining the fork](Fork_Sustainability.md): the fundraising and foundation items.
- [Dodo's identity and the economic reality](Dodo_Identity_and_Economics.md): where the triage board was recommended to new contributors.
- [Deno Desktop and Laufey](Deno_Desktop_and_Laufey.md): the far goal of Deno Desktop and Mobile.
- [TypeScript 7 and type-aware tooling](TypeScript_7_and_Tooling.md): the far goal of authoring its own dependency updates.
- [Foundation outreach and Bart's reply](Foundation_Outreach.md): the foundation and fundraising items.

## Sources

[^1]: [`are-we-dodo-yet/dodo` pull request 17](https://github.com/are-we-dodo-yet/dodo/pull/17), read through the GitHub API on 2026-10-31: open, created 2026-10-30, 261 additions and 259 deletions in 18 files; the repository `are-we-dodo-yet/dodo` had 77 stars and no releases.

[^2]: [`are-we-dodo-yet/.github`](https://github.com/are-we-dodo-yet/.github), read through the GitHub API on 2026-11-13: created 2026-11-11T18:52:06Z, last pushed 2026-11-11T18:55:16Z, description "About the Dodo Community", `profile/README.md` present.
