# Phase 7 prep — Nitpick sign-off (student guides)

**Reviewer:** Nitpick · **Date:** 2026-10-03 · **Branch:** `phase-7-pilot-prep`
**Scope:** `START-HERE.md`, `EMPIEZA-AQUI.md`, the README entry point,
`tests/pilot/guide-run.mjs`, against `core/app.js`, the Company Analysis
recipe, GitHub's current docs and the live fresh copy
(`king-tuerto.github.io/brain-hub-pilot-test/`).

## Verdict

**APPROVED WITH REQUIRED CHANGES.** The guides are accurate where they speak:
every app label and message they quote exists verbatim, the GitHub wording
matches GitHub's docs, and a student following the Spanish guide on Android
gets from a blank phone to a sourced, downloaded Costco analysis with zero
page errors. But three places leave a student stuck or misled (G1–G3). Fix
those in both guides before any student sees them; then this sign-off stands
without another full run, provided `npm test` stays green (the new guide
tests will force G1's new labels to be classified).

## Counts (`npm test`, no network)

| Suite | Result |
|---|---|
| Unit | **428 pass**, 0 fail (15 new in `tests/unit/guides.test.mjs`) |
| DB | **10 pass**, 0 fail |
| E2E (desktop, iPhone WebKit, Android Chromium) | **397 pass**, 2 skipped, 0 fail |

The new guide tests were mutation-checked on a scratch copy; each of these
made the suite fail: renaming an app button, breaking README's link, adding an
unclassified bold label, dropping an ES troubleshooting row, breaking a
relative link, changing an ES code value, removing an ES gloss, renaming a
recipe input label.

### What `tests/unit/guides.test.mjs` checks

- **Parity by content:** links in the same order (the cross-link to the other
  guide counts as the same link); code values in the same order
  (`TU-USUARIO` = `YOUR-USERNAME`); the same `##` sections with steps 1–6 in
  order; the same troubleshooting rows, matched by the on-screen message each
  row quotes; the same quoted UI messages in the same order.
- **Every bold or quoted string is classified**, or the test fails:
  - **app labels** (verbatim string literal in `core/app.js`): Skip — I don't
    have a brain yet, Manual (copy and paste), Automatic, Finish, Run, Copy
    prompt, Paste answer, Use this answer, Check this answer, Save to brain,
    Download, Add a tool, Sign in again, Settings; plus Open Claude (from the
    `Open ${app.name}` template);
  - **app messages** (substring of an app.js string): Could not reach that
    brain, This brain is open / open, Your brain session ended, have no source;
  - **recipe labels** (from `core/tools/company-analysis.recipe.md`, not
    app.js): Company Analysis, Company, Business unit for the environmental
    scan, What is this for?;
  - **GitHub's wording** (checked against docs.github.com, not testable
    offline): Fork, Create fork, Settings, Pages, Build and deployment,
    Source, Deploy from a branch, Branch, main, / (root), Save, Sync fork,
    Update branch, Your site is live at…, 404;
  - **the phone's wording** (PILOT-CHECKLIST): Desktop site, Share, Add to
    Home Screen, Install app, ⋮, Paste, and the Spanish equivalents;
  - **emphasis** (lead-ins, example questions).
- The only normalisation is the apostrophe: the app writes `I don’t`, the
  guides `I don't` (G6).
- **ES glosses** each app/recipe label on first use (rule from PLAN.md), with
  one recorded exception, `Automatic` (G7).
- README links both guides; every relative link resolves; every repo path
  named in code (`core/`, `plugins/`) exists; Step 2's address has the shape
  `repoFromLocation()` reads.

## Independent run — Spanish guide, Android (Chromium, Pixel 7, es-MX), no brain

My own runner (kept in my scratchpad, not the repo): every label it taps is
first looked up as **bold** text in `EMPIEZA-AQUI.md`, buttons are matched
by **exact** accessible name, and unlike `guide-run.mjs` it uses the **real
clipboard** for Copy prompt and Paste answer. Fresh phone profile, live
fresh copy. The answer is El Código's real Costco answer (same prompt, byte
for byte after the Windows clipboard's CRLF).

