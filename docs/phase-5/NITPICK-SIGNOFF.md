# Phase 5 — Nitpick Sign-off

**Branch:** `phase-5-checker` · **Date:** 2026-10-03 · **Verdict: SIGNED OFF**

**Two reviews:**

- **First review:** NOT SIGNED OFF, because of H1.
- **Re-review:** after El Código's commit 6768989, which fixes H1, M1, M2
  and L1–L5. The fixes are listed in PLAN Part B, "Amendments after
  Nitpick's first Phase 5 review".

**Result:** every test passes, every planted error is caught, and there
are no open high findings.

## Test counts (`npm test`, full run after 6768989)

| Suite | Result |
|---|---|
| Unit | **412 / 412 pass**, including `phase5.test.mjs` (78) |
| DB | **10 / 10 pass** |
| E2E (desktop-chromium, iphone-webkit, android-chromium) | **397 pass, 0 fail, 2 skipped** |

**About these counts:**

- **The 2 skips** were there before Phase 5: the PWA guard, and the
  tap-target rule on desktop.
- **`phase5-checker.spec.mjs`:** 17 tests × 3 projects, and all 51 pass.
  That includes the two H1 tests that failed in the first review. They
  were not weakened: they are now unconditional, and they also prove the
  saved check belongs to the saved report, including after a reload.

## The plant table

