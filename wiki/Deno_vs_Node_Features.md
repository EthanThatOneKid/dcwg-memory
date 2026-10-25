---
"@type": schema:TechArticle
schema:name: Deno versus Node features
schema:description: The 2026-10-16 #propose thread asking whether the group should keep developing Deno or push its best features into Node.js, and the argument that Deno is a developer-experience product rather than a feature checklist.
wazoo:source: dcwg
wazoo:thread: "1560790338480906290"
wiki:priority: medium
---

# Deno versus Node features

`Matthew` asked the question on 2026-10-16 in one line: would it be better to continue developing Deno, or just to add all of the best features from Deno to Node.js?

It is not an idle question for this group, because the group exists to keep a runtime alive that its owner has stopped developing, and the answer decides whether that work has a purpose. The thread is also the only place in the capture where participants argue about who the project is for.

## The first answer

`daniellacosse` answered that there is a certain opinionatedness to Deno's entire stack that would not work in Node.js. He then posted screenshots of a conversation `Matthew` had been having in the Open JSF Slack, for the record.

His reading of that conversation is blunt: "you'll help many orders of magnitude more people" is probably code for helping big tech with free labor, and he said he has been on the other side and that this is how those organizations actually think about open source. That is his characterization of the Slack exchange rather than a finding of this record, and the exchange itself is not in the capture, only two screenshots of it.

He then gave the position he holds for the rest of the thread, which is that both can be done. There is an argument for developing Deno and continuing to add its best features to Node, because not every feature will be admitted and whatever form the admitted ones take will be more enterprise-y, while Deno, or Dodo, can remain a more streamlined and indie tool with a cohesive vision. His summary is that these are different scales with different ecosystems and usage patterns, so it is not zero sum.

`Sandeep Kumar Kuanar✌🏼` posed a philosophical question on 2026-10-18 about why Node survived despite Deno coming before Bun and being created by Ryan Dahl. He attributed Node's longevity to its ecosystem dominance, users being lazy to migrate, and its inherent "stickiness," describing the situation as a "supply chain attack nightmare." `Sandeep Kumar Kuanar✌🏼` suggested on 2026-10-18 that Node's initial success was in providing a minimal JS kernel and allowing developers to build infrastructure and packages around it, leading many to believe "Node is good enough." `daniellacosse` added on 2026-10-18 that "the best tool doesn't always win," stating that a product's success is 50% product and 50% marketing, including knowing who to target. When Bun arrived, `Cyan` described it on 2026-10-18 as "faster Node" with "better Node compatibility, better performance, more built-in tools," which encouraged people to switch.

## The cannibalization argument

`Matthew` pushed on the downside of that position, and his argument is the strongest in the thread. More Deno features in Node means less of a reason for people and companies to switch to Deno, which means fewer users and probably fewer contributors. He then followed it to the end: if all of Deno's features were merged into Node, everyone could switch back to Node and it would not matter that Deno gets abandoned.

His concern is not either outcome but the middle. The thing to be worried about is a halfway state where enough features get added to Node that people are satisfied and stop using Deno, but not enough to fully replace the benefits of Deno. That is a claim about incentives rather than engineering, and nobody in the thread refuted it.

## The developer-experience answer

`daniellacosse`'s answer to the halfway argument is that the premise is wrong: Deno is more than just a feature checklist. He expanded it in the next messages. Deno aims to make development streamlined and delightful in a way Node cannot, because Node has to target enterprise. Enterprise does not really care about developer experience and can staff around it, and the more features and options a platform has, the harder it is to ensure a good experience, which he called an unfortunate tradeoff. That is why he thinks there is a bit of a false equivalency between Deno and Node in the current discourse. `daniellacosse` affirmed on 2026-10-18 that "Deno's DX is best in class" and targets a user market not served by Node. He also claimed on 2026-10-18 that trying to replace Node explicitly "sacrifices the developer experience," as Node compatibility did for Deno. `Sandeep Kumar Kuanar✌🏼` noted on 2026-10-18 that he personally uses Deno for "Personal projects" like password managers or ASCII utility tools.

`netop://ウィビ` agreed from the practitioner's side. He would never switch back to Node, describing a nightmare of configurations and troubleshooting why Rollup does not work with a specific point release of TypeScript, plus dealing with npm. He allowed that masochists exist and said he would not yuck anyone's yum, then offered the thread's most quotable line: Node is McDonald's, Deno is a bit classier.

However, `Cyan` argued on 2026-10-18 that Deno's permission system has "no clear benefit for most people" and is "more annoying" due to "extra flags" and contributing to "approval/alarm fatigue." He added that the permission prompts also "break the output." `andy` suggested on 2026-10-18 an "allow and save to deno.json" permission option would be preferable to `--allow-all`, and that `COLOR`, `FORCE_COLOR`, and `TERM` environment variables should be allowed by default. `CaptainLach` observed on 2026-10-18 that `LD_` variables, used for the Linux audio stack, often force Deno to run with `-A`, advocating that nothing should require `-A`.

## The merge question

`Matthew` ended with the structural version of his own question: is there any way the projects could merge, where Node could have a Deno mode that changes all of the defaults to act like Deno and a Node mode that works like normal Node?

`daniellacosse` did not think so, and his evidence is the reception the other direction got: it seemed that the Open JSR people were only open to some features. The name is written as "Open JSR" in the capture, and whether that refers to the OpenJS Foundation or to the JSR registry is not resolvable from the text, so it is recorded as said.

## Where it stands

Nothing was decided, no work follows from the thread, and no participant changed position. Its value in the record is that it states the fork's purpose in a way the architecture threads do not: if the group's runtime is a developer-experience product with opinionated defaults, then moving those features into Node is not the same project at a different scale, it is the end of the project.

## Open questions

- Whether any Deno feature has actually been proposed to Node, which nobody in the thread checked.
- What the halfway state would look like in practice, and whether it is reachable given that Node has to keep its existing defaults.
- Who the project is for, which is the same question the funding thread asks from the other side in [Sustaining the fork](Fork_Sustainability.md).

## Related

- [Deno](Deno.md): what the runtime is, and the state of its upstream development.
- [Deno Core Working Group](Deno_Core_Working_Group.md): the group this argument is about the purpose of.
- [Deno fork options and naming](Deno_Fork_Options.md): what a fork keeps of Deno, including the Node compatibility that this thread is arguing about.
- [Sustaining the fork](Fork_Sustainability.md): who pays for the work, which depends on who the users are.
- [Ende versus Dodo](Ende_vs_Dodo.md): the competing fork that drops Node compatibility entirely.
