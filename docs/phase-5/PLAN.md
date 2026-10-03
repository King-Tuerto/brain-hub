# Phase 5 — Guide v1.1 + the Checker: El Código's Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `phase-5-checker`
Paul's go-ahead and answers are in DECISIONS #18. **Claude merges this branch
itself once Nitpick signs off.** Phase 6 is out of scope: it changes another
repo, so Claude stops and writes up instead (`docs/phase-6/PROPOSAL.md`).

## Part A — guide v1.1 and the standard rules (DECISIONS #16–#18)

1. **`STANDARD_BLOCK` (`core/lib/prompt.js`)** has these lines, in order:
   - `---`;
   - the format line;
   - one `- <section>` line per section, then `- Summary`;
   - the source rule: `SOURCE_RULE_FACTS`, or `SOURCE_RULE_ADVICE` when
     `recipe.sourcing === 'advice'`;
   - `NOTE_RULE`;
   - **`NO_INVENTION_RULE`**, added to every prompt whatever the recipe
     says;
   - the Summary line.

   All the rule strings are exported constants.
2. **Optional recipe field `sourcing: facts | advice`.**
   - **Validator:** any other value is an error; leaving it out means
     `facts`. Recipe format stays `1`, so v1.0 recipes are unchanged.
   - **Install summary:** shows `summary-sourcing`.
3. **`checkSources(md, { sourcing })`.**
   - **`advice` mode:** counts only claims containing a figure, `%`, a
     currency sign, or a quotation of 6+ characters (`FACT_RE`).
   - **The result shape stays the same.**
   - **New `claimItems(md, opts)`:** returns
     `[{ section, text, status, urls }]` for every counted claim. For an
     inherited source, `urls` holds the parent's links.
4. **The guide (`WIDGET-GUIDE.md` v1.1)** adds:
   - the shared-body rule (§1) and optional-input handling (§4);
   - narrow brain queries (§5) and when to choose `web_search` (§6a);
   - `sourcing` (§6b) and the new standard rules (§8);
   - an updated example and a checklist (§11).
5. **Phase 4 rerun.** A fresh **Sonnet** agent built `interview-prep` from
   guide v1.1 alone, and a fresh **Haiku** agent answered it as the AI app.
   - **No hand-fixing:** the file is verbatim in
     `tests/fixtures/phase-4-rerun/`, with SHA-256 `03fc5519…a79c6e`.
   - **Pass bar:**
     - it validates;
     - it installs by paste and runs in Manual mode;
     - its answer renders with no missing sections;
     - **the answer invents no facts about the student**: placeholders
       appear instead of made-up figures;
     - every v1.0 finding is gone: no personal name in the body, narrow
       query, `sourcing: advice`, `web_search` not `required`, and the
       optional input handled.
3a. **Revised after the rerun answer**, before any Phase 5 test ran.
   - **The trigger:** the first advice-mode rule flagged 24 of 27 lines in a
     good coaching answer. They were suggested interview questions in
     quotes, words quoted from the posting, and placeholders.
   - **The new rules:**
     - `FACT_RE` is `/\d|%|[$€£]/`, tested after removing `[…]`
       placeholders and `(1)`-style enumerators. Quotations no longer count.
     - **For both modes:** a line is a question if it ends in `?` followed
       only by closing quotes or brackets, or by a trailing `[note]`.
   - **Effect:**

     | Answer | Before | After |
     |---|---|---|
     | Rerun answer (advice) | 24 of 27 flagged | 4 claims, 3 unsourced |
     | v1.0 job-prep answer (advice) | — | 11 claims, 6 unsourced, **including every invented student figure** |
     | v1.0 job-prep answer (facts) | 50 claims, 41 unsourced | 41 claims, 32 unsourced |

     The 50 → 41 drop is quoted questions that are no longer counted.
     Deere runs 1–3 are unchanged: 60/49/3/8, 53/52/0/1, 53/51/0/2.
6. **Fixtures:** prompt fixtures regenerated for the new block. The prompts
   the old answers responded to are kept as `answer-prompt.md`.

## Part B — the Checker (`core/lib/checker.js`)

**Spec §11.3:** it grades any tool output against a rubric (sources present,
claims supported, sections covered), returns a score and specific fixes, and
runs the citation check.

### Contracts

