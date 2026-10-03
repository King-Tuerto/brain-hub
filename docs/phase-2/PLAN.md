# Phase 2 — Hub Core: El Código's Build Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `phase-2-hub-core`

This is the contract Nitpick writes tests against before any code exists.
Module names, function signatures, wire formats and `data-testid` values below
are binding. If the code needs to differ, this file changes first.

Read with: `docs/DECISIONS.md` (it overrides the spec) and `WIDGET-GUIDE.md`
(recipe format v1).

## Done when (from the spec, as amended by DECISIONS #7)

A dummy recipe runs end to end in **both AI modes**, **with and without a
brain**, at **laptop size and in phone emulation** (iPhone/WebKit,
Android/Chromium). This is proved by automated tests, and Nitpick signs off in
`docs/phase-2/NITPICK-SIGNOFF.md`.

## Constraints

- **Static site, no build step.** Plain ES modules served as-is by GitHub
  Pages, under a sub-path (`/brain-hub/`). Every URL in the app is relative.
- **Vendored libraries, no CDN at runtime:** `core/vendor/js-yaml.mjs`,
  `core/vendor/marked.esm.js`, `core/vendor/purify.es.mjs`, copied from npm by
  `npm run vendor`. No supabase-js: the brain client is plain `fetch`, which
  keeps it small and makes every request visible to tests.
- **Pure logic in `core/lib/`.** No DOM, and runnable in Node for unit tests.
  Network functions take an injected `fetch`. Anything that needs time takes an
  injected `now`.
- **Credentials only in `localStorage`** (keys listed under Storage). Passwords
  are never stored.
- **Phone first:** a single column up to 640px; nothing scrolls sideways at
  320px; tap targets are at least 44px.

## Files

```
index.html  manifest.json  sw.js  icon.svg  icon-192.png  icon-512.png
core/app.js            router + screens (DOM only; logic lives in lib)
core/styles.css
core/lib/recipe.js     parse + validate recipes
core/lib/prompt.js     build prompts
core/lib/summary.js    install summary
core/lib/output.js     parse AI answers
core/lib/brain.js      brain client + open-database check
core/lib/ai.js         OpenRouter client + model fallback
core/lib/plugins.js    tool discovery
core/lib/save.js       save payload + download file
core/lib/store.js      localStorage wrapper (never throws)
core/tools/index.json  ["hello-hub.recipe.md"]
core/tools/hello-hub.recipe.md
core/vendor/…
plugins/ (Phase 1, unchanged)
tests/unit/*.test.mjs  node:test
tests/db/*.test.mjs    PGlite + Express migration.sql
tests/e2e/*.spec.mjs   Playwright
tests/fixtures/express-migration.sql   copy of open-brain-express@14890f1 migration.sql
tests/helpers/          fake brain, fake OpenRouter, fake GitHub (Playwright routes)
tests/serve.mjs         static server: serves the repo at http://localhost:4173/brain-hub/
playwright.config.mjs   projects: desktop-chromium, iphone-webkit (devices['iPhone 13']),
                        android-chromium (devices['Pixel 7'])
package.json            scripts: vendor, test:unit, test:db, test:e2e, test (all three)
```

## Module contracts (`core/lib`)

### recipe.js

```js
parseRecipe(text, { fileName } = {}) → { ok: true, recipe } | { ok: false, errors: string[] }
```

- Front matter is everything between the first two `---` lines (the first
  line must be `---`). It is parsed with js-yaml `load` using the
  `CORE_SCHEMA`, so no custom types. The body is everything after the second
  `---`, trimmed.
- `recipe` = the front matter fields, plus `body` (string) and `fileName`
  (string or undefined).
- It enforces **every** rule in WIDGET-GUIDE.md §3, §4, §5, §6, §6a, §7 and
  §9, and collects **all** errors rather than stopping at the first. Each
  error is a short English sentence naming the field, e.g.
  `inputs[1].type must be one of text, long_text, choose_one, number`.
