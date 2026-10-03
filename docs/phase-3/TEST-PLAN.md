# Phase 3 — Nitpick's Test Plan

**Author:** Nitpick · **Date:** 2026-10-03 · **Contract:** `docs/phase-3/PLAN.md`
(including §2a, the source-check revision) and DECISIONS #9–#12.

Independence was relaxed this phase: I read the core code, but every test
asserts the PLAN, not what the code happens to do.

## Done-when → tests

| Done when | Proven by |
|---|---|
| 1. Deere runs end to end in Manual mode | `company-analysis.test.mjs`: the prompt for `inputs.json` equals `prompt.md` byte for byte. E2E `real run: prompt-box equals prompt.md…` |
| 2. 0 unsourced claims and every section present in the real answer | `real-answer.test.mjs` (7 tests on the current `deere/answer.md`, i.e. run 3). E2E `real run: … 0 unsourced` |
| 3a. Saved row → Home's recent list | E2E `real run: save, then found again…` and `synthetic answer: found again…` |
| 3b. Brain search for "Deere" returns it | same two tests; they call the stand-in's `search-brain` with the hub's own session |
| 3c. Pulled into the next Deere prompt | same two tests; a fresh run puts `- (date) <summary>` under the notes header |
| 4. All three projects | every E2E test runs on desktop-chromium, iphone-webkit and android-chromium |

**PLAN test list → files:**
- `checkSources` rules (§2 and §2a): `tests/unit/checksources.test.mjs` and
  `tests/unit/checksources-2a.test.mjs`.
- Runs 1 and 2 as regression fixtures, in `checksources-2a.test.mjs`:
  - **run 1** (original prompt): 60 claims, 49 sourced, 3 unverified,
    8 unsourced. The 8 are the method statements: 1 in Business units,
    1 in Environmental scan, 6 in Limits.
  - **run 2** (Note-rule prompt): 53 claims, 52 sourced, 0 unverified,
    1 unsourced, the unmarked "PESTLE for … only." scope line.
  - A further test checks that `prompt.md` now asks for that scope line as
    a `Note:`.
  - Only the top-level `prompt.md` is compared to `prompt-box`. Each
    `run-N/prompt.md` matches the recipe of its own time.
- `buildSaveRow` with `sourceCheck`, recipe shape, `index.json`, and prompt
  equals `prompt.md`: `tests/unit/company-analysis.test.mjs`.
- E2E: `tests/e2e/phase3-company.spec.mjs`, 11 tests per project. They cover
  setup, the real run, save, found again (1–3), saving twice, the weak
  answer, the 160-character cut, §2a in the browser, and N = 0 hiding the
  check.
- Shared fixtures: `tests/helpers/phase3.mjs`, holding the Deere files plus
  the synthetic GOOD, WEAK and RULES answers.

**How the tests behave:**
- **Missing `answer.md`:** each real-answer test throws "answer.md missing".
  None skips silently.
- **Mechanism vs. real answer:** the same save and find-again flows also run
  on a synthetic answer. That proves the mechanism separately from the real
  answer.
- **Stand-in lifetime:** a fresh stand-in per test, about 1.2–1.7 s to
  build (measured). No rows are shared between tests.
- **Phase 2 guards still apply:** the network guard and the CSP-violation
  check run unchanged. The stand-in is the only brain these tests touch.

## Phase 2 tests changed

