---
"@type": schema:TechArticle
schema:name: Deno runtime handoff
schema:description: What a community handoff of the Deno runtime, std, and rusty_v8 would have to transfer, split into what is possible, what needs negotiation, and what is not on the table.
wazoo:source: dcwg
wiki:priority: high
---

# Deno runtime handoff

What a handoff of the Deno runtime and standard library would have to move, and which of those pieces can actually move. Derived from a handoff brief captured at `raw/briefs/2026-10-11_deno-handoff-terms-and-feasibility.md` and checked against live repository state on 2026-10-11. Transferring a runtime is a different problem from transferring a web framework: [Fresh framework migration](Fresh_Framework_Migration.md) moved one GitHub repository, while a runtime handoff drags trademark, registries, crates, and signing keys with it.

## The two shapes of the deal

|               | Community handover, keeping the `deno` name | Independent fork, new name |
| ------------- | ------------------------------------------- | -------------------------- |
| Name          | trademark licensed to the community         | new binary and CLI name    |
| Repositories  | transferred, or `denoland` handed over      | new org, or a fork         |
| Registries    | publish rights for the core scopes          | new scopes                 |
| Compatibility | can stay drop-in                            | clean break                |

Everything below is one or the other, or a choice about which.

## Possible without much negotiation

- **Moving repositories out of `denoland`.** GitHub redirects HTTP, clone, and package-fetch URLs from the old path to the new one, so downstream CI keeps working. This is the path Fresh already took.
- **Handing over the `denoland` organization itself**, by inviting community members as owners and having corporate owners step down. This keeps stars, issues, and links in place without moving anything.
- **Transferring crate ownership on crates.io** (`deno_core`, `deno_runtime`) and scope admin on JSR for `@std`.

## Needs negotiation

- **Trademark: license or ownership.** A company usually keeps the trademark and grants a perpetual, royalty-free license instead. That license is only as durable as its terms, and it is revocable in practice if a brand-guideline dispute arises.
- **Binary distribution and code signing.** Release pipelines depend on an Apple Developer ID and Windows Authenticode certificates. Handing those to unincorporated volunteers is a supply-chain risk, which is the argument for a legal entity to hold them.
- **Split infrastructure.** If JSR moves under Cloudflare while the community maintains the CLI, runtime-registry compatibility becomes a shared obligation across two owners.
- **Who is the counterparty.** A group with no legal entity cannot sign anything. A 501(c)(3) or 501(c)(6), or an existing umbrella foundation, is the usual answer.

## Not on the table

- **Proprietary cloud infrastructure.** The closed-source platform behind Deno Deploy is not part of the handoff, and Deploy is shutting down anyway.
- **Retroactive license changes.** The codebase is MIT and stays MIT. Neither side can restrict access to already-published releases, and the community cannot stop Cloudflare from using parts of `rusty_v8` or `deno_core` inside `workerd` or `celld`.
- **Using the `deno` name without permission.** A fork cannot legally ship a binary called `deno`, or publish into the `@deno` and `denoland` namespaces, without trademark and scope rights.

## What the group would actually do

The brief's recommended sequence, and the one the Discord discussion converges on: form or join a legal umbrella that can hold the trademark and the signing credentials, transfer the repositories or the organization, then strip corporate telemetry, deploy hooks, and corporate secrets out of the build scripts and replace them with community-owned CI.

## Open questions

- Is `denoland` willing to transfer repositories, the organization, or neither? Not established. Ethan reached out to two Deno engineers on 2026-10-11; see [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md).
- Who holds the signing certificates today, and would they issue releases signed on behalf of a community entity?
- Does JSR publication for `@std` require `denoland` scope rights that cannot be delegated?
- Is there a maintainer willing to stay on as the bridge, which is the difference between a handover and a cold fork.
- Whether to transfer the Deno runtime to a foundation (such as the OpenJS Foundation) as a means of community handover. (Ooker, daniellacosse, 2026-10-15)
- Additionally, JSR has been reported as janky with issues like options rearranging on page refresh and limits on publication (2026-10-15T04:03:54Z `netop://ウィビ`).
