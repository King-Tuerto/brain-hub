# Brain Hub — Phase 1 Decisions

Answers to the open questions in `SPEC-v1.0.md` section 15, plus the spec
changes they forced. Where this file and the spec disagree, this file wins.

Status key: **DECIDED** (Paul chose) · **DEFAULT** (proposed, proceeding unless
Paul objects) · **DEFERRED** (on purpose, with the phase it's due).

---

## Q1. Repo name and location — DECIDED

`King-Tuerto/brain-hub`, **public**. Students can't fork a private repo unless
they're added as collaborators. Because every fork is public, no key or
password may ever be written to a file in this repo.

## Q2. Can Express store full documents? — DEFAULT: yes, no upgrade needed

What Express already has (checked against `open-brain-express` main,
2026-10-03):

- `thoughts.content` is the searchable text. On insert, a database webhook runs
  `enrich-thought`, which embeds it and **overwrites `tags`, `category` and
  `summary`** with its own AI-picked values.
- `thoughts.metadata` (jsonb) is **not** touched by enrichment, and the browser
  may write it under row-level security.
- `thought_sources` holds full source text, but it has no browser policy. Only
  edge functions can write it.

**Decision:** the hub saves one thought per report:

| Field | Value |
|---|---|
| `content` | the short summary (this is what search finds) |
| `source` | `'brain-hub'` |
| `metadata.hub` | `{ tool, tool_version, type, tags, report, sources, saved_at, archived }` |

`report` holds the full markdown. Tags and type live in `metadata.hub`, not in
the `tags`/`category` columns, because enrichment would overwrite those.

**Why:** it works on every upgraded Express brain today, with nothing for
students to deploy.

**Known limit:** search finds the summary, not words buried deep in the
report. If that turns out to matter, a later `save-report` edge function can
write the report to `thought_sources`, where Express already chunks and
searches it. That change can be added without moving old data.

## Q3. Hub login — DEFAULT: use the brain's own login

Express brains already use Supabase email + password with row-level security,
and the publishable key is safe to expose. The hub signs in exactly the same
way, so:

- **Setup asks for:** brain URL, publishable key, email, password. The
  password goes to Supabase and is never stored by the hub; Supabase keeps a
  session token in the browser.
- **No secret key ever enters the hub.** This replaces the spec's "brain key":
  there is no secret brain key for students to paste.
- **Without a brain:** no login at all. The hub works in download-only mode.

**Open-database check (spec §5):** the hub runs this before sign-in, using
only the publishable key.

- **The weak version can be fooled.** The first draft read `thoughts` and
  treated "rows came back" as open. **An open brain that happens to be empty
  returns no rows, exactly like a locked one**, so that check passes a brain
  it should refuse. A new student's brain is the likeliest to be empty, so
  this isn't an edge case.
- **The stronger check is a deliberately invalid write.** The hub sends a
  not-signed-in insert of one row with `content` set to null:
  - A **locked** brain refuses at the security policy: error `42501`.
  - An **open** brain gets past the policy, then fails the not-null rule on
    `content`: error `23502`.
  - **Nothing is written in either case.** Postgres checks the security
    policy before not-null constraints, so the order is guaranteed. It costs
    one request.
- **Only `42501` counts as safe.** Any other answer (`23502`, a missing
  column, a missing table, a network error) means the hub refuses to connect
  and links to Express's `UPGRADE.md`.
- **A brain that predates Express fails too.** If the `search-brain` function
  is missing, the hub shows the same message.
- **Not yet proven.** The policy-before-constraint ordering, and the dedup
  trigger staying harmless on a null `content`, must be tested in Phase 2
  against a local throwaway Postgres loaded with Express's `migration.sql`,
  once locked and once with the June-cohort open policy. Until that test
  passes, treat this check as unverified.

## Q4. Where student-added recipes live — DEFAULT: GitHub is the source of truth

- Recipes are files in the student's fork, under `plugins/`. Starter tools
  live in `core/tools/`, which students never edit.
- **Add tool screen:** paste a recipe → read the summary → Install. The tool
  runs immediately from browser storage, marked "not saved to your repo yet."
  The hub then offers to download the file and gives one-line instructions for
  putting it in `plugins/`.
- **Students never edit a list of their tools.** The hub finds them itself.
  It reads the fork's `plugins/` folder through the public GitHub API
  (`GET /repos/<owner>/<repo>/contents/plugins`) and loads every
  `*.recipe.md` from the `download_url` the API returns.
  - **Where owner and repo come from:** the Pages address
    (`<owner>.github.io/<repo>`). Settings lets the student override them for
    custom domains or local runs.
  - **Rate limits:** unauthenticated calls allow 60 an hour per network. The
    hub caches the listing in the browser and refreshes it at most once every
    10 minutes, or when the student taps Refresh.
  - **Raw file links, not Pages links:** a just-committed file shows up
    before Pages finishes rebuilding.
  - **Fallback:** if the API fails (rate-limited, offline, private fork, not
    on GitHub), the hub reads `plugins/plugins.json`. That file is optional.
    Students who never touch it lose nothing except the fallback.
- The brain stores **results**, not recipes.

**Why:** it keeps the spec's single-source rule (the Phase 6 connector reads
the same file from GitHub), it's versioned, and `plugins/` is student-only
territory, so "Sync fork" never conflicts.

