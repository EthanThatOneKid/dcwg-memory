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
- **No nightlies or canaries.** He said on 2026-10-14 he saw no point and was ending them. `daniellacosse` answered that some people like them and noted that dynamic extensions would need nightlies to track V8's changes.

## The node-compatibility flag

On 2026-10-28 a participant proposed hiding Node compatibility behind a flag such as `--enable-node`. `daniellacosse` replied that this is roughly the plan for Dodo, toggling features including Node compatibility, but that Dodo had no build yet and was in a holding pattern awaiting a reply from "Bart". `netop://ウィビ` answered that such a flag would be load-bearing: removing Node from Ende took six commits and touched several places. `paula` said node support sits somewhere in between, that supporting npm is good, but some changes are insane, citing a change to `setTimeout` in Deno 2.8. `Summer` noted that losing `node:sqlite`, which Deno implemented natively, would hurt because it avoided needing a C FFI, and `netop://ウィビ` said SQLite is probably a good candidate for Ende's first extension. `daniellacosse` characterized the community as split on Node support with an emerging consensus on embeddability. These are participants' views, not measurements.

## Security notes raised in the channel

`Summer`, on 2026-10-27, told `netop://ウィビ` that a repository setting, shown in a screenshot that is not in the capture, needed to be enabled for Ende to accept security reports. He first said it apparently costs money, then that the setting was only complaining because of the organization's one private repository. `Summer` also described two behaviors of Deno's permission model as intentional rather than reportable: `--allow-read` and `--allow-write` scoped to a folder do not restrict where symlinks inside it lead, and the `DENO_PERMISSION_BROKER_PATH` mechanism returns only a yes or no rather than a file descriptor, which `Summer` called open to a time-of-check-to-time-of-use race. `Summer` suggested enforcing the boundary with Landlock on Linux. These are `Summer`'s own claims and were not checked here. See [Per-package permissions](Per_Package_Permissions.md) for the group's wider permission discussion.

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
