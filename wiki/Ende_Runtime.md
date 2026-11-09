---
"@type": schema:SoftwareApplication
schema:name: Ende
schema:description: A Deno fork by Paul Anthony Webb that keeps the Deno namespace and drops Node compatibility, Deno Deploy, KV, and Jupyter; public since 2026-10-13, first release v2026.10.14, with its own docs site and standard library.
schema:applicationCategory: DeveloperApplication
schema:author:
  schema:name: Paul Anthony Webb
schema:sameAs:
  - https://blog.webb.page/WM-105
wazoo:source: dcwg
wiki:priority: high
---

# Ende

The first concrete fork to come out of the working group, announced in [WM-105, "Beginning of the Ende"](https://blog.webb.page/WM-105) by Paul Anthony Webb (`netop://ウィビ` in the group, [NetOpWibby](https://github.com/NetOpWibby) on GitHub), and shared into the group's channel on 2026-10-11.

## What it is

A drop-in Deno fork. It keeps the namespace so existing imports resolve, and strips everything else. `netop://ウィビ` stated that Ende's identity "has been decided" as a runtime "for people who don't want all the extra stuff," serving as "a foundation for TypeScript apps" (2026-10-18).

## Roadmap as published

- No Node compatibility. The post's argument is that it was added for adoption and is not worth carrying.
- Deno Deploy, KV, and Jupyter are dropped.
- Per-module permissions, extending the permission model rather than replacing it.
- Sandboxes for running untrusted code, which is the use case the group's `w` described doing with Deno itself.
- Post-quantum cryptography in Web Crypto.
- Better binary output.

When the post was written, development happened on the author's own infrastructure at `eol.sh` and the post described a soft launch in December 2026. The project has since moved faster than that plan, as the next section records. `netop://ウィビ` also said in `#ende` on 2026-10-12 that `ChronVer` replaces `SemVer`, and that "no more distractions, period" is the scope rule.

## What has shipped

The `#ende` channel was opened for the project on 2026-10-12, and `netop://ウィビ` reported progress there as it happened. Times are UTC.

- **Public repositories, 2026-10-13.** He posted `theende/ende` and `theende/std` (the Ende standard library). The GitHub API read on 2026-10-29 shows `theende/ende` created 2026-10-13, written in Rust, last pushed 2026-10-27, with 116 stars, and `theende/std` created the same day with 6 stars.[^1]
- **Not a GitHub fork.** `CaptainLach` noticed on 2026-10-20 that the repository is not marked as a fork. `netop://ウィビ` said he forked it the ordinary way and then left the fork network in the repository settings, and `CaptainLach` confirmed it still has history. The API on 2026-10-29 reports `fork: false` for both Ende and Dodo.
- **CI.** His first green CI run on 2026-10-14 took over thirty minutes. After applying a set of optimizations an AI assistant suggested (warm caches on the primary branch, lint on Linux only, macOS jobs weekly and on demand, skip CI for documentation-only pushes) it dropped from 34 to 13 minutes by his own two linked runs. macOS jobs now run on Mondays at 06:00 UTC and Linux jobs on every push. See [CI and release cadence](CI_and_Release_Cadence.md).
- **First release, `v2026.10.14`,** announced 2026-10-17. By his description Ende was forked from Deno 2.9.7 with Deploy, KV, Jupyter, and especially Node.js compatibility removed. The release workflow ran for almost an hour. The API on 2026-10-29 shows `v2026.10.22` as the latest release.
- **Publishing and registry.** `ende publish` to JSR worked on 2026-10-15, under the `@ende` scope. See [JSR and the package registry](JSR_and_Package_Registry.md).
- **Documentation, 2026-10-21.** He made an Ende-first static site generator called Satz for the docs, with no npm packages or bundler and no bundled CSS framework, rather than use Lume. The docs went live at `docs.ende.sh`, and a "Coming from Deno" migration guide followed on 2026-10-28.
- **First product built on it.** On 2026-10-24 he said Disc, his schema-first TypeScript database, is the first released product built with Ende, and on 2026-10-22 that Disc and his API for `eol.sh` both ran on it.
- **Presence.** A Mastodon account on 2026-10-25, a Bluesky account on 2026-10-26, and a Lobsters thread he said he was pleasantly surprised was not hostile. `daniellacosse` shared a Reddit thread about Ende on 2026-10-22, and `netop://ウィビ` reported on 2026-10-23 that a comment on it was removed by the moderators.

## How it differs in practice

- **The `Deno` global is aliased,** so existing code that uses it should keep working (2026-10-17).
- **Anything that requests Node errors.** `npm:` specifiers fail with a message that npm packages are not supported. He found on 2026-10-21 that this also applies to dependencies of dependencies, so a project is only portable if nothing in its dependency graph uses `npm:`. He confirmed to `paula` on 2026-10-28 that a JSR package that itself uses npm packages therefore cannot be used either.
- **Not a drop-in replacement.** He said on 2026-10-22 that the homepage needs to make that clear, and `daniellacosse` suggested the image of a dinosaur too big to fit through the front door.
- **No bundling.** `paula` tried Ende for a game on 2026-10-26 and found it works the same as Deno except that it has no bundler: she used `Deno.bundle` to package client code for the browser and for a standalone app, and `Ende.transpile` does not exist (the `ende transpile` command does, but only transpiles TypeScript and JSX, as `daniellacosse` noted, and does not package files together). `netop://ウィビ` pointed out that `compile` produces a single executable. `daniellacosse` observed that `Deno.bundle` just wraps esbuild, so importing esbuild is a possible substitute, and said he also relies on bundling to build routes just in time. `netop://ウィビ` also said on 2026-10-26 that he migrated his blog from Deno to Ende, and `andy` suggested `esm.sh` for packages that used `npm:`.
- **No nightlies or canaries.** He said on 2026-10-14 he saw no point and was ending them. `daniellacosse` answered that some people like them and noted that dynamic extensions would need nightlies to track V8's changes.

## The node-compatibility flag

On 2026-10-28 a participant proposed hiding Node compatibility behind a flag such as `--enable-node`. `daniellacosse` replied that this is roughly the plan for Dodo, toggling features including Node compatibility, but that Dodo had no build yet and was in a holding pattern awaiting a reply from "Bart". `netop://ウィビ` answered that such a flag would be load-bearing: removing Node from Ende took six commits and touched several places. `paula` said node support sits somewhere in between, that supporting npm is good, but some changes are insane, citing a change to `setTimeout` in Deno 2.8. `Summer` noted that losing `node:sqlite`, which Deno implemented natively, would hurt because it avoided needing a C FFI, and `netop://ウィビ` said SQLite is probably a good candidate for Ende's first extension. `daniellacosse` characterized the community as split on Node support with an emerging consensus on embeddability. These are participants' views, not measurements.

## Homepage live, SQLite, and npm migration (2026-10-29 to 2026-11-03)

- **Homepage.** `netop://ウィビ` shared a sneak peek of the new Ende homepage on 2026-10-29, saying he still had to make it responsive before deploying, and then that he had forgotten to add the logo to the footer. `lishaduck` suggested citing the Dahl quote used on it, pointing to a Hacker News item,[^2] so it would read less like a criticism of Deno's direction and more like Dahl's own view; `netop://ウィビ` replied that the "+" below the quote is a link for precisely that reason. On 2026-10-31 he announced: "WE'RE LIVE https://ende.sh".
- **Built-in SQLite.** On 2026-10-31 he said he had received another request for built-in SQLite, so it was on the roadmap. `andy` asked whether it makes sense as part of the runtime rather than a library, saying the requests are probably because "bun does it". `netop://ウィビ` replied that he had not figured that out yet, that scope creep is how Deno got to where it is now, and that if SQLite requires more than what web standards need, built-in makes sense, otherwise he would add it to Ende's standard library. `paula` said it would be good to test a native SQLite implementation against one with FFI, and pointed to `denodrivers/sqlite3`, which she said claims to be faster than `node:sqlite`.
- **Using npm packages without npm support.** `davey` asked on 2026-10-29 how he would use Ende if he relies on npm packages such as drizzle and zod: whether he would need to mirror them onto JSR and potentially fork them to remove Node-isms. The answers in the channel were: use `jsr:@zod/zod` (`paula`), use `esm.sh` (`netop://ウィビ`), and that JSR, regular HTTP(S) imports, and vendoring are all options, each potentially requiring removal of `node:` and `npm:` imports (another participant). On 2026-11-03 `Philakot` said he had noticed Ende will not support npm, wanted to keep using `npm:effect` in a production project after migrating to Ende, and asked whether Ende provides a guide for npm packages; he put the only way as copying the package into the project and adding imports to `ende.json` (or `import_map.json`). `paula` replied that a simple package can go through `esm.sh`, but one needing Node-specific things such as using the `node_modules` folder directly will not work. On 2026-11-04 `netop://ウィビ` replied to `Philakot`, pointing to the [Coming from Deno migration guide](https://docs.ende.sh/runtime/getting_started/coming_from_deno/) and saying that "because of the nature of my fork, breaking up with Node isn't a walk in the park."
- **GitHub Actions.** Asked on 2026-11-02 whether there is a usable Action to use Ende directly in GitHub Actions, `netop://ウィビ` answered: "Not yet!"
- **AI stance.** Asked the same day about his stance on AI, `netop://ウィビ` answered: "AI" does not exist, LLMs do, and he finds LLMs useful. That is his stated view, recorded here because it answers a question put to the project's author in its own channel.

## musl builds, and a text-encoding comparison (2026-11-05)

- **musl builds.** `𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素` asked on 2026-11-05 whether Ende supports musl builds on Linux. `netop://ウィビ` answered: "Nope." Asked what musl builds would add, `CaptainLach` said running in `FROM scratch` docker containers, and the asker said running on musl Linux distributions like Alpine without build hacks, "or at least without re-installing glibc". `daniellacosse` answered: "guys if you have to ask the answer is probably no".
- **Why static linking came up.** `netop://ウィビ` quoted an AI assistant's answer that a fully static musl binary cannot `dlopen`, so `Ende.dlopen`/FFI and Node-API addons would break. `CaptainLach` agreed, because a statically linked binary cannot dynamically link, then added that it can in fact do so if the binary reimplements the necessary mechanisms itself, linking his own post on the subject,[^3] "but in general no". The asker pointed out he had not asked about static linking. `CaptainLach` replied that in most places musl means static linking, even though dynamic linking with it is possible, and asked: "If your goal is not to have a single, portable binary, then why would you link with musl instead of glibc... Musl is not great for normal systems in many aspects, especially its allocator". The exchange establishes only that Ende has no musl build; the claims about what musl would break are the participants', not measurements.
- **Text-encoding labels.** The same participant shared a note testing 288 text encoding labels across JavaScript runtimes, described in its embed as "Text encoding label support per-JavaScript runtime. The ES column indicates whether the label has been defined by the WHATWG encoding standard." The note itself was not read here, so this page records only that it was shared, not what it found.

## DNT, and the Hono fix release (2026-11-05 to 2026-11-06)

- **DNT is the other direction.** `𐑛𐑦𐑕𐑣𐑸𐑥𐑩𐑯𐑦 | 最不調和の伝播者 | 異議の元素` asked in `#ende` on 2026-11-05 whether there was a project called DNT that transpiled Node.js projects into Deno, and whether it was still available. `CaptainLach` corrected him: dnt is the opposite — it allows publishing JSR/Deno packages to npm — and added that, in his view, it never worked properly. The correction is the participants', not a check run here.
- **Hono fix release.** `netop://ウィビ` reported on 2026-11-06 a new Ende release accounting for an issue where someone tried to use Hono with Ende and was blocked: Hono's `middlewares/context-storage` export relies on the `node:async_hooks` built-in, per [theende/ende#10](https://github.com/theende/ende/issues/10). The GitHub API read on 2026-11-07 shows that issue closed, and the release published just before his message was `v2026.11.05` (2026-11-06T00:52Z).[^4] He also said he had updated the CI runners to the latest Node.js versions, and that he has yet to create a GitHub Action for Ende — that is on his TODO now.

## Release v2026.11.06, and TypeScript 7 next (2026-11-06 to 2026-11-07)

- **Release `v2026.11.06`.** `netop://ウィビ` announced it on 2026-11-06, linking the [release](https://github.com/theende/ende/releases/tag/v2026.11.06): security fixes from upstream Deno and updates to dependencies with advisories. DNS resolution is improved on macOS, reading the system config over `/etc/resolv.conf`.[^5]
- **Triaging Deno's backlog.** He said he had triaged Deno's remaining issues and pull requests for relevance to Ende, porting merged fixes his fork base had not caught and open pull requests that fix inherited bugs.
- **TypeScript 7 next.** After these fixes land, he said he will look at adding TypeScript 7 to Ende. He noted Deno had started on a native TypeScript compiler and reverted it, linking [denoland/deno#37088](https://github.com/denoland/deno/pull/37088) and [#37057](https://github.com/denoland/deno/pull/37057): the first removes the native TypeScript compiler module, the second restores the in-process checker as the `deno check` backend.[^6] See [TypeScript 7 and type-aware tooling](TypeScript_7_and_Tooling.md).

## Windows desktop fixes, and a possible release (2026-11-07)

- **WebView2 user data folder.** `netop://ウィビ` reported on 2026-11-07 that upstream desktop issues on Windows are fixed in Ende, linking [commit `fd625c73`](https://github.com/theende/ende/commit/fd625c73ca8dd8e2cd90ade78407fd19b7b2e099): “fix(desktop): give each Windows app its own WebView2 user data folder.”[^7] Laufey's WebView2 backend passes no user data folder, so WebView2 keeps its data next to the exe; under Program Files, where the MSI installs the app, a normal user cannot write there, so the app gets `E_ACCESSDENIED` and a blank window — the same Windows installer problem (`#36768`) `Tadda` cited on 2026-10-17. The fix defaults the folder to `%LOCALAPPDATA%\<identifier>\WebView2`, keyed by the app's reverse-DNS identifier, unless the user set it. See [Deno Desktop and Laufey](Deno_Desktop_and_Laufey.md).
- **A release may follow.** He said he might cut a new release that weekend, with some other fixes he wanted to include. No release was named in the capture.

## Security notes raised in the channel

`Summer`, on 2026-10-27, told `netop://ウィビ` that a repository setting, shown in a screenshot that is not in the capture, needed to be enabled for Ende to accept security reports. He first said it apparently costs money, then that the setting was only complaining because of the organization's one private repository. `Summer` also described two behaviors of Deno's permission model as intentional rather than reportable: `--allow-read` and `--allow-write` scoped to a folder do not restrict where symlinks inside it lead, and the `DENO_PERMISSION_BROKER_PATH` mechanism returns only a yes or no rather than a file descriptor, which `Summer` called open to a time-of-check-to-time-of-use race. `Summer` suggested enforcing the boundary with Landlock on Linux. These are `Summer`'s own claims and were not checked here. `Summer` raised the same points again in `#general` on 2026-11-08, and `SpaceMonkey` answered with fixes queued for his own Deno fork; see [Deno permission-model security](Deno_Permission_Model_Security.md). See [Per-package permissions](Per_Package_Permissions.md) for the group's wider permission discussion.

## Why it matters to the group

It splits the fork question in two. Ende is the stripped fork; the compatibility fork that most of the group said they wanted still has no name, repository, or maintainer. See [Deno fork options and naming](Deno_Fork_Options.md).

The post also supplies the argument for urgency. It points at Disc, Deno's Postgres client, as the pattern to avoid: the team moved to Vercel, the community was handed a blessed fork, and it stopped receiving updates. The post's framing is that a fork organized after the maintainers leave is already late.

## Facts to verify before relying on this page

- The roadmap list above is from the 2026-10-11 post. Of it, removal of Node compatibility, Deploy, KV, and Jupyter is confirmed shipped by the release notes the author linked; per-module permissions, sandboxes, post-quantum cryptography, and better binary output are not shown to have shipped by anything in the record.
- The earlier statement on this page that Ende had no public repository and a December soft launch was true of the 2026-10-11 post and is superseded: the repository was posted on 2026-10-13 and the first release followed on 2026-10-14.
- Star counts, release tags, and push dates above were read from the GitHub API on 2026-10-29 and drift.
- `daniellacosse`'s remark on 2026-10-21 that Ende has more stars than Dodo held when read on 2026-10-29: 116 stars for `theende/ende` against 75 for `are-we-dodo-yet/dodo`.[^1]

## Sources

[^1]: GitHub API, read 2026-10-29: `theende/ende` (created 2026-10-13, 116 stars, last pushed 2026-10-27, latest release `v2026.10.22`), `theende/std` (created 2026-10-13, 6 stars), and `are-we-dodo-yet/dodo` (created 2026-10-12, 75 stars, last pushed 2026-10-21).

[^2]: [Hacker News item 50023277](https://news.ycombinator.com/item?id=50023277): the Dahl quote citation `lishaduck` pointed to on 2026-10-30. The quote's wording and attribution are as presented in that item, not independently checked here.

[^3]: [wine vs champagne](https://delta.rocks/blog/lach-stuff/champagne): the post `CaptainLach` linked on 2026-11-05 for reimplementing dynamic linking inside a statically linked binary. Not read here.

[^4]: GitHub API, read 2026-11-07: `theende/ende` issue #10 ("Hono is not compatible with Ende for lock purposes") closed; release `v2026.11.05` published 2026-11-06T00:52:22Z.

[^5]: [theende/ende `v2026.11.06`](https://github.com/theende/ende/releases/tag/v2026.11.06): the tag page linked in the announcement, confirmed to resolve on 2026-11-08. The GitHub API was rate-limited for unauthenticated reads that day, so the release's published timestamp was not read from the API; the announcement message is timestamped 2026-11-06T23:45:19Z.

[^6]: [denoland/deno#37057](https://github.com/denoland/deno/pull/37057), "revert: type-check with native tsc by default", read 2026-11-08: reverts #35938 to restore the in-process TypeScript checker for `deno check`, as the first step in rolling back the TypeScript migration for compatible canary builds. [denoland/deno#37088](https://github.com/denoland/deno/pull/37088), "revert: remove the native TypeScript compiler module": title and open state read through the GitHub API on 2026-11-08; its merged state was not read.

[^7]: [theende/ende commit `fd625c73`](https://github.com/theende/ende/commit/fd625c73ca8dd8e2cd90ade78407fd19b7b2e099), “fix(desktop): give each Windows app its own WebView2 user data folder”: commit page read 2026-11-09; the diff matches the capture's description, including the `E_ACCESSDENIED` and blank-window failure under Program Files.
