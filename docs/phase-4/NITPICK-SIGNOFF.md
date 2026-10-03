# Phase 4 — Nitpick Sign-off

**Reviewer:** Nitpick (QA) · **Date:** 2026-10-03 · **Branch:** `phase-4-guide-proof`

## Verdict: SIGNED OFF

The Sonnet agent's tool **installs and works with no hand-fixing**, on laptop,
iPhone (WebKit) and Android (Chromium) emulation. The recipe was never touched:
its SHA-256 is still `355bc6b0…adbc4`, the value recorded in `RESULT.md`, and a
test fails if that ever changes.

That verdict is about the bar in PLAN ("installs and works"). It is **not** a
verdict that the guide is good enough. The findings below are real, and two of
them (sourcing, invented facts) would mislead a student today.

## Counts — full `npm test`

| Suite | Passed | Failed | Skipped |
|---|---|---|---|
| Unit | 330 | 0 | 0 |
| DB | 10 | 0 | 0 |
| Browser (3 projects) | 346 | 0 | 2 |

The 2 skips are old and deliberate (the tap-target rule on the laptop project,
and WebKit's service-worker offline test). Phases 2–3 stay green.

**Phase 4's own share:** 6 unit tests and 6 browser tests × 3 projects = 18.

## What the tests prove (PLAN "Method")

| Check | Result |
|---|---|
| Fixture SHA-256 equals RESULT.md (hash read from the doc itself) | pass |
| `parseRecipe` with the file name: ok, 0 errors, id matches | pass |
| Paste in Add tool: no `recipe-errors`; summary shows the 3 exact permission texts, query "resume background skills experience", "Needs web search", privacy warning; Install → tile on Home | pass |
| `plugins/` via fake GitHub: tile appears from the listing alone; no `plugins.json` fetched after the refresh; the review gate, then a run, gives `prompt.md` | pass |
| Manual run with `inputs.json`, stand-in brain connected: `prompt-box` equals `prompt.md` byte for byte; the agent's query was sent to search-brain | pass |
| `answer.md` pasted: all 4 sections render, no `missing-sections`; `source-check` warns and lists every unsourced line | pass |
| Save with the stand-in brain: one row, `metadata.hub.tool = 'job-interview-prep'`, version, type, tags | pass |
| No horizontal scroll: prompt, result, source-check list and save panel, at device size and 320 px | pass |

**`{{today}}`:** compared exactly, not with the date stripped. The browser
clock in every test is fixed at 2026-10-03, the day `prompt.md` was built.
Stripping the date would hide a hub that filled `{{today}}` wrongly. A unit
test also shows the date is the *only* part of the prompt that changes with
the day.

**Missing answer:** while `answer.md` was absent, the answer tests failed with
"answer.md missing", not skipped (same pattern as Phase 3).

## Source-check of the job-prep answer (reported, not graded)

| Claims | Sourced | [unverified] | Unsourced |
|---|---|---|---|
| 50 | 9 | 0 | **41** |

The student sees "41 of 50 claims have no source" and a 41-line list. Six
distinct URLs were cited. They were not checked (tests have no network), and
the answering agent had no web access, so they may not be real pages.

## Where the guide failed a different AI — blunt

1. **The sourcing rule doesn't fit advice tools.**
   - 41 of 50 "claims" are advice ("Describe any time you surveyed
     students…"), not facts. No link could ever source them.
   - The AI marked **zero** as `[unverified]`, so the rule is simply ignored
     when the content is opinion.
   - The student gets a 41-item warning that is almost all noise, which
     teaches them to ignore the warning on the tools where it matters.
   - The guide gives a recipe author no way to say "this is an advice tool".
     This is a guide/hub design gap, not something the author did wrong.
2. **Invented facts about the student.**
   - The brain was empty, yet the answer leads with "event attendance up 40%,
     member satisfaction 4.5/5".
   - The guide never tells authors what the AI should do when notes are
     "(No personal notes available.)".
   - For a resume tool, invented accomplishments are the worst possible
     failure. The guide should require a line like "If you know nothing about
     me, don't invent anything; tell me what to add."
3. **The author's identity is baked into a shareable tool.**
   - The body says "I'm Maria Lopez". Every other student who installs this
     plugin sends prompts claiming to be Maria.
   - The agent copied the guide's own example ("I'm a university student going
     to a networking event…", with `author` beside it).
   - The guide never says the body is shared with everyone who installs the
     tool, and the validator can't catch it.
4. **`web_search: required` without guidance.**
   - For interview prep, "required" adds "Search the web… and cite what you
     find". In Manual mode with an app that can't browse, that invites
     made-up links.
   - The guide doesn't help an author choose between `required`, `helpful`
     and `none`.
5. **The brain query** (already in RESULT.md). Four fixed words, ANDed by
   keyword-only search, will rarely match one note. This is confirmed: the hub
   sends the query verbatim.
6. **Optional input with no handling.**
   - A blank "weaknesses" becomes "(not provided)", but the body never tells
     the AI what to do with that.
   - The Phase 3 recipe does handle it, so the guide should say to.
   - This is minor.

None of these is a core (hub) defect, so there is nothing to send back to El
Código as a code fix. Findings 1–4 and 6 are guide changes for PLAN's
"fix the guide, rerun with a fresh Sonnet agent" loop. Finding 1 may also need
a hub feature (a per-recipe sourcing mode), which is Paul's call.

## Files

- `tests/unit/phase4.test.mjs`
- `tests/e2e/phase4-guide-proof.spec.mjs`
- `tests/helpers/phase4.mjs` (shared fixture loader: hash, inputs, prompt, `readAnswer`)
