---
"@type": schema:TechArticle
schema:name: A "Killer App Framework" for Dodo
schema:description: The 2026-10-21 #propose thread in which daniellacosse offered a fullstack framework as a showcase for the runtime, andy asked how it relates to the runtime, and SpaceMonkey argued against starting a new framework.
wazoo:source: dcwg
wazoo:thread: "1562291277209411675"
wiki:priority: low
---

# A "Killer App Framework" for Dodo

`daniellacosse` opened this post on 2026-10-21 (UTC) with a document, `killer-framework.md`, attached to the thread. The attachment is not in the capture, so what the framework contains is known only from what he and others said about it here. He described it as kept concise by skipping parts and using simplified examples, with each layer of the proposal one he is less sure of than the last, and he asked that the layers be considered in that order. He also said he could still assemble a full prototype, but that parts of the proposal are blocked on in-flight explorations, so he would rather set it down and come back as the situation evolves.

## What it is for

`andy` asked how it relates to the runtime. `daniellacosse` answered by quoting his own framing from the document, with a correction: the sentence should have said "runtime" where it said "runtimes", and he could not edit the file after posting. The argument is that, as discussed in General, the group needs ways to educate by showing rather than telling, and that one way to do that is a fullstack framework that fully leverages the runtime's capabilities. He linked two earlier messages in other channels, which the capture records only as URLs.

He then reduced it to its role: it is potential marketing, and it is not a framework that could exist outside Dodo. He said it is not a priority at the moment and that he would understand if the group ignored it; he posted it to follow through. He added that type checking is possible with this approach.

## The objection

`SpaceMonkey` replied on 2026-10-21 against starting a new framework. His points, as he made them:

- A lifelong project is the right scale. His own project, Denext, an app framework he is engineering with AI, follows a rule of not reinventing, and tracks the surface API of existing React and Next. Even so it has been a far larger undertaking than he planned, especially after the Deno forking rabbit hole.
- A well-documented surface API produces much better generated code, by his estimate ten times better. Even so, getting Denext stable, tested, and secure has been laborious.
- Dodo should stay with a fork of Laufey, so that changes to Deno do not alienate existing Deno users. He offered his fork of Laufey to anyone who wants a more mature version.

The capture does not say what Laufey is, and this page does not claim to know. `SpaceMonkey` is not in the [participants table](Deno_Core_Working_Group_Participants.md), which was built from an earlier capture.

## The response

`daniellacosse` declined to be discouraged by the size argument, saying he has a history of being told things are too big an undertaking and proving people wrong, and that he would not drag the community into it. He then narrowed the claim: "this can just be for me." He said React does not support his business needs, and that Laufey is orthogonal to this, in his understanding. `SpaceMonkey` took the narrowing well and described Denext as no longer plain React but React crossed with Remix and Astro and Supabase.

## Where it stands

Nothing was decided and nobody was asked to do anything. The framework was withdrawn from the group's agenda by its author within the thread, and continues, if at all, as `daniellacosse`'s own project.

## Open questions

- What the attached `killer-framework.md` specifies, since the attachment is not captured.
- What Laufey is, and whether staying with a fork of it conflicts with the fork direction recorded in [Deno fork options and naming](Deno_Fork_Options.md).
- Whether a showcase framework returns to the agenda once the in-flight explorations it is blocked on resolve.

## Related

- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the minimal-core and extensions design the framework would showcase.
- [Deno fork options and naming](Deno_Fork_Options.md): the fork scope that `SpaceMonkey`'s Laufey point bears on.
- [Fresh framework migration](Fresh_Framework_Migration.md): Deno's own full-stack framework, and how it moved out of the denoland organization.
- [Deno Core Working Group participants](Deno_Core_Working_Group_Participants.md): the handles in this thread.
