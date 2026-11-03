# DCWG memory daily cron

Repo `EthanThatOneKid/dcwg-memory`, branch `main`. Two halves of one daily loop:

| Step | Runs at | Who |
| --- | --- | --- |
| Archive | 11:00 UTC (03:00 PST / 04:00 PDT) | GitHub Actions, `discord-ingest.yml` |
| Fold | about 06:30 PT | Muse cron `dcwg-memory-daily-wiki-sync` |

The gap is deliberate. Both write `raw/discord/.cursor`, and the archive's push
handler aborts on a rebase conflict, so an archive still running when the fold
starts loses that day's capture. Move one and you move the other.

## How the day works

1. **11:00 UTC — archive only.** The Actions workflow pulls new Discord activity
   with the repo's existing bot token, writes append-only captures to
   `raw/discord/`, advances `raw/discord/.cursor`, and leaves the fold queue
   (`_pending` in that same file) on `main`. Scheduled runs call no model and
   need no API key.
2. **06:30 PT — fold.** The Muse cron reads only the queued captures, edits
   `wiki/*.md`, runs the six gates, and commits the wiki edits plus the cleared
   queue entries to `main`.
3. **Nothing queued** — the fold commits nothing and reports nothing. That is a
   healthy day, not a skipped one.

A manual `workflow_dispatch` is the fallback for both halves: tick `skip_wiki`
to archive without a fold, or leave it off for the old archive+fold run.

## Check the loop is alive

The schedule has died twice — removed 2026-10-29, then the workflow disabled by
hand — and both times the only symptom was a quietly stale archive. Check first:

```sh
gh workflow view "Discord ingest" --repo EthanThatOneKid/dcwg-memory
gh run list --workflow "Discord ingest" --limit 3 --repo EthanThatOneKid/dcwg-memory
gh api repos/EthanThatOneKid/dcwg-memory/contents/raw/discord/.cursor \
  --jq .content | base64 -d | jq '{_lastRun, pending: (._pending | length)}'
```

Healthy reads as `state: active`, a `schedule` run inside the last 24 hours,
`_lastRun` inside the last day, and one `_pending` entry per venue that had new
messages. If the workflow says `disabled_manually`, run
`gh workflow enable "Discord ingest"`. Merging this repo's files does not enable
it, and the Muse GitHub App cannot push anything under `.github/workflows/`, so
that one step is always a human's.

## Scope

Fold only what the archive already produced. The archive covers every public
channel the bot can read: pinned `#brainstorm` and `#propose`, plus everything
`tools/discord/discover.ts` lists. The rule and its history are `AGENTS.md`'s
("Adding a Discord capture"): `@everyone` can view the channel and read its
history, the bot can too, the channel is not age-restricted and holds messages,
and no `DCWG_EXCLUDE_CHANNELS` entry names it. Such a channel is in scope
whether or not its topic says "This channel is indexed by AI." — that
per-channel requirement was dropped on 2026-11-03, when the server's main
moderator confirmed with Ethan that archiving every public channel is fine
because he had already assumed it was happening. The switch is the repository
variable `DCWG_REQUIRE_ANNOTATION`, which is exactly `false`. Private channels,
and whatever `DCWG_EXCLUDE_CHANNELS` names (`#github`, `#offtopic`), stay out;
never assume a channel is excluded.

## The fold

The editorial rules — attribution to handles, dating state-dependent claims,
separating evidence from claim, filename pattern, never touching `raw/` — are
`AGENTS.md`'s. This page does not restate them; two copies drift. What is
specific to a scheduled fold:

- Run the gates before you stage anything, and again after page edits settle.
- Stage only `wiki/` and `raw/discord/.cursor` (the queue entries for captures
  this run actually folded). Never stage `raw/discord/*.md` in a fold commit.
- One commit per run, message like `Fold the 2026-11-02 archive into the wiki`.
- Check `main`'s head SHA immediately before pushing. Never force-push.
- Read the commit back after pushing and confirm it landed exactly once. If the
  push is rejected, pull/rebase and retry once; if that fails, stop and report
  rather than re-committing the same fold.

On the Muse host the Deno binary is not on `PATH`:

```sh
cd <repo checkout>
~/.deno/bin/deno task --config tools/discord/deno.json gates
```

That runs `fmt` (which writes), `check --strict`, `lint --strict`,
`render --check`, the orphan check, and the forum thread check, and exits
non-zero on any failure. CI runs the same six plus the connector job. A wiki
commit that has not passed them does not go to `main`.

## If a run fails

- **Archive failed in Actions.** Read the log for that day. The fold will still
  drain whatever is already queued; it never re-pulls Discord itself.
- **Push conflict in the archive.** `push_main` aborts and the job fails, and
  the ephemeral runner discards the commit, so the next run re-fetches that
  range. Do not hand-edit `.cursor` to "catch up" — a duplicate capture is
  allowed, a skipped range is not.
- **A gate failed in the fold.** Revert the wiki edits, leave the queue intact,
  commit nothing, and report the failing gate. Never commit a broken page to
  "fix it tomorrow".
- **An unfamiliar venue appears in the queue.** Fold it only because the archive
  produced it, name the venue in the report, and treat it as no licence to widen
  scope past public channels.
- **The fold parks on an approval card.** The GitHub connector asks before
  changing repository content, so the first runs wait for a human. That is
  expected. Fully unattended commits would mean relaxing that permission, which
  is a user decision — do not change it silently.

## Phase 2 — delete the old fold code

Nothing here is safe until the archive has run green once and one Muse fold has
committed through the gates. Then, in one change:

- Delete `tools/discord/anthropic.ts`, `anthropic_test.ts`, `gemini.ts`,
  `gemini_test.ts`, `providers.ts`, `providers_test.ts`, `model.ts`,
  `prompt/dcwg-pass.md`, and `prompt_test.ts`.
- Remove the fold branches from `tools/discord/ingest.ts` and their assertions in
  `ingest_test.ts`, including `readPassInstructions`, `makeClient`,
  `runAnthropicPass`, and the provider resolution they pulled in.
- Trim what only the deleted pass used: `PROMPT_FENCE` and
  `carryFrontmatterForward` in `guard.ts`, `yamlStr` in `capture.ts`.
- Remove the `provider`, `model`, `max_usd`, and `drain` inputs and their env from
  the workflow, and the `--provider`, `--model`, `--max-usd` flags from the
  connector.
- Delete the then-unused repository secrets `GEMINI_API_KEY`,
  `AI_GATEWAY_API_KEY`, and `OPENROUTER_API_KEY`, and the repository variables
  `DCWG_PROVIDER`, `DCWG_MODEL`, `DCWG_MAX_USD`. Deleting the workflow inputs
  does not delete the secret; leaving it set keeps a gate regression spendable.

Keep `discord.ts`, `discover.ts`, `capture.ts`, `pending.ts`, `index_page.ts`,
`thread_pages.ts` (the gates and `ingest.ts` need it), `guard.ts`, the cursor,
the gates, and the editorial rules in `AGENTS.md`.
