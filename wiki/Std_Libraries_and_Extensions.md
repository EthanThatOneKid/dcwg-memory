---
"@type": schema:TechArticle
schema:name: Standard libraries and extensions
schema:description: The 2026-10-16 #ende discussion of where a standard library ends and a runtime extension begins, whether the forks could share a Runtime global, and how a project would declare the extensions it needs in a manifest.
wazoo:source: dcwg
wiki:priority: medium
---

# Standard libraries and extensions

On 2026-10-16 (UTC) a question about whether Dodo should own a package registry (see [JSR and the package registry](JSR_and_Package_Registry.md)) turned into the most direct exchange in the record about what an extension is. `w` asked it rhetorically: what is Deno's set of extensions, other than a library of standard libraries? `daniellacosse` said he had been thinking the same and had no answer yet. Nothing was decided.

## Drawing the line

- **`daniellacosse`'s rule of thumb.** It is probably as simple as this: standard libraries can run across Deno-like runtimes, and extensions are Dodo-specific. He noted this implies that certain standard libraries depend on certain extensions.
- **`andy`'s version.** Extensions come with the runtime by default. Standard libraries are wrappers around primitive runtime behavior and JavaScript APIs such as streams, and are relatively easy to reimplement yourself, while file I/O is not. His examples of extensions: file I/O, `dodo.serve`, Node support, Dodo desktop.
- **`w`'s counterpoint.** Node support is the Node.js standard library if npm and CommonJS support are treated as adjacent but separate. `andy` replied that Node support is more than a library: it includes module-loader support and injection into all scripts. He then conceded that `require` and the `process` global could be a window-level polyfill, which he called janky. `w` said you do not need CommonJS to allow `import 'node:fs'`. A day earlier, on 2026-10-15, `w` had observed that several Node modules, crypto for one, are self-contained and initialize themselves in the global namespace using native functions only the init script can reach, and `daniellacosse` had suggested someone write the list of which is which. Nobody has.

## Why `andy` wants separate realms

His security argument was that if file I/O were a standard-library feature in the main JavaScript context that talks directly to native system calls, user code could make native calls too. So extensions and user code must be in different realms, and only extension realms may use native APIs. `w` answered that this need not differ from today: both Deno's global-namespace wrapper for file system methods and `node:fs` reach their native code through Deno's permission checks. `andy` replied that Deno implements file I/O and the permission check inside its Rust ops, whereas the extension design moves nearly all complexity into JavaScript apart from managing the runtime, so that anyone could write an extension to do anything without waiting for ops to be implemented, and to keep the core lightweight. The follow-up argument about whether extensions can be sandboxed at all is in [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md). `w` also said that `deno_runtime` is "pretty vacant extension-wise".

## A shared Runtime global

`andy` raised that, if the group is standardizing with Andromeda and [Ende](Ende_Runtime.md), they could agree on a common `Runtime` global. `w` said that is what he was getting at, and `daniellacosse` said he is a huge fan of something like `globalThis.runtime.*`, though it would need to stay backward compatible. The record shows no agreement from Andromeda's or Ende's side in this exchange.

## Declaring extensions in a manifest

`daniellacosse` sketched, "way down the road," that modules could declare the extensions they depend on in a `runtime.jsonc`, with a missing file defaulting to the classic set of extensions, and the feature flags unioned at compile time or dynamically. `w` liked a manifest approach. `andy` said it would be more like `dodo.json`, because extensions are Dodo-specific, with the runtime checking `deno.json`, `dodo.json`, and `package.json`.

`w` added that he would not mind embracing `package.json`, supporting `deno.json` for compatibility, and defaulting to behavior similar to a `deno.json` containing only `"preferPackageJson": true`, unless the group has something really novel to put in a new format. `andy` agreed that `package.json` is not very Node-specific, and that the only real problem is that editors apply the Node JSON schema and give no IntelliSense for fields like an `extensions` array. `w` said that could be patched with editor extensions but found it distasteful.

## Open questions

- Where the line between standard library and extension falls in practice. The only stated rule is `daniellacosse`'s, and `w` and `andy` disagreed about Node support's place on it.
- Whether a manifest is `runtime.jsonc`, `dodo.json`, or a field in `package.json`.
- Whether the forks adopt a common global.

## Related

- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the 2026-10-11 minimal-core design these questions follow from.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): `andy`'s prototype, where extensions are loaded.
- [Sandboxed extension boundary](Sandboxed_Extension_Boundary.md): whether extensions can be sandboxed.
- [CI and release cadence](CI_and_Release_Cadence.md): the build-time argument for dynamic extensions.
