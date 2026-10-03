# Phase 2 — Test Plan (Nitpick)

**Author:** Nitpick · **Date:** 2026-10-03 · **Branch:** `phase-2-hub-core`
**Written against:** `docs/phase-2/PLAN.md` (including the 2026-10-03 OPTIONS
revision), `docs/DECISIONS.md`, `WIDGET-GUIDE.md`. Written before reading any
implementation; tests check the contract, not the code.

Run everything with `npm test`. Every external service is faked in memory. No
test touches the real network or a real Supabase project.

## Suites

| Suite | Command | Proves | PLAN section |
|---|---|---|---|
| `tests/db/open-check.test.mjs` | `npm run test:db` | Open-database check on the **real** Express migration in PGlite | Database proof; DECISIONS Q3 |
| `tests/unit/recipe.test.mjs` | `npm run test:unit` | Every WIDGET-GUIDE §3–§9 rule, all errors collected, §10 example parses | recipe.js |
| `tests/unit/prompt.test.mjs` | 〃 | Exact constants, STANDARD_BLOCK lines, web line placement, 600-char cut, literal single-pass fill | prompt.js |
| `tests/unit/summary.test.mjs` | 〃 | Exact permission/web-search texts, `[Label]` query, privacy warning only for search_brain + run_ai | summary.js |
| `tests/unit/output.test.mjs` | 〃 | `##`-only headings, missing sections, last Summary, unique sources | output.js |
| `tests/unit/brain.test.mjs` | 〃 | Exact URLs/headers/bodies, open-check classification, refresh at `expires_at - 60`, refresh failure → `signed-out`, recent/profile/archive | brain.js |
| `tests/unit/ai.test.mjs` | 〃 | Free-model filter + sort, fallback triggers, stop codes, web plugin, `tried` | ai.js |
| `tests/unit/plugins.test.mjs` | 〃 | `repoFromLocation`, api/cache/manifest/none, 10-minute cache, core-over-plugin conflicts | plugins.js |
| `tests/unit/save.test.mjs` | 〃 | Exact save row (no top-level tags/category/summary), download file name and layout | save.js |
| `tests/unit/store.test.mjs` | 〃 | JSON round trip; never throws when storage is missing, blocked, full or corrupt | store.js |
| `tests/e2e/harness.spec.mjs` | `npm run test:e2e` | The fakes and the network guard themselves, in all three browsers, with no app code | (harness) |
| `tests/e2e/setup.spec.mjs` | 〃 | Refusal of `open`, `not-express`, unreachable brains; no sign-in request; password cleared and never stored or sent elsewhere | Setup |
| `tests/e2e/hello-hub.spec.mjs` | 〃 | **Done when:** hello-hub end to end, Automatic and Manual, with and without a brain; copy/paste; sanitised output | Done when; Tool runner |
| `tests/e2e/save-download.spec.mjs` | 〃 | Save panel prefill, exact row, upsert, recent list, archive; download file | Result; save.js |
| `tests/e2e/websearch-and-models.spec.mjs` | 〃 | Full web-search decision table; 429 fallback; 401 → `run-error` → manual | Web search decision; ai.js |
| `tests/e2e/add-restore-plugins.spec.mjs` | 〃 | Add tool errors/summary/install/download; in-progress restore; GitHub discovery and manifest fallback | Add tool; plugins.js |
| `tests/e2e/settings.spec.mjs` | 〃 | Export excludes key and session; sign out; reconnect; reset with confirm | Settings |
| `tests/e2e/layout.spec.mjs` | 〃 | No sideways scroll on every screen at device size and at 320px; buttons ≥ 44×44 on phones | Constraints |
| `tests/e2e/pwa.spec.mjs` | 〃 | Manifest values and real 192/512 PNGs; SW scope and script; SW caches only same-origin shell; offline shell | PWA |

All e2e specs run in `desktop-chromium`, `iphone-webkit` (iPhone 13) and
`android-chromium` (Pixel 7). Counts at time of writing: **224 unit**,
**10 db**, **60 e2e × 3 projects = 180** (15 of them the harness self-check).

### "Done when" mapping