```
paso 4.1: name box found; tapping "Next" (NOT named in the guide)
paso 4.2: tapped Skip; app uses a curly apostrophe (I don’t), guide a straight one
paso 4:   Home "Hi, Mariana", 2 tools, badge "No brain"
          page errors: none · failed requests: none
paso 5.1: Company Analysis tile (a link)
paso 5.2: Company filled; business unit left blank; "What is this for?" options:
          Choose… | Class assignment | Job interview | Investing research |
          Board or consulting work | General curiosity
paso 5.3–5.4: Copy prompt → "Copied."; clipboard = prompt box (2950 chars, CRLF only);
          "Open Claude" → https://claude.ai/new, new tab
          page errors: none · failed requests: none
paso 5.7: back in the hub, prompt still shown: true
          Paste answer filled the box from the clipboard: true (16994 chars)
result:   all 7 sections + Summary; missing sections: none
source check: All 45 factual claims have a source or are marked [unverified].
          1 marked [unverified].
check:    "Score so far: 50 / 50 — the citation check has not been run yet";
          buttons now on screen: Copy check prompt | Score it (guide names neither)
keep:     Download → company-analysis-2026-10-03.md; no "Save to brain" without a brain
          page errors: none · failed requests: none
```

**Pass bar (my part):** every Spanish-guide step was doable with the guide's
own words, except two buttons the guide never names (Next, and the checker's
Copy check prompt / Score it). There were no page errors. Every section
showed, sources were 100% (≥95%), and the download name was correct. The
citation check (pasting a checker reply) was not repeated; El Código's iPhone
run covers it.

## Findings for El Código (guide text — I did not edit the guides)

**Required before students:**

- **G1 — The Checker steps leave a student stranded (medium).**
  - **The problem:** after **Check this answer** the screen says "Score so
    far: 50 / 50". A student can read that as a perfect score and stop.
    The guide also never names **Copy check prompt** or **Score it**, so a
    student who does paste the reply back doesn't know they must tap
    **Score it**.
  - **The fix:** name both buttons (ES with glosses). Say the first number is
    only half: the score out of 100 appears after **Score it**. Then add
    both labels to `APP_LABELS` in the test.
- **G2 — Save to brain is two taps (medium).** **Save to brain** only opens
  a panel with Summary and Tags; nothing is saved until the student taps
  **Save**. The guide says Save to brain "saves". Add "then check the summary
  and tap **Save**; you'll see 'Saved to your brain.'"
- **G3 — The "Could not reach that brain" row gives the wrong cause
  (medium).**
  - **Why it's wrong:** the app rejects a badly shaped address before it
    tries, with a different message ("The brain address should look
    like…"). So "check it starts with https:// and ends with .supabase.co"
    can't be why it was unreachable.
  - **The real causes:** no internet, a mistyped project address, or, most
    likely for a student, a **free Supabase project paused after a week
    unused**.
  - **The fix:** say "check your internet; open your project in Supabase and,
    if it says paused, restore it; check the address letter by letter".
- **G4 — Wrong step number (low, trivial).** The example question says
  "I'm on step 3 and I don't see a Pages option". Pages is Step 2. This is in
  both guides.

**Recommended:**

- **G5 — Two small mismatches with the app.** Step 4.1 doesn't say to tap
  **Next**. Step 4 says "three things", while the app's first screen says
  "Two quick choices and you are in." Both are harmless, but a literal
  reader notices.
- **G6 — Apostrophes.** The guide writes `I don't`; the app writes
  `I don’t`. Use `’` in both guides so the labels are truly verbatim.
  The test currently accepts either.
- **G7 — ES `**Automatic**` has no gloss.** Add "(automático)" and remove
  the `KNOWN_UNGLOSSED` exception in the test.
- **G8 — Spanish phone labels, unverified.**
  - **iPhone:** the iOS Spanish share-sheet entry is probably "Agregar a
    pantalla de inicio", not "Agregar a inicio".
  - **Language:** many LatAm students run their phone in English. Give
    both, as the guide already does for "Sitio de escritorio (o Desktop
    site)".
  - **The check:** confirm on a real es-MX iPhone and Android (PILOT-CHECKLIST
    already has the Spanish-reader item).
