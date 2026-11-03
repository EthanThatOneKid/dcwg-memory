---
"@type": schema:TechArticle
schema:name: JSR and the package registry
schema:description: What the 2026-10-16 to 2026-10-21 #ende discussion recorded about JSR's rate limits, publishing quotas and stuck packages, whether Dodo should run its own registry, and who owns the standard library.
wazoo:source: dcwg
wiki:priority: medium
---

# JSR and the package registry

JSR is the package registry Deno's ecosystem publishes to, and it is where Ende publishes. This page records what `#ende` participants said about it between 2026-10-15 and 2026-10-21 (UTC). Experiences with JSR are the participants' own and mostly could not be checked here.

## Limits and failures people reported

- **A weekly publishing quota.** `netop://ウィビ` said new packages were limited to 20 per week. He asked JSR for an increase, and on 2026-10-17 reported the reply: the new-packages-per-week quota for scope `@ende` had been raised from 20 to 100, though he had asked for 50. `daniellacosse` took it as a sign that "we can rely on somebody other than ourselves."
- **Rate limits on the website.** `netop://ウィビ` said JSR has aggressive rate limits, and that linking GitHub repositories while updating several packages locks him out for a while. `Doctor 🤖` said the limit is on HTTP requests in general, that he thought it is about 60 requests per minute and that some pages consume many requests, and linked a JSR issue about it (`jsr-io/jsr` #1467). That figure is `Doctor 🤖`'s belief. `davey` joked that a five-dollar VPS can handle tens of thousands of requests per second.
- **Packages stuck as pending.** `CaptainLach` said on 2026-10-17 that four of his packages were stuck pending with no reply from support, and linked `jsr-io/jsr` #1554. `suprstarrd` replied on 2026-10-20 that a fix had landed the day after his post.

## Complaints and the response

`netop://ウィビ` called JSR's user experience janky when deploying and changing package settings, with screenshots of dropdowns that shift on load and of pages that need a hard refresh. `andy` replied that JSR deploying is "a breeze" and much easier than npm, and that such problems could be addressed with a pull request to the open repository, adding that PRs had been merged as recently as five days earlier, mostly by `crowlKats`. `netop://ウィビ` characterized the repository as a list of ignored PRs. The record does not show whether anyone checked.

`andy` also said he switched away from npm when it started requiring two-factor authentication without letting him use authenticator codes, which he took to mean a physical security key, and that this is why he moved to JSR. `netop://ウィビ` said he used a passkey stored in a password manager, and on 2026-10-23 conceded `andy` had been right about npm requiring a passkey in his own case. `CaptainLach` argued security keys are good and named the brand he uses. This is a personal-workflow aside, recorded only because it explains why `andy` publishes to JSR.

## Whether Dodo should run a registry

`daniellacosse` joked about a Dodo package repository, and `w` asked whether it could be out of Dodo's scope, since much of `@std` is built on open web standards and is not Deno-specific, and since the parts that stitch together Deno and Node compatibility would be better served by guaranteeing support for everything in `jsr:@std`. Several answers:

- `daniellacosse` said he would prefer not to take on JSR, and that there is an opportunity for the Dodo, [Ende](Ende_Runtime.md), and Andromeda projects to collaborate on a shared standard library.
- `w` listed from the JSR compatibility icons which `@std` modules are Deno-specific (`cli`, `dotenv`, `fs`, `http`, `io`, `log`, `net`, `tar`, `testing`), saying he was reading the icons.
- `Doctor 🤖`, who said he wrote some of the implementations in `@std`, replied that `@std/tar` is not Deno-specific and uses web standards only, but does not work in Safari because Safari does not support readable byte streams. That is `Doctor 🤖`'s account and was not checked.
- `netop://ウィビ` pointed to `theende/std` as already solid, though not everything is on JSR yet, and said Dodo and Andromeda would need to add Node compatibility back to use it.
- `w` said he wished for a URL scheme meaning "a GitHub release of this repository, with my version string treated as a semver pattern against release names, filtered to immutable releases," which would greatly reduce the need for a registry. `andy` noted that direct GitHub release URLs already exist.
- `andy` wished that WinterTC would standardize APIs like file I/O across runtimes, but said it standardizes only things like command-line arguments.

## Ende and private registries

`netop://ウィビ` said his frustration with JSR led him to put a package manager on his roadmap, at `pm.ende.sh` instead of a new domain, because it seems odd to him that npm and JSR live apart from their frameworks. On 2026-10-21 `CaptainLach` pointed out a consequence of Ende rejecting `npm:` specifiers: proper private registries are out unless someone adds multi-registry JSR support and forks JSR so that it no longer depends on Google Cloud, which he described disparagingly. `netop://ウィビ` said he intends to fork JSR at some point, but not yet. `Stag Math` said he thought Cloudflare is supposed to continue to manage and support JSR. That belief was not checked here. `daniellacosse` answered that `Stag Math` did not understand `netop://ウィビ`, in the sense that forking JSR is just the kind of project he would take on, and `netop://ウィビ` agreed, "I'm insane."

On 2026-10-30 a newcomer offered in `#brainstorm` to help maintain the standard library and official TypeScript packages. `daniellacosse` replied that the group has discussed sharing `@std` ownership with the `#ende` and `#andromeda` channels and pointed them there. That is the first record of anyone volunteering for the shared-standard-library idea; no owner has been named.

## Open questions

- Whether JSR's pending-package and rate-limit problems are fixed or only worked around for a few scopes.
- Whether Dodo, Ende, and Andromeda actually share a standard library, which only `daniellacosse` and `netop://ウィビ` discussed and nobody scheduled.
- Where standard libraries end and extensions begin, which is the subject of [Standard libraries and extensions](Std_Libraries_and_Extensions.md).

## Related

- [Ende](Ende_Runtime.md): publishes to JSR under `@ende`.
- [Standard libraries and extensions](Std_Libraries_and_Extensions.md): the boundary this discussion led into.
- [Sustaining the fork](Fork_Sustainability.md): who pays for shared infrastructure.
