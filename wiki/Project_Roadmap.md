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

## Related

- [Deno Core Working Group](Deno_Core_Working_Group.md): the group the roadmap is for.
- [Sustaining the fork](Fork_Sustainability.md): the fundraising and foundation items.
- [Dodo's identity and the economic reality](Dodo_Identity_and_Economics.md): where the triage board was recommended to new contributors.
