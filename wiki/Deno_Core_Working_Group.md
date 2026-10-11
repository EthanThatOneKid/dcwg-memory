---
'@type': schema:Organization
schema:name: Deno Core Working Group
schema:description: An informal group of Deno users organizing on Discord to keep the runtime alive after Cloudflare acquired Deno Land Inc. and Deno ended its own runtime development.
schema:keywords:
  - deno
  - fork
  - governance
  - lts
  - community
wazoo:source: dcwg
wiki:priority: high
---

# Deno Core Working Group

An informal group of Deno users coordinating on Discord, with the working name "dcwg", to keep the Deno runtime alive and maintained after Deno Land Inc. stopped planning to develop it. It is not a foundation, has no published charter, and owns no repository.

## Origin

The group formed in reaction to the 2026-10-09 announcement that Cloudflare is acquiring Deno and that Deno will end its own runtime development after about a year of monthly bug-fix and security releases. The acquisition itself is recorded on [[Deno]].

## Evidence

One capture so far: `raw/discord/2026-10-11_deno-core-working-group-talk.md`, the group's `#talk` channel from 10:10 AM to 1:44 PM on 2026-10-11. The server name and channel list are not in the capture, only the channel label `#talk`. Everything below that is not traceable to that capture is marked as unverified.

## What the group has settled on

- **The bar is LTS, not new features.** The strongest agreement in the capture, from `davey` and echoed by Ethan: keep Deno as it is, enough to compile and run backend services, maintained as a long-term-support branch with security patches.
- **Keep the permission model.** `davey` said they would vote for any fork that keeps it; `w` is running Deno embedded in a game client and relies on the permission layer as the only reason users can trust running other users' code.
- **Ask the current team rather than reverse-engineer.** `davey`'s four-step ask: request a handover, ask the team to get the repo into a maintainable state, ask to pair with core team members, and use an LLM over recent commit history to baseline maintenance and produce a forecast. Ethan agreed with all four.
- **A community end-to-end test suite as a regression net.** `davey` proposed a public repo of contributed e2e suites describing how real users run Deno, which any fork could run against. `netop://ウィビ` called it a good idea. This is the one concrete artifact the group agreed to want.
- **Scan the issue and PR backlog with an LLM.** `netop://ウィビ` did this for the Gel fork with a script that uses the GitHub API to categorize issues and PRs into an implementable backlog, discarding the ones that did not make sense.

## What the group has not settled

- **The name.** Candidates raised on 2026-10-11: `endo` and `noend` (andy), `Pteryx` with the `ptx` command (`netop://ウィビ`), `dodo` (daniellacosse and `w`), and `Ende` (the name `netop://ウィビ` actually shipped). See [[Deno_Fork_Options]].
- **One fork or several.** `netop://ウィビ` argued for at least two: a full-compatibility fork and his own stripped-down one. `daniellacosse` proposed instead a single core runtime whose features (KV, Deploy, Node compatibility) are modules you switch on per project.
- **Whether to ask for `denoland/deno` itself or to start elsewhere.** Stag Math's reading of the thread: two parties, one stripped-down fork and one that keeps Deno core, with the possibility that "we may be given Deno itself."
- **Who does release engineering.** Nobody has volunteered for builds, signing, release automation, or a CI matrix.
- **Decision process.** No stated way to make decisions, no roster, no meeting.

## Outreach

Ethan reported on 2026-10-11 that he had reached out to Divy and Crowl: Divy Srivastava (`littledivy`) and Leo Kettmeir (`crowlKats`), both of Deno. Whether they responded is not in the capture. `daniellacosse` asked whether anyone already has a relationship with the current core maintainers; nobody answered before the capture ends. Reaching out to Luca Casonato, raised by `W7T2A` and seconded by Max P., was still just a proposal. See [[Luca_Casonato]] and [[Deno_Core_Working_Group_Participants]].

## Related

- [[Deno_Runtime_Handoff]]: what can and cannot be transferred.
- [[Ende_Runtime]]: the one fork with a published roadmap.
