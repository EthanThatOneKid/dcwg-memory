---
"@type": schema:Organization
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

The group formed in reaction to the 2026-10-09 announcement that Cloudflare is acquiring Deno and that Deno will end its own runtime development after about a year of monthly bug-fix and security releases. The acquisition itself is recorded on [Deno](Deno.md).

## Evidence

Two captures so far: `raw/discord/2026-10-11_dcwg-talk.md`, the group's `#talk` channel from 10:10 AM to 1:44 PM on 2026-10-11, and `raw/discord/2026-10-11_dcwg-architecture.md`, an architecture channel from 3:13 PM to 3:45 PM the same day, opened by `andy` for proposing what the runtime should be made of. The server name and channel list are not in either capture, only the channel labels. Everything below that is not traceable to a capture is marked as unverified.

## What the group has settled on

- **The bar is LTS, not new features.** The strongest agreement in the capture, from `davey` and echoed by Ethan: keep Deno as it is, enough to compile and run backend services, maintained as a long-term-support branch with security patches.
- **Keep the permission model.** `davey` said they would vote for any fork that keeps it; `w` is running Deno embedded in a game client and relies on the permission layer as the only reason users can trust running other users' code.
- **Ask the current team rather than reverse-engineer.** `davey`'s four-step ask: request a handover, ask the team to get the repo into a maintainable state, ask to pair with core team members, and use an LLM over recent commit history to baseline maintenance and produce a forecast. Ethan agreed with all four.
- **A community end-to-end test suite as a regression net.** `davey` proposed a public repo of contributed e2e suites describing how real users run Deno, which any fork could run against. `netop://ウィビ` called it a good idea. This is the one concrete artifact the group agreed to want.
- **Scan the issue and PR backlog with an LLM.** `netop://ウィビ` did this for the Gel fork with a script that uses the GitHub API to categorize issues and PRs into an implementable backlog, discarding the ones that did not make sense.

## What the group has not settled

- **The name.** Candidates raised on 2026-10-11: `endo` and `noend` (andy), `Pteryx` with the `ptx` command (`netop://ウィビ`), `dodo` (daniellacosse and `w`), and `Ende` (the name `netop://ウィビ` actually shipped). See [Deno fork options and naming](Deno_Fork_Options.md).
- **One fork or several.** `netop://ウィビ` argued for at least two: a full-compatibility fork and his own stripped-down one. `daniellacosse` proposed instead a single core runtime whose features (KV, Deploy, Node compatibility) are modules you switch on per project, and later expressed the expectation that various companies would take on Deno forks to keep their infrastructure running (2026-10-13T20:54:18Z).
- **Whether to ask for `denoland/deno` itself or to start elsewhere.** Stag Math's reading of the thread: two parties, one stripped-down fork and one that keeps Deno core, with the possibility that "we may be given Deno itself."
- **Who does release engineering.** Nobody has volunteered for builds, signing, release automation, or a CI matrix.
- **Decision process.** No stated way to make decisions, no roster, no meeting.

## Outreach

Ethan reported on 2026-10-11 that he had reached out to Divy and Crowl: Divy Srivastava (`littledivy`) and Leo Kettmeir (`crowlKats`), both of Deno. Whether they responded is not in the capture. The later contact with Bart, the Deno team member who runs the foundation effort, and his 2026-10-28 reply are in [Foundation outreach and Bart's reply](Foundation_Outreach.md). `daniellacosse` asked whether anyone already has a relationship with the current core maintainers; nobody answered before the capture ends. Reaching out to Luca Casonato, raised by `W7T2A` and seconded by Max P., was still just a proposal. See [Luca Casonato](Luca_Casonato.md) and [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md).

## Related

- [Deno runtime handoff](Deno_Runtime_Handoff.md): what can and cannot be transferred.
- [Ende](Ende_Runtime.md): the one fork with a published roadmap.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the second capture, where the group argued about the core.
- [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md): what already implements the architecture being proposed.

- [Rust core rewrite proposal](Rust_Core_Proposal.md): the rewrite that got formalized the next day, and the zig prototype it started as.
- [Benchmarking dodo](Dodo_Benchmarks.md): the performance baseline the rewrite will eventually be judged against.
- [Deno versus Node features](Deno_vs_Node_Features.md): whether the project's purpose is to stay a distinct runtime at all.
- [Fork sustainability](Fork_Sustainability.md): how the group proposed to pay for any of it.
- [Rust upskilling](Rust_Upskilling.md): the skill survey and what to learn first.
- [Dodo project roadmap](Project_Roadmap.md): the now, near, and far plan posted to the roadmap channel.
- [Server rules and announcements](Server_Rules_and_Announcements.md): the four rules and the announcements channel.
- [CI and release cadence](CI_and_Release_Cadence.md): how long the forks' CI runs and what Ende changed.
- [JSR and the package registry](JSR_and_Package_Registry.md): publishing limits, stuck packages, and who owns the standard library.
- [Foundation outreach and Bart's reply](Foundation_Outreach.md): contact with the Deno team and what Dodo is for if a foundation forms.
- [Dodo branding, namespaces, and website](Dodo_Branding_and_Namespaces.md): scopes, domain hunting, the logo, and the website.
- [Community and press reaction](Community_and_Press_Reaction.md): the videos and articles the group shared and discussed.
