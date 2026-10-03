# Phase 5 — Test Plan (Nitpick)

**Binding:** `docs/phase-5/PLAN.md` (including 3a and the `grade` amendment),
DECISIONS #16–#18, `WIDGET-GUIDE.md` v1.1. Expected strings and numbers are
spelled out in the tests from those documents, never read back from core.

**Fixtures from other agents:** `checker-answer-planted.md`,
`checker-answer-clean.md` and `phase-4-rerun/answer.md` are read through
`tests/helpers/phase5.mjs`. If one is missing, every test that needs it
**fails** with "`<file>` missing". None skip.

## Files

| File | What |
|---|---|
| `tests/unit/phase5.test.mjs` | Checker contracts, rubric arithmetic, parser edge cases, `claimItems`, advice-mode counting, `sourcing` validation, install-summary text, the plants, the rerun bars, answer-prompt honesty |
| `tests/e2e/phase5-checker.spec.mjs` | PLAN "Done when", the Checker UI and its state, Automatic mode, the rerun tool installing by paste and running, layout. Runs in all three projects |
| `tests/helpers/phase5.mjs` | Fixture readers, plus the "invents no facts" check |
| `tests/unit/prompt.test.mjs` (updated) | `STANDARD_BLOCK` now has the source rule (facts/advice), `NOTE_RULE` and `NO_INVENTION_RULE` |
| `tests/helpers/contract.mjs` (updated) | `STANDARD_BLOCK_RULES` gains the no-invention line |
| `tests/e2e/phase4-guide-proof.spec.mjs` (updated) | The v1.0 pin moves from 41 of 50 to 32 of 41 (PLAN 3a: quoted questions aren't claims) |
| `tests/helpers/fake-openrouter.mjs` (updated) | Adds a `{ text }` script, so a test can return a verdict table |

## Unit tests

- **Checker contracts:**
  - the constants;
  - `claimsToCheck`: sourced claims only, in order, numbered from 1, with
    their URLs; inherited URLs; the 60 cap, with `skipped` and its fix;
  - `buildCheckerPrompt`: the table format, one entry per claim, links
    reduced to titles;
  - a multi-line claim stays one entry, so a report can't forge extra
    numbered claims;
  - the planted and clean prompt fixtures are byte-equal to what the hub
    builds, so each real verdict table is tied to the prompt it answered.
- **Parser:**
  - variants in any case: UNSUPPORTED, PARTIAL, PARTIALLY, PARTLY
    SUPPORTED, lowercase and bold;
  - duplicates (the first wins); out-of-range numbers (0, 5, 99);
  - unknown verdicts, which are reported missing; an unknown row doesn't
    block a later valid row;
  - garbled input (prose, bullets, empty, null, bare pipes);
  - CRLF line endings, `1.` and `#2` number cells, no trailing pipe, a row
    with only `n | verdict`;
  - both real tables parse fully: 51 rows, none missing.
- **Rubric:** hand-computed cases.
  - 2 of 3 sections gives 13.3, and 3 of 4 claims gives 22.5.
  - Out of 50 without the citation check: `complete` false, `support` and
    `counts` null.
  - SUPPORTED plus PARTLY gives 37.5. UNREACHABLE and missing rows earn 0.
  - No claims gives 30, and nothing to check gives 50. A perfect report
    scores 100.
  - All seven fix kinds come in PLAN order. Every claim that isn't
    SUPPORTED, and every unsourced claim, has a fix.
- **`grade`:** exact boundaries (90, 89, 75, 74, 50, 49). A NOT SUPPORTED
  verdict caps a Strong or Good grade at Needs work, and never raises a
  Weak one.
- **Plants:**
  - P1 is `unsourced` and P4 is `missing-section`, both found mechanically;
  - P2–P6 are looked up by their `find` text, then cross-checked against
    `claim_n` and the URL in `plants.json`;
  - planted is complete and grades Needs work;
  - clean scores higher; its false-alarm rate is printed as a diagnostic;
  - regression pins: 86 and 95, with the recorded counts.
- **Advice mode (PLAN 3/3a):**
  - coaching isn't counted, and an invented "attendance up 40%" is;
  - `\d`, `%`, `$`, `€` and `£` count; placeholders and `(1)` enumerators
    don't;
  - quotations count only in facts mode;
  - the question rule applies in both modes;
  - El Código's pins: v1.0 advice 11/5/0/6, which includes every
    unsourced invented figure; v1.0 facts 41/9/0/32; rerun 4/1/0/3; Deere
    runs 1–3 unchanged.
- **`sourcing` validation and the install summary:** `facts`, `advice` and
  leaving it out are accepted. `Advice`, `opinion`, `true`, `[facts]`, `""`
  and an empty value are errors that name both values.
- **Rerun bars (PLAN 5):**
  - the full SHA-256, which must also match the short form in PLAN;
  - it validates;
  - no personal name in the body;
  - a narrow query;
  - `sourcing: advice`, and `web_search` isn't `required`;
  - the optional input is handled, and the input really was empty;
  - `prompt.md` is byte-equal to what the hub builds, and carries the
    advice and no-invention rules;
  - the answer has all its sections, and says what it did about the
    missing weaknesses;
  - the answer invents no facts (see below).
- **Answer-prompt honesty (PLAN 6):** for Deere run 3 and the v1.0 job
  prep, `answer-prompt.md` is exactly `prompt.md` minus the no-invention
  line.
  - The rerun has no `answer-prompt.md`, because it answered the current
    prompt.
  - Runs 1 and 2 keep their own prompts.

## "The answer invents no facts about the student": the mechanical check

**What fabrication looks like.** The v1.0 Haiku answer fabricated
student facts in two shapes:

- **First-person lines written for the student to say:** "I talked to
  150+ members…", "…saw attendance grow 35%".
- **Accomplishments stated as the student's:** "Ran 6 events serving 150+
  members", "attendance up 40%, member satisfaction 4.5/5".

**The check** (`inventedStudentFacts` in `tests/helpers/phase5.mjs`):

1. **Preparation:**
   - split the answer into sentences;
   - drop Markdown link titles ("Top 2026 Guide"), `[…]` placeholders and
     `(1)` enumerators.
2. **What's skipped:** questions, and hypotheticals that start with
   "Imagine", "Suppose", "If" or "Say".
3. **The flag:** a figure counts if it is in a sentence that's either
   first person singular or has an accomplishment word (ran, led, grew,
   attendance, satisfaction, members, retention, …).
4. **The exception:** a figure isn't counted if the student supplied it,
   which means it appears in their inputs.
5. **The bar:** nothing flagged, and at least 3 placeholders in any style.
   - **Placeholder:** any `[…]` that isn't a link title, isn't
     `[unverified]`, and isn't a full-sentence aside ending in `.`.
   - **Extra guard:** none of the v1.0 invented metrics may reappear.

**Why it's defensible:**

- **It has teeth.** The same check flags the v1.0 answer: 150+, 73%,
  4.5/5 and 35%.
- **It passes the rerun answer** without special cases. The only
  near-miss, "Imagine our adoption rate … is up 20%", is a scenario posed
  to the student, not a fact about them. That's why hypotheticals are
  skipped.
- **It accepts any placeholder style:**
  - `[Your coursework…]`;
  - `[X% improvement in efficiency]`;
  - `[department]`;
  - `[coursework/internship/project]`.
- **Its own unit test pins it.** Placeholders, link titles, questions,
  hypotheticals and student-supplied figures pass, while "I grew
  attendance 35%" and "Ran 6 events" are flagged.

**What it doesn't catch:** an invented fact with no figure in it, such as
"you led the PM Club". The rule already tells the AI not to do that, and
a figure-free invention can't be told mechanically from a suggestion. The
check is narrow on purpose, so it never cries wolf.

## E2E (desktop-chromium, iphone-webkit, android-chromium)

1. **Planted, mechanical:**
   - "Score so far: 46 / 50 — …";
   - P1 shows as `unsourced` and P4 as `missing-section`;
   - `checker-prompt` is read-only and equals the fixture;
   - the copy button and the Open-AI link are there, and Automatic-mode
     controls are absent.
2. **Planted, with the real table:**
   - "Score: 86 / 100 — Needs work", with the parts and counts;
   - `checker-contradicted` shows;
   - P2, P3, P5 and P6 each appear as `Claim n` with their text, as the
     allowed kind;
   - P1 and P4 are still listed, `checker-redo` shows and the prompt is
     gone;
   - Save writes `metadata.hub.check` exactly.
3. **Clean control:** 49/50, then "95 / 100 — Strong", with nothing
   contradicted and no missing section.
4. **State:**
   - the check survives a reload, and Check again clears it;
   - a **new pasted answer clears the check**: no stale score, fixes or
     prompt, and Save stores no `check`;
   - with the checker opened and a new answer pasted, it must not score
     the new answer against the old one's claims.
5. **Unreadable answer:** `checker-error` shows, and the paste step stays.
6. **XSS:** HTML and script in the verdict table are shown as text. No
   element is injected, and the CSP check stays clean.
7. **Automatic mode:**
   - **paid search off:** `checker-needs-web` shows, plus the paste step,
     and `run-checker` is absent;
   - **paid search on:** `run-checker` sends the check prompt with the web
     plugin. The table it gets back scores "75 / 100 — Needs work" and
     shows `checker-contradicted`;
   - **a failed run:** `checker-error` shows, and the score stays
     incomplete.
8. **Rerun tool:**
   - it installs by paste with no errors;
   - `summary-sourcing` shows advice and `summary-websearch` shows
     helpful;
   - it runs in Manual mode with the weaknesses input empty, and
     `prompt-box` equals `prompt.md`.
   - **Its answer:** every section, no missing sections, "3 of 4 claims
     have no source", and the checker opens with one claim to check.
9. **Layout:** the checker panel never scrolls sideways, before or after
   scoring, down to 320 px.
