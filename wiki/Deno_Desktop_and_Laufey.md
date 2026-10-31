---
"@type": schema:TechArticle
schema:name: Deno Desktop and Laufey
schema:description: The 2026-10-16 to 2026-10-27 discussion of Deno Desktop's webview layer Laufey, a contributor's open fixes, whether to switch to wry, the licensing and CLA question, and a competing fork.
wazoo:source: dcwg
wiki:priority: low
---

# Deno Desktop and Laufey

Deno Desktop packages a web app as a native application. `Tadda` explained on 2026-10-16 that Laufey is "the webview engine that powers Deno Desktop." Deno Desktop and Mobile are listed as a far goal in the [Dodo project roadmap](Project_Roadmap.md). This page records what the group said about Laufey, with state read from GitHub on 2026-10-29.

## What exists

- **Laufey.** The repository `littledivy/laufey` is described as a "modern web native application framework," was created 2026-01-26, and had 51 stars and a last push on 2026-08-21.[^1]
- **`Tadda`'s contributions.** He linked three items on 2026-10-16: a Laufey pull request (`#126`) making page-triggered downloads use the operating system's native save dialog, a Deno issue (`#37021`) saying the same for `deno desktop`, and a `deno desktop 2.9.7` regression (`#37008`) in which `node:net` from an npm package fails to resolve. On 2026-10-29 the pull request and both issues were open, and `#36768`, a Windows installer problem he cited on 2026-10-17, was also open. He said he created everything he had linked.
- **Windows.** He said Windows support for his own desktop application is coming in its 0.3.0 release, helped by a script that fixes the MSI file because Deno Desktop has bugs generating valid MSI files.

## The questions raised

- **Where do fixes go.** `Tadda` asked whether to send fixes to Deno, which might still accept pull requests, or to Dodo. `CaptainLach` said the group would like to apply many existing pull requests, but that it should first study Deno's contributor license agreement, because the work might not be MIT-licensed. When `Tadda` said he authored the code himself, `CaptainLach` said it should be clean. `daniellacosse` added `Tadda`'s issues to the triage board.
- **What if Laufey is not maintained.** `CaptainLach` said that if its author, `littledivy`, is unwilling to maintain Laufey, the group would fork it and switch Dodo to the fork, but for now Dodo uses his version.
- **Switching to `wry`.** `daniellacosse` asked about the feasibility of switching to `wry`, the webview library from the Tauri project. `CaptainLach` said he had not yet touched Deno Desktop, and had assumed it used Tauri's implementation before he heard of Laufey. He described `wry` as intending the same thing, except it does not embed Chromium and delegates to the platform's webview. He also gave one piece of feedback on the existing code: on Linux, where XDG portals are present, they should be used instead of GTK. `Tadda` said Laufey is wonderful because it is minimalist, lightweight, and fast.
- **A competing fork.** `SpaceMonkey` said he maintains a Laufey fork as the center of his own framework project and offered to maintain Laufey for Dodo if needed. He claimed 331 commits on a branch and hardware to test on macOS, Windows, Linux, and Windows on ARM under emulation. On GitHub the fork is `Brainwires/laufey`, created 2026-09-30, last pushed 2026-10-28, with 0 stars. The commit count was not checked. `Tadda` said he admired the fork and thought it might be better for integrating into Dodo.
- **CLA.** `SpaceMonkey` said Deno runs a CLA in its CI and suggested Dodo might want one. `CaptainLach` replied that a CLA isn't needed unless the project wants to commercialize Dodo. The group did not decide.
- **Seriousness.** `Tadda` asked on 2026-10-17 how serious the project's intentions are and whether his time would be wasted. `daniellacosse` answered that anyone would be concerned after what happened to Deno, that he himself was committed, and advised not to go all in right away: "give it time and see how things develop."

## A browser-engine benchmark

On 2026-10-26 `paula` said she wanted to fix problems in Deno Desktop, then reported that on her Linux AMD machine Firefox ran her game far better than Chromium, and tested Servo. She wrote that Servo's shell lacked features to run the game at all, but ran her rendering benchmark, beating Firefox on some benchmarks and doing "really bad" on others, nowhere near 60 frames per second. This is one person's measurement on one machine, `daniellacosse` said he would love to hear how stable Servo ends up being, and `netop://ウィビ` said he looks forward to Servo-based browsers.

## Open questions

- Whether Dodo keeps Laufey, forks it, or moves to `wry`.
- Whether a CLA is adopted, and whether Deno's pull requests can be applied given its CLA.
- Whether `Tadda`'s fixes land in Laufey, Deno, or Dodo.

## Related

- [Dodo project roadmap](Project_Roadmap.md): Deno Desktop and Mobile as a far goal.
- [Killer App Framework](Killer_App_Framework.md): the other place `SpaceMonkey`'s framework project appears.
- [Dodo's identity and the economic reality](Dodo_Identity_and_Economics.md): the earlier discussion of replacing Laufey's backends with `wry`.

## Sources

[^1]: GitHub API, read 2026-10-29: `littledivy/laufey` (created 2026-01-26, 51 stars, last pushed 2026-08-21); `Brainwires/laufey` (a fork, created 2026-09-30, last pushed 2026-10-28, 0 stars); `denoland/deno` issues `#37021`, `#37008`, and `#36768` (all open); Laufey pull request `#126` (open, not merged).
