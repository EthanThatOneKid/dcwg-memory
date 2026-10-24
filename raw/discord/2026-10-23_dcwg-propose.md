---
title: "Discord #propose — 2026-10-23"
source: "Discord REST API, channel 1559218298128695386, UTC timestamps"
channel_type: forum
author:
  - "daniellacosse"
  - "netop://ウィビ"
  - "andy"
  - "CaptainLach"
  - "Varad"
created: 2026-10-23
description: "Append-only capture of #propose from 2026-10-23T18:08:59Z to 2026-10-24T15:47:00Z, pulled from the Discord REST API. 172 messages, 5 participants, across 3 threads."
tags:
  - "deno"
  - "dcwg"
  - "discord"
---

Append-only capture of `#propose` in the Deno Core Working Group Discord, 2026-10-23T18:08:59Z to 2026-10-24T15:47:00Z. Pulled from the Discord REST API, not pasted from a client, so every timestamp below is the server's own UTC timestamp and every message carries its snowflake id. Message text is reproduced verbatim, including typos. Bot and webhook messages are omitted. Attachment and embed URLs are recorded as sent; they may expire. Threads are grouped under their own headings below, and a forum post's body is the first message under its heading.

---
## [REWRITE] Rust-Core and Typescript Extensions (thread 1559219836297547847)

**andy** — 2026-10-23T19:35:28Z (`1563274682554261537`)

https://www.tldraw.com/p/_scSgryMNL1ijyT2nS9Ic?d=v-111.-62.1286.1113.page

_(2026-10-23T19:35:50Z `1563274774250258543`)_

i put together my thoughts about rust-core


**CaptainLach** — 2026-10-23T19:59:10Z (`1563280648674873485`)

> ↳ replying to andy: deno.dlopen can be polyfilled

No? It's kinda a lowest level primitive

_(2026-10-23T19:59:35Z `1563280751015895071`)_

Deno.dlopen creates JIT-optimised JS wrappers for system library calls

_(2026-10-23T20:00:15Z `1563280918079213630`)_

> ↳ replying to andy: https://www.tldraw.com/p/_scSgryMNL1ijyT2nS9Ic?d=v-111.-62.1286.1113.page

Also trying to limit access to system apis using core is kinda futile

_(2026-10-23T20:00:55Z `1563281087252140245`)_

I mean, how do you propose core to understand from your fnctl/ioctl calls?

_(2026-10-23T20:02:17Z `1563281431470280877`)_

> ↳ replying to CaptainLach: I mean, how do you propose core to understand from your fnctl/ioctl calls?

I don't think it makes sense to move most of the deno ops to the extensions

_(2026-10-23T20:04:17Z `1563281933683785911`)_

> Also trying to limit access to system apis using core is kinda futile
Because this assumes symbol = capability, and there are too many APIs which can perform a lot of different stuff in a single syscall

_(2026-10-23T20:04:29Z `1563281983570972794`)_

Deno's current resource model is much better for that


**andy** — 2026-10-23T20:19:40Z (`1563285804111896587`)

> ↳ replying to CaptainLach: > Also trying to limit access to system apis using core is kinda futile Because this assumes symbol = capability, and th

yeah, but extensions are trusted

_(2026-10-23T20:19:46Z `1563285829244289065`)_

extensions can do everyhitng thats the point

_(2026-10-23T20:19:50Z `1563285847292248075`)_

user code cant do everything


**CaptainLach** — 2026-10-23T20:20:23Z (`1563285985763008513`)

I think both of your proposals can be better implemented as per-package permission grants...


**andy** — 2026-10-23T20:20:42Z (`1563286065106780173`)

> ↳ replying to CaptainLach: Deno.dlopen creates JIT-optimised JS wrappers for system library calls

i would like to avoid making it dodo-specific so it could theoretically be reused in like ende or something, also even deno.dlopen is a bit high-level

_(2026-10-23T20:20:52Z `1563286106441781279`)_

> ↳ replying to CaptainLach: I think both of your proposals can be better implemented as per-package permission grants...

again, per-package permission grants are *impossible*


**CaptainLach** — 2026-10-23T20:21:00Z (`1563286140201476201`)

> ↳ replying to andy: i would like to avoid making it dodo-specific so it could theoretically be reused in like ende or something, also even d

What is lower-level?

_(2026-10-23T20:21:30Z `1563286265980522567`)_

> ↳ replying to andy: again, per-package permission grants are *impossible*

In the current deno model - yes

_(2026-10-23T20:22:05Z, edited 2026-10-23T20:22:14Z `1563286414047576255`)_

But it is possible to make stuff like import 'deno:fs' to bring the fs module which is scoped to this package own permissions


**andy** — 2026-10-23T20:22:05Z (`1563286415804993539`)

