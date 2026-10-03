# Phase 7 prep — Nitpick sign-off (student guides)

**Reviewer:** Nitpick · **Date:** 2026-10-03 · **Branch:** `phase-7-pilot-prep`
**Scope:**
- **Reviewed:** `START-HERE.md`, `EMPIEZA-AQUI.md`, the README entry point and
  `tests/pilot/guide-run.mjs`.
- **Against:** `core/app.js`, the Company Analysis recipe, GitHub's and
  Supabase's current docs, and the live fresh copy
  (`king-tuerto.github.io/brain-hub-pilot-test/`).
- **Round 2** covers El Código's fixes in 3b66f1f and 1ff19f5. The live copy
  serves the same `core/app.js` and `sw.js` as this branch (checked byte for
  byte).

## Final verdict — Round 3

**APPROVED. Merge.**

El Código fixed both Round 2 findings before merging:

- **N2:** a pasted tool that is later saved into `plugins/` is now hidden
  quietly. It's kept in storage, and every other clash still warns.
- **N1:** the app message and both guides now say "tap **Connect** at the top
  of your project".

The live copy serves the same `core/app.js` and `core/lib/plugins.js` as
this branch (checked byte for byte). The guide change is one troubleshooting
row, so the Spanish run below still stands.

| Suite | Round 3 result |
|---|---|
| Unit | **434 pass**, 0 fail |
| DB | **10 pass**, 0 fail |
| E2E | **421 pass**, 2 skipped, 0 fail |

**New in Round 3:**

- **`guides.test.mjs`:**
  - `SUPABASE` is now `Connect`, `Project URL`. The stale `Project Settings`
    and `API` are gone. "Connect" is Supabase's button, not the hub's
    "Connect my brain".
  - A new test checks that the app's address message and both guides send
    students to the same place ("tap Connect … Project URL"). Neither the app
    nor the guides may say "Project Settings" again.
- **`tests/e2e/phase7.spec.mjs`** adds 4 tests × 3 projects for N2:
  - **The guide's path:** paste-install `gh-tool`. The fake GitHub then lists
    the same id in `plugins/`, and the student taps Refresh tools. Result:
    one tile, no `tool-conflict`, also after a reload, and the pasted copy is
    still in `hub.localTools`.
  - **Pasting a newer version once it's in `plugins/`:** refused at Check
    recipe ("A plugins/ tool already uses the id …"). A student is never
    silently left running a different version than the one they pasted.
  - **Genuine clash, still warns:** a `plugins/` tool using a built-in id.
  - **Genuine clash, still warns:** a pasted tool using a built-in id.
- **Mutation checks** on `core/lib/plugins.js` (restored byte for byte):
  - never promoting fails the N2 test;
  - promoting every clash fails both guard tests.

---

## Verdict — Round 2

**APPROVED.** Merge when ready.

- **All required findings are fixed** (G1–G4), and so are all the
  recommended ones (G5–G11).
- **Both app fixes are correct and now have tests:**
  - **`st.checkOpen`:** the check panel reopens after the trip to the AI app.
  - **Service worker `no-cache`:** an update reaches an installed app
    promptly.
- **The Spanish-guide run on the live copy** now goes all the way from a
  blank Android phone to a scored check (95 / 100, Strong), with zero page
  errors. It uses only labels the guide gives, and the real clipboard.

Two new findings are below (N1, N2). Neither blocks the pilot; both are small
and can ride along or wait for pilot feedback.

## Counts (`npm test`, no network) — Round 2

| Suite | Result |
|---|---|
| Unit | **433 pass**, 0 fail. Includes 16 in `tests/unit/guides.test.mjs` and 4 new in `tests/unit/sw.test.mjs`. |
| DB | **10 pass**, 0 fail |
| E2E (desktop, iPhone WebKit, Android Chromium) | **409 pass**, 2 skipped, 0 fail. Includes 4 new tests × 3 projects in `tests/e2e/phase7.spec.mjs`. |

Round 1 was 428 / 10 / 397.

### New and changed tests

