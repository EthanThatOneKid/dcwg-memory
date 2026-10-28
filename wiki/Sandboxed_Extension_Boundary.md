---
"@type": schema:TechArticle
schema:name: Sandboxed extension boundary
schema:description: The 2026-10-22 to 2026-10-25 #propose thread on whether extensions can be sandboxed per extension, the WASI-isolate and separate-isolate designs, why andy holds extensions to be fully trusted, the embeddability and iOS motivation, and CaptainLach's per-package runtime-object alternative.
wazoo:source: dcwg
wazoo:thread: "1562944037135196211"
wiki:priority: high
---

# Sandboxed extension boundary

`netop://ウィビ` opened this post on 2026-10-22 (UTC) with two documents from a conversation with Claude, held in the Ende codebase, about how an extensions API might look in practice: an overview and an "explained simply" version. He noted that the design does not fully bring back Node compatibility in Ende, because there are several layers to that. The documents were public links that required a Claude login to view, so at `daniellacosse`'s request he posted PDF exports. Neither the links nor the PDFs are in the capture, so the proposal itself is known only through what the participants said about it. This page records the discussion, not the documents.

By `daniellacosse`'s later account to `Varad`, the thread's subject is making Deno more pluggable and enforcing permissions per plug, that is, per extension. It is a long thread: `Varad` put it at about 170 messages when he arrived on 2026-10-24.

## The proposal as the thread understood it

`daniellacosse` read the proposal as isolating each extension in its own WASI sandbox, and noted the documents describe extensions that can still do things, though not everything. Beyond that, the thread states two points from the documents with attribution:

- `netop://ウィビ` said that what he agreed with in the documents is an agnostic name for the extension system and a neutral repository and organization for it.
- On 2026-10-24 he posted a further set of screenshots: he started with the shape of an extension in a project and had Claude flesh it out. Per his description, whatever an extension declares, it never overruns what the app allows, and a violation produces an error. Extensions imported from a URL trigger an alert when the contents change, and the extension must be allowed again, backed by a lockfile.

`daniellacosse` said the documents did not seem to cover everything people had discussed, and suggested that a lower-level extension for Deno or Dodo could wrap one of these universal extensions. He asked for a design meeting once another participant's prototype is done, to discuss the tradeoffs of every approach raised, and for an inventory of the extension methods discussed so far.

## The central disagreement: can an extension be sandboxed

`daniellacosse` said he really liked enforcing permissions per extension: load an extension that gives partial Node support and forbid it from writing to disk. He called that a feasible middle ground to per-module permissions, which he called sadly infeasible (see [per-package permissions](Per_Package_Permissions.md)).

`andy` opposed it flatly: per-extension permissions are nearly impossible. His reasoning, in order:

- An extension that sets up globals in a JavaScript prelude must be able to inject JavaScript, so it must at least have the privileges of user code.
- An extension could probably find bugs in native system functions and, with enough effort, corrupt memory and escalate.
- So extensions are assumed fully trusted. They are the gatekeepers of permission. Telling a developer an extension is sandboxed would be "a straight-up lie", and there would be many sandbox escapes.

`daniellacosse` answered that this holds for native extensions, but the proposal isolates each extension in a WASI sandbox. `andy` asked what the point is of a wasm-only extension that cannot do anything. `andy` then described his preferred native design: extensions get one basic function that calls system libraries directly, using a `nativeCall` with a library, a method, and arguments, with `kernel32.dll` `WriteFile` as the example, instead of many Rust ops, because operating systems are complicated and the op list would be enormous. `netop://ウィビ` replied that working backwards from how that hooks into Dodo would produce something like what he proposed. `andy` disagreed.

`andy` also raised bloat: if the core must provide all of these methods to extensions, the core is big again. `netop://ウィビ` said that "all these methods" isn't bloat, and `andy` conceded it is not bloated but still big.

## Separate isolates instead of WASI

`daniellacosse` asked whether, instead of bridging V8 and wasmtime, the runtime could stand up an entirely separate V8 instance per extension and communicate by IPC. `andy` replied that V8 supports wasm fine and that there should be no problem. `w` replied that a separate instance is more or less what you have to do, and that it is what he does in his own MUD client. `daniellacosse` thought JSC (JavaScriptCore) is more memory efficient than V8, which makes one instance per extension not terrible, but called it a product question: whether per-extension permission is worth the memory and complexity.