## Q5. Which Claude/ChatGPT plans allow custom connectors — DEFERRED to Phase 6

This changes often, so checking now would just go stale. Check it at the
start of Phase 6, against live vendor docs.

## Q6. Student profile structure — DEFAULT: tagged thoughts, no new table

A profile entry is an ordinary hub save with `metadata.hub.type = 'profile'`
and one sub-tag: `skills`, `experience`, `job-history`, `education`, or
`goals`. The dashboard's profile snapshot is the newest entry of each sub-tag.

**Why:** it works on any brain without an upgrade, and students can still
write profile facts freely through Telegram or the Express app.

---

## Hub functions — exact behavior (spec §9)

| Function | Does | Needs |
|---|---|---|
| `search_brain(query, limit)` | POSTs to the brain's `search-brain` edge function with the student's session. | Brain connected and signed in. |
| `save_to_brain(summary, report, sources, type, tags)` | Upserts one row into `thoughts`, laid out as in Q2. Enrichment and embedding run on their own. | Brain connected and signed in. |
| `build_prompt(recipe, inputs, brain_context)` | Fills the template and appends the standard output block. Pure text, with no network call. | Nothing. |
| `run_ai(prompt, model, web_search)` | Calls OpenRouter with the student's key and the model they picked. Turns on OpenRouter web search only when the recipe wants it and the student has allowed paid search. On a rate-limit or model error, it offers the next model they've chosen, or Manual mode. | Automatic mode and a key. |

Recipes name these functions in `permissions`, but they never call them
directly. The hub calls them on the recipe's behalf.

## Spec changes these force

1. **§5 Credentials:** "brain key" becomes brain URL + publishable key + the
   brain's own email/password sign-in. The OpenRouter key is still stored in
   the browser only.
2. **§10 Archiving:** Express has no archive column. v1 sets
   `metadata.hub.archived = true`. The hub hides archived items, but brain
   search still finds them. That's honest, cheap and reversible; real
   archiving would mean a brain upgrade.
3. **§8 Output rules:** the hub, not each recipe, adds the standard rules to
   every prompt: sources on every factual claim, plus a closing `## Summary`.
   The hub saves that summary, so saving never needs a second AI call. See
   `WIDGET-GUIDE.md`.
4. **Repo layout:** `core/` (Paul's) and `plugins/` (the student's). The hub
   finds tools by listing `plugins/` (Q4). `plugins/plugins.json` is only an
   optional fallback; it ships once and core updates never change it.
5. **Web search (Paul, at approval):** every recipe declares
   `web_search: required | helpful | none`. Paid search in Automatic mode is
   off until the student turns it on. When a `required` tool meets Automatic
   mode with paid search off, the hub warns and steers the student to Manual
   mode. Full rules in `WIDGET-GUIDE.md` §6a.
6. **Install summary (Paul, at approval):** shows the exact `brain_context`
   query, the `web_search` setting, and a plain-English warning whenever a
   recipe combines `search_brain` with `run_ai`: in Automatic mode, brain
   notes go to OpenRouter and the model's provider. `WIDGET-GUIDE.md` §6.

7. **Testing and sign-off (Paul, October 3, after Phase 1):** Paul does no
   hands-on checks. In every phase, his check is replaced by **automated
   browser tests run by Claude**, at laptop size and in phone emulation
   (iPhone on WebKit, Android on Chromium). **Nitpick signs off on those
   test results.** Real-phone testing moves to the Phase 7 student pilot.
   Anything emulation can't prove goes on `docs/PILOT-CHECKLIST.md`. PRs
   still wait for Paul's merge approval.

8. **Brain address must be `*.supabase.co`** (El Código, Phase 2, made while
   Paul was away). Every Express brain lives there, and refusing everything
   else stops a student's password reaching a look-alike server.
   - **Cost:** a brain on a custom Supabase domain is refused (Nitpick L10).
   - **Revisit if** a student has a custom domain. It means changing the
     check in `brain.js` and the CSP in `index.html`.

---

**Phase 1 closed October 3, 2026.** Paul approved these decisions and
`WIDGET-GUIDE.md`, with changes 5 and 6 above and the Q3 and Q4 revisions
made at approval.