| Plant | Must be | v1 checker (old prompt) | v2 checker (revised prompt) |
|---|---|---|---|
| P1: link removed | `unsourced` | `unsourced` (mechanical) | same |
| P2: $17.311B → $21.406B | NS or PARTLY | PARTLY (#9) | **NOT SUPPORTED** (#9) |
| P3: Volvo link → Wikipedia "Tractor" | NS | NOT SUPPORTED (#23) | **NOT SUPPORTED** (#23) |
| P4: section removed | `missing-section` | `missing-section` (mechanical) | same |
| P5: invented 2027 spin-off | NS | NOT SUPPORTED (#51) | **NOT SUPPORTED** (#51) |
| P6: 16 Sept → 16 March | NS or PARTLY | PARTLY (#36) | **NOT SUPPORTED** (#36) |

**All six are caught by both checkers.**

- **The v2 run** confirms M1: every figure, date and link plant is now NOT
  SUPPORTED, and none is left in the half-credit PARTLY bucket.
- **The plants are located by text,** then cross-checked against
  `claim_n` and the URL in `plants.json`.

| | Score | Grade | S / P / NS / U |
|---|---|---|---|
| **Planted, v1** | 86 / 100 | Needs work (capped) | 33 / 16 / 2 / 0 |
| **Planted, v2** | 82 / 100 | Needs work | 28 / 18 / 5 / 0 |
| **Clean, v1** | 95 / 100 | Strong | 43 / 8 / 0 / 0 |

**The clean report scores higher than either planted run.**

**v2's one unplanted NOT SUPPORTED is #2:**

- **The claim:** "listed on the NYSE as DE".
- **The problem:** it cites the Q3 release, which never mentions the NYSE
  or DE.
- **The verdict:** strict, but correct. Both v1 checkers had already
  marked it PARTLY for the same reason.

**Clean-control false-alarm rate:** 0 of 51 came back NOT SUPPORTED, which
is **0%**. That was under the old prompt; see R1.

**Variance between runs:**

- **Agreement:** the two v1 checkers agreed on 39 of the 47 unplanted
  claims the reports share (83%).
- **What the disagreements look like:** all 8 are SUPPORTED versus
  PARTLY.
- **One is a real catch:**
  - **The claim:** run 3 says Financial Services had "net income of
    $1.114 billion".
  - **What the page shows:** that figure is operating profit; net income
    is $890M.
  - **The two checkers:** the clean checker caught it, but the planted
    checker passed it.
  - **What it means:** a single check is evidence, not proof.

**How each fixture is tied to its prompt:**

- `checker-prompt-planted-v2.md` is byte-equal to the prompt the hub
  builds today.
- The two v1 prompt fixtures differ from today's prompt only in the
  instructions. Their claims lists are byte-equal to today's (tested), so
  replaying the v1 tables is still honest.

## Part A (unchanged since the first review; still passing)

**The rerun recipe:**

- its SHA-256 is `03fc5519…a79c6e`, matching PLAN, and it validates;
- it installs by paste and runs in Manual mode in all three projects, and
  `prompt-box` equals `prompt.md`.

**Its answer:**

- it renders with no missing sections;
- it invents no facts about the student: it has 12 placeholders in mixed
  styles, and nothing is flagged;
- the same check flags the v1.0 answer (150+, 73%, 4.5/5, 35%), so it
  has teeth. TEST-PLAN explains the method.

**Every v1.0 finding is gone.**

**Each `answer-prompt.md` is exactly `prompt.md` minus the no-invention
line.** This holds for Deere run 3 and the v1.0 job prep.

## Findings from the first review: status

| # | Finding | Fixed in 6768989 | Verified by |
|---|---|---|---|
| H1 | A check from one answer was shown and saved with another | One `checker-panel` per answer, created in `showResult` | e2e: "a new pasted answer clears the check…" and "opening the checker, then pasting a new answer…" (now unconditional, plus save and reload), × 3 projects |
| M1 | A wrong figure or date was graded PARTLY | Prompt: a wrong figure, date or name is always NOT SUPPORTED | unit: prompt wording; unit and e2e: the v2 replay puts P2, P3, P5 and P6 all at NOT SUPPORTED, 82/100 |
| M2 | Report text was not marked as data in the checker prompt | Prompt line before `Claims:` | unit (the line is there, before the claims list); newline forging was already blocked |
| L1 | The number cell glued its digits together | First integer only | unit: `3 (of 51)`→3, `1, 2`→1, `7.5`→7; no hit on 12, 351 or 75 |
| L2 | A `\|` in the evidence shifted the fix | Fix = last cell, evidence = the joined middle cells | unit: multi-pipe and three-cell rows |
| L3 | The parts didn't add up to the score | Score = the sum of the rounded parts | unit: the 74 case, plus 200 random tables |
| L4 | The summary and guide said quotations count | Wording fixed | unit: `installSummary` and guide §6b |
| L5 | `checker-needs-web` gave the wrong reason | It gives the real reason | e2e × 3: no key, no models, and paid search off |

## Residual observations (not blocking)

### R1: the clean control was not re-run under the revised prompt

**What we know:** v2 marks #2 (NYSE: DE) as NOT SUPPORTED, and the clean
report has the same claim. So a v2 check of the clean report would
probably flag at least that one.

**The effect:** under the grade cap, that would take clean from Strong to
Needs work. The score stays about 90+.

**Why that's fine:** it is correct behaviour, because the claim really
does cite a page that doesn't say it.

**But the cost:** the stricter prompt plus the cap means a careful report
with one loose citation reads "Needs work".

**Recommendation:** run a v2 clean check before the Phase 7 pilot, and add
the result to PILOT-CHECKLIST. The false-alarm rate isn't a pass bar, so
this doesn't block.

### R2: some inventions can only be caught by the citation check

**The example:** the v1.0 answer's invented "73%" sits on a line citing a
generic article, so advice mode counts it as "sourced". A unit test pins
this.

**The limit:** a single citation-check run can miss things, as the run
3 Financial Services error showed.

## What was reviewed and found sound

- **XSS:**
  - all verdict and fix text is rendered through `textContent`;
  - the e2e injects `<img onerror>`, `<b>` and `<script>`: nothing renders
    or runs, and the CSP stays clean.
- **Grade cap:** it matches the PLAN amendment, and the boundaries are
  exact.
- **State:** Check again clears the check. The check survives a reload and
  stays attached to its own answer. Save stores exactly
  `{score, outOf, parts, counts, checked}`.
- **Automatic mode:**
  - `run-checker` sends the web plugin and the check prompt;
  - a failed run shows `checker-error` and leaves the score incomplete;
  - `checker-needs-web` gives the true reason in each case.