- **Proxy stubs.** `daniellacosse`'s sketch: calling `fetch` in the main isolate would be a proxy stub that makes an IPC call to an isolate that holds the net permission and the real implementation. `andy` objected that much data does not pass nicely over IPC, and that a thin layer declared on the user-code side is nicer. `w` added that everything crossing isolates goes through the structured clone algorithm, which is not great for general-purpose flow, though IPC is not that bad if extensions cooperate in an actor-model style.
- **Callbacks.** `w` raised the question that stayed open: if extension A is called from extension B with a callback, does the callback run with A's permissions or B's? `daniellacosse` had been considering the naive case, and thought such a callback would stay in the main process, though not always.
- **Memory.** On the cost, `w` measured about 10 MB of heap per isolate added to a fully initialized Deno with all extensions, a ceiling that falls if extensions are cut back. `daniellacosse` cited 2 to 5 MB per JSC instance from what he had read. Neither claim is verified here: `w`'s is a self-reported measurement, and `daniellacosse`'s is from reading.

`daniellacosse` summarized that the design had moved from impossible to very difficult, and that the question is whether it is essential, probably with untrusted extensions. `w` agreed: with a concept of untrusted extensions, probably. `w` was also "squirming" over whether it is necessary at all.

## Why have extensions at all

`w` said he was not even fully convinced of dynamic extensibility, because the cold-start saving he saw from a prebuilt snapshot is recent and large. He thought fingerprinting and caching heap snapshots could work around it, but tricky. `daniellacosse` explained that for him extensibility is part of the embeddability direction: when he tried to compile Deno for iOS, core compiled but some extensions were easy and some were not. He first suggested dropping the hard extensions, then reversed himself: each iOS app declares the features it uses in its provisioning profile, so shipping every extension would require declaring every feature, which in his words is a good way to get Apple not to accept the app. These iOS claims are `daniellacosse`'s account of his own experience and were not checked here.

`w` suggested the default be a package manifest where everything is included unless a package lists what it wants; `daniellacosse` said that had been discussed elsewhere and he was in favor. `daniellacosse` then floated publishing a separate static "mobile" build that cuts a lot out. `w` liked it, noting it makes a switch target much more concrete. `daniellacosse` argued this reaches embeddability sooner, which he thought a key sell to bring people back: people come back, funding follows, then the harder problems. `w` added that embeddability plus permissions could be the pitch, and that the JavaScript ecosystem lacks an answer to Lua with its standard library: embedding Node is not safe and embedding V8 alone gives no useful library. He said that is part of why he likes Node compatibility, as a non-blocking analog to Lua's standard library, with permissions.

`netop://ウィビ` asked why have extensions at all if people could write JSR modules. `daniellacosse` answered that JSR has no access to native, though perhaps it could be given some. `andy` gave the case for extensions:

- They keep the runtime simple and extensible, so a feature such as Node support is opt-in without bloating things.
- The extension checks permissions, so user code does not get to do FFI directly without a special FFI permission.
- They can hook into the module loader.
- They can add APIs such as a system keyring without forking the runtime.

`netop://ウィビ` said he was still having trouble listing potential extensions from Ende's perspective, and that in the browser space they make sense because vendors cannot anticipate everything.

## Trust, signing, and community extensions

- `daniellacosse` asked whether sandboxing matters only if the group wants to promote community extensions, and otherwise is a nice-to-have. `andy` answered that he does not think the group wants to promote community extensions, and that they should be a stop-gap until merged into the builtins. He also said that most extensions should be built in and officially supported, and the few others thoroughly vetted. `netop://ウィビ` replied that "should" is doing a lot of heavy lifting. `andy` added that `--allow-all` still exists and that Dodo is not a magic bullet.
- `daniellacosse` said that if a funded foundation does not materialize soon, he leans toward community extensions, and that his current guess is that a foundation, if one arrives, will be "kinda life-support-y". Both are his opinion, stated as such.
- He listed what he wants extensions for: embeddability, especially of web servers, for provisioning profiles and binary size; distributing and reducing maintenance cost through community extensions; and custom runtimes, such as swapping `console` for a `sentry_console`. He noted some extensions would have to be closed source where APIs are not open, and that someone might want to pin an extension version.
- He proposed signed extensions, with an override to run untrusted ones at one's own risk, with the argument that good enough for many raises money, which makes it good enough for all. `lishaduck` asked whether signing would be paid; `daniellacosse` said it could be, though he had in mind more users meaning more potential donors. `netop://ウィビ` recalled seeing software signed via atProto and on 2026-10-25 found it: [ListeningPost/open-firmware-manager](https://github.com/ListeningPost/open-firmware-manager), described in its embed as a simple example of encrypted open firmware management using a PDS to sign firmware.

