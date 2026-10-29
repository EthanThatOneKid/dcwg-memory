---
"@type": schema:TechArticle
schema:name: CI and release cadence
schema:description: The 2026-10-14 to 2026-10-17 #ende discussion of how long the forks' CI runs, what Ende did to cut it from 34 to 13 minutes, the options for Dodo, and whether nightlies are worth keeping.
wazoo:source: dcwg
wiki:priority: medium
---

# CI and release cadence

This page records what the `#ende` channel said about continuous integration for the forks, between 2026-10-14 and 2026-10-17 (UTC). It is a record of participants' measurements and opinions. The only numbers in it are `netop://ウィビ`'s own, from the two workflow runs he linked.

## What Ende measured

On 2026-10-14 `netop://ウィビ` reported that his CI for [Ende](Ende_Runtime.md) had finally turned green. What surprised him was how long it ran: more than thirty minutes. `daniellacosse` noted that Dodo's CI also always runs: a tweak to the Dodo README had set it going in full.

`netop://ウィビ` pasted an AI assistant's list of suggested optimizations and applied all four:

1. Restore the build cache on pushes to the primary branch too, and save `target/` only from the build jobs, one cache per operating system, so that the 10 GB cache limit stops evicting them.
2. Lint on Linux only. The macOS build still compiles macOS-only code.
3. Run the macOS build and test jobs weekly and on demand rather than on every push.
4. Skip CI for pushes that only change Markdown or documentation.

He reported 34 minutes before and 13 minutes after, linking a run for each, and said macOS jobs now run on Mondays at 06:00 UTC and Linux jobs on every push. He also said that Ende has had a lot of code removed, so his CI would be quicker than Dodo's regardless.

## Options raised for Dodo

- `daniellacosse` said a collaborator had ideas about running things only when the relevant parts change, and that he did not think that existed yet in Dodo's CI. He added that getting CI under control and shipping regular releases is one of the important first steps, "both from a cost cutting and legitimacy perspective."
- `davey` suggested the idea behind Nx's "affected" feature, asking whether it can be applied to a Rust monorepo, and, more simply, a workflow `on: push: paths` filter so documentation changes do not run the test suites.
- `Sandeep Kumar Kuanar✌🏼` suggested a script that runs the relevant tests on save, and asked how the CI could be optimized.
- `daniellacosse` said `Max P.` wanted to do CI work and had marked himself as interested in the next day's meeting.

## The macOS cost question

`daniellacosse` thought macOS runners are more expensive. `w` said they are, as far as he knew, free for open-source repositories on GitHub. `daniellacosse` checked the GitHub billing documentation and concluded he had been thinking of private repositories. That settles the cost point for a public repository, per `w` and the documentation `daniellacosse` read; it was not independently checked here.

## Nightlies and canaries

`daniellacosse` observed that Dodo probably cannot make Ende's weekly-macOS trade if it wants nightlies. `netop://ウィビ` said he sees no point in nightlies or canaries and was ending them, and `daniellacosse` answered that some people like them.

The question comes back through extensions. `daniellacosse` asked on 2026-10-15 whether dynamic extensions would require nightlies to keep up with V8's changes, "unless we do some napi-esque thing." `w` said that is still undecided and that the extension crates and `op2` macros are not "not napi-like." On 2026-10-17, after `netop://ウィビ` reported that Ende's release workflow ran for almost an hour even with about half the code removed, and predicted Dodo's would take longer, `daniellacosse` concluded that Dodo probably has to compile extensions dynamically and rebuild only the ones that changed. That is his inference from the reported build time, not a decision. See [Standard libraries and extensions](Std_Libraries_and_Extensions.md) and [Runtime architecture proposals](Runtime_Architecture_Proposals.md).

## Where it stands

Nothing was decided for Dodo. Ende's numbers are a single before-and-after on a different codebase. The record does not show Dodo's own CI duration, or whether any of these changes were applied to it.

## Related

- [Ende](Ende_Runtime.md): the project whose CI was measured.
- [Benchmarking dodo](Dodo_Benchmarks.md): the other thread about measuring Dodo's cost.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): the prototype whose build time `netop://ウィビ` predicted would be longer.
