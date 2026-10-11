# dcwg-memory

Private memory repo for the Deno Core Working Group (DCWG): the community effort
to carry the Deno runtime forward after Cloudflare acquired Deno Land Inc. on
2026-10-09 and Deno announced it would end its own runtime development.

Part of the `*-memory` family (`memory` is the hub). This repo owns one subject:
what the group knows, proposes, and decides about forking, handoff, and
stewardship of Deno.

**Private on purpose.** The `raw/` captures are Discord conversations with named
participants who did not agree to be published, and they contain coordination
about approaching individual Deno maintainers. Do not make this repo public, do
not mirror it into a public wiki, and do not republish participant identities or
quotes outside this repo.

## Layout

```
raw/discord/             append-only channel captures, one file per session
raw/briefs/              append-only briefs received from outside this repo
  SUMMARY.json           machine contract read by memory/scripts/memory_check.py
wiki/                    the typed record, authored from the captures
wiki.yml                 Wiki CLI config (wazootech-wiki)
```

## Layers

`raw/` is evidence and it is append-only. A capture is what arrived, verbatim,
including the parts that turned out to be wrong. It is never edited; a correction
is a new capture or a note in `wiki/`.

`wiki/` is the derived record: typed pages with frontmatter, cross-linked with
wikilinks, and carrying their own provenance. A wiki page is allowed to conclude
something no individual capture says, which is the entire reason the two layers
are separate.

The distinction matters most for the two received briefs in `raw/briefs/`. They
are model-written analysis, useful as research scaffolding and unreliable as
fact. The wiki pages they informed were checked against the GitHub, JSR, and
crates.io APIs and against published reporting, and where a brief's claim did not
survive that check, the wiki page says so. Treat a brief as a claim, never as a
source.

## Pages

| Page | What it holds |
| --- | --- |
| `wiki/Deno.md` | The runtime and the verified acquisition, end-of-life schedule, and asset state |
| `wiki/Deno_Core_Working_Group.md` | What the group is, how it convened, and what it decided |
| `wiki/Deno_Core_Working_Group_Participants.md` | Who was in the founding session, and which handles map to confirmed identities |
| `wiki/Deno_Runtime_Handoff.md` | Terms of a handoff: possible, negotiable, or out of reach |
| `wiki/Deno_Fork_Options.md` | One fork or two, and the naming candidates including what was rejected |
| `wiki/Ende_Runtime.md` | Paul Anthony Webb's stripped fork, the first concrete fork to exist |
| `wiki/Ende_vs_Dodo.md` | Why the two named forks are a project and a preference, not rivals |
| `wiki/Runtime_Architecture_Proposals.md` | Minimal core plus extensions, the host-language question, and the fork-versus-rewrite order |
| `wiki/Prior_Art_Runtimes.md` | What already implements that design, read on 2026-10-11, and what is genuinely new |
| `wiki/Fresh_Framework_Migration.md` | The Fresh precedent, and exactly how far the analogy holds |
| `wiki/Luca_Casonato.md` | Fresh's creator and the handoff precedent's human through-line |

## Adding a capture

A Discord session is captured verbatim into `raw/discord/` with a frontmatter
header naming the venue, the date, and the participants observable in the log.
Timestamp lines are kept exactly as the client displayed them; the timezone is
not captured and is not inferred. The next capture is a new file, never an edit
of the previous one.

## Validation

```bash
wiki check        # config, frontmatter, routes
wiki fmt --check  # canonical frontmatter/body formatting
wiki lint         # links, filenames, headings
```

`python scripts/memory_check.py --root .` from the `memory` hub validates the
`raw/` contracts and the append-only invariant.

## Provenance

Every wiki page carries `wazoo:source: dcwg`. Pages that restate a Discord claim
name the participant who made it; pages that restate a published fact carry a
footnote citation. Numbers in `wiki/Deno.md` and `wiki/Fresh_Framework_Migration.md`
were read from live APIs on 2026-10-11 and are dated so that a stale figure is
obvious rather than invisible.