> ↳ replying to CaptainLach: What is lower-level?

an api where it doesnt even produce objects, it's just you pass in a library to use, the method, the type signature, and the arguments, which makes it a bit easier to implement (this im not dead-set on)


**CaptainLach** — 2026-10-23T20:22:34Z (`1563286534667374702`)

> ↳ replying to andy: an api where it doesnt even produce objects, it's just you pass in a library to use, the method, the type signature, and

...That's what Deno.dlopen is

_(2026-10-23T20:22:58Z `1563286634902847530`)_

That's dodo-bindgen which wraps pointers and stuff returned from Deno.dlopen in fancy objects


**andy** — 2026-10-23T20:23:00Z (`1563286645283885157`)

> ↳ replying to CaptainLach: ...That's what Deno.dlopen is

deno.dlopen requires that you open the library and then it returns a bunch of constructed functions


**CaptainLach** — 2026-10-23T20:23:11Z (`1563286690393493698`)

dlopen operates in pointers and stuff

_(2026-10-23T20:23:21Z, edited 2026-10-23T20:24:41Z `1563286731711709425`)_

> ↳ replying to andy: deno.dlopen requires that you open the library and then it returns a bunch of constructed functions

Sorry, can you give an example of what is lower-level then?..


**andy** — 2026-10-23T20:25:02Z (`1563287156464554088`)

```typescript
const dylib = Deno.dlopen(
  libName,
  {
    "add": { parameters: ["isize", "isize"], result: "isize" },
  } as const,
);

// Call the symbol `add`
const result = dylib.symbols.add(35n, 34n); // 69n
//                           ^ constructed function
```

```typescript
const result = extensionsRuntime.callFFI({
  libName,
  method: "add",
  parameters: ["i64","i64"],
  arguments; [35n, 34n]
  result: "i64"
});
// ^ no extra functions created
```

_(2026-10-23T20:25:10Z `1563287188534198455`)_

> ↳ replying to CaptainLach: But it is possible to make stuff like import 'deno:fs' to bring the fs module which is scoped to this package own permis

im not quite sure what you mean by that


**CaptainLach** — 2026-10-23T20:25:51Z (`1563287362778308684`)

