---
"@type": schema:TechArticle
schema:name: Foundation outreach and Bart's reply
schema:description: The working group's contact with Deno's Bartek Iwańczuk from 2026-10-15 to 2026-10-28, what he said about a Deno foundation and about upstreaming fork changes, and how the group reacted, including whether Dodo should exist if a foundation does.
wazoo:source: dcwg
wiki:priority: high
---

# Foundation outreach and Bart's reply

The group's `#general` channel is where it discussed contacting the Deno team and, on 2026-10-28, where `daniellacosse` relayed a reply. "Bart" in the channel is Bartek Iwańczuk, who posts on GitHub as `bartlomieju`. All times are UTC. What Bart said is quoted from messages `daniellacosse` pasted into the channel, except where a GitHub comment was checked.

## What is public and checked

Deno published an issue, [`denoland/deno#37030`, "The state of Deno after the Cloudflare announcement"](https://github.com/denoland/deno/issues/37030), explaining what the maintenance period means. On 2026-10-29 it was open with 28 comments. `Max P.` shared it in the channel on 2026-10-15. `w` found it welcome but thought it read more like a response to backlash than a plan, and `netop://ウィビ` pointed out that the announcement was only a week old. `Tadda` quoted from the issue the line that the Deno team is "considering ways to organize development beyond October 2027," and asked contributors to get in touch with Bart.[^1]

On 2026-10-21 at 07:50Z `bartlomieju` commented on that issue: "You can mail me directly to bartek [at] deno.com, I'll try to respond to all messages. We are now working on getting Deno into a foundation, but there's no news to share at this point."[^2] That is the public basis for everything below. `daniellacosse` shared news of it in the channel on 2026-10-21 (the message has no text in the capture), and `Stag Math` replied that it was awesome news. On 2026-10-22 `marc` shared a Reddit post of the comment.

## The two attempts to reach him

- **A comment on the issue, 2026-10-15 to 2026-10-16.** `daniellacosse` drafted a reply to Bart for the issue, saying the community server had grown to over 100 active members in 48 hours, that it was coordinating around a fork, and that it would much prefer Deno be officially passed to a reputable steward organization. `andy` approved it. After `Tadda` pointed to the "beyond October 2027" line, `daniellacosse` added a line saying the community has a vision to pitch, and posted it.
- **An email, 2026-10-21.** After Bart's invitation, `daniellacosse` drafted an email in the channel and revised it with `lishaduck`, `CaptainLach`, `andy`, and `Stag Math`. It was sent from `daniellacosse`, with `andy` copied, at about 17:55Z. The draft said the group had 160+ active members, 28 of whom had marked themselves willing contributors, that the group's consensus is that Deno's focus on security and web standards isn't replaceable, and that it wants to "maintain Deno _and_ take it forward," with portability as the shared vision. It offered a contact who had converted open-source projects into foundations. Editing choices worth recording:
  - A paragraph about a policy on the use of AI to maintain Deno was in the first draft and was cut. `lishaduck` thought it out of place in a collaborative email.
  - The attached changelog of `CaptainLach`'s fixes became "notes from him attached." `daniellacosse` had generated the changelog with an AI model from `CaptainLach`'s descriptions of the issues; `CaptainLach` said it contained subtle errors and that his own version was better, and that he had presumably described the issues poorly.
  - `lishaduck` suggested the email show willingness to work with Cloudflare rather than read as taking Deno in a different direction. When `daniellacosse` said he disliked playing the political game, he added that "it's not enough to be correct, you also have to be effective."

## Bart's reply, 2026-10-28

`daniellacosse` posted the reply to the channel at 17:07Z. Bart wrote that all earlier messages had gone to his spam folder, that as mentioned in the pinned issue the Deno team is working on getting Deno into a foundation, that "at this point there's nothing more that I can share," that the group is "more than welcome to maintain a fork and upstream changes to Deno," and that he has little capacity now but expects that to change in a few weeks.

`daniellacosse` asked a follow-up about duplication of effort. Bart answered that he was not sure what the ask was, that he is happy to merge fixes into the main tree in a couple of weeks, but that as announced Deno will focus on security fixes and monthly releases, and that he cannot say how things will look once Deno is in a foundation. `daniellacosse` replied that the group would prioritize sending fixes back when Bart has capacity, and that features it adds might serve as a jumping-off point for a foundation. Bart asked to be told when changes are sent up.

Read plainly, the reply promises nothing beyond willingness to take upstream patches in a few weeks and a foundation effort whose outcome and timing are unknown. It does not say a foundation will exist.

## How the group reacted

- **Waiting.** On 2026-10-26, before the reply, `daniellacosse` said the group was waiting on Bart, five days after his comment, and that the pause "kills the momentum." `andy` argued the group should keep going until a foundation actually exists rather than "pure ideation," because Bart seemed to him the only person on the Deno team who cares about a foundation and does not have full power over the situation. `Ooker` said that is the fate of most open-source projects. `daniellacosse` proposed the group make a plan for both outcomes, foundation or none.
- **What Dodo is for.** After the reply `daniellacosse` suggested positioning Dodo as an upstream "playground" of proposals to bring to a foundation, or alternatively doing its own thing. `netop://ウィビ` said he leans toward the second but is not in charge of Dodo, and `daniellacosse` asked "Is anyone?" `netop://ウィビ` answered that there is a core group. `daniellacosse` said governance is murky and should be ratified, and suggested a meeting with `andy`.
- **Whether Dodo should exist.** `andy` said on 2026-10-28, "for now we're just a deno fork designed to be maintained, until a proper deno foundation exists," that he is not confident the foundation will pan out, and that if it does there is no point to Dodo. `daniellacosse` asked whether that is much ado about nothing and what scope Dodo has beyond what the core Deno team has committed to. Ethan (`Ethan:Print"Ethan";:GoTo Ethan`) said the worst case is that the Dodo fork is practice for perpetual maintenance by a working group or foundation, and that he expects many Dodo contributors to migrate into a Deno core working group once one exists. `daniellacosse` agreed, and added that Dodo has an opportunity to explore new ideas and bring what it learns to that group, perhaps as forks of Dodo.
- **Dodo has no build.** `netop://ウィビ` wondered on 2026-10-28 why there is still no build when a rename across the board seems easy, and `daniellacosse` said CI issues also need attention. On 2026-10-26 he had said he would probably start pushing toward a Dodo release in a few days, and on 2026-10-27, "ugh we need a build." On 2026-10-30 he opened the first rename pull request toward one; as of 2026-10-31 it was still open. See [Dodo project roadmap](Project_Roadmap.md).

## Open questions

- Whether a Deno foundation forms, who would be in it, and when. Nothing public beyond Bart's two comments says so.
- Whether Dodo is an upstream playground or an independent fork, which `andy`, `daniellacosse`, and `netop://ウィビ` answered differently and the group has not ratified.
- Who has authority to decide, which the group acknowledged is unclear.

## Related

- [Sustaining the fork](Fork_Sustainability.md): the funding side of the same question.
- [Deno runtime handoff](Deno_Runtime_Handoff.md): what a handoff could transfer.
- [Deno dependents](Deno_Dependents.md): the list of projects `w` compiled as potential allies.
- [Dodo project roadmap](Project_Roadmap.md): the fundraising and foundation items.
- [Ende](Ende_Runtime.md): the fork whose maintainer, `netop://ウィビ`, leans toward going their own way.
- [Community and press reaction](Community_and_Press_Reaction.md): the wider response to the announcement.

## Sources

[^1]: [`denoland/deno#37030`](https://github.com/denoland/deno/issues/37030), "The state of Deno after the Cloudflare announcement," read through the GitHub API on 2026-10-29: open, created 2026-10-15, 28 comments.

[^2]: Comment by `bartlomieju` on `denoland/deno#37030`, created 2026-10-21T07:50Z, read through the GitHub API on 2026-10-29.
