---
"@type": schema:TechArticle
schema:name: TypeScript 7 and type-aware tooling
schema:description: The 2026-10-17 to 2026-10-21 discussion of how a Dodo fork keeps up with TypeScript 7, the Rust port tsrs, and what type-aware linting needs, and why TypeScript upgrades fall outside Deno's promised maintenance.
wazoo:source: dcwg
wiki:priority: low
---

# TypeScript 7 and type-aware tooling

A fork of Deno inherits Deno's TypeScript support as it stood at the fork point. This page records how `#general` participants discussed keeping up with TypeScript 7 and its Rust ports. Times are UTC.

## The gap

`lishaduck`, who described himself as a tooling maintainer, asked on 2026-10-17 whether the group had thought about TypeScript 7. He had been excited by a move in Deno 3 to a type-information mechanism he called `sync-types`, which would enable type-aware linting for Deno, and noted that if Dodo is forked from 2.9.7 it does not inherit that. `daniellacosse` said the group had not thought about it, that from what he knew it would not be trivial, and that he would add it to the roadmap if nobody objected. `w` said that as a decision item it belongs on the roadmap.

`lishaduck` clarified he was not saying the group should adopt `sync-types` wholesale, only that "something will need to be done," and that he does not think forking patches of forks is a healthy undertaking. `daniellacosse` observed that the upgrade sneakily feels like part of Deno's promised "12 months of maintenance and bug fixes" but is not, "so we're on our own," which he thought is why nobody, himself included, had raised it. The roadmap's far list now names V8 and TypeScript features among the dependency updates Dodo wants to be able to author; see [Dodo project roadmap](Project_Roadmap.md).

## tsrs

On 2026-10-20 `netop://ウィビ` shared a Cloudflare blog post introducing `tsrs`, described in its embed as a Rust port of TypeScript that is up to eight times faster and uses 70 percent less memory. `daniellacosse` linked its crates and told `lishaduck` it might be the way forward on future TypeScript support. The repository `oxc-project/tsrs` is described on GitHub as a "Rust port of the TypeScript 7 type checker"; read on 2026-10-29 it had about 2,500 stars and a push the day before.[^1] The speed and memory figures are the blog's, not checked here.

`lishaduck`'s view was that it is "pretty much ideal from a technical standpoint" for his tooling, and a decent option if the group stays with unforking, since there is no Go runtime to embed. He said he was watching how well it is stewarded, and guessed it will last because it serves `oxlint`, while noting it was brand new. `daniellacosse` agreed it was too early but worth watching. `CaptainLach` hoped its stewards would not "do anything stupid like bun," pointing to a post from Bun about language changes if TypeScript types become real, and `lishaduck` answered that it is in their best interest not to diverge much. A tangent followed about a library called Effect and an `ESLint` limitation that led its fans to fork the Go-based compiler to add checks; `CaptainLach` said he did not see why, since to him it is mostly web streams but worse. None of this bears on a decision.

## Open questions

- Whether Dodo adopts TypeScript 7, a Rust port, or stays on Deno's current support, and when.
- Whether type-aware linting is in scope. It is `lishaduck`'s interest, and nobody else weighed in.
- Who owns the decision. `w` called it a decision item; nobody has taken it.

## Related

- [Dodo project roadmap](Project_Roadmap.md): the far goal of authoring its own dependency updates.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): the rewrite that would change which dependencies matter.

## Sources

[^1]: [`oxc-project/tsrs`](https://github.com/oxc-project/tsrs), read through the GitHub API on 2026-10-29: described as a Rust port of the TypeScript 7 type checker, created 2026-10-01, about 2,500 stars, last pushed 2026-10-28.
