# DCWG memory daily cron — runbook

Repo: `EthanThatOneKid/dcwg-memory`, branch `main`
Muse cron: `dcwg-memory-daily-wiki-sync`, daily at about 06:30 PT
Status: Muse cron is live; the Actions archive schedule is NOT in this PR's diff — it is in the PR review comment, for the reviewer to add to `.github/workflows/discord-ingest.yml` before merging.

## How the day works

1. **13:00 UTC — GitHub Actions archive only** (05:00 PST / 06:00 PDT).
   The Actions workflow pulls new Discord activity with the repo's existing
   bot token, writes append-only captures to `raw/discord/`, advances
   `raw/discord/.cursor`, and leaves the fold queue (`_pending` in `.cursor`)
   on main. Scheduled runs never call a model.
2. **06:30 PT — Muse fold.** The Muse cron reads only the queued captures,
   edits `wiki/*.md` per the repo's `AGENTS.md` rules, updates
   `wiki/Captures.md` if needed, runs the six gates, and commits the wiki
   edits plus the cleared queue entries to `main`.
3. **If nothing is queued**, the Muse run commits nothing and reports nothing.

## Scope gate — do not widen without a server statement

Fold only what the archive already produced. The archive on main is:
pinned `#brainstorm` and `#propose`, plus discovered channels whose
description says "This channel is indexed by AI."

Do NOT archive or fold a channel just because it is public. The all-public
widening (open PR #39) stays unmerged until a moderator states all-public
archiving in the server. Exclusions come from the repo variable
`DCWG_EXCLUDE_CHANNELS`; do not assume any channel is excluded.

## Privacy and evidence rules for every fold run

- Never edit, rename, or delete anything under `raw/`. Corrections go in `wiki/`.
- Attribute claims to the Discord handle that made them. Separate what a
  participant said from what is externally verifiable; cite published facts
  with a footnote. Date any numeric or state-dependent claim.
- New wiki filenames must match `[A-Za-z0-9_()-]+\.md`.
- Never log a skipped/private channel by name in a public log; IDs and
  reasons only.
- If the six gates fail, revert the wiki edits, leave the queue intact,
  commit nothing, and report the failing gate. Never commit broken pages
  to "fix them tomorrow".

## Gates (run before any wiki commit)

Use the Deno binary at `~/.deno/bin/deno` (it is not on PATH):

```
cd <repo checkout>
~/.deno/bin/deno task --config tools/discord/deno.json gates
```

That runs `fmt` (which writes), `check --strict`, `lint --strict`,
`render --check`, the orphan check, and the forum thread check, plus the
connector checks in CI. A wiki commit that has not passed these gates
does not go to main.

## Committing

- Check `main`'s head SHA immediately before pushing. Never force-push.
- One commit per run, message like `Fold the 2026-11-02 archive into the wiki`.
- Stage only `wiki/` and `raw/discord/.cursor` (queue entries for folded
  captures only). Never stage `raw/discord/*.md` in a fold commit.
- Read the commit back after pushing and confirm it landed exactly once.
  If a push is rejected, pull/rebase and retry once; if that fails, stop
  and report — do not re-commit the same fold.

## One step the user must do by hand (and why)

The Muse GitHub App cannot push files under `.github/workflows/`, so the
archive schedule cannot be turned on by Muse. Apply the workflow change from the review comment on this PR by hand:

- Replace `.github/workflows/discord-ingest.yml` with the patched version
  in that comment, either in the GitHub web editor or from a local checkout.
  (The Muse GitHub App cannot push files under `.github/workflows/`.)
- Also re-enable the workflow in GitHub Settings if it was disabled
  (it was disabled when the cron was removed on 2026-10-29).

The patch only adds a `schedule: cron "0 13 * * *"` trigger and gates
the old model fold to manual runs. Manual dispatch is unchanged as a
fallback. No new secrets are needed: the archive still uses the repo's
existing Discord bot token secret.

Until that patch is applied, the Muse cron will still run each morning,
but it will usually find an empty queue and do nothing — the archive
is still manual-only. That is the safe failure mode, not a bug.

## GitHub write approval

The GitHub connector is currently set to ask before changing repository
content. A Muse fold commit will therefore park on an approval card
until it is approved. That is expected on the first runs. Fully
unattended commits would require changing that connector permission
to allow, which is a user decision — do not change it silently.

## Phase 2 — deleting the old fold code (after the first green Muse fold)

Do not delete this until the archive patch is live AND one Muse fold
has committed cleanly through the gates. Then delete, in one change:

- `tools/discord/anthropic.ts`, `anthropic_test.ts`
- `tools/discord/gemini.ts`, `gemini_test.ts`
- `tools/discord/providers.ts`, `providers_test.ts`, `model.ts`
- `tools/discord/prompt/dcwg-pass.md`, `prompt_test.ts`
- the fold branches in `tools/discord/ingest.ts`, and the provider /
  model / spend-cap inputs and secrets in the workflow

Keep: `discord.ts`, `discover.ts`, `capture.ts`, `pending.ts`,
`index_page.ts`, the cursor, the gates, and `AGENTS.md`'s editorial rules.

## If a run fails

- Archive failed in Actions: check the Actions log for that day; the
  Muse run folds whatever is queued and does not re-pull Discord itself.
- Fold gates failed: report the gate, leave the queue intact, commit nothing.
- Push conflict: rebase once, then stop and report if it still fails.
- A capture from an unfamiliar venue appears in the queue: fold it only
  if the archive workflow produced it, note the venue in the report,
  and do not treat it as permission to widen scope.