- `fileName`, when given, must equal `${id}.recipe.md`.
- Defaults applied: `brain_context.limit` → 5; `input.required` has no default
  (it's required).
- `PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g`, exported. Any `{{`
  that doesn't match is an error.
- HTML check: the regex `/<\s*\/?\s*[a-zA-Z][^>]*>|javascript:/i` against the
  whole text is an error.

### prompt.js

```js
fillTemplate(template, values) → string        // replaces {{key}} with values[key]; unknown keys left as-is
buildPrompt(recipe, inputs, { brainContext, today, webSearchLine }) → string
STANDARD_BLOCK(recipe) → string
WEB_SEARCH_LINE = 'Search the web for current information before answering, and cite what you find.'
NO_BRAIN_TEXT = '(No personal notes available.)'
EMPTY_INPUT_TEXT = '(not provided)'
```

- `values` = the inputs (empty or whitespace becomes `EMPTY_INPUT_TEXT`),
  `brain_context` (a formatted string, or `NO_BRAIN_TEXT` when null), and
  `today`.
- Prompt = filled body + `\n\n` + (webSearchLine ? webSearchLine + `\n\n` : '')
  + `STANDARD_BLOCK(recipe)`.
- `STANDARD_BLOCK` contains, in this order:
  - the line `---`;
  - `Format your answer in Markdown with these sections, in this order, each as a "## " heading:`;
  - one `- <section>` line per section;
  - `- Summary`;
  - the source rule: `Every factual claim must include a source link in Markdown form [title](https://…). If you cannot source a claim, mark it [unverified].`;
  - the summary rule: `End with "## Summary": 2–3 sentences someone could search for later.`
- `formatBrainContext(results)` → string: one `- (YYYY-MM-DD) <content>` line
  per result, each `content` cut to 600 characters with `…`. An empty array
  becomes `NO_BRAIN_TEXT`.
- `webSearchLine` is decided by the caller (see Runner).

### summary.js

```js
installSummary(recipe) → { name, author, version, description,
  permissions: [{ id, text }], query: string|null, webSearch, warnings: string[] }
```

- `query`: `brain_context.query`, with every `{{id}}` replaced by
  `[<that input's label>]`. Null when there's no `brain_context`.
- Permission texts:
  - `search_brain`: `Search your brain for: "<query>"`
  - `save_to_brain`: `Show a Save to brain button (you choose each time)`
  - `run_ai`: `Send its prompt to your AI automatically in Automatic mode`
- `webSearch` text:
  - `required`: `Needs web search`
  - `helpful`: `Better with web search`
  - `none`: `No web search`
- `warnings` contains `PRIVACY_WARNING` exactly when permissions include both
  `search_brain` and `run_ai`.
- `PRIVACY_WARNING = 'In Automatic mode, notes from your brain are sent to OpenRouter and the AI company behind the model you picked.'`

### output.js

```js
parseOutput(markdown, recipe) → { summary: string, sections: string[], missingSections: string[], sources: string[] }
```

- Headings are lines matching `^##\s+(.+?)\s*#*$` (`##` only, not `###`).
  `sections` lists them in order.
- `missingSections`: the recipe's `output.sections`, plus `Summary`, that are
  absent. The comparison is case-insensitive and ignores surrounding
  punctuation and whitespace.
- `summary`: the text under the last `## Summary` heading, up to the next
  `##` or the end, trimmed. Empty string if absent.
- `sources`: unique `http(s)` URLs from Markdown links and bare URLs, in order
  of first appearance, with trailing `).,;` stripped.

### brain.js

```js
createBrain({ url, anonKey, fetch, store, now }) → {
  openCheck(): Promise<'locked'|'open'|'not-express'|'unreachable'|'unknown'>,
  signIn(email, password): Promise<{ ok, error? }>,
  signOut(), isSignedIn(): boolean, email(): string|null,
  search(query, limit): Promise<{ ok, results?, error? }>,
  save(row): Promise<{ ok, id?, error? }>,
  recent(limit = 20): Promise<{ ok, items? }>,      // hub saves, newest first, archived filtered out
  profile(): Promise<{ ok, items? }>,               // newest per profile_part
  archive(item): Promise<{ ok }>,
}
classifyOpenCheck(status, body) → 'locked'|'open'|'unknown'      // pure
```

**Wire formats.** Every request sends the header `apikey: <anonKey>`. A
trailing `/` on `url` is stripped.

- **openCheck:**
  - First request: `POST {url}/rest/v1/thoughts`, `Authorization: Bearer <anonKey>`,
    `Content-Type: application/json`, `Prefer: return=minimal`, body
    `{"content":null}`.
  - `classifyOpenCheck`: body `code` `42501` → `locked`; `23502` → `open`;
    anything else → `unknown`. A network failure → `unreachable`.
  - If `locked`: a second request, `OPTIONS {url}/functions/v1/search-brain`.
    A 404 → `not-express`. Anything else, **including a network failure** →
    `locked`.
    - *(Revised 2026-10-03, before any test ran.)* This step only tells an
      Express brain from an older one; the security decision was already made
      by the first request.
    - Against real Supabase, the gateway's answer to a cross-origin OPTIONS
      is unverified, and treating doubt as "refuse" would lock out real
      students. If `search-brain` is really missing, search fails later with
      a clear message.
  - Only `locked` lets setup continue.
- **signIn:** `POST {url}/auth/v1/token?grant_type=password`, body
  `{email,password}`.
  - On 200, store `{access_token, refresh_token, expires_at, user:{id,email}}`
    (`expires_at` in epoch seconds; if missing, it's `now/1000 + expires_in`).
  - On error, `error` is `body.error_description || body.msg || body.message || 'Sign-in failed'`.
- **Token refresh:** before any authed call, if `now/1000 > expires_at - 60`,
  `POST {url}/auth/v1/token?grant_type=refresh_token` with body
  `{refresh_token}`. If that fails, the session is cleared and the call
  returns `{ ok:false, error:'signed-out' }`.
- **search:** `POST {url}/functions/v1/search-brain`, `Authorization: Bearer <access_token>`,
  body `{query, limit}`. Response `{ok, results:[{id, content, created_at, …}]}`.
- **save:** `POST {url}/rest/v1/thoughts?on_conflict=dedup_key,user_id`,
  `Prefer: resolution=merge-duplicates,return=representation`, body = `row`.
  Returns the `id` of the returned row.
- **recent:**
  `GET {url}/rest/v1/thoughts?select=id,content,created_at,metadata&source=eq.brain-hub&order=created_at.desc&limit=<limit*2>`,
  then drops rows with `metadata.hub.archived === true` and cuts to `limit`.
- **profile:** the same GET with `&metadata->hub->>type=eq.profile&limit=100`,
  reduced to the newest row per `metadata.hub.profile_part`.
- **archive:** `PATCH {url}/rest/v1/thoughts?id=eq.<id>`, body
  `{metadata: {...item.metadata, hub: {...item.metadata.hub, archived: true}}}`.

### ai.js

```js
createAI({ key, fetch }) → {
  listFreeModels(): Promise<{ ok, models?: [{id, name}] , error? }>,
  run(prompt, { models: string[], webSearch: boolean }): Promise<{ ok, text?, model?, error?, tried: string[] }>
}
```

- **listFreeModels:** `GET https://openrouter.ai/api/v1/models`. Free means
  `id` ends with `:free`, or `pricing.prompt === "0" && pricing.completion === "0"`.
  Sorted by name.
- **run:** tries `models` in order with
  `POST https://openrouter.ai/api/v1/chat/completions`,
  `Authorization: Bearer <key>`, `X-Title: Brain Hub`, body
  `{model, messages:[{role:'user', content: prompt}]}`, plus
  `plugins:[{id:'web'}]` when `webSearch`.
  - **Moves to the next model on:** 429, 404, 408, 5xx, network error, or a
    200 with no `choices[0].message.content`.
  - **Stops immediately on:**
    - 401 → `error:'bad-key'`
    - 402 → `error:'no-credits'`
    - 400 → `error: body.error.message`
  - **All models fail:** `error:'all-models-failed'`.
  - `tried` lists the models attempted.

### plugins.js

```js
repoFromLocation({ hostname, pathname }) → { owner, repo } | null   // <owner>.github.io/<repo>/…
discoverTools({ fetch, store, now, repo, base }) → Promise<{ tools: [{ fileName, url, origin: 'core'|'plugin'|'local' }], via: 'api'|'cache'|'manifest'|'none' }>
```

- **Core tools:** always `GET {base}core/tools/index.json`, then
  `{base}core/tools/<file>`.
- **Plugins, when `repo` is known:**
  - Use the cached listing in store key `hub.pluginCache` if it's younger
    than 10 minutes (`via:'cache'`).
  - Otherwise
    `GET https://api.github.com/repos/<owner>/<repo>/contents/plugins`, keep
    entries with `type === 'file'` whose name ends in `.recipe.md`, use each
    entry's `download_url`, and cache the result (`via:'api'`).
- **API failure, or no repo:** `GET {base}plugins/plugins.json`, then
  `{base}plugins/<file>` (`via:'manifest'`). If the manifest is also missing
  or empty → `via:'none'`.
- **Local:** recipes installed by pasting (store key `hub.localTools`) are
  appended with `origin:'local'`.
- **Duplicate ids:** precedence is core > plugin > local. The losers are
  reported in a `conflicts` array.

### save.js

```js
buildSaveRow({ recipe, inputs, report, summary, sources, userId, now }) → row
downloadFile({ recipe, inputs, report, now }) → { fileName, text }
```

- `row` =
  `{ user_id, source:'brain-hub', content: summary, metadata:{ hub:{ tool, tool_version, type, profile_part?, tags, report, sources, saved_at, archived:false } } }`.
  `tags` come from `save.tags`, filled with the input values and lowercased.
  `saved_at` is an ISO string.
- `fileName` = `<id>-<YYYY-MM-DD>.md`. `text` = `# <name>`, then the date,
  the inputs as a list, a blank line, and the report.

### store.js

```js
get(key, fallback), set(key, value), remove(key)   // JSON; every call wrapped in try/catch; never throws
```

- **Store keys:** `hub.settings`, `hub.brain`, `hub.session`,
  `hub.openrouterKey`, `hub.localTools`, `hub.pluginCache`, `hub.runs.<toolId>`.
- `hub.settings` = `{ name, aiMode:'auto'|'manual', models:[], paidSearch:false, aiApp:'claude'|'chatgpt'|'gemini', repoOverride:null, setupDone:false }`.

## Screens (`core/app.js`) and test ids

Hash routes: `#/setup`, `#/home`, `#/tool/<id>`, `#/add`, `#/settings`. If
`hub.settings.setupDone` isn't true, the app starts at `#/setup`.

**Setup** `[data-testid=screen-setup]`, three steps, one visible at a time:

1. **Name:** `setup-name`, `setup-next`.
2. **Brain:** `brain-skip`, `brain-url`, `brain-key`, `brain-email`,
   `brain-password`, `brain-connect`. Status messages go in `brain-status`;
   a refusal shows `brain-refused` with a link to Express `UPGRADE.md`.
   - Order: `openCheck`, then `signIn` only if the result is `locked`.
   - The password field is cleared after the attempt.
3. **AI mode:** `ai-mode-auto`, `ai-mode-manual`.
   - **Auto:** `or-key`, then `or-limit-reminder` (always visible in auto,
     text includes "spending limit"), `or-load-models`, `model-select`
     (multiple; the order picked = fallback order), and `paid-search`
     (checkbox, off).
   - **Manual:** `ai-app-claude`, `ai-app-chatgpt`, `ai-app-gemini`.
   - Then `setup-finish`.

**Home** `[data-testid=screen-home]`:

- `home-name`: the greeting.
- `brain-badge`: text `Brain connected` or `No brain`.
- `profile-snapshot`: only with a brain.
- `recent-list`: items are `recent-item`, each with `archive-btn`.
- `stats`: runs and saves counted locally in `hub.settings.stats`.
- `tool-tile` × N: each has `data-tool-id`.
- `refresh-tools`, `nav-add`, `nav-settings`.
- `no-brain-nudge`: shown when there's no brain.

**Tool runner** `[data-testid=screen-tool]`:

- **Form:**
  - Each input renders a field `field-<input id>`: an `<input>`,
    `<textarea>`, `<select>` or number field depending on `type`.
  - `run-btn`. Required fields block the run, with `form-error`.
- **Web search decision** (`webSearchLine` / `webSearch` flag):
  - **auto + paidSearch on:** required or helpful → `run(webSearch:true)`, no
    line.
  - **auto + paidSearch off + required:** show `websearch-warning`, with
    `switch-to-manual` and `run-anyway`.
  - **auto + paidSearch off + helpful:** run without search, then label the
    result `no-websearch-label`.
  - **manual:** required or helpful → `WEB_SEARCH_LINE` added to the prompt.
  - **none:** nothing.
- **Auto:** `run-status` while running; on error, `run-error`, which offers
  `switch-to-manual`.
- **Manual:**
  - `prompt-box`: a read-only textarea holding the full prompt.
  - `copy-prompt` (uses `navigator.clipboard.writeText`; falls back to
    selecting the text).
  - `open-ai-app`: an `<a target=_blank rel=noopener>` to
    `https://claude.ai/new`, `https://chatgpt.com/` or
    `https://gemini.google.com/app`.
  - `answer-box`, `paste-answer` (`navigator.clipboard.readText`; on failure,
    `paste-help` tells the student to long-press), and `use-answer`.
- **Result:**
  - `result`: the answer rendered with marked + DOMPurify; links get
    `target=_blank rel="noopener noreferrer"`.
  - `missing-sections`: listed when not empty. `no-sources-warning`: shown
    when there are zero sources.
  - `save-btn`: only with a brain, and only if the recipe has
    `save_to_brain`. It opens `save-panel` with `save-summary` (editable,
    prefilled), `save-tags` (comma list, prefilled) and `save-confirm`. The
    result appears in `save-status`.
  - `download-btn`: always shown.
  - `no-brain-nudge`: when there's no brain.
- **In-progress state** (inputs, prompt, answer) is kept in
  `hub.runs.<toolId>` and restored on return. `clear-run` resets it.

**Add tool** `[data-testid=screen-add]`:

- `recipe-paste`, `recipe-check`.
- On errors, `recipe-errors` (one `li` per error).
- On success, `install-summary` with:
  - `summary-permissions` (one `li` each);
  - `summary-query`;
  - `summary-websearch`;
  - `summary-warning` (only when there are warnings).
- `install-btn` adds the recipe to `hub.localTools`, then shows
  `installed-notice`, which includes `download-recipe` and the text "plugins/".

**Settings** `[data-testid=screen-settings]`:

- `settings-brain-status`, `settings-signout`, `settings-reconnect` (goes to
  setup step 2).
- `settings-ai-mode` (auto/manual select), `settings-paid-search`,
  `settings-models`.
- `settings-repo-override` (`owner/repo`).
- `settings-export`: downloads `brain-hub-settings.json` with every key
  except `hub.openrouterKey` and `hub.session`.
- `settings-reset`: clears all `hub.*` keys after a confirm.

**PWA:**

- `manifest.json`: `start_url "./"`, `scope "./"`, `display standalone`, and
  192/512 PNG icons.
- `sw.js`:
  - Caches the app shell: index, core css/js/lib/vendor, manifest, icons.
  - The shell is served network-first, falling back to the cache.
  - Never caches requests to other origins, or to `plugins/` or
    `core/tools/`.
- Registered from `index.html` with a relative path.

## Starter dummy recipe (`core/tools/hello-hub.recipe.md`)

| Field | Value |
|---|---|
| `id` | `hello-hub` |
| `permissions` | `[search_brain, save_to_brain, run_ai]` |
| `web_search` | `helpful` |
| `inputs` | `topic` (text, required); `depth` (choose_one: Quick, Thorough, required) |
| `brain_context` | query `"{{topic}}"`, limit 3 |
| `output.sections` | `[Key points, Next steps]` |
| `save` | type `work_product`, tags `[hello-hub, "{{topic}}"]` |

## Database proof (`tests/db`)

Using PGlite with the pgvector extension, and the fixture copy of Express's
`migration.sql`:

- **Stubs:** schema `auth`, `auth.users(id uuid primary key, email text)`,
  `auth.uid()` reading `current_setting('request.jwt.claim.sub', true)::uuid`,
  and roles `anon` and `authenticated`. Stub only what the migration
  references. Anything it touches that can't be stubbed (for example
  `pg_net`) is skipped by editing a copy in the test, never the fixture, and
  the test records what was skipped.
- **Then the open-database check, both ways:**
  - **Locked:** after the migration, as `SET ROLE anon`, run
    `INSERT INTO thoughts (content) VALUES (NULL)` and get SQLSTATE `42501`.
    The table has 0 rows before and after, with the table empty AND with one
    seeded row.
  - **Open (June cohort):** add
    `create policy temporary_open_access on thoughts for all to anon using (true) with check (true)`
    and grant the privileges. The same insert gets SQLSTATE `23502`, and the
    row count is unchanged, again empty AND seeded.
  - **Dedup trigger:** it doesn't raise on null content (proved by the open
    case reaching `23502`).
- **Save upsert:** as `authenticated` with a sub claim, inserting the same
  content twice with `ON CONFLICT (dedup_key, user_id) DO UPDATE` leaves one
  row, and `metadata` survives.

## Out of scope for Phase 2

Company analysis (Phase 3), Checker (Phase 5), connector (Phase 6), Spanish
UI.