```js
claimsToCheck(report, recipe) → { checked: [{ n, section, text, urls }], skipped }
// Every claim with status 'sourced', in order, numbered from 1, at most MAX_CLAIMS (60).
buildCheckerPrompt(checked) → string
parseCheckerAnswer(text, checked) → { verdicts: [{ n, verdict, evidence, fix }], missing: [n] }
scoreReport(report, recipe, citation|null) → { score, outOf, complete, parts, counts, checked, skipped, fixes: [{ kind, n?, text }] }
grade(result) → 'Strong' | 'Good' | 'Needs work' | 'Weak'   // ≥90%, ≥75%, ≥50% of outOf;
// any NOT SUPPORTED caps the grade at 'Needs work' (amended after the real check:
// the planted report with a fabricated claim scored 86 = 'Good'). UI shows `checker-contradicted`.
```

- **Rubric (100):**
  - **sections, 20:** present ÷ (recipe sections + Summary);
  - **sources present, 30:** (sourced + unverified) ÷ claims, or 30 when
    there are no claims;
  - **claims supported, 50:** (SUPPORTED + ½·PARTLY) ÷ checked. Unreachable
    and missing rows earn 0.
- **Without the citation check:** `outOf` is 50 and `complete` is false.
- **Verdict table:** a row is `| n | VERDICT | evidence | fix |`.
  - **Verdicts:** SUPPORTED, PARTLY, NOT SUPPORTED, UNREACHABLE. The parser
    also accepts the variants UNSUPPORTED, PARTIAL, PARTIALLY and PARTLY
    SUPPORTED, in any case.
  - **Ignored rows:** numbers outside the list, duplicates (the first row
    wins) and unknown verdicts.
- **Fix kinds, in this order:**
  1. `missing-section`
  2. `unsourced`
  3. `not-supported`
  4. `partly`
  5. `unreachable`
  6. `not-checked`
  7. `skipped`

  No claim is ever dropped silently.

### UI (result card)

- **The button:** `check-btn` opens `checker-panel` with:
  - `checker-score`: "Score so far: X / 50 — the citation check has not
    been run yet", or "Score: X / 100 — Grade";
  - `checker-parts`;
  - `checker-fixes` (one `li[data-kind]` per fix).
- **Citation check, Manual mode** (or Automatic with paid search off, which
  shows `checker-needs-web`): `checker-prompt` (read-only),
  `copy-checker-prompt`, `checker-open-ai`, `checker-answer` and
  `use-checker-answer`.
  - **Unreadable answer:** `checker-error`.
  - **After scoring:** `checker-redo`.
- **Citation check, Automatic mode with paid search on:** `run-checker`.
  This runs OpenRouter with the web plugin, labelled as weaker than opening
  each link.
- **State:** `st.checkAnswer` persists across reloads. A new run, or a new
  pasted answer, clears it. A completed check is saved as `metadata.hub.check`.

## Done when (spec: "catches planted errors")

The planted report is `tests/fixtures/phase-5/planted.md`: the real Deere
run 3 answer with six known errors, listed in `plants.json`.

| Plant | Error | Caught by | Must be |
|---|---|---|---|
| P1 | link removed from a claim | mechanical | in fixes as `unsourced` |
| P2 | PPA revenue $17.311B → $21.406B, link kept | citation check | NOT SUPPORTED or PARTLY |
| P3 | Volvo claim's link swapped to an unrelated page | citation check | NOT SUPPORTED |
| P4 | "Suggested further research" section removed | mechanical | `missing-section` |
| P5 | invented "spin-off in 2027" claim citing a real Deere page | citation check | NOT SUPPORTED |
| P6 | Fed date 16 Sept → 16 March 2026 | citation check | NOT SUPPORTED or PARTLY |

- **The real runs:** two independent fact-checker agents, using live web
  and seeing only the checker prompt, answer for the planted report and for
  the **clean** run 3. Their tables are fixtures, so the browser tests
  replay real checks.
- **The control:** the clean report's NOT SUPPORTED rate is **reported**
  (false alarms). It isn't a pass bar, because an honest checker may find
  real weaknesses in run 3.
- **Tests:** unit (all contracts, the rubric arithmetic, parser edge cases,
  the plants) and e2e (all three projects):
  - paste the planted answer → the mechanical fixes show P1 and P4;
  - paste `checker-answer-planted.md` → the fixes show P2, P3, P5 and P6 as
    not supported or partly;
  - the score is complete;
  - Save stores `metadata.hub.check`;
  - the clean control scores higher than the planted report.
- **Nitpick signs off**, then Claude merges to main and confirms the live
  site.
