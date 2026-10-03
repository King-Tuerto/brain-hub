# Phase 3 — Nitpick Sign-off

**Reviewer:** Nitpick · **Date:** 2026-10-03 · **Branch:** `phase-3-company-analysis`
**Verified against:** El Código's commit `271619d`, plus my test changes on top of it.

## Verdict: SIGNED OFF — 2026-10-03, after the F1 fix

El Código fixed F1: `extractSources` now skips bare-URL matches that fall
inside a Markdown link. I re-ran the full `npm test` myself and it exits 0.
Every Phase 3 done-when is proven, Phase 2 is still green, and no finding
is open at any severity.

## Test results (my own full `npm test`, after the F1 fix)

| Suite | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Unit (`tests/unit`) | 324 (248 Phase 2 + 76 Phase 3) | 324 | 0 | 0 |
| Database proof (`tests/db`) | 10 | 10 | 0 | 0 |
| Browser (`tests/e2e`), 110 tests × 3 projects | 330 (285 Phase 2 + 45 Phase 3) | 328 | 0 | 2 |

The 2 skips are Phase 2's deliberate ones: the tap-target check at laptop
size, and WebKit's offline reload.

## Done-when, as amended (PLAN §2a, §2b; DECISIONS #13–#15)

| # | Done when | Status | Evidence |
|---|---|---|---|
| 1 | Deere runs end to end in Manual mode | ✅ | In all three projects, `prompt-box` equals `prompt.md` byte for byte. Run 3 is the answer of an independent research agent, given only that prompt. |
| 2 | Every claim has a source (DECISIONS #15 bar) | ✅ | Run 3 has 53 claims: 51 sourced, 0 unverified, 2 unsourced, so **96.2%** of claims are sourced. Both unsourced claims are listed on screen, exactly. No section is missing, and the answer cites 21 distinct URLs. |
| 2 | Source audit | ✅ PASS | `SOURCE-AUDIT.md`: 21 of 21 URLs resolve, 24 claims spot-checked, 0 "not supported". |
| 3 | Saved, then found again (stand-in brain) | ✅ | Run 3 saved: one row holding the tool, version, tags (including the company), report, sources and `source_check`. It is then found again three ways: on Home, by searching "Deere", and in the next Deere prompt. |
| 3 | Found again without the ticker (A4, DECISIONS #13) | ✅ | A summary without "NYSE"/"DE" is found by the next run's exact query, with keyword-only search. A control test proves it would not be found without the context line. |
| 4 | Laptop, iPhone (WebKit), Android (Chromium) | ✅ | All 45 Phase 3 browser tests pass in every project. That includes no sideways scroll at device size and at 320 px with the real answer on screen. |

**Regression fixtures** score exactly as recorded:
- run 1: 60 claims, 49 sourced, 3 unverified, 8 unsourced;
- run 2: 53 claims, 52 sourced, 0 unverified, 1 unsourced.

## Findings

| # | Severity | Status | What |
|---|---|---|---|
| D1–D3 | Medium | **Fixed** (§2b), tests pass | `~~~` fences; `---`/`***`/`___` rules; the Summary heading recognised the same way by both parsers |
| A1–A7 | — | **Resolved** (§2b, DECISIONS #13–#15), tests pass | Label limit raised to 15 words, and a bold sentence is a claim; lazy continuation; an item's own `[unverified]` wins over inheritance; context line on save; the latest report wins on a repeat save |
| F1 | Low | **Fixed**, its test passes | Details below. |
| F2 | Info | — | Run 3's two unsourced "What it sells" bullets are true (10-K). The checker flags them correctly. |
| F3 | Info | — | `census.gov/…/newresconst.pdf` is a "latest release" file and changes on 20 Oct. Student guidance should prefer dated URLs. |
| F4 | Info, for Phase 5 | — | SEC and Investing.com return 403 to scripts but work in a browser. A future link checker must not call them dead. |

**F1 in detail (now fixed):**
- **Where:** `extractSources`, in `core/lib/output.js`.
- **What happens:** a link whose URL contains `'` (`…federal-gov't-funding/`)
  is saved twice: once in full, once cut off at the `'`.
- **Real effect:** run 3's saved `metadata.hub.sources` contains the broken
  cut-off URL.
- **Fix:** skip bare-URL matches that fall inside a Markdown link already
  matched.
- **Test:** `checksources-2a.test.mjs`, "a Markdown link whose URL contains
  an apostrophe…".

## Test changes I made this round

- **Updated to the amended contract:**
  - A3: an item's own `[unverified]` wins;
  - DECISIONS #13 content in `save.test.mjs`, `company-analysis.test.mjs`,
    `save-download.spec.mjs` and the Phase 3 spec;
  - the real-answer tests, now on the #15 bar (≥95%, and every unsourced
    claim shown in `unsourced-list`).
- **Added:**
  - D1–D3, A1 (a bold sentence vs. a 15/16-word label) and A2 (lazy
    continuation);
  - A4 (re-found without the ticker, plus a control test);
  - DECISIONS #14 (latest report wins);
  - a layout check on the real answer;
  - the run-2 regression;
  - F1.
- **Flake guard:** `layout.spec.mjs` now allows 60 s. Under a full parallel
  run, WebKit's long screen tour once took over 30 s (8–15 s when run
  alone). It is not a product issue.

## Unverified, for Paul (also on `PILOT-CHECKLIST.md`)

- Save, search and re-find against a real student Express brain on Supabase.
  Everything here ran on the local stand-in.
- **Confirm DECISIONS #15.** "Every claim has a source" is met as "≥95%,
  and every gap is shown to the student", not as "100%".
