# Builder & Tester specialists: Nitpick's test plan

**Author:** Nitpick · **Date:** 2026-10-04 · **Branch:** `builder-tester`
**Status:** second round done: the full loop (rounds 1–7 of the final run)
is replayed through the UI in all three projects. Sign-off and findings are in
Nitpick's report for this round.

## Where the tests are

| File | What |
|---|---|
| `tests/unit/builder-tester.test.mjs` | `{{widget_guide}}`, `sourcing: none`, the three recipes, and every round of the real run (r1 … r7) |
| `tests/e2e/builder-tester.spec.mjs` | The hub pieces in all three projects, replayed from the real fixtures; `sectionText` and `recipesIn` edge cases; the Tester guard; the retest box |
| `tests/e2e/builder-tester-loop.spec.mjs` | The whole loop through the UI, all seven rounds |
| `tests/helpers/buildertester.mjs` | Finds the rounds by file name; the lines the hub has changed since earlier rounds (`SUPERSEDED`) |
| `tests/unit/guides.test.mjs` | Classifies the new bold labels; checks the guides against the recipes |

`sectionText` and `recipesIn` can't be imported in Node, because `core/app.js`
uses `document`, `location` and `window` and routes as soon as it loads. The
E2E tests import the module the page already loaded. That's the same URL, so
it doesn't run again. They call the exports directly, with no `eval`, because
the CSP guard would rightly flag `eval`.

The tests read the final run at the top of `tests/fixtures/builder-tester/`
(`r1-*` … `r7-*`); the `attempt-*` folders are history and are not tested.
Every prompt is compared byte for byte with what the hub builds today. Rounds
run before a hub change (the narrowed no-invention rule, the word-form-aware
Testers) may differ only in those whole lines, written out in the helper's
`SUPERSEDED` list; the last round must use none of them.

## Contract fixes (existing tests)

- **`job-prep.test.mjs`, `job-prep.spec.mjs`:** six core tools, in
  `index.json` order, and the stats tile shows 6.
- **`guides.test.mjs`:**
  - every new bold or quoted string is classified;
  - the Builder and Tester names and section labels are checked against the
    recipes;
  - "FIX AND RETEST" and "PASS — install it" are checked against Tester 2;
  - `Copy` is checked as the templated `Copy “${name}”`;
  - `Copy answer` is an app label;
  - the renamed "Keep it on every device" lead-ins are updated;
  - the Spanish gloss rule now covers the new labels.
- **`signoff2.spec.mjs` (H1 sanitizer audit):** the hub's own Copy-section
  button is exempt, but only the exact `div.row > button.ghost[copy-section]`
  directly after an `h2`. Any other `<button>` in an answer still fails.

## Unit

**`{{widget_guide}}`**
- It's valid with or without spaces.
- A misspelling is an error, and the error message names `widget_guide`.
- It's filled verbatim. The guide's own `{{today}}` and `{{<input id>}}`
  stay literal (single pass).
- A student typing `{{widget_guide}}` doesn't get the guide expanded.
- With `null`, `undefined` or `''`, the prompt gets `NO_GUIDE_TEXT`.
- Recipes that don't use it are unaffected.
- It's documented in §8 and §9.

**`sourcing: none`**
- The validator accepts `none`, `facts`, `advice` or nothing, and rejects
  anything else.
- `STANDARD_BLOCK` has no facts, advice or Note rule. It keeps
  `NO_INVENTION_RULE` and the Summary.
- `facts` and `advice` are unchanged.
- `checkSources` and `claimItems` count zero, even on text full of figures,
  and on the real answers.
- The install summary reads "No sources needed (it works on your own text)".
- It's documented in §3 and §6b.

**The recipes**
- All three validate. All have `sourcing: none` and `web_search: none`, never
  read the brain, and use `run_ai`. Their names match what the guides quote.
