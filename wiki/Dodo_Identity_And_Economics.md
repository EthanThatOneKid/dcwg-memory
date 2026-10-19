---
"@type": schema:TechArticle
schema:name: Dodo's identity and the economic reality
schema:description: The 2026-10-18 #propose thread proposing an embeddable runtime as the fork's identity, the modularity-versus-batteries argument, the deploy and JITless gaps, and the four funding routes weighed against the warning that taking money takes the project.
wazoo:source: dcwg
wazoo:thread: "1561488644219478176"
wiki:priority: high
---

# Dodo's identity and the economic reality

`Sandeep Kumar Kuanar✌🏼` opened this post on 2026-10-18 with a four-part proposal and one attachment, a PDF he titled `Dodo_and_Ende.pdf` and described as the white paper. His framing is that the group has to choose an identity because it cannot be everything to everyone, and the four parts are who the fork is, the architectural contradiction that follows from that, the two gaps an embedded runtime leaves open, and how anyone gets paid. Everything below is attributed to the handle that said it in the capture.[^1]

This is the thread where the identity question and the money question were asked together for the first time, and where most of the answers took the form of sequencing rather than decisions.

## The identity: an embeddable runtime, not a Node killer

Sandeep's proposal is that the fork is a foundational, embeddable runtime rather than a Node replacement. He named the position "Tauri for Web Apps" and the people it serves the embedders. He attributed the shape of the stack to another participant, as `cli <-> core <-> runtime <-> v8`, and the consequence he drew is that the batteries come out: the linter and the formatter are stripped so the runtime can be the engine inside Tauri, desktop applications, and local-first tools.

`daniellacosse` amended that stack rather than rejecting it, offering `cli <-> core <-> TS runtime <-> engine` as a possibly better description and inviting disagreement from the participant who first drew it.

`Pierrot` recorded a worry the proposal answered: he had initially feared the fork would abandon embedding once the rewrite proposal arrived.

## The contradiction: modularity against developer experience

Sandeep set a LEGO position against a batteries-included position he attributed to `daniellacosse`, and his resolution is that they are two architectures rather than two preferences. In his framing the core is tiny and modular, and a batteries-included framework is a separate layer built on top of it rather than part of the core.

`daniellacosse` answered with the strongest form of the opposing case in one line: people do not buy LEGO bricks, they buy the LEGO set. He then conceded that the set contains the bricks, and argued the appeal is that a person can turn their brain off and build the set as instructed while keeping the option to do anything else.

Nothing in the thread resolves this. What the exchange establishes is that the two positions differ about what the project ships rather than about what the core contains.

## The deploy void and the JITless constraint

Sandeep named two gaps that follow from embedding everywhere. The first is hosting: if the runtime is embedded, there is no story for how people deploy, and his position is that the group does not need to fight Vercel but does need an answer. The second is JITless execution, which he attributed to `Cyan`, that a JIT cannot run on iOS or the Switch, and he asked what the strategy is there.

`daniellacosse` answered the JITless question with two prongs rather than one: a runtime lightweight enough that the absence of a JIT stops mattering, and offloading to WebGPU compute shaders where that makes sense. He said he was about seventy percent through drafting a proposal on it.

On deploy he agreed with Sandeep's diagnosis and reframed it as timing rather than oversight. He quoted the line about being so focused on the engine that the road is ignored, called it correct, and added that it is hard to know what the road looks like while the engine is still being built. His conclusion is that the group is not being myopic but does not yet have enough information to navigate, which he put as putting the cart before the horse.

## The four funding routes

Sandeep asked how maintainers stay paid so the project does not die of burnout in eighteen months, and offered two directions: monetize embeddability for enterprise the way Tauri does, or build a hosted service.

`daniellacosse` rejected hosting on market grounds. His argument is that the market is saturated and the upfront capital required is not available, so the question is moot. He then gave three routes and a fourth possibility.

The first is a console route. An organization able to sign console NDAs could add WebGPU support for those consoles privately and charge per build, which he described as leasing API access. He noted it cannot be open sourced, called it risky given recent events, and said it would turn the group into a game development company, which he does not think is wanted.

The second is donations. His case is specific rather than general: organizations that depend on Deno may be persuadable because they were just burned by not supporting it. He doubted donations could pay a salary, and proposed generous bounties for issue resolution on the model other foundations use, which he judged the best fit for an operation built on hundreds of contributors giving a few hours a week.

The third is consulting, offering support and expertise to clients adopting or switching to the runtime, with the cost he named himself: it distracts from developing the tools.

The fourth is a combination of the above. He added that the best business model comes from talking to prospective customers, which he said the group has not done, and that the ideas usually come out of those conversations.

## The warning about taking money

The most load-bearing claim in the thread is `daniellacosse`'s argument against investment. He said that once you start taking someone's money, and especially large investments, the project is no longer yours and effectively becomes theirs, and he identified that mechanism as what was at play in Deno's demise. His conclusion is that funders have to actually want what the group wants, and he raised crowdfunding as a way to avoid the problem. He added that raising money requires trust the group has to build first.

He also kept one variable open. He said he still thinks there is a chance that Bart suddenly decides to make Deno a foundation, and that the possibility is not certain either way.