- **`tests/unit/guides.test.mjs`**
  - **Parity by content:**
    - links in order (the cross-link counts as the same link);
    - code values in order (`TU-USUARIO` = `YOUR-USERNAME`);
    - the same `##` sections, with steps 1–6 in order;
    - the same troubleshooting rows, matched by the message each one quotes;
    - the same quoted UI messages, in order.
  - **Every bold or quoted string is classified,** or the test fails. The
    categories:
    - **App label:** must exist **verbatim**, including the `’` in
      "I don’t". Round 2 adds Next, Connect my brain, Copy check prompt,
      Score it, Save, Check recipe, Install and Refresh tools.
    - **App template:** Open Claude.
    - **App message:** now including "not supported".
    - **Recipe label.**
    - **GitHub wording:** now including Add file, Create new file, Commit
      changes and Actions.
    - **Supabase wording (new):** Project URL, Project Settings, API.
    - **Phone wording.**
    - **Emphasis.**
  - **"Score so far: … / 50"** is shown with a template value in the app, so
    it's classified as an **app template**. It passes only if app.js still
    builds `Score so far: ${result.score} / ${result.outOf}`, and
    `scoreReport()` with no citation check really returns `outOf === 50`. If
    the text or the scoring changes, the guide's number is caught.
  - **No stale entries (new):** every list entry must still be quoted by a
    guide.
  - **The apostrophe normalisation is gone,** now that G6 is fixed.
  - **ES gloss on first use,** for every app and recipe label. Labels GitHub
    also uses (Save, Settings) are skipped, because their first use is in the
    GitHub step. The `Automatic` exception is removed (G7 fixed).
  - **Links and paths:** README links both guides, every relative link
    resolves, and every repo path the guides name exists.
- **`tests/unit/sw.test.mjs` (new).** It runs the real `sw.js` in a vm with a
  fake worker global.
  - Every app-shell request is fetched with `cache: 'no-cache'`.
  - Recipes, `plugins/`, other origins and non-GET requests are never
    intercepted.
  - When offline it falls back to the cache, and a navigation falls back to
    `index.html`.
  - A good response refreshes the cache.
  - **Why a unit test:** browsers don't expose which cache mode a worker
    used, so this can't be seen from e2e.
- **`tests/e2e/phase7.spec.mjs` (new),** all three projects:
  - an opened, unscored check reopens after a reload, with the same check
    prompt and **Score it** ready;
  - it also reopens after going Home and back;
  - a new answer closes it, and it stays closed after a reload;
  - a new Run closes it, and it stays closed after a reload.

**Mutation checks** (scratch copies, never the repo; `core/app.js` was
restored byte for byte):

- **Each of these made the suite fail:**
  - removing `st.checkOpen` from the reopen condition (2 e2e tests fail);
  - dropping `cache: 'no-cache'` from `sw.js`;
  - a straight apostrophe in the Skip label;
  - renaming "Score so far" or "Score it" in app.js;
  - removing an ES gloss;
  - all eight Round 1 mutations.

## Independent run — Spanish guide, Android (Chromium, Pixel 7, es-MX), no brain — Round 2

**Setup:**
- My own runner, kept in my scratchpad. Every label it taps is first looked up
  as **bold** text in `EMPIEZA-AQUI.md`. Buttons are matched by exact
  accessible name. Copy prompt, Paste answer and Copy check prompt go through
  the real clipboard.
- Fresh profile, live copy.
- **Inputs reused from El Código's runs:** the real Costco answer (my prompt
  was identical to his) and the real checker table.
- **New this round:** the check stage. It's a separate browser session after
  "leaving for the AI app", the hardest case for the reopen fix.

```
paso 4: Next, Skip — I don’t have a brain yet, Manual (copy and paste), Claude, Finish
        → Home "Hi, Mariana", 2 tools, "No brain"         errors: none, failed requests: none
paso 5.1–5.4: Company Analysis → Company / What is this for? (Class assignment) → Run →
        Copy prompt "Copied.", clipboard = prompt (2950 chars) → "Open Claude" = https://claude.ai/new
paso 5.7: back: prompt still shown; Paste answer filled the box from the clipboard (16994 chars)
        → Use this answer: 7 sections + Summary, none missing;
        source check: All 45 factual claims have a source or are marked [unverified]. 1 marked [unverified].
check:  Check this answer → "Score so far: 50 / 50 — the citation check has not been run yet"
        Download → company-analysis-2026-10-03.md
— new browser session (the trip to the AI app) —
check:  panel reopened by itself: true, "Score so far: 50 / 50 — …"
        Copy check prompt → clipboard = check prompt (15341 chars)
        paste reply → Score it → "Score: 95 / 100 — Strong"
        Sections 20/20 · Sources present 30/30 · Claims supported 45/50
        (36 supported, 8 partly, 0 not supported, 0 unreachable); 8 fixes, all "partly supported"
        reload → full score still shown
page errors: none · failed requests: none   (every stage)
```

**Every label the runner tapped was found in bold in the Spanish guide.**
That includes Next, Copy check prompt and Score it, which Round 1 flagged as
missing.

