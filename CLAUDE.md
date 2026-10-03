# Brain Hub — Claude Code instructions

Forkable student command center. Read `docs/SPEC-v1.0.md`, then
`docs/DECISIONS.md` (which overrides the spec where they differ), then
`WIDGET-GUIDE.md` (the authoritative recipe format).

## Rules

- **Only modify files in this repo (brain-hub).** You may READ the sibling
  `Open-Brain` folder and the `open-brain-express` and `open-brain-student`
  repos, but never edit, commit or push to them. If you think another repo
  needs a change, stop and tell Paul why instead. (Paul's rule, 2026-10-03.)

- **No full drive paths in any file.** Paul works on three machines. Refer to
  sibling projects by name, e.g. "the `Open-Brain` folder next to this one".
- **No keys, passwords or tokens in any file.** Forks are public. Credentials
  are entered in the browser and stay there.
- **Core vs plugins.** Core features go in `core/`. Never change anything in
  `plugins/` after it ships, or student forks will conflict on Sync. The hub
  finds tools by listing `plugins/` through the GitHub API, so students never
  edit a manifest; `plugins.json` is an optional fallback only.
- **Never create a test Supabase project.** Test brain changes against a local
  throwaway Postgres, or report them as unverified.
- **TDD flow:** El Código specs → Nitpick test plan → El Código codes → Nitpick
  review. No freelancing outside it.
- **Paul does no hands-on checks.** Every phase ends with automated browser
  tests (`npm test`), at laptop size and in phone emulation, plus Nitpick's
  written sign-off. Anything emulation can't prove goes on
  `docs/PILOT-CHECKLIST.md`. PRs still wait for Paul's merge approval.
- **Phone first.** Every screen must work at phone width.
- **The brain contract is Express.** The hub targets `open-brain-express` main.
  Check that repo before assuming anything about the brain's schema or
  functions. Enrichment overwrites `tags`, `category` and `summary`, so hub
  data lives in `metadata.hub`.
- **Git:** Claude runs git; Paul never does. Work on feature branches, never
  main. Commit and push at the end of any session that changed files.
- Save finished work and session summaries to Paul's Open Brain.