- **G9 — Spanish style.** The Spanish is natural Mexican/LatAm overall
  ("¿Te atoras?", "Anótala", "Listo"). Three small changes:
  - **"llave" → "clave"** (clave pública / clave secreta): "clave" is the
    normal LatAm word for keys and passwords in apps, and "llave" reads as a
    literal translation.
  - **"¿Quieres estar seguro?" → "¿Quieres asegurarte?"** (gender-neutral).
  - **"Cómo correr las herramientas" → "Cómo usar las herramientas"**
    (optional).
- **G10 — "Make your own tools" step 4 is too thin for a phone user.**
  - **What's missing:** it doesn't say how to add a file on GitHub (**Add
    file → Create new file**), that the name must end `.recipe.md`, or to
    tap **Refresh** on Home. The tool list is cached for 10 minutes.
  - **Also:** the Add a tool screen's buttons (**Check recipe**, then
    **Install**) aren't named.
  - **The fix:** `plugins/README.md` has most of this; link it.
- **G11 — Risk, not verified: Pages on a real *fork*.**
  - **The risk:** GitHub disables Actions on new forks by default, and
    branch-based Pages now builds through the "pages build and deployment"
    Actions run. Whether that blocks a fork's first Pages build couldn't be
    tested, because the fresh copy is not a fork.
  - **The fix:** add it to PILOT-CHECKLIST under the Fork item. Consider a
    troubleshooting line: "still 404 after 10 minutes → open the **Actions**
    tab; if GitHub asks to enable workflows, tap the green button".

**Verified correct (GitHub docs, 2026-10-03):**

- **Fork → Create fork.** The default "Copy the main branch only" is fine.
- **Settings → Pages → Build and deployment → Source: Deploy from a
  branch.** Branch: main, folder / (root), then Save.
- **Sync fork → Update branch.**

## `tests/pilot/guide-run.mjs` as test tooling

It does not hide a real app problem in what it recorded. My stricter
independent run (exact names, real clipboard) agrees with its results. Weak
spots to fix before it's reused:

- **T1 — It never fails.** Page errors and failed requests are only logged,
  and the exit code is always 0, so a pass is "someone read the log". It
  should exit 1 on any page error, or on a failed request other than the
  expected open-check 401.
- **T2 — The CSP filter is the wrong tool.**
  - **Hides app errors:** it drops *any* "Refused to apply a stylesheet"
    raised during a screenshot window, so a real CSP violation by the app in
    that window would be hidden.
  - **Leaks anyway:** El Código's `p7-iphone` setup and prompt logs still
    list that message as a page error, so the filter also leaks, through
    timing or an older run.
  - **The fix:** the cause is Playwright injecting a caret-hiding style.
    `page.screenshot({ caret: 'initial' })` stops the injection, so the
    filter can be deleted.
- **T3 — It never exercises the real clipboard.** The answer stage uses
  `fill()`, so **Paste answer** and the clipboard are never used on the live
  site. My run covered that on Android Chromium; WebKit can't emulate it, and
  it's on PILOT-CHECKLIST.
- **T4 — Loose button matching.** `btn()` matches by substring and takes
  `.first()`, the same looseness that caused its first-run "ChatGPT"
  mismatch. Exact names worked for every label in my run. Use
  `exact: true`, or anchored regexes for buttons whose name includes a
  description (Manual).
- **T5 — Minor.**
  - The "Copied." wait swallows its timeout.
  - There's no cache-bust or service-worker bypass, so a re-run after a
    deploy could test stale files.
  - The stand-in session persistence monkey-patches internals. That's
    acceptable for tooling, and it's documented.
