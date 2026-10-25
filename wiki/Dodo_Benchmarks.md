---
"@type": schema:TechArticle
schema:name: Benchmarking dodo
schema:description: The 2026-10-13 #propose thread on getting performance baselines for dodo, the CI benchmark harness and its noise threshold, and whether modularizing the build loses the LTO benefits Deno gets today.
wazoo:source: dcwg
wazoo:thread: "1559657749892300934"
wiki:priority: high
---

# Benchmarking dodo

`w` opened this post on 2026-10-13 with a position rather than a proposal: given the initial effort to monorepoize Deno, he is unsure where dodo is headed on the spectrum of ground-up rewrite versus continuation of Deno, and given the stated goal of modularity with compatibility, the group should probably start paying close attention to performance and get some baselines. He had done the archaeology: recent benchmark history was written to a proprietary Deno Grafana board, and the ancient history lives at `deno.com/benchmarks`. He asked whether there was any reason he should not open a pull request that gets Deno's existing benches showing for dodo using a continuous-benchmark GitHub action.

Nobody gave him a reason, and he did it.

## The plan and the objections

`daniellacosse` inquired (2026-10-13) if this would overlap with `andy`'s testing efforts, specifically the tests `andy` had been getting to run. `CaptainLach` confirmed (2026-10-13) there should be no overlap.

`davey` liked the idea and raised the question that decides whether the numbers mean anything: would the results be skewed if the existing benchmarks ran on non-free-tier runners? He also offered his own setup as a template, a pull request check that fails and comments when a benchmark slips by more than a threshold, which he called a potentially good way to catch accidental regressions.

That led to a hosting question from `davey`, whether the benchmarks would collide with GitHub Pages if the project used them for a dodo homepage or docs, and whether they could be served from a path. `w` said he would opt for a path himself (2026-10-13), offering "benches or benchmarks", and `davey` settled on benches (2026-10-13).

## Noise, and how much of it is tolerable

The most useful exchange in the thread is about measurement quality on free infrastructure. `w` reported (2026-10-13) that free runners can be noisy, and that plus or minus seven percent is not unusual, but that if you introduce a meaningful regression it is still generally apparent through the noise. He offered two mitigations: `Gungraun`, and running multiple trials and taking the minimum rather than the average if straight lines are the priority.

`davey` answered (2026-10-13) with the threshold he runs in production: 25 percent. He linked both the pull request comment his workflow produces and the workflow itself as inspiration, and said it worked well enough for him to catch a few regressions early.

So the thread contains a working answer to the noise problem, which is to set the threshold high enough that noise never trips it and let the change-detection catch only regressions worth acting on. Nobody argued about whether 25 percent is the right number.

## What the numbers actually showed

`w` came back on 2026-10-14 with a correction to his own opening. He linked the dodo commit that stops sending benchmark data to Grafana and noted that he had misspoke: Grafana has been dead for four years. He then said `deno.land/benchmarks` is up to date as of the previous week, posted a screenshot of it, and said the readme had misspoke as well.

That is a small thing that matters for the group's record: the assumption that Deno's benchmark history was lost with the acquisition was wrong, and the live page is current.

`daniellacosse` read the page (2026-10-14) and found it hard to use, which produced the most concrete criticism of the measurement work. He asked how big `workers_large_message` is exactly, asked whether the figures include cold startup, and said 80 milliseconds to encode some text seems really slow when he knows Deno is faster than that. He also asked for percentiles: they are not breaking the results down by percentile, and that matters, because a tame p99 is a great talking point, since it means the system is more predictable.

`w` answered the coverage question (2026-10-14): many of the small benchmarks in the project are not shown on that page, and he had a suite running with almost every benchmark in the project included plus a workflow file to write pages, though he described it as still a bit of a mess, and unlikely to effectively prevent regressions once an extensions system was implemented.

## The question that outlives the harness

`w`'s doubt about the exercise is the part of the thread that is still open, and it is specific: using those benches as a starting point will not be that helpful for avoiding regressions if the extensions system gets flipped on its head. `daniellacosse` agreed on the mechanism (2026-10-14), since extensions will presumably add to startup, and otherwise the runtime work is just moving code around, so maybe the group should focus on the benchmarks that matter for that. He added that coming back to this may make sense once the group starts thinking about promoting dodo.

`w` closed the thread with what he is most curious about (2026-10-14): whether there are benefits currently being realized through link-time optimization and having everything in one build that end up lost.

That is the thread's sharpest question and it is a direct challenge to the modular architecture the group is pursuing. Deno's current build gets LTO across everything in one binary. A minimal core with separately built extension components may not, and nobody in this capture addressed whether the measured cost of that is acceptable. It is the same boundary question the architecture threads argue about from the other direction, and it is the one place where performance work would settle a design argument rather than merely report on it.

## Where it stands

A benchmark suite is running in the dodo repository with a workflow to publish pages, at `benches` rather than the repository root, and the group has a noise-tolerant threshold in `davey`'s 25 percent. The published Deno page is current and was judged unclear, missing cold-start disclosure and percentile breakdowns. The question of what modularization costs in lost link-time optimization is open and unmeasured.

## Open questions

- Whether the reported numbers include cold startup, which `daniellacosse` asked and nobody answered.
- Whether percentiles are added, since an average hides the tail that predicts behaviour.
- Whether the extension system adds startup cost, and whether the group measures it before or after building it.
- Whether LTO benefits survive modularization, which is the design question the harness could answer.
- Which benchmarks matter for the modular design specifically, which `daniellacosse` raised as the way to avoid measuring code that is about to be rewritten.

## Related

- [Rust core rewrite proposal](Rust_Core_Proposal.md): the modular architecture whose cost this thread is trying to measure.
- [Rust upskilling for the fork](Rust_Upskilling.md): the thread where `w` asked for cold-start numbers and `andy` had not checked yet.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the extension boundary that decides whether the benchmarks stay comparable.
- [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md): other runtimes that already ship a modular build.

## Sources

[^1]: [Deno benchmarks](https://deno.com/benchmarks), the live page `w` said was up to date as of the week of 2026-10-06 and `daniellacosse` reviewed on 2026-10-14. Read 2026-10-18.
