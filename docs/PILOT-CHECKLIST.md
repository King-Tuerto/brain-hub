# Pilot Checklist — what emulation can't prove

Automated browser tests run the hub at phone size, with phone user agents and
touch, on WebKit (Safari's engine) and Chromium. They still aren't phones.
Everything below has to be checked by students on real devices during the
Phase 7 pilot. Add to this list in every phase; never remove an item until a
real device has proved it.

Format: **item** — why emulation can't prove it — phase added.

## Manual (copy-paste) mode

- **Copy prompt on iPhone Safari and the installed iPhone app**: iOS only
  allows clipboard writes inside a real tap, and tests grant clipboard
  permission artificially. — Phase 2
- **Copy prompt on Android Chrome and the installed Android app** — same
  reason. — Phase 2
- **"Open my AI app" lands in the native Claude / ChatGPT / Gemini app** (or
  its website if the app isn't installed): app hand-off is an operating-system
  feature, and a test browser just opens a URL. — Phase 2
- **Coming back to the hub after the AI app:** does iOS or Android reload
  the page and lose the student's inputs? The hub saves the in-progress run in
  browser storage, but only a real app switch shows whether it survives.
  — Phase 2
- **"Paste answer" button:** iOS shows its own Paste bubble and Android may
  ask for permission. Tests can only simulate reading the clipboard. Fallback:
  long-press in the answer box. — Phase 2
- **Pasting a long answer (10–20 KB) from the Claude and ChatGPT apps:**
  formatting may arrive as rich text, plain text, or truncated, depending on
  the app. — Phase 2

## Install and storage

- **Add to Home Screen on iPhone (Safari share menu) and Install on
  Android:** install prompts are browser chrome, not page content. — Phase 2
- **Keys and sign-in survive closing and reopening the installed app.** On
  iOS, a home-screen app has storage separate from Safari, so a student who
  set up in Safari must set up again in the app. Confirm the hub's message
  about this is clear. — Phase 2
- **iOS storage eviction:** Safari may wipe a site's storage after about 7
  days unused. Check whether a student must re-enter keys after a week away.
  — Phase 2

## Real services (mocked in tests)

- **Sign-in against a real student Express brain** (email + password), and
  the token refreshing after an hour. — Phase 2
- **The open-database check against a real June-cohort brain** that is still
  open: tests prove it on local Postgres and a simulated server, not real
  Supabase. — Phase 2
- **A real OpenRouter call** with a student's key, a free model hitting its
  rate limit, and fallback to the next model. — Phase 2
- **Listing `plugins/` through the GitHub API from a real student fork**
  served by GitHub Pages. — Phase 2

## Layout

- **On-screen keyboard covering form fields and buttons** on small phones:
  emulation sets the screen size but shows no keyboard. — Phase 2
- **Notch and home-bar safe areas** on an iPhone in the installed app.
  — Phase 2

## Real-service behaviour the test fakes assume (added by Nitpick)

- **Express detection (OPTIONS search-brain) against a real Supabase
  gateway**: in a browser the app's OPTIONS is preceded by a CORS preflight,
  and the fakes answer both exactly as PLAN says. Whether real Supabase ever
  returns a readable 404 for a missing function is unknown, so detection of
  pre-Express brains may silently never fire. — Phase 2
- **The open check writes nothing on a course-built (pre-Express) open
  brain**: "nothing is written" relies on `content` being NOT NULL. Proven
  for the Express schema only, in local Postgres. — Phase 2
- **CORS from the student's github.io address** to Supabase REST, Auth and
  Functions, to OpenRouter (with the `X-Title` header) and to
  `raw.githubusercontent.com`: the fakes allow every origin and header.
  — Phase 2
- **Token refresh after a long Manual-mode detour**: a student who spends
  over an hour in the AI app comes back to an expired token; tests prove the
  refresh logic only with a fake clock. — Phase 2
- **Picking several models on a phone**: the model list is a multi-select,
  which phones show as an OS picker. Check a student can choose more than one
  and understands the fallback order. — Phase 2
- **Offline start of the installed iPhone app**: Playwright's WebKit can't
  reload a page while offline, so the cached-shell test is skipped on the
  iPhone project. — Phase 2

## Phase 3 — company analysis (added by Nitpick)

- **Save, search and re-find against a real Express brain on Supabase.**
  Proven only on the local stand-in: Express's real migration in PGlite,
  behind the hub's exact HTTP calls. PostgREST's own request parsing,
  Supabase Auth and the deployed `search-brain` function are imitated, not
  run. — Phase 3
- **Re-find with embeddings on.** The stand-in has no embeddings, so search
  is keyword-only, and keyword search ANDs every word of the query. The
  brain query is the company exactly as typed ("Deere & Company (NYSE: DE)"),
  so a saved summary is found again only if it contains every word,
  ticker included. A real brain's vector search should be looser; check that
  re-find works when a student types the company differently from the
  saved summary. — Phase 3
- **Real AI apps' Markdown habits.** The source-check rules were tuned
  against one research agent's answers. ChatGPT, Gemini and Claude.ai
  apps format differently: bold pseudo-headings, `---` separators, `~~~`
  fences, nested bullets, citation footnotes like `[1]` with a reference
  list. Paste a real answer from each app and read the source-check result.
  — Phase 3
- **A long answer pasted on a phone.** About 20 KB of Markdown goes into
  the answer box through the OS paste menu; emulation fills the box
  directly. — Phase 3
