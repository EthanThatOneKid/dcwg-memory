# dcwg-memory: agent instructions

Private repo. Discord captures name third parties and record coordination about
approaching individual Deno maintainers. Never publish, mirror, or republish the
contents.

## What this repo owns

One subject: the Deno Core Working Group's work on forking, handoff, and
stewardship of the Deno runtime after Cloudflare acquired Deno Land Inc. on
2026-10-09.

## Rules

- `raw/` is append-only evidence and the only source of truth: `raw/discord/`
  holds verbatim channel captures, `raw/briefs/` holds briefs received from
  outside the repo. Never edit or rename either; add a new file. The hub's
  `memory/scripts/memory_check.py` fails when a capture is modified or deleted.
- A capture is verbatim, including typos, wrong claims, and handle spellings.
  Corrections belong in `wiki/`, not in the capture.
- `raw/<source>/SUMMARY.json` is connector-owned. Do not hand-edit beyond
  seeding it, and update the counts when a capture is added.
- Wiki pages are typed and cross-linked, and they must separate what a
  participant said from what is externally verifiable. Attribute a claim to the
  handle that made it; cite a published fact with a footnote. A received brief is
  a claim, not a source: check it against a live API or published reporting
  before a wiki page repeats it, and say in the page when it did not survive
  that check.
- Anything numeric or state-dependent (star counts, org membership, license,
  scope, EOL horizon) gets the date it was read. Live state drifts and the repo
  is a record, not a mirror.
- Filenames must match `wiki.filename_pattern` (`[A-Za-z0-9_()-]+\.md`): no
  spaces, no apostrophes. A handle that cannot be a filename goes in a
  participants page instead of a per-person page.
- After any edit: `wiki check && wiki fmt --check && wiki lint`, all passing.

## Adding a Discord capture

1. Capture the session verbatim into `raw/discord/<YYYY-MM-DD>_<venue>.md` with
   frontmatter naming the venue, date, and observable participants. Keep
   timestamp lines exactly as displayed; the timezone is not captured and must
   not be inferred.
2. Update `raw/discord/SUMMARY.json` counts.
3. Fold anything durable into the wiki pages, attributing claims to handles.
4. Run the three validation commands.

## What this repo is not

Not a public advocacy document and not a place for polished positions. The
record's value is that a later session can tell what was observed, what was
argued, and what was verified, and only the `wiki/` layer is allowed to conclude
anything.
