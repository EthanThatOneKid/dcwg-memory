---
"@type": schema:TechArticle
schema:name: Deno permission-model security
schema:description: The 2026-11-08 #general thread in which Summer argued Deno's permission flags carry undocumented footguns, SpaceMonkey answered with a kernel-enforcement plan for his Denext fork of Deno, and Summer pointed to three upstream Deno issues.
wazoo:source: dcwg
wiki:priority: medium
---

# Deno permission-model security

On 2026-11-08 (UTC), `Summer` and `SpaceMonkey` argued in `#general` about whether Deno's permission flags are a sandbox at all. `Summer` opened by sharing a 2024 blog post criticizing Deno's security model,[^1] and `SpaceMonkey` answered with a long AI-generated summary and a plan to fix the problems in his own fork of Deno, built for his Denext application framework. The thread is the group's sharpest statement of the permission model's limits, and it connects to `Summer`'s earlier security notes in `#ende` and to the per-package permissions discussion.

## Summer's critique

`Summer` shared [“I’m not a fan of Deno’s security model”](https://goldstein.lol/posts/deno-security/), published 2024-08-31, and summarized its point in her own words: “I don't think there is a single permission flag for deno that doesn't have a secret undocumented footgun understanding of security.” Her proposal was that `--no-prompt` should “actually lock things down with landlock/pledge/namespaces at least”.

The post she linked makes two arguments. The first is the prompts problem: the permission prompt is printed on a terminal that untrusted code can also write to and read from, so malicious code can hide the prompt with terminal colors, pre-feed approval into stdin, or trick the terminal into feeding approval. The second is the `--allow-run` problem: `--allow-run=uname` resolves `uname` through `PATH`, which the child process's environment can redirect, and environment variables such as `LD_PRELOAD` can make the dynamic loader run arbitrary code on load; the post says Deno patched the `LD_` case by disallowing those variables, but that this fixes one escape while the larger problem — “permission to run a single command” is mostly not a useful concept — remains. Its conclusion is that the Deno process “is not actually sandboxed, it only pretends it is,” and that the permissions give a false sense of security. The post ends by recommending `bwrap` for untrusted code and asking readers not to harass Deno's developers. Those are the post's claims, read here on 2026-11-09; the group did not re-check them.

## SpaceMonkey's answer: kernel enforcement in the Denext fork

`SpaceMonkey` replied with a long block pasted from a Claude Code session, introduced as “Claude agrees with you even more than the post...” The pasted summary said `Summer`'s “every flag has an undocumented footgun” line was overstated but right in direction, and listed the footguns:

- `--allow-run`: full trust, effectively.
- `--allow-ffi`: full trust.
- `--allow-write`: write access to `~/.bashrc`, `deno.json`, or `node_modules` turns into running code.
- `--allow-env`: exposes secrets, and can change how libc behaves.
- `--allow-net`: includes localhost, so code can reach local services and cloud metadata endpoints.

It added that Deno's docs do warn about run and ffi, so not every one is undocumented, but that the implications of write, env, and net “aren't spelled out anywhere a typical user would notice.”

The summary's sharpest point, in its own words, was that prompting is “fundamentally at odds with kernel enforcement”: Landlock, pledge, seccomp, and Seatbelt can only narrow what a process may do, and once applied nothing can widen it, while prompting needs to grant a new permission mid-run — so the permission set must be fixed at startup, “which is exactly when it can be compiled into kernel.”

`SpaceMonkey` said he manages a fork of Deno for his Denext application framework, at `Brainwires/deno`, which he does not distribute outside Denext but which anyone can build themselves. He said the fork would address the critique with kernel enforcement — Landlock/seccomp on Linux, Seatbelt on macOS, AppContainer and job objects on Windows later — switching on automatically whenever the permission set is fixed: `--no-prompt`, no TTY, compiled binaries, packaged desktop apps. Prompting would stay as the interactive guardrail mode. He said the fork already runs npm lifecycle scripts jailed this way. He also listed the footguns as queued work:

- allow scopes checked against the resolved symlink target (deny scopes already are)
- the permission broker handing back an open fd/handle instead of yes/no (TOCTOU)
- `Deno.permissions.names` plus deny-by-default worker permissions, so reduced workers are actually safe
- net allow/deny with proxies audited and documented (proxy env vars are already snapshotted before user code)
- terminal state reset before the prompt (stdin is already flushed)
- opt-in clean environment for `--allow-run`, “which is spelled out as full trust”

He said the docs would be reworded to “least-privilege guardrails” until the kernel mode is on, and that private vulnerability reporting is enabled for the runtime, linking the advisory form.[^2] None of this was checked here: the fork's repository was not read, and the queued items are his plan, not shipped work.

## The core of the disagreement

`SpaceMonkey` then restated the problem in his own words: “Fair. The core problem is that the permission flags are checks inside Deno's own APIs, not a sandbox. Anything that reaches the OS another way (FFI, a subprocess, a native addon) isn't held to them, and the docs never said that plainly.” That restatement is the point on which the two agreed: the flags guard Deno's own APIs, not the process.

`Summer` added three further points of her own:

- net allow/deny “used to act weird when combined with proxies”
- “there is no way to introspect what possible categories of permissions there are in deno, so its impossible to make a worker thread with a reduced subset of permissions safely”
- “every aspect of deno's security shirks best practices, or even just like... practices full stop”

## Three upstream issues

`Summer` then linked three upstream Deno items, saying “its more these issues”:[^3][^4][^5]

- [Traversal-resistant file APIs / Go's `openRoot`](https://github.com/denoland/deno/discussions/36651) — a discussion proposing `Deno.openRoot`, so file access stays inside a chosen root even across symlinks, and noting there is “practically zero way of avoiding TOCTOU issues currently.”
- [Desktop: Allow verifying sender of messages over desktop bindings for security](https://github.com/denoland/deno/issues/36861) — quotes Electron's security checklist item 17, validate the sender of all IPC messages.
- [Desktop: Expose an equivielent of 'will-navigate' event with `preventDefault` support for security](https://github.com/denoland/deno/issues/36860) — quotes Electron's checklist item 13, disable or limit navigation.

The two desktop issues are the same Electron checklist items 13 and 17 that `Summer` said on 2026-10-30 were impossible in Deno Desktop; see [Deno Desktop and Laufey](Deno_Desktop_and_Laufey.md). `SpaceMonkey` replied “We'll do all three, no problem... Action runners are a b1tch (already backlogged), but I should have it done in a couple weeks (AI's guess).” That is his estimate for his fork, not a commitment from Deno or the group.

## The LLM-paste exchange

`Summer` asked him: “and pls no more llm paste to me, sorry.” `SpaceMonkey` apologized, said to talk to him directly instead, and said he has autism, is not the best at typing, and had been working all night. `Summer` joked that she was “born always being right,” and that a robot acknowledging it “doesn't do much for me” since it will forget within seconds. The exchange is recorded because it is the thread's own turn: the AI-generated summary was the medium of the reply, and the recipient asked for it to stop.

## Connection to the earlier record

This thread repeats, with a respondent, the points `Summer` first raised in `#ende` on 2026-10-27: that `--allow-read` and `--allow-write` scoped to a folder do not restrict where symlinks inside it lead, that the permission broker returns only yes or no rather than a file descriptor (open to a time-of-check-to-time-of-use race), and that the boundary should be enforced with Landlock on Linux. See [Ende](Ende_Runtime.md). `SpaceMonkey`'s queued fixes address exactly those three items — symlink-resolved allow scopes, an fd-returning broker, and kernel enforcement — in his fork rather than in Deno or Ende.

## Where it stands

Nothing was decided upstream and nothing was filed by the group: the three linked items are existing Deno issues and a discussion, pointed to rather than created. `SpaceMonkey`'s kernel-enforcement plan is his own fork's roadmap. The open questions the thread leaves are the ones `Summer` raised: whether a worker can ever get a safely reduced permission set without a way to enumerate the permission categories, and whether the net allow/deny behavior with proxies is documented anywhere.

## Related

- [Per-package permissions](Per_Package_Permissions.md): the group's wider permission discussion, including worker-per-package isolation and the `Deno.permissions` introspection gap.
- [Deno Desktop and Laufey](Deno_Desktop_and_Laufey.md): the desktop surface the linked issues 36860 and 36861 concern, and where `Summer` first raised Electron checklist items 13 and 17.
- [Ende](Ende_Runtime.md): where `Summer` first raised the symlink, broker, and Landlock points on 2026-10-27.
- [Killer App Framework](Killer_App_Framework.md): the other place `SpaceMonkey`'s Denext framework appears.
- [Deno Core Working Group](Deno_Core_Working_Group.md): the group's position on keeping the permission model.

## Sources

[^1]: [“I’m not a fan of Deno’s security model”](https://goldstein.lol/posts/deno-security/), published 2024-08-31, read 2026-11-09: the prompts problem and the `--allow-run` problem, as summarized above. The claims are the post's, not the group's.

[^2]: [Brainwires/deno security advisories](https://github.com/Brainwires/deno/security/advisories/new): the private vulnerability-reporting form `SpaceMonkey` linked on 2026-11-08. Not read beyond the link.

[^3]: [denoland/deno discussions #36651](https://github.com/denoland/deno/discussions/36651), “Traversal-resistant file APIs / Go's openRoot”: title and body read 2026-11-09.

[^4]: [denoland/deno issues #36861](https://github.com/denoland/deno/issues/36861), “Desktop: Allow verifying sender of messages over desktop bindings for security”: title read 2026-11-09; the body quotes Electron checklist item 17.

[^5]: [denoland/deno issues #36860](https://github.com/denoland/deno/issues/36860), “Desktop: Expose an equivielent of 'will-navigate' event with `preventDefault` support for security”: title read 2026-11-09; the body quotes Electron checklist item 13. The “equivielent” spelling is the issue's own.