`netop://ウィビ` also said, after a chat with DeepSeek, that Ende is close to done: after his short roadmap it is maintenance, and a large user base is unlikely without Node and npm, leaving enterprise and "weirdos like me". `daniellacosse` replied that he is a backstop, since there will be at least one Deno-like runtime because of him.

## CaptainLach's alternative: a runtime object per package

`CaptainLach` joined on 2026-10-23, saying he had missed the thread. He asked what the point of writing extensions in wasm is if they end up using `Deno.open()`-like APIs, and why an extension cannot be a normal library that registers global polyfills before everything else starts. He argued that limiting extensions to WASI does nothing for Deno's current security model, and that the whole described model fits "per-package permissions/grants". `netop://ウィビ` asked whether he meant special JSR modules; he said yes, ones that are always preloaded.

His design: give each package its own runtime object. It is easier to explain with imports than globals. Instead of the `Deno` global, a package would reach the runtime with an import such as `deno:rt`, and the resolver, which already exists for import maps, would return a different module to different packages. A package granted only `/tmp` filesystem writes would get a `fs.write` that asserts the path and a `net.serve` that fails; another would get the reverse. Both would be generated from a package's permissions by a function along the lines of `runtimeForPackagePermissions`. He labeled his code pseudocode, noting `__bootstrap` would not be so accessible from such modules, and `netop://ウィビ` called it fugly. The point, in his words: the permissions model can be implemented by returning a different runtime to different packages.

`andy` asked how a leaked `__bootstrap` could cause vulnerabilities. `CaptainLach` answered that many Deno Rust ops check permissions themselves, but not every op is exposed directly because JavaScript mediates access; a leaked `__bootstrap` can be used, for example, to reuse resource ids badly, which is why Deno's APIs do not expose rids and why built-in extensions use primordials. He added that impersonation is possible only if a package leaks the object, such as by not using primordials properly, and that Deno itself works this way, with bypasses available to someone who can steal `__bootstrap`.

On 2026-10-24 he also summarized `netop://ウィビ`'s second design as "every extension is just a webworker with its API described with webidl so the shims can be implemented in primary worker". `netop://ウィビ` said it did not know WebIDL but that an extension matching the shape should work, then read the [Web IDL](https://webidl.spec.whatwg.org) specification.

## Context for newcomers

On 2026-10-24 `Varad` arrived, wanting a runtime where every package is isolated like a website in a browser, and asked what the group is doing, what the plan is, and each contributor's role. `daniellacosse` replied that the plan lives in a separate proposals channel of which an extensions proposal is a part, and that the group was in a holding pattern waiting to hear back from a co-creator of Deno, called "bart" in the thread, about foundation progress. That is `daniellacosse`'s statement; this page does not confirm it.

## Where it stands

Nothing was decided, and no design was adopted. The state of the argument:

- **Per-extension permissions** are rejected by `andy` as infeasible because extensions are trusted by construction, and `w` judged them very difficult. `daniellacosse` and `w` leaned toward needing sandboxing if untrusted extensions exist.
- **A static mobile build** found support from `daniellacosse` and `w` as the faster route to embeddability.
- **Per-package runtime objects** were proposed by `CaptainLach` as a way to get the permission model without extensions as a security boundary, with no recorded verdict from `andy` or `w`.
- `netop://ウィビ` said he might publish examples that weekend.

## Open questions

- Whether untrusted extensions are in scope at all, which `andy` and `daniellacosse` answered differently.
- Whose permissions apply to a callback passed between extensions.
- Whether per-extension isolates are worth roughly 10 MB each on desktop, against `w`'s own measurement.
- Whether `CaptainLach`'s package-scoped runtime object can be made safe against leaked internals.
- Whether dynamic extensibility survives `w`'s cold-start finding.
- What the missing proposal documents say beyond what the thread reports.

## Related

- [Per-package (module-level) permissions](Per_Package_Permissions.md): the thread this one grew out of.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the 2026-10-11 minimal-core-with-extensions design this thread tests.
- [Ende runtime](Ende_Runtime.md): the fork `netop://ウィビ` is building, and the codebase the proposal was drafted in.
- [Prior art for a minimal-core runtime](Prior_Art_Runtimes.md): existing runtimes that already answer parts of the extension question.
- [Deno Core Working Group](Deno_Core_Working_Group.md): the group's stance on keeping the permission model.
- [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md): the handles in this thread.