## The foundation argument

Sandeep's proposal did not ask for a foundation, but the thread spent most of its length on one, because a foundation is what several participants think funders and users expect.

`CaptainLach` opened the objection: what is the point of a foundation if there are no developers on Deno's side, since a lot of the work in those repositories was done by employees. He said he does not think anything like that can be expected from anyone but Cloudflare, and he later added that the foundation should have been created before the team was sold to Cloudflare.

`daniellacosse` answered that foundations can hire employees, that what makes sense depends on the funding structure, and that they need a board at minimum. He also laid out his sequencing: show people a build that works with their existing stack, show commitment, get situated, and if a few months pass with nothing happening at Deno then it is not saved and the group can start moving in.

`w` supplied the structural counterargument. He described a chicken and egg problem: a project born from something that has not officially died yet, only been scheduled to, will not cultivate a user base unless it makes moves compatible with being rolled into a foundation, and some people will not take it seriously otherwise. He then said he dreads being rolled into a foundation, because hacking on Deno is where he relaxes when he is not doing things for money, and because donations bring obligations whether or not there is a corporate master. `daniellacosse` agreed and added that not everyone has the luxury of that position, which he called tricky.

`w` also named the gap the donations route does not fill: there is no model in which each person kicks in twenty dollars to answer deploy.

## Bringing the cost down instead of raising money

`CaptainLach` proposed the other lever, which is making the runtime mostly maintain itself by delegating work to external libraries. His examples are replacing some of laufey's backends with Tauri and leaving only CEF, and rewriting the cryptography onto higher-level libraries. He identified node compatibility as the most expensive part of the codebase, on the grounds that it exposes many hazmat APIs that have to be kept current, and added that many Node ecosystem libraries can be replaced by bindings to the Rust ecosystem, which he considers more mature in some respects.

`w` argued for waiting rather than spending on it, on the grounds that the maintenance burden may not be that much of a bear and that Node is not moving at lightning speed. `daniellacosse` agreed that he was and remains in wait and see, while saying he wants to take Sandeep's concerns seriously, and raised the idea of a donation page that breaks out each extension so people can fund one directly, node compatibility being his example.

`CaptainLach` closed that line with the counterweight: hazmat APIs need maintenance taken seriously because they are a large source of vulnerabilities.

## The tangent the thread ended on

The last third of the thread is not about the proposal. It is `CaptainLach` and `w` arguing about the quality of Google's Cloud client libraries for Node, which `CaptainLach` called garbage and suspected was machine-generated, and which he then confirmed was generated from templates after `w` assumed `protoc` produced it.

A second tangent is a channel permission problem. `w` observed that only three participants could post in the channel set up for GitHub notifications, `daniellacosse` said he had not realized Discord permissions needed syncing and fixed it, and `andy` added that discussions about changes should go somewhere better so that changes do not get lost in a sea of discussion.

## Where it stands

Nothing in the thread is decided. The identity question was answered with agreement about the stack and no agreement about the batteries, the deploy question was deferred on timing, and the funding question produced four routes with no choice among them. Sandeep's last message on 2026-10-19 says the thread has gained traction and that he will take his time to read and review all of it, so the proposal is open rather than accepted.

Two things are worth separating from the rest. The funding argument and the foundation argument are not the same argument: donations avoid the obligation `w` objects to and the control `daniellacosse` warns about, while a foundation is the structure that most directly introduces both. And the thread's only cost estimate is qualitative: node compatibility is named as the expensive part, with no figure attached by anyone.

## Open questions

- Whether the core is modular only, with the batteries as a layer above it, or ships a batteries-included experience.
- What the deploy story is, and whether it is a service, a convention, or nothing the group builds.
- Whether the JITless answer is the WebGPU proposal `daniellacosse` was drafting, and whether it covers iOS and the Switch.
- Which funding route is taken, and whether crowdfunding is enough to avoid the control problem he described.
- Whether a foundation is formed at all, and if so whether it precedes or follows a working build.
- How much node compatibility actually costs to maintain, which no participant put a number on.

## Related

- [Sustaining the fork](Fork_Sustainability.md): the earlier #propose thread on the same money question, where the cloud route was rejected and Open Collective was left as the easy option nobody set up.
- [Runtime architecture proposals](Runtime_Architecture_Proposals.md): the minimal core with opt-in extensions that this thread's LEGO position restates.
- [Rust core rewrite proposal](Rust_Core_Proposal.md): the rewrite proposal `Pierrot` feared would end the embedding goal.
- [Deno versus Node features](Deno_vs_Node_Features.md): the other thread about who the project is for, which is the same question as what it ships.
- [Ende](Ende_Runtime.md): the runtime the attached white paper pairs with the fork.
- [Prior art runtimes](Prior_Art_Runtimes.md): the embeddable runtimes this identity is claimed against.

## Sources

[^1]: `raw/discord/2026-10-18_dcwg-propose.md`, the verbatim capture of the `#propose` forum post "Proposal: Dodo's identity & The Economic Reality" (thread `1561488644219478176`), covering 2026-10-18T21:18:23Z through 2026-10-19T14:07:58Z. The white paper's contents are not read here; only its attachment and the description Sandeep gave it are recorded.
