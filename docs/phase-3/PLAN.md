# Phase 3 — Company Analysis: El Código's Build Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `phase-3-company-analysis`
Paul was away for this phase. Calls made on his behalf are recorded in
`docs/DECISIONS.md` (#9 onward).

## Done when (spec §13, as amended by DECISIONS #7)

1. **A real company runs end to end.** Deere & Company is analysed through the
   hub in Manual mode. The "AI app" is an independent research agent with
   live web search, answering exactly the prompt the hub built.
2. **Every claim has a source.** The hub's source check finds 0 unsourced
   claims in that real answer, every required section is present, and a
   source audit confirms a sample of the cited pages exist and support their
   claims.
3. **Results save to the brain and are found again.** This is proven against
   the **local stand-in brain**, never Paul's real brain. The saved analysis:
   - appears in Home's recent list;
   - is returned by the brain's own search for "Deere";
   - is pulled into the prompt the next time the tool runs for Deere.
4. **Automated tests** prove all of this at laptop size and in iPhone and
   Android emulation, and Nitpick signs off.

**Unverified, and marked as such for Paul:** a real save, search and
re-find against a real student Express brain on Supabase.

## Deliverables

### 1. `core/tools/company-analysis.recipe.md` (core starter tool #1)

| Field | Value |
|---|---|
| `permissions` | `[search_brain, save_to_brain, run_ai]` |
| `web_search` | `required` |

- **Inputs:**
  - `company` (text, required);
  - `focus_unit` (text, optional: the business unit for the environmental
    scan; blank means the largest);
  - `purpose` (choose_one, required).
- **`brain_context`:** query `"{{company}}"`, limit 5.
- **Sections, in order:** Company snapshot, Business units, Industries and
  main competitors, Environmental scan, Research summary, Suggested further
  research, Limits of this analysis (+ the hub's Summary).
- **Environmental scan** is a PESTLE scan of the chosen business unit. That
  matches Paul's course framework.
- **Competitors:** two to four per industry, each with one strength and one
  weakness.
- **Private companies:** private or subsidiary status must be stated under
  Limits, with estimates marked `[unverified]`.
- **Further research** items are phrased as questions, so the source check
  doesn't count them as claims.
- Listed in `core/tools/index.json` after `hello-hub`.

### 2. Source check — `checkSources(markdown)` in `core/lib/output.js`

```js
checkSources(markdown) → { claims, sourced, unverified, unsourced: [{ section, text }] }
```

- **Claims** are each list item (`-`, `*`, `+`, `1.` or `1)`), each table body
  row, and each paragraph, inside any `##` section **except Summary**. Text
  before the first `##` is ignored.
- **Not claims:**
  - items whose text, with `*_\`` stripped, ends in `?` or `:`;
  - table header and separator rows;
  - anything inside a fenced code block;
  - headings at any level.
- **Sorting:** a claim containing an `http(s)://` URL is **sourced**. Without
  one, a claim containing `[unverified]` (any case) is **unverified**.
  Otherwise it's **unsourced**.
- **UI:** the result card shows `source-check`:
  - **ok:** "All N factual claims have a source or are marked [unverified]."
  - **warn:** "K of N claims have no source…", plus `unsourced-list` (one
    `li` per claim, `<section>: <text>`, cut to 160 characters).
  - Nothing is shown when N = 0. The existing `no-sources-warning` stays.
- **Save:** `buildSaveRow` takes an optional
  `sourceCheck: { claims, sourced, unverified, unsourced: <count> }`, stored
  as `metadata.hub.source_check`.

### 3. Stand-in brain — `tests/standin/brain-standin.mjs`

- **What it is:** the real Express migration in PGlite, with the same
  stubs Nitpick validated in `tests/db/pglite-brain.mjs`.
- **How it's served:** through Playwright routes at
  `https://standin-brain.supabase.co` (publishable key
  `sb_publishable_standin`, user `student@example.com` / `standin-password`).
- **Endpoints:** exactly the hub's wire formats from Phase 2 PLAN:
  - `auth/v1/token` (password and refresh grants) and `logout`;
  - the anonymous open-check insert, run as `anon`;
  - upsert, select and patch on `thoughts`, run as `authenticated` with the
    user id as the JWT subject, so the real RLS applies;
  - `functions/v1/search-brain`, which calls the real
    `search_thoughts_hybrid(user, query, NULL, 0.3, limit)`.
    - With a NULL embedding this is keyword-only, as Express is when its
      embedding call fails.
- Handlers run one at a time, because PGlite has one connection.
- **Not reproduced:** the Supabase gateway, real JWTs, CORS, embeddings, and
  the `enrich-thought` webhook.

### 4. The real run — `tests/fixtures/real-run/deere/`

- **`inputs.json`:**
  `{ company: "Deere & Company (NYSE: DE)", focus_unit: "Construction & Forestry", purpose: "Class assignment" }`.
- **`prompt.md`:** the exact Manual-mode prompt the hub builds for those
  inputs with no brain notes. It has the web-search line because
  `web_search: required`. Generated with `buildPrompt`, it must equal what
  `prompt-box` shows.
- **`answer.md`:** the research agent's answer. The agent gets only
  `prompt.md`, as a student would paste it, and uses live web search and
  fetch. It never sees the hub's code or tests.
- **`run-notes.md`:** the agent's model, date, searches made, and anything it
  couldn't verify.

### 5. Source audit — `docs/phase-3/SOURCE-AUDIT.md`

A one-off, real-network check, done by Nitpick or an agent Nitpick
directs, outside the test suite:
- every cited URL is fetched once and its status recorded;
- at least 12 claims are spot-checked against their cited page (supported,
  partly supported, or not supported).

**Pass bar:** at least 90% of URLs resolve, and no spot-checked claim is "not
supported" without a fix to the answer being recorded.

### 2a. Source-check revision after the first real run (2026-10-03, before any Phase 3 test ran)

The first real Deere answer (kept as `tests/fixtures/real-run/deere/run-1/`)
scored 76 claims: 45 sourced, 2 unverified, 29 unsourced. Most of the 29 were
the checker's fault, so the rules change.

- **Labels aren't claims.** If an item or paragraph is entirely emphasis
  (`**Caterpillar**`, `**1. Construction equipment**`, `*Political*`), it's a
  label.
- **`[unverified …]` with extra words counts as unverified.** The pattern is
  `/\[unverified\b[^\]]*\]/i`, so `[unverified – not checked]` counts.
- **List items are blocks.** Indented non-list lines after a list item belong
  to that item, not to a new paragraph. A nested list item without its own
  link is **sourced by inheritance** when its top-level item's block has one.
  The block is the item text plus its continuation lines, not its siblings.
- **Notes aren't claims.** Statements about the analysis itself start with
  `Note:` (case-insensitive, after list markers and emphasis). That covers
  method, own arithmetic, and what couldn't be verified. The hub's standard
  block now tells every AI: *"Statements about your own method or about what
  you could not verify are not factual claims: start them with "Note:"."*
  WIDGET-GUIDE §8 lists this as the hub's fourth standard rule.
- **What run 1 showed:** the checker caught real gaps that the prompt
  allowed: method statements, and a product list under a lead-in line. The
  fix is the Note rule and inheritance, not looser checking.
- **Run 2:** a fresh research agent answers the revised prompt. Done-when #2
  applies to run 2.
- **Run 1 stays as evidence:** it's a regression fixture that shows the
  revised checker still flags its method statements, which run 1 didn't
  mark with `Note:`.

### 2b. Amendments after Nitpick's Phase 3 test pass (2026-10-03)

- **D1:** `~~~` fences count as code fences, the same as ```` ``` ````.
- **D2:** horizontal rules (`---`, `***`, `___`) are neither claims nor
  continuation lines.
- **D3:** Summary headings are recognised the same way by `parseOutput` and
  `checkSources` (`isSummaryHeading`, the same normalisation), so
  `## **Summary**` and `## Summary:` both count.
- **A1:** a label is wholly emphasised, at most 15 words, and doesn't end in
  `.`, `!` or `?`. A wholly bold sentence is a claim.
- **A2:** a non-list line straight after a list item, with no blank line
  between, continues that item (lazy continuation).
- **A3:** an item's own marks win. Its own link means sourced; otherwise its
  own `[unverified]` means unverified; only then is a source inherited from
  the parent.
- **A4:** see DECISIONS #13. The saved `content` is the summary plus a context
  line, so the next run's brain query (built from the same inputs) finds it
  with keyword-only search.
- **A5:** see DECISIONS #14.
- **A6:** the paragraph reading is confirmed.
- **A7:** Nitpick's extra bars for the real answer are accepted.

## Tests Nitpick writes (Phase 3)

- **Unit:**
  - `checkSources` rules, including every exclusion and a real-answer
    fixture with 0 unsourced claims;
  - `buildSaveRow` with `sourceCheck`;
  - the company-analysis recipe parses, has the inputs, sections and
    permissions above, and its prompt for `inputs.json` equals `prompt.md`
    byte for byte.
- **E2E, all three projects, against the stand-in:**
  - **Setup:** connect to the stand-in (the open check passes, from the real
    RLS).
  - **Run** company-analysis in Manual mode with the Deere inputs:
    `prompt-box` equals `prompt.md`; paste `answer.md` → result rendered,
    no `missing-sections`, and `source-check` ok with 0 unsourced.
  - **Save:** the stand-in has one `brain-hub` row whose `metadata.hub` has
    the tool, version, tags (including the company), report, sources and a
    `source_check` with 0 unsourced.
  - **Found again (1):** Home's `recent-list` shows it.
  - **Found again (2):** stand-in search for "Deere" returns it.
  - **Found again (3):** running company-analysis again for Deere puts the
    saved summary into `prompt-box` under "What I already have in my notes".
  - **Saving twice:** identical summary text leaves one row, from the real
    unique index.
  - **Weak answer:** a deliberately unsourced answer shows `source-check`
    warn and lists the claims.
- **Network:** no real network in any test. The stand-in is the only brain.

## Out of scope

The Checker specialist that grades claims against sources (Phase 5);
OpenRouter runs with a real key; any write to Paul's real brain.
