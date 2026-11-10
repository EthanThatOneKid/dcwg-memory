---
"@type": schema:TechArticle
schema:name: Self-hosted deploy platform
schema:description: CaptainLach's standalone, self-hosted implementation of a Deno Deploy-style platform, as described in #sandboxo on 2026-10-22 to 2026-11-09, in #ende on 2026-10-20, and in #propose on 2026-11-08, with the naming ideas and what is not yet public.
wazoo:source: dcwg
wiki:priority: low
---

# Self-hosted deploy platform

`CaptainLach` is building a self-hosted platform in the style of Deno Deploy. The record is thin and entirely in his and others' own words. No repository or release was linked, so nothing here could be checked against code.

## What was said

- **2026-10-20, in `#ende`.** `CaptainLach` said he had copied the Deno documentation for his Deno Deploy implementation, showed a screenshot of it, and said he was not sure how to name it. `daniellacosse` suggested "Dodo Doploy" and `CaptainLach` "Dodo Nest." He added that he had accidentally leaked the domain of the first production instance, and that the docs section had been reconstructed by an AI model from his notes, so he had not reviewed it much.
- **2026-10-22, in `#sandboxo`.** When a new participant asked what the channel was for, `daniellacosse` described it as a self-hosted Deno Deploy adapter of sorts. `CaptainLach` corrected him: it is not an adapter but a self-contained implementation of such a platform. It was based on internal company work, and he is replacing parts of it to make it fully standalone. "Stay tuned."
- **2026-10-24, in `#sandboxo`.** Ethan (handle `Ethan:Print"Ethan";:GoTo Ethan`) wrote that it sounds exciting and that he was thinking of "coolify but for Deno Deploy."
- **2026-11-06, in `#sandboxo`.** `CaptainLach` shared eight screenshots of the platform (images, with no accompanying text) and said it is "still a very early version," offering closed alpha access to anyone who wants to test it. The images themselves are not in the record, so what they show is not recorded here, and no repository or release was linked.
- **2026-11-08, in `#propose`.** `CaptainLach` said he had researched how Deno Deploy works and made a Deno Deploy-compatible thing, which he would open-source at some point but make self-hosted much sooner, once he was sure the architecture would not drift much more. He linked the UI and offered access to a couple of people any time. He added that he was not planning on monetizing it, and that several of his chatbots use the platform to build features chats ask for: someone can ask his chatbot to implement a leveling system in the chat, and it builds it using sandboxo to accept webhooks and show the user leveling progress on the website.
- **2026-11-09, in `#sandboxo`.** `Varad` reacted to the platform ("Intersting!!!") and, on the closed-alpha offer, said he was going to try it.

## Why it matters to the group

The group's [analysis of Deno Deploy's architecture](Deno_Deploy_Architecture.md) asks how feasible it would be to replicate the platform, and [Ende](Ende_Runtime.md) removed Deno Deploy from its fork altogether. A standalone implementation would be a concrete answer to the replication question that did not require forking the runtime, but at this point it is one participant's work in progress with no public artifact.

## Open questions

- Its name, which was undecided as of 2026-10-20.
- Whether it will be public, and under what license. Closed alpha access was offered on 2026-11-06, and `Varad` said on 2026-11-09 that he would try it; `CaptainLach` said on 2026-11-08 that he would open-source it at some point, self-hosted first.
- How much of it depends on the internal work it came from.

## Related

- [Deno Deploy architecture](Deno_Deploy_Architecture.md): what replicating the platform would involve.
- [Ende](Ende_Runtime.md): the fork that dropped Deno Deploy.
