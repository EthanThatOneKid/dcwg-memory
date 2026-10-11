# SPARQL Queries

Saved query inventories make this wiki operational, not just readable. Run them from the repo root with `wiki query`.

```bash
wiki query < queries/pages-by-type.sparql
```

On Windows PowerShell the equivalent is `Get-Content queries/pages-by-type.sparql -Raw | wiki query`.

Prefixes such as `schema:`, `wiki:`, `wazoo:`, `sh:`, and `xsd:` come from `wiki.yml`; do not add duplicate `PREFIX` lines unless querying outside the Wiki CLI.

## Operating inventories

| Question | Query file |
| --- | --- |
| What pages exist, grouped by type? | `pages-by-type.sparql` |
| Which pages are missing a `schema:name`? | `pages-missing-name.sparql` |

## Query rule

If a recurring question cannot be answered with a saved query or a canonical index page, either add the missing semantic frontmatter or add the query here.

Empty results are useful when they prove the graph is clean. Empty results can also expose a modeling gap, such as a register table that has not yet been promoted into first-class entity pages.