| Criterion | Where |
|---|---|
| Dummy recipe end to end, Automatic mode, with brain | `hello-hub.spec` "Automatic mode, with brain" |
| … Automatic mode, without brain | `hello-hub.spec` "Automatic mode, without brain" |
| … Manual mode, with brain | `hello-hub.spec` "Manual mode, with brain" |
| … Manual mode, without brain | `hello-hub.spec` "Manual mode, without brain" |
| Laptop size, iPhone/WebKit, Android/Chromium | Every spec runs in all three projects |
| Open check proven against local Postgres | `tests/db/open-check.test.mjs` |

## Harness

- `tests/helpers/fixtures.mjs`: every test gets a **network guard**. Any
  request to an origin other than the test server or a fake is aborted and
  **fails the test**. It also fixes the browser clock at
  `2026-10-03T12:00:00Z` (timezone UTC) so dates are deterministic.
- `fake-brain.mjs`: `https://fake-brain.supabase.co`, modes `locked`, `open`,
  `not-express`, `down`. PostgREST-style errors, authed upsert honouring
  `on_conflict=dedup_key,user_id` with md5 dedup, GET filters including
  `metadata->hub->>type`, PATCH, `search-brain`. Real CORS preflights are
  answered separately from the app's own OPTIONS request, so `not-express`
  really is a readable 404 in every browser.
- `fake-openrouter.mjs`: per-model scripts (`ok`, 429, 401, 402, 400,
  `empty`), answers built from the prompt's section list, a `hold()` gate to
  observe `run-status`, and a log of whether `plugins:[{id:'web'}]` was sent.
- `fake-github.mjs`: contents listing and raw downloads; `failApi` gives a 403
  rate-limit.
- Service workers are blocked except in `pwa.spec`, so they can't hide
  requests from the fakes.

## Database proof — what was stubbed or stripped

- **Stubbed:** roles `anon` and `authenticated`; schema `auth`;
  `auth.users(id, email)`; `auth.uid()` reading
  `request.jwt.claim.sub`; `USAGE` on `auth` and `public`; and Supabase's
  default table/sequence/function grants to `anon` and `authenticated`.
- **Why the grants matter:** without them, `anon` fails with
  `permission denied for table`, which is also `42501`. The locked test
  would then pass for the wrong reason. The test asserts the message is the
  **row-level security** one.
- **Stripped:** nothing. PGlite with pgvector runs the fixture verbatim
  (HNSW indexes, generated columns, `nulls not distinct`, plpgsql, the view).
  The test prints this in its diagnostics.
- **Result:** 10/10 pass. Locked → `42501` (RLS) and open → `23502`, with 0
  rows written, on both an empty and a seeded table. The dedup trigger
  doesn't raise on null content. Authenticated upsert keeps one row, and its
  metadata survives. An enrichment-style UPDATE leaves `metadata.hub` intact.
  A user can't save a row for another user.

## Ambiguities for El Código

Each was resolved with the strictest reasonable reading. Change PLAN.md if you
disagree, and I'll change the test.

1. **`now` type.** PLAN never says whether `now` is a function or a number.
   The unit tests pass a value that works as both (`now()`,
   `now/1000` and `new Date(now)`). Please state which in PLAN.
2. **Leading blank line before `---`.** PLAN says "the first line must be
   `---`". The code accepts a leading blank line, and the test fails. I'd
   accept leading whitespace, since pasted text often has it. **Amend PLAN or
   fix the code.**
3. **CRLF** recipes (saved on Windows) must parse. The test passes.
4. **Strict input rules:** `options` on a non-`choose_one` input, an unknown
   key inside an input, and `profile_part` on a non-profile save are all
   errors. Error indexes are 0-based (`inputs[1]`), as in the PLAN example.
5. **20 KB limit:** the boundary (20,000 or 20,480 bytes) is unspecified.
   Tests only use 15 KB (accept) and 25 KB (reject).
6. **600-char cut:** `content.slice(0, 600) + '…'`. Exactly 600 characters
   aren't cut.
7. **STANDARD_BLOCK:** the non-blank lines must equal the PLAN list exactly.
   Blank lines between them are allowed.
8. **missingSections:** `## **Key points**` and `## Next steps.` count as
   present, because the asterisks and full stop are surrounding punctuation.
9. **`repoFromLocation`** of a user site (`alice.github.io/`) returns
   `{owner:'alice', repo:'alice.github.io'}`. I first expected `null`, then
   accepted this reading because it's correct for GitHub Pages.