Both edits add the §2a fourth standard rule ("Statements about your own
method…"):
- `EXPECTED_BLOCK_LINES` in `tests/unit/prompt.test.mjs`;
- `STANDARD_BLOCK_RULES` in `tests/helpers/contract.mjs`.

## Stand-in review (`tests/standin/brain-standin.mjs`), and what I changed

The stand-in was sound: the real migration, real RLS, real dedup trigger and
unique index, and real `search_thoughts_hybrid`. Some gaps would have hidden
a hub regression, so I fixed them. Each fix is recorded in the file header.
- **Prefer was ignored.** A hub that dropped `resolution=merge-duplicates`
  would still have "saved twice" fine. Now a non-merge duplicate is a plain
  INSERT that fails 409/23505, and without `return=representation` the
  response body is empty.
- **Columns were fixed.** POST now inserts exactly the columns sent, as
  PostgREST does, so an unknown column fails.
- **GET dropped unknown filters silently.** It now returns 400 for any
  parameter or `order` it doesn't implement.
- **42501 was always 401.** PostgREST gives 401 to anon and 403 to a
  signed-in user; the stand-in now does the same. Anon GET and PATCH run as
  anon, so RLS returns nothing.
- **Tokens:**
  - a refresh token was accepted as an access token; they are now separate
    maps, and a used refresh token is revoked;
  - `expires_at` came from the real clock, while the browser clock is fixed.
    Tests run before noon UTC would have refreshed on every call. It now
    uses `FIXED_S`, as the fake brain does.
- **Hangs:** a handler that threw left the request hanging until the test
  timed out. It now answers 500.

**Still not reproduced** (on `PILOT-CHECKLIST.md`): PostgREST's own parsing,
Supabase Auth, the deployed `search-brain` function (whose source isn't in
this repo, so its response shape is taken from the Phase 2 PLAN), and
embeddings.

## Defects found in core (for El Código)

These are failing unit tests, written to PLAN §2.

- **D1 — `~~~` fences are not code.** `core/lib/output.js:64` only toggles
  on lines starting with ```` ``` ````. PLAN says "anything inside a fenced
  code block", and `~~~` is a fence in CommonMark and GFM.
- **D2 — a thematic break counts as a claim.** `---` on its own line is
  counted as an unsourced claim. It is not a list item, table row or
  paragraph. The hub's own STANDARD_BLOCK starts with `---`, so AIs echo it.
  (`***` and `___` escape only because emphasis is stripped.)
- **D3 — the two parsers disagree on what Summary is.**
  - `parseOutput` normalises punctuation (`output.js:23`), so it accepts
    `## **Summary**` and `## Summary:` and saves that text as the summary.
  - `checkSources` compares the raw lowercase text (`output.js:69`), so it
    counts the same sentences as unsourced claims.

## PLAN ambiguities and defects

- **A1 — a bold sentence is invisible to the check.** An item that is
  entirely bold is a "label", even when it is a whole factual sentence:
  `- **Deere revenue fell 12%.**` yields 0 claims (`output.js:49` even
  allows a trailing `.`). An AI that bolds its key findings escapes the
  check.
  - **Suggest:** a label has no sentence punctuation inside it and is short
    (for example 8 words or fewer).
- **A2 — lazy continuation.** §2a covers *indented* continuation lines only.
  An unindented line directly after an item (CommonMark lazy continuation)
  becomes a separate paragraph claim, so the item looks unsourced. The PLAN
  is silent on this; I wrote no test for it.
- **A3 — inheritance overrides the AI's own mark.** A nested item with no
  link of its own is "sourced by inheritance" even when it says
  `[unverified]`. That reports more sourced claims than the AI itself
  claimed. I tested it as the PLAN reads.
  - **Suggest:** the item's own `[unverified]` should win.
- **A4 — re-find depends on the ticker.**
  - **Why:** the brain query is the company exactly as typed, and keyword
    search needs every word to match.
  - **Here:** "Found again (3)" passes for run 1 only because its Summary
    happens to contain "(NYSE: DE)".
  - **When it fails:** a summary that says "Deere & Company" without the
    ticker would never be re-found on a brain without embeddings. That
    covers any Express brain whose embedding call fails, and the stand-in.
  - **Suggest:** query on the company name only, or have the hub append the
    company input to the saved content.
- **A5 — saving twice overwrites silently.** "Saving twice" leaves one row
  by design. But a second save with the same summary and a *different*
  report also silently overwrites the first report, because merge-duplicates
  updates metadata. That's probably fine, but it isn't stated.
- **A6 — what "items" covers.** PLAN §2 says "items" ending in `?`/`:` are
  not claims. The code applies this to paragraphs too, which matches
  DECISIONS #12 ("lead-in lines"). I tested that reading.
- **A7 — the PLAN pinned no thresholds for the real answer.** I added three
  bars of my own to `real-answer.test.mjs`:
  - at least 20 sourced claims;
  - `[unverified]` at most a quarter of sourced;
  - at least 10 distinct real source URLs, with no `example.*` addresses.

## Results at hand-off

See the report to El Código. The tests that need run 3's `deere/answer.md`
fail with "answer.md missing" until it lands: 7 unit, plus 2 E2E per
project. D1–D3 fail until
they are fixed.

## Update after PLAN §2b (2026-10-03)

D1–D3 and A1–A7 are resolved in PLAN §2b and DECISIONS #13–#15, and the
tests now follow the amended contract.
- **Real answer:** done-when #2 uses the #15 bar: at least 95% of claims
  sourced or `[unverified]`, and every unsourced claim listed on screen.
- **Run 3** is `deere/answer.md`. Runs 1 and 2 are regression fixtures.
- **Results and the final verdict** are in `NITPICK-SIGNOFF.md`.
- **The source audit** is in `SOURCE-AUDIT.md`.
