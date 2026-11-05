---
"@type": schema:TechArticle
schema:name: Per-package (module-level) permissions
schema:description: The 2026-10-21 #propose thread in which Varad proposed per-package permission manifests, andy and Matthew objected that modules share one context, and davey and daniellacosse later asked whether separate contexts could make it work, before the conversation moved to the extension-boundary thread.
wazoo:source: dcwg
wazoo:thread: "1562324423615184897"
wiki:priority: medium
---

# Per-package (module-level) permissions

`Varad` opened this post on 2026-10-21 (UTC) with the problem: Deno permissions apply to the whole process, so if an app is granted `--allow-net` and `--allow-read`, every dependency gets them too.

## The proposal

Packages would declare what they need in their manifest, for example a `permissions` object with `read` paths, `net` hosts, `env` variables, and `run` commands. A package would get only what it declared and never more than the app was granted. A second step would make denials name the package, as in `@x/xyz tried to read ~/.ssh/id_rsa not declared`.

`Varad` flagged his own doubts. The main one: if package A passes a function or object to package B, whose permissions apply? The other: what happens to npm packages that have no manifest?

## The objections

- `andy` (2026-10-21): not viable, because modules all share the same context, so code you call into can interfere with code that has higher permissions, for example by prototype pollution.
- `Matthew` (2026-10-21): it would be nice but probably too complicated to be practical for normal things, and would need each module to run in its own process and talk over a serialized format such as JSON.
- `Varad` pointed to [LavaMoat](https://github.com/LavaMoat/LavaMoat), described in the embed as tools for sandboxing a dependency graph, as worth researching. No one in this thread followed up on it.

## The move to the extension thread

On 2026-10-24 (UTC), `daniellacosse` wrote that the conversation had moved to the [sandboxed extension boundary](Sandboxed_Extension_Boundary.md) thread and linked it. That thread is where the same objections and a different framing, per-extension rather than per-module permissions, were argued out.

## Later replies

The thread was revived on 2026-10-24 by `davey`, who asked three things:

- Whether extensions and modules are two different ideas, with extensions reaching a wider surface than JS and TS and modules limited to JS and TS.
- Why the context and globals must be shared, and whether something like `new Worker`, but better, could work, since Deno lets you set permissions as an argument to `Worker`.
- On 2026-10-25, whether the runtime could offer a transparent layer, so a module believes it has the same context but is in fact limited to what its manifest grants. `davey` said they had not looked into the area and thought it would be very cool.

`andy` answered the first two on 2026-10-24 that sharing context is how ES modules work, while extensions do not share it. `daniellacosse` agreed that modules and extensions are different ideas, and said modules cannot be effectively permissioned per package, but that with different contexts it becomes possible.

On 2026-10-27 `daniellacosse` replied to `davey`'s transparent-layer suggestion that he was not sure what `davey` meant, and welcomed a sketch in code or pseudocode of the idea. Nothing came back in the capture.

## Import attributes sketch (2026-10-31)

On 2026-10-31 (UTC) `daniellacosse` revived the thread with a sketch of his own, asking "what if we used this somehow?" and pointing to the import attributes syntax documented by MDN.[^1] His sketch, which he said was not close to final, was:

```ts
import { fetch } from "runtime:fetch" with { newContext: true, net: "[::1]" };
```

He said it should work with another participant's compile-time optimization idea (named in the capture only by Discord user id), throw errors when the wrong attributes are used ("runtime:" only, and requiring an implementation of an IPC layer), and that browsers recognize the syntax. He added that it could potentially load multiple fetches with different permissions:

```ts
import { fetch as localFetch } from "runtime:fetch" with { net: "[::1]" };
import { fetch as extFetch } from "runtime:fetch" with { sandbox: true };
```

This sketch answers `davey`'s 2026-10-27 request for code, but with a different mechanism than the transparent layer `davey` suggested: separate contexts declared per import, rather than one context that believes itself unlimited. No reply to the sketch is in the capture.

## Per-package, not per-module (2026-11-03)

On 2026-11-03 (UTC) `CaptainLach` corrected the record in the same thread: he was never proposing per-module permissions, he was proposing per-package. `daniellacosse` replied that he had not meant to imply `CaptainLach` was proposing per-module; he himself had been trying to move `CaptainLach`'s ideas to the module level, and then dropped that move: "scratch that idea then."

`CaptainLach`'s reason, given the same day, was that ESM modules are deduplicated in the graph, so using `with` attributes for such a thing is "just wrong". `daniellacosse` had reasoned that because `{ type: "json" }` occurs after the module is deduplicated, a similar mechanism might work, with each module `with` instance placed in a sandbox as a sort of post-processing in the way `{ type: "json" }` works. He then said that is a runtime behavior, not a compile-time one, unless the sandbox could somehow be "compiled in" per module. For that he pointed to the TC39 proposal for source-phase imports,[^2] which he said even mentions Deno as a use case. No reply to that pointer is in the capture, and nothing was decided.

## Package scope, and the prototype-pollution warning (2026-11-04)

`davey` revived the thread on 2026-11-04 (UTC), saying per-module or per-package permissions "would be huge". He pointed to how emdash CMS had to go "off the happy path" for plugin isolation, linking a Cloudflare blog post about it,[^3] and to his own project's workers setup as a similar case,[^4] and said he would support any approach that enables isolation natively. He offered to help evaluate options from a developer-experience perspective.

`daniellacosse` answered that the first big decision is package or module: package "makes sense and is the cleanest (doable)", while module is "kinda messy and kinda crazy (compile-in isolates wtf)", but even more flexible. He added that he would hate to do both and support both.

`CaptainLach` then gave the enforcement argument against per-module permissions: you "can't really have per-module permissions, you don't even have a place to put permissions for module in, and no real way to enforce them". The import-attributes `with { }` idea from 2026-10-31 does not work either, he said, because the attributes would somehow need to be unified in the module graph. For packages, by contrast, "you can easily scope permissions to package". He warned to be wary of leaking things through prototype pollution, giving primordials as the example of how to guard against it.

That warning lands on the same ground as `andy`'s 2026-10-21 objection, that modules share one context so code called into can interfere with higher-permission code, but now as an implementation caution for the package-scoped design rather than an objection to it.

## Where it stands

Nothing was decided. The two positions are that per-module permissions are not viable inside a shared context (`andy`, `Matthew`), and that separate contexts might make them possible (`daniellacosse`, `davey`). `daniellacosse` elsewhere called per-module permissions "sadly infeasible" and treated per-extension permissions as a possible middle ground; see the [extension boundary](Sandboxed_Extension_Boundary.md) page for how that fared. The 2026-11-04 exchange narrowed the scope question: package, not module, with `davey` offering to evaluate the options from a developer-experience perspective.

## Open questions

- Whose permissions apply when one package hands a function or object to another. `Varad` raised it and no reply addressed it.
- How npm packages without a manifest would be treated.
- Whether a worker-per-package design is acceptable given the serialization cost raised by `Matthew`.

## Related

- [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md): where this conversation continued, and where CaptainLach described a per-package runtime object.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the extension design that frames the modules-versus-extensions distinction.
- [Deno Core Working Group](Deno_Core_Working_Group.md): the group's position on keeping the permission model.
- [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md): the handles in this thread.

## Sources

[^1]: [Import attributes, MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with#description): the `import ... with { ... }` syntax `daniellacosse` pointed to on 2026-10-31. The `runtime:` specifier and the `newContext`, `net`, and `sandbox` attributes in his sketch are his proposal, not part of the documented syntax.

[^2]: [Proposal to enable importing modules at the source phase](https://github.com/tc39/proposal-source-phase-imports): the TC39 proposal `daniellacosse` pointed to on 2026-11-03. Whether it mentions Deno as a use case is his claim, not checked here.

[^3]: [emdash and WordPress](https://blog.cloudflare.com/emdash-wordpress/): the Cloudflare blog post `davey` linked on 2026-11-04 for how emdash CMS handled plugin isolation off the happy path. Not read here; the claim about what it shows is his.

[^4]: [hotsauce workers README](https://github.com/smallhoursorg/hotsauce/blob/main/packages/workers/README.md): `davey`'s own project, linked on 2026-11-04 as a similar case. Not read here.
