# Brain Hub — Claude Code instructions

Forkable student command center. Read `docs/SPEC-v1.0.md`, then
`docs/DECISIONS.md` (which overrides the spec where they differ), then
`WIDGET-GUIDE.md` (the authoritative recipe format).

## Rules

- **No full drive paths in any file.** Paul works on three machines. Refer to
  sibling projects by name, e.g. "the `Open-Brain` folder next to this one".
- **No keys, passwords or tokens in any file.** Forks are public. Credentials
  are entered in the browser and stay there.
- **Core vs plugins.** Core features go in `core/`. Never write to `plugins/`
  except `plugins/plugins.json` in its initial form, and never change that file
  after it ships, or student forks will conflict on Sync.
- **Never create a test Supabase project.** Test brain changes against a local
  throwaway Postgres, or report them as unverified.
- **TDD flow:** El Código specs → Nitpick test plan → El Código codes → Nitpick
  review. No freelancing outside it.
- **Phone first.** Every screen must work at phone width.
- **The brain contract is Express.** The hub targets `open-brain-express` main.
  Check that repo before assuming anything about the brain's schema or
  functions. Enrichment overwrites `tags`, `category` and `summary`, so hub
  data lives in `metadata.hub`.
- **Git:** Claude runs git; Paul never does. Work on feature branches, never
  main. Commit and push at the end of any session that changed files.
- Save finished work and session summaries to Paul's Open Brain.
