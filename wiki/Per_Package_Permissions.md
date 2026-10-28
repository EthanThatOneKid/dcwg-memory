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

## Where it stands

Nothing was decided. The two positions are that per-module permissions are not viable inside a shared context (`andy`, `Matthew`), and that separate contexts might make them possible (`daniellacosse`, `davey`). `daniellacosse` elsewhere called per-module permissions "sadly infeasible" and treated per-extension permissions as a possible middle ground; see the [extension boundary](Sandboxed_Extension_Boundary.md) page for how that fared.

## Open questions

- Whose permissions apply when one package hands a function or object to another. `Varad` raised it and no reply addressed it.
- How npm packages without a manifest would be treated.
- Whether a worker-per-package design is acceptable given the serialization cost raised by `Matthew`.

## Related

- [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md): where this conversation continued, and where CaptainLach described a per-package runtime object.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the extension design that frames the modules-versus-extensions distinction.
- [Deno Core Working Group](Deno_Core_Working_Group.md): the group's position on keeping the permission model.
- [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md): the handles in this thread.
