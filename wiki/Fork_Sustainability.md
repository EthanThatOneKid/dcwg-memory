---
"@type": schema:TechArticle
schema:name: Sustaining the fork
schema:description: The 2026-10-12 #propose thread on how a fork gets funded and maintained past one volunteer, covering the cloud-hosting proposal, the foundation and sponsorship routes, and which companies were named as prospects.
wazoo:source: dcwg
wazoo:thread: "1559236057663414383"
wiki:priority: high
---

# Sustaining the fork

`davey` opened this post on 2026-10-12 with the question nobody else had asked: does anyone have an aim to keep a fork sustainable in the long run? His stated worry is that a solo developer might burn out after a while, and then the group is back to square one. He asked how to make sure a team is fairly compensated for its work, proposed sponsorship, and then offered what he called a crazy idea: form a small team and sell a cloud solution, not so far from Deno Deploy but runtime agnostic, with dodo as a first-class citizen and support for other runtimes too, a bit like Heroku. The funding would pay for development. He asked directly whether that is an awful idea and whether it would dilute the fork's main goals.

This is the thread where the group answered a money question in one day, and the answer was no to the product and yes to everything cheaper.

## The cloud idea was rejected, on two grounds

`CaptainLach` rejected it on sustainability: a cloud solution requires a lot of trust, and even at Deno's scale they were unable to turn it profitable. He preferred Open Collective to start, and added the reason it fits early work specifically, that Open Collective allows setting bounties and other incentives for contributors.

`netop://ウィビ` rejected it on competition, with a precedent. Gel had the same issue: they tried to push their hosted Gel Cloud, but someone like him would never use it, and he had written a couple of tutorials on how to self-host instead. His framing is that you would be competing with the people who have the know-how or at least the determination to trudge through and figure it out. He then gave the condition under which it could work anyway: it is worth having if you can convince enterprise-level customers that Dodo Cloud is the best option on the market, mainly by touting focus and expertise against other cloud providers that merely have dodo as an option among many. He noted that `dodo.cloud` was registered years ago, so the name is gone.

`davey` accepted both and closed the proposal himself: "OK so no cloud. Good potential for sponsorship though. Nice."

One adjacent wish was recorded and not acted on. `strmnn` said he wishes they would make Deno Deploy open source, because the interface is so nice.

## The routes that were kept

`daniellacosse` endorsed Open Collective as definitely the easiest, and said he would be getting in touch with the folks who helped foundationalize as a backup. He offered the precedent he had worked with: Outline VPN, which he said was successfully converted into a foundation that collects donations to survive, linking the foundation's repository. That repository read on 2026-10-18 is public and active, with the most recent push the day before, which supports the claim without confirming the financial detail.[^1]

`CaptainLach`'s bounty point is the one substantive addition to the Open Collective route: allowing contributors to claim bounties is most useful in the beginning, which is exactly when the fork needs work done and has no revenue.

## Corporate outreach

`Pierrot` proposed reaching out to companies that currently use Deno, naming Supabase and Netlify. `daniellacosse` agreed with the direction and added a precondition: the group needs a little more first. He pointed at a list another participant had made in the server.

`Broglah` added Neon, linking its Deno Deploy integration guide, and noted that Databricks owns it. Ethan added that the Turso team used Deno and were recently acquihired. Taken together, the three replies are an argument about the prospects rather than for them: the named companies are either owned by a larger company or have already been acquired, which is the same consolidation that produced the handoff in the first place.

## The customer-trust argument

`Ooker` questioned the premise of the rejection, asking what kind of trust customers need, since for him price and convenience are enough and he guessed most people just need that as well.

`daniellacosse` answered with an instruction rather than an argument: he would recommend going to talk to some customers and reporting back, and named security as a big consideration `Ooker` had not mentioned. That is the thread's only concrete next action, and nobody reported doing it.

## Where it stands

No cloud product, no foundation, no sponsor, and no bounty program. The one decision the thread contains is the rejection of the cloud route, which `davey` accepted. Open Collective is the option everyone agreed is easiest and nobody has set up. The corporate list exists in the server rather than in this capture, and the outreach has not started because `daniellacosse` judged the project not ready.

The structural point is worth separating from the funding question: the group's concern is a fork with one maintainer, and every route discussed here either requires more project to sell or more trust than the project has. Nothing in the thread addresses what happens to the fork if the person who is building it stops.

## Open questions

- Whether an Open Collective is created, and who creates it.
- Whether the corporate outreach happens, and whether a company that already has a Deno integration is a better prospect than one that does not.
- Whether bounties are used, given they are most useful early and there is no money yet.
- Whether a fork with a single maintainer is acceptable at all, which is the question `davey` opened with and the thread did not answer.

## Related

- [Deno fork options and naming](Deno_Fork_Options.md): what a fork would have to preserve, which is the scope any funder would be paying for.
- [Deno Core Working Group](Deno_Core_Working_Group.md): who is in the room, and how informal the group is.
- [Ende](Ende_Runtime.md): a fork with a single owner, which is the arrangement this thread is worried about.
- [Deno runtime handoff](Deno_Runtime_Handoff.md): the alternative to a fork, and what a transfer would require.
- [Deno versus Node features](Deno_vs_Node_Features.md): the other thread about who the project is for, which is the same question as who would pay for it.

## Sources

[^1]: [`OutlineFoundation/outline-apps`](https://github.com/OutlineFoundation/outline-apps), the repository `daniellacosse` linked as the foundation precedent, read through the GitHub API on 2026-10-18. The financial detail is his claim; the repository's existence and activity are verified.