10. **Plugin cache:** keyed per repo, so an override doesn't reuse another
    repo's listing. A failed API call isn't cached. Exactly 10 minutes old
    counts as stale.
11. **`hub.localTools` shape** and the **`conflicts` element shape** are
    unspecified. As a result, local origin and plugin-vs-local precedence are
    only covered end to end (install, then tile), not at unit level.
12. **Setup step 2:** a successful connect, or `brain-skip`, goes straight
    to step 3. Step 2 has no `setup-next`.
13. **`field-<id>`** is on the control itself: the `input`, `textarea` or
    `select`.
14. **`model-select`** option `value` is the model id.
15. **Manual mode:** `run-btn` builds the prompt and shows `prompt-box`.
16. **`run-status`** may stay visible after the run to show which model
    answered. That's accepted.
17. **Downloaded report:** the format of the inputs list is unspecified. The
    test only checks that it's a `- ` list containing the values.
    `download-recipe` saves as `<id>.recipe.md`, with the pasted text
    unchanged.
18. **Settings export:** the file format is unspecified. The test checks only
    that no key or session values or key names appear, and that settings are
    present.
19. **`settings-repo-override`** is saved on change, Enter or blur.
20. **`profile()`** says nothing about archived rows. Untested.
21. **Recipes without `run_ai`** in Automatic mode should offer copy-paste
    only (WIDGET-GUIDE §6). The runner section of PLAN doesn't say how, or with
    which test ids. Untested until it does.

## PLAN defects (blunt)

1. **Edited tags are lost.** `save-tags` is editable, but `buildSaveRow`
   takes no `tags` argument; it always derives them from `save.tags`. A
   student's tag edits can't reach the row through the contract. Add a
   `tags` parameter.
2. **Refresh can't bypass the cache.** DECISIONS Q4 says Refresh bypasses the
   10-minute cache, but `discoverTools` has no `force` option. A student who
   commits a recipe and taps Refresh within 10 minutes sees nothing. Add
   `force`.
3. **Fallback order can't be expressed.** "The order picked = fallback order"
   doesn't work with a native `<select multiple>`: it has no pick order, and on
   phones it's an OS picker. The tests pass only because the fake models'
   alphabetical order equals the intended order. Use an ordered list with
   up/down buttons, or say "alphabetical".
4. **No way back to Home.** `screen-tool`, `screen-add` and
   `screen-settings` have no back test id (`nav-home`). Tests navigate by
   hash. Real students need a button.
5. **`npm test` was broken on Node 22.** `node --test tests/unit/` (a
   directory) fails with `MODULE_NOT_FOUND`. I changed `test:unit` and
   `test:db` to quoted globs (`"tests/unit/*.test.mjs"`).
6. **"Nothing is written" depends on `content` being NOT NULL.** That's true
   for the Express schema. If a pre-Express, open course brain ever had a
   nullable `content`, the probe would insert one junk row before the hub
   refused it. It's harmless but contradicts DECISIONS. It's on the pilot
   checklist.
7. **Express detection may never fire on real Supabase** (revised rule). In a
   browser, the app's OPTIONS triggers a CORS preflight first, and Supabase's
   gateway may answer any path. It isn't a security problem, since the first
   request decides. It's on the pilot checklist, as asked.
8. **`recent(limit)` fetches `limit*2`.** When more than half of the newest
   saves are archived, the list shows fewer than `limit` items. This is minor;
   document it or page through.

## App defects seen so far (tests run against the in-progress code)

- **Save hangs, in all three projects.** The fake returns `201` with the
  row, but `save-status` stays empty and `save-confirm` stays disabled. The
  row *is* written. Confirmed with and without the fixed clock.
- **Leading blank line accepted** (ambiguity 2).

## Platform limits recorded rather than failed

- **WebKit clipboard:** where Playwright WebKit can't read the clipboard, the
  manual tests record an annotation and prove the fallbacks instead
  (`paste-help`, typing into `answer-box`). In the current run, none were
  needed.
- **WebKit offline reload:** Playwright WebKit throws an internal error on
  `page.reload()` while offline, so the offline-shell test is skipped there.
  It hasn't been proven whether that's the app or the browser. It's on the
  pilot checklist.
- **Windows clipboard** turns LF into CRLF, so the copy test normalises line
  endings before comparing.