> ↳ replying to andy: ```typescript const dylib = Deno.dlopen(   libName,   {     "add": { parameters: ["isize", "isize"], result: "isize" }, 

...Wow

The whole point of dlopen is to construct a FFI trampoline once
Your implementation will be doing that on every call, and that is crazy expensive and error-prone


**andy** — 2026-10-23T20:25:54Z (`1563287373431832637`)

any library running in the same context can pretend to be user code or any other library due to the way javascript works


**CaptainLach** — 2026-10-23T20:26:48Z (`1563287599085522985`)

And if you cache the constructed trampoline, you will get Deno.dlopen, but worse, as it would constructing heterogenous array on every call


**andy** — 2026-10-23T20:26:49Z (`1563287604148043888`)

> ↳ replying to CaptainLach: ...Wow  The whole point of dlopen is to construct a FFI trampoline once Your implementation will be doing that on every 

i suppose, yeah, although it's not actually that much more expensive, deno still returns a rust function that then does FFI stuff, it's not generated machine code, the main difference with mine is it loads the library on first usage

_(2026-10-23T20:27:39Z `1563287816484556861`)_

again

_(2026-10-23T20:27:43Z `1563287832041226302`)_

im not dead-set on it

_(2026-10-23T20:27:52Z `1563287869517332552`)_

but at the very least i'd rename it to not be dodo-specific

_(2026-10-23T20:28:03Z `1563287916686344283`)_

even if it has the same api as the deno one


**CaptainLach** — 2026-10-23T20:28:07Z, edited 2026-10-23T20:28:46Z (`1563287932524302417`)

I mean... If the whole point is loading on the first call...

function memoized<T>(cb: ()=>T)=>()=>T{
let value: T | undefined;
return () => value??=cb();
}

const lib = memoized(()=>Deno.dlopen(...));

lib().someCall(1,2,3)


**andy** — 2026-10-23T20:29:10Z (`1563288196312207435`)

> ↳ replying to CaptainLach: I mean... If the whole point is loading on the first call...  function memoized<T>(cb: ()=>T)=>()=>T{ let value: T | und

yeah but there's still rust functions being bound to v8 happening there


**CaptainLach** — 2026-10-23T20:29:13Z, edited 2026-10-23T20:29:34Z (`1563288208756842649`)

> i suppose, yeah, although it's not actually that much more expensive, deno still returns a rust function that then does FFI stuff, it's not generated machine code, the main difference with mine is it loads the library on first usage
It will be much expensive, FFI trampolines are expensive, that's why they are usually constructed once and jitted, and not being translated on every call

_(2026-10-23T20:31:00Z `1563288658251878656`)_

That's how every library like libffi works

_(2026-10-23T20:31:48Z `1563288859830132787`)_

> ↳ replying to andy: any library running in the same context can pretend to be user code or any other library due to the way javascript works

That's why deno extensions are using primordials 😄

_(2026-10-23T20:32:11Z `1563288956328743074`)_

They ARE running in the same context, but you can't pretend to be a deno extension

_(2026-10-23T20:32:43Z, edited 2026-10-23T20:32:50Z `1563289091280347157`)_

> ↳ replying to andy: yeah but there's still rust functions being bound to v8 happening there

I still haven't got the point of this thing, sorry

_(2026-10-23T20:33:49Z `1563289367164751994`)_

The extra function is created to be specialized for this specific FFI call, and to make the call cheap
It contains a fixed, cheap conversion of v8 args into the target calling convention


**andy** — 2026-10-23T20:33:50Z (`1563289369039732859`)

okay nevermind i misunderstood the way that deno's ffi is implemented internally, it's still doesn't quite work the way you believe (see https://github.com/denoland/deno/blob/d7205acbed60f68414d1485407a5b50bc867131e/ext/ffi/00_ffi.js), but it's more efficient than i thought it was

_(2026-10-23T20:34:02Z `1563289420910563409`)_

> ↳ replying to CaptainLach: They ARE running in the same context, but you can't pretend to be a deno extension

i wouldn't count on that, also permissions are still checked on deno side

_(2026-10-23T20:34:36Z, edited 2026-10-23T20:34:42Z `1563289564284452985`)_

> ↳ replying to CaptainLach: The extra function is created to be specialized for this specific FFI call, and to make the call cheap It contains a fix

it doesn't actually, it's just a wrapper around `op_ffi_call_nonblocking`, which then converts the arguments, it's not specialized

_(2026-10-23T20:35:47Z `1563289862730424342`)_

wait

_(2026-10-23T20:35:53Z `1563289887543918665`)_

nevermind it looks like it has an additional trampoline

_(2026-10-23T20:36:47Z `1563290111146197176`)_

however i don't know how much benefit there is in constructing a trampoline, the overhead of making it is quite high, and i dont know how much actual performance gain it gives with repeated calls


**CaptainLach** — 2026-10-23T20:36:47Z (`1563290113142821025`)

Nonblocking are different, as they need to transfer call data to a different thread

_(2026-10-23T20:37:05Z `1563290188627845271`)_

op_ffi_unsafe_callback_create does create a trampoline

_(2026-10-23T20:37:42Z `1563290344655687730`)_

> ↳ replying to andy: however i don't know how much benefit there is in constructing a trampoline, the overhead of making it is quite high, an

Actually, there is a lot, that's why every ffi library implements it that way 😄


**andy** — 2026-10-23T20:37:53Z (`1563290391044685835`)

how much do you estimate?


**CaptainLach** — 2026-10-23T20:38:21Z (`1563290509378846852`)

You would need to create trampoline any way, the only difference if you are doing it once for a lifetime of the program, or once every call


**andy** — 2026-10-23T20:39:03Z (`1563290685531095094`)

> ↳ replying to CaptainLach: You would need to create trampoline any way, the only difference if you are doing it once for a lifetime of the program,

i'm saying we cache trampoline in my implementation, that or just not creating a trampoline at all and setting up the stack directly


**CaptainLach** — 2026-10-23T20:39:12Z (`1563290720419446916`)

Because the purpose of a trampoline is to place the arguments from one representation into the target registers
And you don't have the registers to perform the computation of this movement on the fly
Even if you had - it would be pretty thought assembly code to implement

_(2026-10-23T20:39:29Z `1563290790619521146`)_

> ↳ replying to andy: i'm saying we cache trampoline in my implementation, that or just not creating a trampoline at all and setting up the st

Arguments are not always passed through the stack

_(2026-10-23T20:39:39Z `1563290833480982670`)_

There are many different calling conventions


**andy** — 2026-10-23T20:39:39Z (`1563290835787718738`)

(i mean C calling convention)


**CaptainLach** — 2026-10-23T20:39:45Z (`1563290861435883662`)

There isn't one

_(2026-10-23T20:39:50Z `1563290881296175205`)_

Every platform has its own


**andy** — 2026-10-23T20:40:04Z (`1563290937650585741`)

what i mean is like

_(2026-10-23T20:40:11Z `1563290969166839909`)_

doing it the way deno's unoptimized non-trampoline version does it

_(2026-10-23T20:40:14Z `1563290979526774838`)_

anyways I gtg


**CaptainLach** — 2026-10-23T20:40:16Z (`1563290989664403527`)

Rust's "C" calling convention is "whatever the C compiler uses on this platform"

_(2026-10-23T20:40:26Z `1563291032274206866`)_

> ↳ replying to andy: doing it the way deno's unoptimized non-trampoline version does it

There is no non-trampoline version

_(2026-10-23T20:40:33Z `1563291059646107791`)_

You need a trampoline

_(2026-10-23T20:40:44Z, edited 2026-10-23T20:40:50Z `1563291107024961710`)_

You can't implement the trampoline-like translation in higher level language


**andy** — 2026-10-23T20:41:08Z (`1563291208212545680`)

yes there is, pub(crate) fn ffi_call_sync<'scope>(

_(2026-10-23T20:41:12Z `1563291223328952550`)_

fuck wrong copy paste

_(2026-10-23T20:41:15Z `1563291238336176158`)_

https://github.com/denoland/deno/blob/d7205acbed60f68414d1485407a5b50bc867131e/ext/ffi/call.rs#L83
[embed] deno/ext/ffi/call.rs at d7205acbed60f68414d1485407a5b50bc867131e ·... A modern runtime for JavaScript and TypeScript. Contribute to denoland/deno development by creating an account on GitHub.


**CaptainLach** — 2026-10-23T20:41:32Z (`1563291309806977148`)

You can write such non-trampoline translator in assembly, but it would be very hard
But it is much easier to just create a trampoline machine code and call it

_(2026-10-23T20:42:02Z `1563291432884633721`)_

> ↳ replying to andy: https://github.com/denoland/deno/blob/d7205acbed60f68414d1485407a5b50bc867131e/ext/ffi/call.rs#L83

It still constructs a trampoline internally


**andy** — 2026-10-23T20:44:59Z (`1563292176170094823`)

> ↳ replying to CaptainLach: It still constructs a trampoline internally

ah shi

_(2026-10-23T20:46:08Z `1563292467296600175`)_

I see the rationale


**CaptainLach** — 2026-10-23T20:47:58Z (`1563292928158212238`)

I'm not sure why Rust's libffi crate even exposes such method (call<R>(arg_types, arg) -> R), but it does just call ffi_prep_cif and ffi_call libffi methods internally


**andy** — 2026-10-23T20:48:00Z (`1563292933833228320`)

extensions will still probably need to call more low-level (similar to the Deno ops) functions for FFI, but the SDK will have helpers for those who want it, things like dodo-bindgen can just call the ops directly for less overhead when in extensions


**CaptainLach** — 2026-10-23T20:49:30Z (`1563293311521919060`)

> ↳ replying to CaptainLach: I'm not sure why Rust's libffi crate even exposes such method (call<R>(arg_types, arg) -> R), but it does just call ffi_

Where ffi_prep_cif does construct a trampoline internally, and it can be ffi_call'ed multiple times, its just that this API does not allow you to store the prepared trampoline 😄

_(2026-10-23T20:50:10Z `1563293480825135198`)_

So Deno.dlopen or whatever it can be called IS the right abstraction for such stuff


**andy** — 2026-10-23T20:50:31Z (`1563293570876575915`)

> ↳ replying to CaptainLach: Where ffi_prep_cif does construct a trampoline internally, and it can be ffi_call'ed multiple times, its just that this 

that's nice, I'd rather not have to implement the trampoline manually like in Deno, I'll try to find a workaround for the rust bindings sucking


**CaptainLach** — 2026-10-23T20:50:56Z (`1563293674769481871`)

(Also, loading library on the first call is kinda bad imo, because it delays the crash until the first call of the ffi library)


**andy** — 2026-10-23T20:51:15Z (`1563293752108253276`)

> ↳ replying to CaptainLach: So Deno.dlopen or whatever it can be called IS the right abstraction for such stuff

not really, it's not high level enough to be nice and at that point why not just use the low level ops that dlopen calls internally


**CaptainLach** — 2026-10-23T20:52:04Z (`1563293961194442886`)

> ↳ replying to andy: not really, it's not high level enough to be nice and at that point why not just use the low level ops that dlopen calls

To make it high-level you need something like dodo-bindgen, which knows how to work with the ffi pointers


**andy** — 2026-10-23T20:52:15Z (`1563294007067410563`)

> ↳ replying to CaptainLach: To make it high-level you need something like dodo-bindgen, which knows how to work with the ffi pointers

yeah


**CaptainLach** — 2026-10-23T20:52:31Z (`1563294074172080129`)

...So it is still a right abstraction for the job


**andy** — 2026-10-23T20:52:39Z (`1563294105470247125`)

dlopen is just kinda a shitty halfway between simple low level API and ergonomic high level API


**CaptainLach** — 2026-10-23T20:52:59Z, edited 2026-10-23T20:53:02Z (`1563294190245515337`)

Nope, it is as low-level as possible 😄


**andy** — 2026-10-23T20:53:06Z (`1563294220234661929`)

> ↳ replying to CaptainLach: ...So it is still a right abstraction for the job

The ops are the right abstraction, not 00_ffi.js


**CaptainLach** — 2026-10-23T20:53:16Z (`1563294259690610771`)

> ↳ replying to CaptainLach: Nope, it is as low-level as possible 😄

I don't see how it can be lower level


**andy** — 2026-10-23T20:53:32Z (`1563294330339197000`)

> ↳ replying to CaptainLach: I don't see how it can be lower level

just give people the ops directly


**CaptainLach** — 2026-10-23T20:53:59Z (`1563294439902810175`)

> ↳ replying to andy: The ops are the right abstraction, not 00_ffi.js

I mean, 00_ffi is just a basic abstraction on top of the ops, there is no point in dropping it, you won't gain anything from calling the ops directly

_(2026-10-23T20:54:08Z `1563294479232798861`)_

Why?..


**andy** — 2026-10-23T20:54:37Z (`1563294599777091749`)

most extensions will use the binding generator in the SDK rather than using it directly, and it adds more complexity by forcing a prelude for extensions


**CaptainLach** — 2026-10-23T20:55:05Z (`1563294716781662369`)

I would argue that ffi interface deno implemented is one of the best low-level API's it provides


**andy** — 2026-10-23T20:55:47Z (`1563294894003453983`)

again, if people really want the API of dlopen, the SDK will also have a wrapper around the ops, but that's just a library imported by the extension and bundled, rather than saddling the runtime with it


**CaptainLach** — 2026-10-23T20:56:19Z (`1563295026803376279`)

So... 00_ffi.js repackaged as @dodo/ffi?

_(2026-10-23T20:56:29Z `1563295072731013252`)_

But it is not good, because it is tightly coupled with the ops


**andy** — 2026-10-23T20:56:44Z (`1563295134118842469`)

> ↳ replying to CaptainLach: So... 00_ffi.js repackaged as @dodo/ffi?

effectively

_(2026-10-23T20:56:56Z `1563295182923894796`)_

> ↳ replying to CaptainLach: But it is not good, because it is tightly coupled with the ops

how is that not good


**CaptainLach** — 2026-10-23T20:57:00Z (`1563295199172755631`)

It would be extremely tedious to maintain backwards compatibility for such stuff

_(2026-10-23T20:57:16Z `1563295267153911883`)_

Again, look at the 00_ffi.js optimized path


**andy** — 2026-10-23T20:57:19Z (`1563295282379362426`)

> ↳ replying to CaptainLach: It would be extremely tedious to maintain backwards compatibility for such stuff

I don't intend to change it all the time


**CaptainLach** — 2026-10-23T20:57:26Z (`1563295308568596503`)

It converts the calls into v8 turbocall directly


**andy** — 2026-10-23T20:57:42Z (`1563295378558689401`)

also the API is for extensions only, not for user code


**CaptainLach** — 2026-10-23T20:57:43Z (`1563295380618092668`)

Any v8 change might require changes in js wrapper


**andy** — 2026-10-23T20:58:08Z (`1563295484590690397`)

> ↳ replying to CaptainLach: Any v8 change might require changes in js wrapper

same with updates to module loading


**CaptainLach** — 2026-10-23T20:58:16Z (`1563295518971531316`)

> ↳ replying to andy: also the API is for extensions only, not for user code

But then the users would need to write an extension just for calling ffmpeg?..


**andy** — 2026-10-23T20:58:42Z (`1563295626878517272`)

> ↳ replying to CaptainLach: But then the users would need to write an extension just for calling ffmpeg?..

there will be a user-facing FFI extension, but user code can't call the ops


**CaptainLach** — 2026-10-23T20:59:22Z (`1563295794621194402`)

I still don't get why do we want to get rid of 00_ffi.js from deno, it is still a good abstraction for both extensions and user code

_(2026-10-23T20:59:44Z `1563295886719590493`)_

It is also tightly coupled with v8 internals


**andy** — 2026-10-23T21:00:02Z (`1563295962800070740`)

> ↳ replying to CaptainLach: I still don't get why do we want to get rid of 00_ffi.js from deno, it is still a good abstraction for both extensions a

simplicity, the core is meant to be dead simple, most work should be delegated to extensions


**CaptainLach** — 2026-10-23T21:00:13Z (`1563296009512026259`)

ffi is an extension


**andy** — 2026-10-23T21:00:46Z (`1563296146871296093`)

> ↳ replying to CaptainLach: ffi is an extension

no, because nearly every other extension (file IO, etc) uses FFI


**CaptainLach** — 2026-10-23T21:01:08Z (`1563296241817755758`)

They are not using FFI, they are using Rust APIs directly

_(2026-10-23T21:01:25Z `1563296313330634834`)_

Which is better, because Rust API's are crossplatform, and ffi is not


**andy** — 2026-10-23T21:01:31Z (`1563296337053622393`)

> ↳ replying to CaptainLach: They are not using FFI, they are using Rust APIs directly

in deno, yes, but this is an experimental architecture I'm messing around with

_(2026-10-23T21:01:55Z `1563296440158130267`)_

> ↳ replying to CaptainLach: Which is better, because Rust API's are crossplatform, and ffi is not

native system APIs lets us do optimizations like with file copying on macOS and stuff


**CaptainLach** — 2026-10-23T21:02:17Z (`1563296529962369136`)

Furthermore, FFI requires your code to be built with glibc
While extensions can call syscalls directly and work with musl and others

_(2026-10-23T21:02:33Z `1563296596404342928`)_

> ↳ replying to andy: native system APIs lets us do optimizations like with file copying on macOS and stuff

Yes, that's why Rust APIs use that

_(2026-10-23T21:03:04Z `1563296727711359017`)_

> ↳ replying to CaptainLach: Furthermore, FFI requires your code to be built with glibc While extensions can call syscalls directly and work with mus

How would you call libc.malloc in statically-linked deno? There is no libc 😄

_(2026-10-23T21:04:13Z `1563297017969516567`)_

Wiring everything through ffi is kinda impossible, because libffi forces you to allocate all the structs


**andy** — 2026-10-23T21:04:20Z, edited 2026-10-23T21:04:39Z (`1563297045068914799`)

> ↳ replying to CaptainLach: Furthermore, FFI requires your code to be built with glibc While extensions can call syscalls directly and work with mus

rust already links with glibc


**CaptainLach** — 2026-10-23T21:04:30Z (`1563297086370222213`)

You can't pass a reference to the on-stack object from js to libffi

_(2026-10-23T21:05:04Z, edited 2026-10-23T21:05:19Z `1563297232353231001`)_

> ↳ replying to andy: rust already links with glibc

In case of musl and others it is linked statically, there is no libc shared library, there are libc.a, which will copy all the libc functions into the built rust binary


**andy** — 2026-10-23T21:05:21Z (`1563297300133056646`)

> ↳ replying to CaptainLach: You can't pass a reference to the on-stack object from js to libffi

that's why the heap exists


**CaptainLach** — 2026-10-23T21:05:50Z (`1563297423529480225`)

> ↳ replying to andy: that's why the heap exists

And this is why you shouldn't use libffi when you can use Rust APIs directly

_(2026-10-23T21:06:15Z `1563297526990381207`)_

ffi extension in deno is solely for js consumption

_(2026-10-23T21:06:26Z `1563297574415368254`)_

It is a poor fit for anything else


**andy** — 2026-10-23T21:07:04Z (`1563297735296421949`)

if we find it to be too slow we can add more ops, but for this prototype it'll just be ffi


**CaptainLach** — 2026-10-23T21:07:47Z (`1563297915525406962`)

So do you want to prevent calling Rust API's directly, and only use ext_ffi?.. Why?..


**andy** — 2026-10-23T21:08:09Z (`1563298006642462822`)

> ↳ replying to CaptainLach: So do you want to prevent calling Rust API's directly, and only use ext_ffi?.. Why?..

it makes the core bigger, and again, isn't based on the existing deno codebase


**CaptainLach** — 2026-10-23T21:08:41Z (`1563298139828396124`)

I understand that, I'm just very confused about the reasoning for that


**andy** — 2026-10-23T21:09:27Z (`1563298331982172201`)

> ↳ replying to CaptainLach: I understand that, I'm just very confused about the reasoning for that

startup time, dogfooding the experience of community developed extensions, also its a lot easier to write typescript than rust


**CaptainLach** — 2026-10-23T21:10:24Z (`1563298574333382859`)

I think we're going circles 😄
I need to go, and will try to properly rephrase why I think this isn't a good idea a bit later 😄


**daniellacosse** — 2026-10-24T00:30:24Z, edited 2026-10-24T00:31:36Z (`1563348904030769153`)

catching up here, please correct me if my understanding is off:

- I think TS extensions are a reasonable spike and if it proves too much overhead/not good we have rust to fall back on. but also, if we're saying we don't want the community to embrace extending our core from a product perspective the ergonomics of being able to use TS become less important
- There's possibly a bit of a backwards-compatibility problem with the import-based extension approach, but i do like it. We could maybe simplify migration with side-effects, e.g. `import "deno:serve";` injects `Deno.serve` into the global scope.

---

## per-package (module-level) permissions (thread 1562324423615184897)

**daniellacosse** — 2026-10-24T00:35:23Z (`1563350160342388858`)

the convo kinda moved here tbh:

https://discord.com/channels/1558888938251223050/1562944037135196211/1562944037135196211

---

## Sandboxed extension boundary (thread 1562944037135196211)

**daniellacosse** — 2026-10-23T18:08:59Z (`1563252919808163891`)

> ↳ replying to netop://ウィビ: So, as far as getting a huge user base, that's most likely not going to happen (no Node/npm) and most people aren't secu

you're also like, a backstop for this whole thing. we can count on there being at least one deno-like cuz of you <@125029111839064065>


**netop://ウィビ** — 2026-10-23T18:09:38Z (`1563253079665811557`)

There's dozens of us!


**andy** — 2026-10-23T19:17:16Z (`1563270103129399387`)

> ↳ replying to netop://ウィビ: The more I think about this, the more I wonder why do extensions at all? People would just write JSR modules

extensions allow for extensibility while still enforcing a permission boundary

_(2026-10-23T19:17:22Z `1563270126306861157`)_

you trust the extension

_(2026-10-23T19:17:27Z `1563270149082185801`)_

the extension checks permissions

_(2026-10-23T19:17:39Z `1563270197379473420`)_

rather than your code getting to do FFI directly (without a special FFI permission)

_(2026-10-23T19:17:56Z `1563270271350083595`)_

also extensions get to do things like hook into the module loader and stuff


**netop://ウィビ** — 2026-10-23T19:28:46Z, edited 2026-10-23T19:30:16Z (`1563272998109053031`)

> ↳ replying to andy: extensions allow for extensibility while still enforcing a permission boundary

I know what they are. My question is, why have extensions for things that should (probably) be in the runtime anyway?

_(2026-10-23T19:29:20Z `1563273138274570334`)_

In the browser space it makes sense, there's no way for vendors to account for all the things people want to do online.

_(2026-10-23T19:29:46Z `1563273249117175880`)_

At least from the Ende perspective, I'm having trouble thinking of a list of potential extensions.


**andy** — 2026-10-23T19:34:53Z (`1563274534776471657`)

> ↳ replying to netop://ウィビ: I know what they are. My question is, why have extensions for things that should (probably) be in the runtime anyway?

to keep the runtime simple and extensible

_(2026-10-23T19:35:02Z `1563274574651596858`)_

to allow people to have features like node support if they want

_(2026-10-23T19:35:07Z, edited 2026-10-23T19:35:09Z `1563274593454522541`)_

without bloating things if they dont want it

_(2026-10-23T19:35:23Z `1563274662815862965`)_

and for example to add apis for the system keyring without forking the runtime


**CaptainLach** — 2026-10-23T20:09:04Z (`1563283137276940370`)

I don't understand, what's the point of writing extensions in wasm then, if they are just end up using Deno.open() like APIs?..
[attachment] image.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563283137113497642/image.png?ex=6addb920&is=6adc67a0&hm=70b0fd971395ed791ab98e9ce61630b3cc6db3ada4aada979235e455cb88f338&)

_(2026-10-23T20:09:12Z `1563283170646954155`)_

Sorry, I have missed the whole thread

_(2026-10-23T20:11:14Z `1563283683174121522`)_

In this schema, why can't the extension be a normal library registering global polyfills before the rest of everything starts?..
[attachment] image.png (https://cdn.discordapp.com/attachments/1562944037135196211/1563283682825871563/image.png?ex=6addb9a2&is=6adc6822&hm=5b941a5ddbaf750dfe3661de895357caaaeed3e588f0f85560d181348bd10c8d&)

_(2026-10-23T20:12:51Z, edited 2026-10-23T20:13:17Z `1563284090046648342`)_

Limiting extensions to WASI does nothing beneficial to the current deno security model, there is no point in putting extension behind the deno/ende?..
The whole described model fits "per-package permissions/grants"


**netop://ウィビ** — 2026-10-23T20:38:18Z (`1563290494950187109`)

> ↳ replying to CaptainLach: In this schema, why can't the extension be a normal library registering global polyfills before the rest of everything s

So you're thinking of just having special JSR modules?


**CaptainLach** — 2026-10-23T21:14:22Z (`1563299570471927939`)

Yep, the kind that are always preloaded

_(2026-10-23T21:17:02Z `1563300243817373717`)_

> The whole described model fits "per-package permissions/grants" 
As for that, the way it can be implemented is by providing every package its own Deno (Dodo/Ende/whatever) object, and the impersonation would only be possible if the package somehow leaks it (For example, by not using primordials properly)

This security model works well in Deno itself, you can do some things bypassing the permission model... If you manage to steal __bootstrap from one of the deno core extension libraries


**netop://ウィビ** — 2026-10-23T21:18:45Z (`1563300673368367155`)

I guess I would need to see an actual example, I'm having difficulty understanding.

_(2026-10-23T21:19:26Z `1563300847906062378`)_

I may publish some examples this weekend


**andy** — 2026-10-23T21:21:25Z (`1563301344222249024`)

> ↳ replying to CaptainLach: > The whole described model fits "per-package permissions/grants"  As for that, the way it can be implemented is by prov

like what?


**CaptainLach** — 2026-10-23T21:24:35Z (`1563302144394928310`)

It is actually easier to explain with not globals, but imports

Imagine you have to reach runtime not by using Deno global, but by using

import * as rt from 'deno:rt';

Now, it is pretty easy to override which module it will be resolved to, because the infrastructure is already here and used for e.g importmaps

You can give package @std/tempdir with {requests: {fs: {paths: ['/tmp']}}} the following module:

```
export const fs = {write(path, data) { assert(path.startsWith('/tmp')); __bootstrap.ops.write(path, data) }};
export const net = {serve() { fail('nuh-huh, no network for you') }}
```

And give @std/serve the following:

```
export const fs = {write() { fail('nuh-huh, no fs for you') }};
export const net = {serve(opts, cb) { assert(__bootstrap.allowedPorts.includes(opts.port)); __bootstrap.ops.serve(opts, cb) }}
```

Of course those won't be the real js files, those would be created differently, but that's how it can be implemented pretty easily

_(2026-10-23T21:29:01Z `1563303256116174942`)_

```ts
function runtimeForPackagePermissions(permissions: Permissions) {
  return {
    fs: {
      write(path, data): {permissions.fs.check(path, 'write');...}
    },
    net: {
      serve(opts, cb): {permissions.network.checkPort(opts.port, 'serve');...}
    },
  }
}
```

```ts
// deno:rt that @std/tempdir gets
export default __bootstrap.runtimeForPackagePermissions(permissingObjectOfStdTempdir)
```

```ts
// deno:rt that @std/serve gets
export default __bootstrap.runtimeForPackagePermissions(permissingObjectOfStdServe)
```

...Except it won't be as easy to access __bootstrap from such modules, this is just a pseudocode 😄


**netop://ウィビ** — 2026-10-23T21:29:26Z (`1563303362588315789`)

This pseudocode is fugly LOL


**CaptainLach** — 2026-10-23T21:29:55Z (`1563303484575715360`)

The point is it is possible to implement the permissions model by returning a different runtime to different packages


**andy** — 2026-10-23T21:29:57Z (`1563303494696570922`)

I mean as in how can __bootstrap leaking trigger vulnerabilities


**CaptainLach** — 2026-10-23T21:30:58Z (`1563303749143892101`)

> ↳ replying to andy: I mean as in how can __bootstrap leaking trigger vulnerabilities

Many deno rust ops check the permissions themselves, but there is a reason why not every operation is exposed to be called directly, because there is usually the js code which mediates access to such ops

_(2026-10-23T21:31:14Z, edited 2026-10-23T21:31:21Z `1563303817133424713`)_

For example you can pretty easily use leaked __bootstrap to reuse resource ids in a bad way

_(2026-10-23T21:31:37Z `1563303911614582847`)_

That's why deno APIs won't give you the access to rid's

_(2026-10-23T21:35:35Z `1563304910668177511`)_

There is a reason why built-in extensions use primordials


**Varad** — 2026-10-24T05:48:08Z, edited 2026-10-24T05:50:27Z (`1563428865798443031`)

Hey, i  just came here,plz if anyone will give me the context of this thread( before,i will start to Read 170 messages in this thread), it would be better for me 🙂.i was thinking that how can we make javascript runtime so 
Secure that .every package is isolated like  website in a browser.

_(2026-10-24T08:22:08Z `1563467621490237526`)_

One thing I need to know is what are we currently doing?, what is our future plan?, what's the role of each contributor, so what can I do for now? I want full clarity before i should start.


**daniellacosse** — 2026-10-24T15:45:58Z (`1563579314128031746`)

> ↳ replying to Varad: Hey, i  just came here,plz if anyone will give me the context of this thread( before,i will start to Read 170 messages i

one of the main concepts we're circling is making deno more pluggable, and so this thread explores the possibility of enforcing permissions per "plug" or extension

_(2026-10-24T15:47:00Z `1563579573512437841`)_

> ↳ replying to Varad: One thing I need to know is what are we currently doing?, what is our future plan?, what's the role of each contributor,

future plan is in <#1560371677127381232> of which an extensions proposal is a part. however we are currently in a bit of a holding pattern waiting to hear back from bart (co-creator of deno) about foundation progress
