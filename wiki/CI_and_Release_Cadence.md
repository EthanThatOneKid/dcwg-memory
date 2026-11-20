---
"@type": schema:TechArticle
schema:name: CI and release cadence
schema:description: The 2026-10-14 to 2026-10-17 #ende discussion of how long the forks' CI runs, what Ende did to cut it from 34 to 13 minutes, the options for Dodo, and whether nightlies are worth keeping; plus a 2026-11-08 #general note on Dependabot and CodeQL being turned off for noise, and a 2026-11-11 #general note on Dodo pull request 17's failing checks and the Node 20 CI.
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

## Automated tooling turned off for noise

On 2026-11-08 `netop://ウィビ` said in `#general`, replying to `Summer`, that he had turned off Dependabot and CodeQL because they added too much noise. The capture does not name the repository, so this records the decision and the reason, not which project it applied to.

## Dodo's CI on pull request 17 (2026-11-11)

On 2026-11-11 `daniellacosse` reported in `#general` that the failing checks on `are-we-dodo-yet/dodo` pull request 17 were down to 23, linking [the run](https://github.com/are-we-dodo-yet/dodo/actions/runs/42963363171?pr=17), and invited anyone to push to the branch as long as the work stays coordinated. He noted that a lot of the CI checks are still using Node v20 and should be fixed. `davey` answered that Node 20 did not get patched for the emudhra certificate leak, though probably not a big deal for tests, and offered to look at bumping from Node 20 over the next few days. `CaptainLach` added that it is not just Node.js but the version that matters: many GitHub Actions, including checkout, are written using Node.js.

## Pulling in Deno 2.9.8, and issue 37008 (2026-11-16)

On 2026-11-16 in `#brainstorm` `CaptainLach` said `denoland/deno#37008` can be closed, because it will be covered by the v8x update he still needs to finish. `daniellacosse` removed it from the project. The issue, read 2026-11-18, is a Deno Desktop 2.9.7 regression: `node:net` from an npm package fails to resolve `ext:core/mod.js` at runtime, leaving a packaged desktop app with a blank window. Whether the v8x update does cover it is `CaptainLach`'s claim, not checked here.

`daniellacosse` also said he wished it were possible to say why draft issues are being closed, and that two board cards are redundant with "Publish CD artifacts to GitHub Releases instead of dl.deno.land": "Get CI green on trunk" and "Release a runnable Dodo build". Reading a conversation `CaptainLach` had with another participant, he said the group probably just needs a ticket for pulling in the latest Deno (2.9.8), and that new tickets can be added as new versions are released for the group to pull in.

`CaptainLach` answered that the latest Deno is just Deno including a partial fix for eMudhra, and that he had an issue with a couple of things the group might want to cherry-pick that were also released in 2.9.8, but he had looked into them and was not confident those fixes are correct and acceptable to be merged as-is. `daniellacosse` answered: "Alright. We'll just do it case by case then."

## Self-hosted runners and a dispatch system (2026-11-19)

On 2026-11-19 `SpaceMonkey` said in `#brainstorm`, replying to `daniellacosse`, that an addition could not really be considered until it passes the respective tests, and that he was closing the gap on tests, expecting something stable the next day. He was also writing a self-hosted runner dispatching system to keep jobs moving on the most powerful runner available first: GitHub's Mac runner limitations had almost required the use of self-hosted runners, which he called the first bottleneck. See [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md) for the permissions work he mentioned in the same message.

## Where it stands

Nothing was decided for Dodo. Ende's numbers are a single before-and-after on a different codebase. The record does not show Dodo's own CI duration, or whether any of these changes were applied to it. On 2026-11-11 the record does show Dodo's CI state on pull request 17: 23 checks failing, with the Node 20 bump offered but not done.

## Related

- [Ende](Ende_Runtime.md): the project whose CI was measured.
- [Benchmarking dodo](Dodo_Benchmarks.md): the other thread about measuring Dodo's cost.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): the prototype whose build time `netop://ウィビ` predicted would be longer.
