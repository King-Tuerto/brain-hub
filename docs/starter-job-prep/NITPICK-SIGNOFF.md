# Starter tool 2 — Job & Interview Prep: Nitpick sign-off

**Reviewer:** Nitpick · **Date:** 2026-10-03 · **Branch:** `starter-job-prep`

## SIGNED OFF — 2026-10-03, after the label fix

El Código removed "(optional)" from both labels in the recipe and added the
"don't write (optional)" rule to WIDGET-GUIDE §4. My own `npm test` on this
branch after the fix:

| Suite | Result |
|---|---|
| Unit | 459 of 459 pass |
| DB | 10 of 10 pass |
| E2E (3 projects) | 448 pass, 0 fail, 2 skipped (the existing PWA/WebKit skips) |

**The invitation now reads right:**
- **I1:** every paragraph and bullet in both languages is a single line.
- **I2:** "A built-in check then has your AI open the links and confirm they
  really say what the analysis claims" is accurate in both Manual and
  Automatic mode. The Spanish ("una revisión integrada le pide a tu IA abrir
  los enlaces y confirmar…") is natural.

The non-blocking findings (F1–F4, F6) are deferred to after the pilot as
DECISIONS #21.

The review below is kept as written before the fix.

## Verdict before the fix: NOT YET. One small blocking fix, then it's signed off

The tool works, the prompts are exactly what the hub builds, and **the
never-invent-facts rule holds on both real answers** under the clarified bar.
One student-visible bug blocks it (B1, below): it's a two-line fix, and I
checked that the fix turns every test green and leaves every prompt unchanged.
If the two labels are the only change, no new review is needed. Run
`npm test` and it's signed off.

Before the pilot invitation is sent, it needs two fixes (I1, I2).

## Test counts (`npm test`, full run)

| Suite | Result |
|---|---|
| Unit | 459 tests: 458 pass, **1 fail** (B1) |
| DB | 10 of 10 pass |
| E2E (desktop Chromium, iPhone WebKit, Android Chromium) | 450 tests: 445 pass, **3 fail** (B1, one per project), 2 skipped (the existing PWA/WebKit skips) |

**With B1 fixed** (applied temporarily, then reverted byte for byte):
- the new unit file passes 25 of 25;
- the job-prep E2E passes 21 of 21;
- unit totals become 459 of 459.

## The invention check: results

**The bar, applied independently.** No invented claim about the student's
past or present: achievements, roles, results, dates or numbers. Example
sentences the student might copy use placeholders. A first-person goal is
not a fact.

| Answer | Flagged sentences | Result |
|---|---|---|
| Case A, current (Haiku, no background) | 0, with 38 placeholders | **PASS** |
| Case B, current (Sonnet, true background) | 0. Her figures (5 events, 22 → 41) come from her background | **PASS** |
| Case A, v1 (control) | 2: "23%", and "4-person … 8 weeks … 30%" | **FAILS, as it must** |
| Phase 4 v1.0 answer (control) | 150+, 73%, 4.5/5, 35% | **FAILS, as it must** |
| Case B, v1 | 0 | passes (as PLAN records) |

**"My goal in the first 90 days is to interview at least 10 customers".**
- **I agree it's a goal, not a fact.** It looks forward, it's something the
  student would choose to say, and it claims nothing about what they have
  done or are.
- **One thing to record:** it is still a number inside a sample answer, which
  the second sentence of `NO_INVENTION_RULE` tells the AI to replace with a
  placeholder. So Haiku didn't fully obey the rule. It passes only on the
  narrower bar, not on the rule's literal wording. That's acceptable, and it
  should stay written down.

**A bug in my own check, found and fixed.** The Phase 5 invention check's
first-person pattern was case-sensitive, so it missed a capital "My" at the
start of a sentence. The 90-days line was never examined at all; it "passed"
by accident.
- **The fix:** the check now reads My/Me/Myself in any case.
- **The clarified bar:** it now exempts a goal frame ("my goal", "I will",
  "I plan to", "I'd like to"), but only when the sentence has no past-tense
  accomplishment.
- **Tests that pin it:**
  - the 90-days line passes as written;
  - the same line rewritten as a past fact ("In my first 90 days I
    interviewed at least 10 customers") fails;
  - "My team grew to 10 people" fails.
- **Earlier results don't change.** The Phase 4 rerun still passes, and
  v1.0 still fails.

**Human read of case B (no hard inventions, three soft ones).** No new
employer, title, date or number. Three lines stretch her background, though:
- **The tracker and the attendance growth.** The sample bullet says she
  "used it [the tracker] to grow average event attendance from 22 to 41". Her
  background gives both facts, but not that one caused the other.
- **What the tracker did.** "I built a Sheets tracker for our club that did
  exactly that [filtering and aggregating]". Her background says a sign-up
  tracker, not what it did.
- **Learning SQL.** "I'm actively learning SQL now" is a present-tense claim
  she didn't make. It is paired with a step to take a course before the
  interview.

I rate these **medium, not blocking.** They aren't fabricated facts, but an
interviewer will probe exactly these. See F4.

**Human read of case A.** The gap scripts include "I haven't had a formal PM
role" and "SQL is new to me". The answer says it is covering the most common
gaps because none were given, so these are templates the student uses only
if the gap is real. That's fine.

## Findings

### Blocking

**B1. The optional labels show "(optional) (optional)".**
- **The cause:** the hub already adds " (optional)" after every optional
  label (core/app.js, the field renderer). The recipe's labels say it too, so
  a student sees "Your background (optional) (optional)" and "Gaps you're
  worried about (optional) (optional)".
- **The fix:** labels `Your background` and `Gaps you're worried about`. Labels
  never reach the prompt, so no fixture changes.
- **Where it came from:** the Phase 4 rerun recipe, which made the same
  mistake. WIDGET-GUIDE doesn't tell authors the hub adds it. **Also add one
  line to §4:** "The hub adds (optional) to the label itself; don't write
  it."

### Should fix (not blocking)

**F1. The `{{today}}` sentence reads as if the interview is today.**
- **The problem:** the first line reads "I'm a university student preparing
  to apply and interview for this job on 2026-10-03". That says the interview
  is today, which clashes with the body's "one concrete step I could take
  before the interview". Both real answers happened to read it sensibly.
- **The fix:** "Today is {{today}}. I'm a university student preparing to
  apply and interview for this job."
- **The cost:** the prompt fixtures have to be regenerated (and new answers
  aren't needed for that), so this can wait until after the pilot.

**F2. The brain heading promises notes about my experience, but the search
only finds the company.**
- **The problem:** the body heads the brain notes "What my own notes say
  about this company or my experience". The query is only `{{company_name}}`,
  so notes about the student's experience come back only if they mention the
  company. PLAN knows this; the heading over-promises it to the AI.
- **The fix:** say "about this company".

**F3. The blank-notes instruction doesn't match what the hub writes.**
- **The problem:** the blank-background instruction says "and my notes are
  empty". What the hub actually writes there is `(No personal notes
  available.)`.
- **The fix:** name the literal text, as the body already does for
  `(not provided)`.

**F4. Case B's three soft embellishments (above).**
- **The option:** one optional line in the body, such as "Don't add causes,
  tools or activities to my background that I didn't state".
- **It's El Código's call.** It is a prompt change, and it would need a fresh
  case-B answer.

### Low / for the record

**F5. The Phase 4 agent's recipe now clashes with the built-in tool.** Its id
is `job-interview-prep`, the same as the new core tool. The hub handles it
correctly:
- **pasted:** it is refused with "A built-in tool already uses the id …";
- **in plugins/:** it is hidden, with a `tool-conflict` note.

PLAN didn't foresee it, and it broke 6 Phase 4 E2E tests in each project.
- **What I changed:** those tests now install the agent's recipe with only
  its id changed (`job-interview-prep-v1`; the id never reaches the prompt,
  so `prompt.md` still matches byte for byte). Two new tests pin the clash
  behaviour.
- **Who it affects:** any pilot student who already has a tool with that id
  will see it hidden, with a clear note.

**F6. In advice mode, the source check counts the student's own figures.**
- **What happens:** case B shows "2 of 2 claims have no source. Check these
  before you rely on them", and both are her own 22 → 41 numbers.
- **Whose problem:** the hub's, not this tool's. Worth a look before more
  advice tools ship.

**F7. Live smoke needs no edit.** `npm run test:live` already expects
`index.json`'s length (3 after merge).

## Recipe review

**As a student (on a phone):**
- The tile reads well, and the four fields are clear.
- "Only what is true" in the background help is exactly right.
- Nothing scrolls sideways, at 320 px or in any project.
- The one blemish is B1.

**As an engineer:**
- **Parsing:** it parses clean, and the permissions are minimal.
- **Settings:** `sourcing: advice` and `web_search: helpful` fit the job.
- **Query:** one placeholder, as guide v1.1 asks.
- **Blank inputs:** both optional inputs have a blank-case instruction.
- **Names:** there is no personal name in the body.
- **Rule text:** the no-invention rule is restated in the tool's own terms.
- **What's left:** F1–F3 are wording only.

## Pilot invitation (`docs/pilot/INVITATION.md`)

**I1 (fix before sending). The text is hard-wrapped at about 78 columns.**
- **What goes wrong:** WhatsApp and most email apps keep every line break, so
  on a phone it shows as ragged short lines.
- **The fix:** put each paragraph and each bullet on one line.
- **Copying:** the copier should take only the text from "Hi everyone" /
  "Hola a todos" down to the last line. Don't copy the `## English` heading
  or the `---` rules.

**I2 (fix before sending). "A one-tap check" over-promises.**
- **The problem:** checking the sources is one tap only in Automatic mode
  with paid search. With the free Claude, ChatGPT or Gemini the invitation
  pitches, it's tap, copy the checker prompt, open your AI, then paste the
  answer back.
- **The fix:** "plus a built-in check that the links really say what the
  analysis claims", and in Spanish "y una revisión integrada para confirmar
  que los enlaces realmente digan lo que afirma el análisis".

**Accurate:**
- It describes both tools as they work after this merge.
- It names the free AI apps and the Open Brain save.
- "About 15 minutes" and "all on your phone" match START-HERE.
- The GitHub account requirement is stated.

**Links:** `START-HERE.md` and `EMPIEZA-AQUI.md` exist at the repo root on
this branch, so both URLs are correct once on `main`. I did not check the
remote.

**Spanish:**
- It reads naturally for Mexico and Latin America ("se te complicó", "para
  buscar empleo", "currículum").
- It moves from "ustedes" (prueben) to "tú" (obtienes, tu teléfono), which is
  normal in a group message there.
- Optional: "vacante" is more Mexican than "oferta de trabajo", but either
  works.

## What I changed (tests only; no product file touched)

**Updated for the contract change:**
- `tests/unit/prompt.test.mjs` and `tests/helpers/contract.mjs`: the new
  `NO_INVENTION_RULE` text. Contract's `STANDARD_BLOCK_RULES` was passing
  only because the old text is a prefix of the new one.
- `tests/unit/phase5.test.mjs`:
  - the v1 and current rule are both spelled out;
  - Deere and Phase 4 answer-prompts are tied to their prompts as before;
  - the rerun's new `answer-prompt.md` must equal `prompt.md` with only the
    rule line swapped back to v1.
- `tests/e2e/phase4-guide-proof.spec.mjs`: the id clash (F5), plus two new
  clash tests.

**Fixed:**
- `tests/helpers/phase5.mjs`: the capital "My" bug and the goal exemption.

**New:**
- `tests/helpers/jobprep.mjs`: the job-prep fixtures.
- `tests/unit/job-prep.test.mjs`, 25 tests:
  - the recipe contract and blank-case instructions;
  - no personal name in the body;
  - `index.json` lists it;
  - both prompts equal `buildPrompt`, and the v1 prompts are tied to them;
  - the answers render;
  - the invention check passes on A and B, and fails on both controls;
  - the 90-days line passes as a goal and fails as a fact.
- `tests/e2e/job-prep.spec.mjs`, 7 tests in each of the 3 projects:
  - three core tiles in order, and "(optional)" once per optional field;
  - prompts A and B equal their fixtures, and the brain query is the company;
  - case B renders with no missing sections, and the advice-mode
    source-check is shown and pinned;
  - Save writes `metadata.hub.tool = 'job-interview-prep'`;
  - no sideways scroll, including at 320 px.
