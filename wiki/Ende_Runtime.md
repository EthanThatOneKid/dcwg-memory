---
"@type": schema:SoftwareApplication
schema:name: Ende
schema:description: A planned drop-in Deno fork by Paul Anthony Webb that keeps the namespace for compatibility and drops Node compatibility, Deno Deploy, KV, and Jupyter; not public yet, soft launch planned for December 2026.
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

A drop-in Deno fork. It keeps the namespace so existing imports resolve, and strips everything else.

## Roadmap as published

- No Node compatibility. The post's argument is that it was added for adoption and is not worth carrying.
- Deno Deploy, KV, and Jupyter are dropped.
- Per-module permissions, extending the permission model rather than replacing it.
- Sandboxes for running untrusted code, which is the use case the group's `w` described doing with Deno itself.
- Post-quantum cryptography in Web Crypto.
- Better binary output.

Development happens on the author's own infrastructure at `eol.sh`. The project is not public, and the post describes a soft launch in December 2026.

## Why it matters to the group

It splits the fork question in two. Ende is the stripped fork; the compatibility fork that most of the group said they wanted still has no name, repository, or maintainer. See [Deno fork options and naming](Deno_Fork_Options.md).

The post also supplies the argument for urgency. It points at Disc, Deno's Postgres client, as the pattern to avoid: the team moved to Vercel, the community was handed a blessed fork, and it stopped receiving updates. The post's framing is that a fork organized after the maintainers leave is already late.

## Facts to verify before relying on this page

- Ende has no public repository as of 2026-10-11, so every roadmap item above is a stated plan, not shipped behavior.
- The December soft launch is the author's own schedule.