## Round 1 findings — status

| # | Finding | Status |
|---|---|---|
| G1 | Checker steps: Copy check prompt / Score it unnamed; "50 / 50" read as final | **Fixed.** Both named and glossed; "isn't your final score yet"; "not supported → fix or remove". Run confirms. |
| G2 | Save to brain is two taps | **Fixed.** "opens a short summary… Tap **Save**". |
| G3 | "Could not reach that brain" gave the wrong cause | **Fixed.** Internet, the Project URL, and the free project pausing. See N1 for the Supabase menu name. |
| G4 | "step 3" in the example | **Fixed** (step 2). |
| G5 | Next unnamed; "three things" | **Fixed** (Next named; "two quick choices"). |
| G6 | Straight apostrophe | **Fixed.** The test is now strict. |
| G7 | Automatic unglossed | **Fixed** (automático). Test exception removed. |
| G8 | Spanish phone labels | **Fixed.** "Agregar a pantalla de inicio", plus the English labels for phones set to English. Real-device check stays on PILOT-CHECKLIST. |
| G9 | llave / estar seguro | **Fixed** (clave, asegurarte). |
| G10 | Make your own tools too thin | **Fixed.** Add file → Create new file → `.recipe.md` → Commit changes → Refresh tools; Check recipe and Install named. See N2. |
| G11 | Pages on a real fork | **On PILOT-CHECKLIST.** The 404 row points to Actions. Still unproven until a student forks. |

**Tooling (`guide-run.mjs`):**

- **T1:** exit 1 on errors. **Fixed.**
- **T3:** real clipboard paste on Android. **Fixed.**
- **T4:** buttons matched from the start of their name. **Fixed.**
- **T5:** loads are cache-busted. **Fixed.**
- **T2: withdrawn.**
  - **Measured on the live copy:** in WebKit, a screenshot with
    `caret: 'initial'` still raises one "Refused to apply a stylesheet"
    (Chromium raises none).
  - **So:** El Código is right, and the narrowed screenshot-window filter
    stays.
- **Remaining note:** T1's exit rule excuses any console error containing
  "status of 401". That is safe only because the failed-request list
  separately allows just the open-check's `401 POST /rest/v1/thoughts`, so a
  401 from anything else still fails the run. Acceptable as is.

## New findings — Round 2 (none blocking; both fixed in Round 3)

- **N1 — Supabase's menu name is out of date (low). FIXED in Round 3.**
  - **The problem:**
    - The troubleshooting row says to compare against **Project URL** under
      **Project Settings → API**. Supabase's docs (checked 2026-10-03) now
      show the project URL in the project's **Connect** dialog, and under
      **Integrations → Data API**. Keys are under **Settings → API Keys**.
    - A student looking for "Project Settings → API" may not find it.
    - The app's own address-format message (`core/app.js`, "Project
      Settings → API in Supabase") has the same wording.
  - **Suggested fix:** "tap **Connect** at the top of your project in
    Supabase; it shows the Project URL", in both guides and in the app
    message. Then update the `SUPABASE` list in the test.
- **N2 — The "Make your own tools" path ends in a warning (low, app). FIXED in Round 3, with e2e tests.**
  - **What happens:** a student who follows it exactly first installs the
    tool by paste (step 3), then saves the same file to `plugins/` (step 4).
    Both copies have the same id. `discoverTools()` keeps the plugin, and
    Home then shows a yellow warning: *"The tool you pasted (id "…") is
    hidden because a tool in your plugins/ folder uses the same id. Change
    one of the ids to see both."*
  - **Why it matters:** for this case the warning is alarming and its
    advice is wrong (they don't want both). This comes from reading
    `core/lib/plugins.js` and the conflict note in `core/app.js`. I did not
    run it live.
  - **Suggested fix (app):** when a pasted tool and a `plugins/` tool share
    an id, quietly drop the pasted copy (or say "now saved in your copy on
    GitHub"). Add an e2e test for it.

---

## Round 1 (for the record)

**Verdict:** approved with required changes (G1–G4).

**Counts:** 428 unit / 10 DB / 397 e2e.

**The run:**
- **Device:** the Spanish guide on Android, no brain, live copy.
- **Reached:** the result (45/45 sourced) and the download, with zero page
  errors.
- **Gaps:** it showed the unnamed buttons and the misleading "Score so far:
  50 / 50" that became G1.

**GitHub wording verified against docs.github.com:**
- Fork → Create fork;
- Settings → Pages → Build and deployment → Source: Deploy from a branch,
  then Branch main, / (root), and Save;
- Sync fork → Update branch.
