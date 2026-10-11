---
'@type': schema:SoftwareApplication
schema:name: Deno
schema:description: A JavaScript, TypeScript, and WebAssembly runtime built on V8 and Rust, created by Ryan Dahl and Bert Belder, whose own development ends about a year after Cloudflare acquired Deno Land Inc. on 2026-10-09.
schema:applicationCategory: DeveloperApplication
schema:license: https://opensource.org/license/mit
schema:sameAs:
  - https://github.com/denoland/deno
  - https://deno.com
  - https://deno.land
wazoo:source: dcwg
wiki:priority: high
---

# Deno

A JavaScript, TypeScript, and WebAssembly runtime built on V8 and Rust, created by Ryan Dahl and Bert Belder. Deno 1.0 shipped in May 2020. It is MIT licensed, and the runtime is a single executable that also acts as its own package manager.

## What happened

On 2026-10-09 Cloudflare announced it is acquiring Deno, and the whole Deno team is joining Cloudflare. The announcement post is signed by Kenton Varda and Ryan Dahl and frames the move around self-hosting Workers and Durable Objects. Cloudflare did not disclose terms; Deno had raised $26M in total, including a $21M Series A led by Sequoia in 2022.

The part that matters to anyone building on Deno was not in the Cloudflare post. Deno stated separately that it will ship monthly bug-fix and security releases for one more year, then end its own development of the runtime, and that it welcomes others to continue it. The runtime stays open source.

## The clock, by product

| Product            | Plan                                                                                         | Horizon                                                 |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Deno CLI / runtime | Maintenance only: monthly bug-fix and security releases, then Deno ends its own development  | about one year from 2026-10-09, so roughly October 2027 |
| Deno Deploy        | keeps running, then shuts down; paying customers get migration support to Cloudflare Workers | about six months, so roughly April 2027                 |
| JSR                | continues; infrastructure moves to Cloudflare                                                | no end date announced                                   |
| `rusty_v8`         | continues, with work toward integrating it into `workerd`                                    | no end date announced                                   |

Deno Deploy Classic is a separate, earlier sunset and was already listed for 2026-07-20, before this announcement.

The technical centerpiece of the acquisition is `celld`, Deno's August 2026 self-hostable implementation of Workers and Durable Objects, which Cloudflare wants for self-hosting. Cloudflare is buying the team and that project more than the runtime.

## State of the estate

Checked live on 2026-10-11:

- `denoland/deno`: 108,758 stars, MIT, last push 2026-10-07, two days before the announcement. Not archived.
- `denoland` organization: 235 public repositories, still the home of `deno` and `rusty_v8` (4,007 stars, "Rust bindings for the V8 JavaScript engine").
- `deno_core` on crates.io: last published 2026-09-16.

Nothing has moved yet. The repositories, the crates, the JSR scopes, and the `deno.com` domain are all still Deno's, and no handoff has been agreed or announced.

## Why it matters to the working group

An MIT runtime that nobody will develop is not dead code, it is an unowned one. The pieces that need an owner are the ones that cannot be re-derived from the source: the trademark, the registry scopes, the crate ownership, and the signing keys behind binary distribution. [[Deno_Runtime_Handoff]] works through which of those can move. [[Fresh_Framework_Migration]] is the one precedent the group has for a project that did move out of `denoland` cleanly.

## Sources

- [Deno is joining Cloudflare](https://deno.com/blog/cloudflare), Deno, 2026-10-09. The source of the release schedule and the runtime, Deploy, JSR, and `rusty_v8` commitments quoted above.
- [Deno is joining Cloudflare](https://blog.cloudflare.com/deno-joins-cloudflare), by Kenton Varda and Ryan Dahl, Cloudflare, 2026-10-09.
- [Deno team joins Cloudflare as runtime development and Deploy hosting face an end](https://www.moneymakers.com/articles/news/deno-team-joins-cloudflare-runtime-deploy-transition)
- [Deno joins Cloudflare: runtime sunset and developer reactions](https://aiidelist.com/blog/deno-joins-cloudflare-runtime-sunset-astro-vite-developer-reactions)