- **Builder:**
  - inputs `idea` (required), `users` and `fixes`; sections Steps, Spec,
    Recipe;
  - embeds the guide in `<<< >>>`;
  - the Spec is for a Tester who never sees the recipe;
  - the recipe goes in a ```` ```recipe ```` fence, followed by the file name;
  - on a revision it keeps the id and bumps the version;
  - also on a revision, it changes only what a fix needs, keeps the criterion
    numbers and wording, and ends Steps with "Spec changed: yes/no";
  - Summary is listed last and never forbidden.
- **Tester 1:**
  - its only input is `spec`, with no recipe, guide or fixes placeholder;
  - it has `run_ai` only;
  - the refusal guard comes before the pasted text;
  - three tests: normal, blank optional inputs and tricky;
  - exact inputs, and checks tied to the criteria;
  - grading happens in a new chat.
- **Tester 2:**
  - inputs `spec`, `test_cases` and `results`;
  - grades only: tests unchanged, no benefit of the doubt, recipes ignored, a
    missing answer means FAIL;
  - one fix per FAIL, naming the criterion and the test;
  - both verdict lines are exact.

**The real run (attempt-1)**
- The built recipe validates under its own file name.
- The answer has Steps, Spec, Recipe and Summary, and names the file.
- The Spec has no recipe syntax.
- Tester 1's prompt is byte-equal to `buildPrompt` from the Spec, and what was
  pasted contains no recipe.
- Tester 1 wrote three tests covering A1–A5.

## E2E (desktop-chromium, iphone-webkit, android-chromium)

**Builder prompt and guide fetch**
- In Manual mode, `prompt-box` equals `buildPrompt` with `WIDGET-GUIDE.md`
  as served by the hub, and the guide is fetched same-origin.
- Tester 1 never fetches the guide.
- A 404 on the guide puts `NO_GUIDE_TEXT` in the prompt.

**Pasting the real Builder answer**
- **Copy section:** one button per section (Steps, Spec, Recipe, Summary),
  each right under its heading.
- **Install:** a single **Install Exam Study Planner** button, with
  `data-tool-id`.
- **Hidden:** no **Check this answer**, no source check and no
  missing-sections warning.
- **Phone layout:** no horizontal scroll, and the copy and install buttons
  are at least 44 px.

**Copy buttons**
- **Copy "Spec"** puts exactly `1-spec.md` on the clipboard, with no recipe
  syntax.
- **Copy answer** copies the whole answer.
- Both are checked in Chromium. Playwright WebKit can't read the clipboard,
  so there the test asserts the button and its status line and records a
  `webkit-platform-limit` annotation. A real iPhone is on PILOT-CHECKLIST.

**Installing**
- Install → Add tool prefilled with exactly the fenced recipe. The draft is
  used once, and nothing is installed before **Check recipe** → **Install**.
- The tile appears and its form shows `syllabus` and `exam_date`. Add tool
  doesn't refill later.
- Installing 1.0.1 from a later Builder answer replaces the local copy: one
  tile, with the new text.

**Tester 1 and Tester 2**
- **Tester 1:** the prompt built from the pasted Spec equals the fixture
  prompt. The answer gets Copy buttons for its sections, and no Install,
  Check or Save.
- **Tester 2:** pasted fields survive leaving the tool, opening another and
  reloading. A phone has one clipboard, so this matters.

**`sectionText`**
- The real Spec comes back correctly.
- Headings are matched with `**` and case ignored.
- A missing section gives `''`.
- The last section runs to the end.
- `###` is kept.
- CRLF works.

**`recipesIn`**
- Finds the recipe:
  - in the real answer;
  - in a `~~~` fence;
  - with any info string, or none;
  - in a 4-backtick fence;
  - after leading blank lines.
- Ignores invalid, non-recipe and unfenced recipes.
- Finds two different recipes in order, and lists a repeated recipe only once.
- A 4-backtick fence may hold a ```` ``` ```` block.

**Known defects:** written as `test.fail`, so the suite stays green. Each one
turns red the day it's fixed, as a reminder to remove the `test.fail`. Set
`NITPICK_SHOW_DEFECTS=1` to see them fail normally.
1. On a `sourcing: none` answer, "This answer has no source links…" still
   shows.
2. A ```` ``` ```` block inside a ```` ```recipe ```` fence gives a cut-down
   recipe that still validates and still offers **Install**.
3. **Copy "Recipe"** stops at a `## ` line inside the recipe's code block.

Second round: 1 and 3 are fixed and are now ordinary tests. 2 is still open
(still `test.fail`). New:
4. **Copy "Recipe"** copies the ```` ```recipe ```` fence and the file-name
   line too, so pasting it into a `plugins/` file, as the guides' "Keep it on
   every device" says, gives a file the hub rejects.

## The full loop (done)

`tests/e2e/builder-tester-loop.spec.mjs` replays all seven rounds through the
UI: Builder → Install → **Copy "Spec"** → Tester 1 (round 2+: with the
previous **Test cases**, copied from its last answer) → the built tool three
times with **Copy answer** into Tester 2's last box → Tester 2 → on FIX, the
Builder with the Fixes, the Spec and the recipe → the newer version installed
over the old → … → PASS → **Download** the recipe. Every prompt along the way
is checked against the real run's prompt.

The unit tests check every round of the real run: byte-exact prompts; one
recipe per Builder answer, valid under its own name; no recipe in any Tester
prompt; the Spec changes only in the criteria the Steps name; Tester 1 copies
every check word for word unless its criterion changed, and marks what it
added or changed; one fix per FAIL; and the verdict sequence FIX×4, PASS,
FIX, PASS.
