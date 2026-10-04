# Builder & Tester specialists: El Código's plan

**Author:** El Código · **Date:** 2026-10-04 · **Branch:** `builder-tester`

**Paul's request:** two starter specialists, so students practise the
El Código → Nitpick discipline themselves.
- **Builder:** turns a plain-words idea into steps, a short spec and a valid
  recipe.
- **Tester:** sees only the spec. It writes tests first, then grades the
  tool's answers with pass/fail and specific fixes, and never grades its own
  work.
- **Constraints:**
  - both are recipes in `core/tools` that work in Manual mode on phones;
  - hub changes stay minimal;
  - the whole loop (Builder → Tester → fix → pass → install) is proved on
    laptop, iPhone and Android;
  - both guides get a "Build your own tool" section.

## The three recipes (`core/tools`, all `sourcing: none`, `web_search: none`)

| Tool | Inputs | Sections | Role |
|---|---|---|---|
| `tool-builder` "Builder — make a tool" | `idea` (required), `users`, `fixes` (the Tester's fixes plus the current Spec and recipe, used when revising) | Steps, Spec, Recipe | **El Código.** It plans the steps, then writes a Spec meant for a tester who'll never see the recipe: inputs, output sections, acceptance criteria A1…A6, and blank-input behaviour. Then it writes the recipe in a fenced block, following the guide. On a revision it applies every fix, keeps the id and bumps the version. |
| `tool-tester-write` "Tester 1 — write the tests" | `spec` only | Test plan, Test cases, How to run them | **Nitpick, tests first.** It **refuses if the pasted text contains a recipe**, then writes 3 tests (normal, blank optional inputs, tricky). Each gives the exact inputs and visible checks tied to the criteria. |
| `tool-tester-grade` "Tester 2 — grade the results" | `spec`, `test_cases`, `results` | Results, Fixes, Verdict | **Nitpick grades.** It grades only the given answers against the unchanged tests: PASS/FAIL per check with evidence, one fix per FAIL addressed to the Builder, and a verdict of "PASS — install it" or "FIX AND RETEST". It ignores any recipe pasted in. |

**"Never grades its own work"** is enforced three ways:
1. the Tester never receives the recipe: its inputs are spec, tests and
   answers only;
2. tests are written in a separate step **before** any answer exists, and
   grading may not change them;
3. the guide tells students to grade in a **new chat**, not the one that
   built the tool.

## Minimal hub changes

1. **`{{widget_guide}}` placeholder.** The hub fills it with its own
   `WIDGET-GUIDE.md`, fetched same-origin with no-cache. That's how the
   Builder knows the format without the student pasting a 13 KB file on a
   phone. It's valid in any recipe and documented in guide §8.
2. **`sourcing: none`.**
   - **Prompt:** no source rule and no Note rule. `NO_INVENTION_RULE`
     stays.
   - **Checks:** `checkSources` returns 0 claims, and the result card hides
     **Check this answer**.
   - **Docs:** guide §6b.
3. **The result card** gains three things:
   - **Copy answer** (`copy-answer`);
   - a **Copy "section"** button after every `##` heading (`copy-section`,
     `data-section`), so a student copies the Spec without the recipe;
   - **Install [name]** (`install-from-answer`) for every *valid* recipe in a
     fenced block. It opens Add tool prefilled through `hub.addDraft`; the
     student still taps **Check recipe** and **Install**.

   The new helpers `sectionText` and `recipesIn` are exported from
   `core/app.js`.
4. **`core/tools/index.json`** lists six tools.

## The proof (`tests/fixtures/builder-tester/`): real AIs, a student's request

- **The request:** "I paste my class syllabus and the date of my exam, and it
  gives me a study plan week by week until the exam. At the end it gives me 5
  practice questions on the first week's topics. Sometimes I don't know the
  exam date yet."
- **The roles:**
  - Builder answered by **Sonnet**;
  - both Testers by fresh agents on another model, which never saw the
    recipe;
  - the built tool's runs answered by **Haiku**.
- **Every prompt comes from the hub's own `buildPrompt`,** and every answer
  is kept verbatim.

**The sequence:**
1. Builder v1.
2. Tester 1 (spec only).
3. Three runs of the built tool, one per test.
4. Tester 2.
5. If FIX AND RETEST: Builder v2 with the fixes, rerun the three tests, then
   Tester 2 again, repeated until PASS.
6. Install.

**The bar:**
- Builder's recipe validates and is found by `recipesIn`.
- Its Spec has no recipe syntax.
- Tester 1 never saw the recipe.
- The first grade's fixes are concrete and tied to criteria.
- The final grade is PASS.
- The final recipe installs.

**E2E (Nitpick, three projects):** the whole loop replayed through the UI
from these fixtures:
- **Build:** Builder run, then paste the answer, then **Install …**, then
  Check, then Install.
- **Test:** **Copy "Spec"** gives the clipboard the Spec and no recipe; then
  Tester 1, then the built tool run three times with the test inputs using
  **Copy answer**, then Tester 2 showing FIX.
- **Fix:** Builder with the fixes, then install v1.0.1 (it replaces the local
  copy), then the reruns, then Tester 2 showing PASS.
- **Keep:** the recipe is downloaded for `plugins/`.

## What the real runs taught us

Three full attempts came before the final run. Each is kept under
`tests/fixtures/builder-tester/attempt-N/`, and each one found a real
weakness that was fixed before the next.

- **Attempt 1 — the Summary clash.** The Spec forbade any section after
  Practice Questions, but the hub always adds a Summary. Every run "failed"
  through no fault of the tool. *Fix:* the Builder lists Summary last and
  never forbids it.
- **Attempt 2 — an uninstallable recipe.** The Builder wrote
  `author: [your name]`, which YAML reads as a list, so the hub found no
  recipe and the student would have seen no Install button and no reason.
  *Fixes:* the Builder sets a plain author and never puts square brackets in
  front matter; the hub now shows a "recipe-problems" note listing what is
  wrong, ready to paste back to the Builder.
- **Attempt 3 — a moving target.** Tester 1 wrote fresh tests every round
  and the Builder renumbered criteria while claiming "Spec changed: no", so
  rounds never converged. *Fixes:* the Builder must keep every criterion's
  number and wording unless a fix requires a change; Tester 1 takes the
  previous test cases and copies them word for word unless a criterion they
  check changed. The bar stays fixed, the way El Código → Nitpick works.

Nitpick's first review added hub fixes the runs then relied on: no false
"no sources" warning on sourcing `none`; fence-aware section and recipe
reading (nested code blocks); an unfenced recipe under `## Recipe` still
installs; the hub refuses to give a Tester anything containing a recipe;
`{{widget_guide}}` only in the prompt body; the phone clipboard flow in the
guides.
- **Final run, round 2 — the Spec was never sent back.** Even with the
  revision rule, the Builder rewrote and renumbered every criterion. The
  cause was structural: on a fix it received the Tester's fixes and the
  recipe, but the criteria live only in the Spec, which it never saw. *Fix:*
  the fixes box now takes the fixes, the current Spec and the recipe, and
  the Builder starts the new Spec from a word-for-word copy. The drifted
  round is kept as `attempt-4/`.
- **Attempt 5 — a fuzzy criterion never passes.** With the Spec and tests
  held fixed, failures fell 3 → 2 → 1 and then stuck at 23 of 24 for three
  rounds, each time on a different judgment call ("in a competitive market"
  ruled to touch the market-structures week). "Only about week 1" can't be
  graded the same way twice. *Fix (Paul's call):* the Builder writes criteria
  decidable without judgment — counts, dates, exact words; Tester 1 turns any
  "about" criterion into word lists; Tester 2 grades each check exactly as
  worded, no wider.
- **Attempt 6 — objective, but the Builder dropped the request.** The first
  Builder run under the objective-criteria rule wrote only layout checks
  (counts, labels) and nothing about week 1 or the syllabus. *Fix:* every
  requirement in the student's idea must be covered by a criterion.

## The final run (passed)

`tests/fixtures/builder-tester/r1-*` … `r5-*`: syllabus-study-planner,
v1.0.0 → v1.0.4, Builder on Sonnet, the tool on Haiku, every Tester a fresh
agent that never saw the recipe.

| Round | Checks passed | Failure | Spec changed |
|---|---|---|---|
| 1 | 22/23 | exam week split into day blocks (A1) | — |
| 2 | 21/23 | "production" in a week-1 answer (A4); "8-week" not "8 weeks" (A2) | A1 only |
| 3 | 22/23 | day blocks again (A1) — the fix was in the recipe, Haiku ignored it | no |
| 4 | 24/25 | "production" again, in an answer explanation (A4) | no |
| 5 | **25/25 — PASS** | — | A4 only (explanations) |

What held: the Spec changed only where a fix required it; tests were copied
word for word except the checks for a changed criterion (Tester 1 added two
stricter A1 checks in round 4); the grade prompts never contained a recipe.

What is still weak, honestly:
- **The run model is not consistent.** Two failures came back after being
  fixed. A pass is one good run on three tests, not a guarantee.
- **Word lists are literal.** Round 5 passed with "genetic" in a week-1
  answer because the banned word was "genetics".
- **Placeholders in practice questions.** The hub's no-invention rule
  (example sentences get [X] for numbers) made the tool write "[X] dollars"
  in made-up exam questions, which a student can't use. The rule is meant for
  copyable claims about the student. Hub-wide; for Nitpick's review.
