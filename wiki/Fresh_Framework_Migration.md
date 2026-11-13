---
"@type": schema:TechArticle
schema:name: Fresh framework migration
schema:description: Fresh, Deno's full-stack web framework, moved out of the denoland GitHub organization into freshframework. The verified facts of that move, and which of them transfer to a runtime handoff.
wazoo:source: dcwg
wiki:priority: high
---

# Fresh framework migration

The group treats Fresh as the blueprint for a handoff: a Deno-flagship project that left the `denoland` GitHub organization and kept running. This page records what is verifiable about that move, because the useful part of the precedent is the part that did not come along.

## What Fresh is

A full-stack, server-rendered web framework built on Preact and web standards, using islands architecture so that client JavaScript is a per-component decision. Created by Luca Casonato while he was at Deno, and used to build deno.com itself. See [Luca Casonato](Luca_Casonato.md).

## What actually moved

| Fact         | Value                                                       | How it was checked                                                                                 |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Repository   | `freshframework/fresh`                                      | `gh api repos/denoland/fresh` returns `full_name: freshframework/fresh`, so the old path redirects |
| License      | MIT                                                         | Repository metadata                                                                                |
| Stars        | 13,792                                                      | Repository metadata, 2026-10-11                                                                    |
| Homepage     | <https://usefresh.dev>                                      | Repository metadata                                                                                |
| Organization | `freshframework`, created 2021-05-08, one public repository | Organization metadata                                                                              |

The redirect is the mechanism the handoff brief leans on: GitHub answers requests to `denoland/fresh` with the new location, so clones and CI pipelines that reference the old path keep working. That is confirmed here at the API level.

## What did not move

The registry did not follow the organization. JSR still records the repository for `@fresh/core` as owned by `denoland`, with the linkage frozen at 2024:

```json
{
  "scope": "fresh",
  "name": "core",
  "githubRepository": {
    "owner": "denoland",
    "name": "fresh",
    "createdAt": "2024-03-27T09:21:50.889759Z"
  }
}
```

`@std/path` carries the same shape, with `owner: denoland` and a 2023 linkage. So the GitHub org transfer left the package provenance pointing at the old owner, and JSR's metadata was not rewritten. For a runtime handoff, where `jsr:@std/*` and the `deno` publish scope are core infrastructure rather than a single framework package, this is the difference that matters: a framework can move and keep publishing, but whoever holds the scope is the one who decides.

The same asymmetry shows up on crates.io. `deno_core` last published 2026-09-16, and crate ownership is a separate registry relationship from GitHub org membership.

## Where the analogy breaks

Fresh is a framework on top of the runtime: it depends on Deno, is versioned independently, and its users pick it per project. Deno, `std`, and `rusty_v8` are the runtime, the standard library, and the V8 binding layer, and they carry release signing, registry scopes, and crate ownership with them. The group's own brief lists what has no Fresh equivalent: trademark licensing, binary signing certificates, and release pipeline secrets. See [Deno runtime handoff](Deno_Runtime_Handoff.md).

## A late-October report on Fresh Next

This is a participant report, not a checked fact about Fresh. In `#general` on 2026-10-30, `paula` said she tried Fresh Next on Deno, that it uses `package.json` and "doesnt even work", and that she will keep using Fresh 2. `davey` replied that it is sad they do not test against Deno. No follow-up, version, or error detail is in the capture, so this records only that one attempt and that reaction.

## A participant's own Fresh fork (2026-11-11)

This is a participant report, not a checked fact about Fresh. In `#general` on 2026-11-11, `paula` said she had forked Fresh so she could change partials to support any HTTP methods, because Fresh 3 had moved away from Deno and JSR. She added that she hoped "the deno foundation thing works out so deno doesnt actually die". The fork and the hope are hers; nothing in the capture says whether anyone else picked either up.

## Open questions

- Whether the `freshframework` organization is the model to copy, or whether a new organization is cleaner than reusing one.
- Whether Luca Casonato's continued stewardship of Fresh was a condition of the move or a consequence of it. The log does not say.
