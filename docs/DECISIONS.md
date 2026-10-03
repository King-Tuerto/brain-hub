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

**Open-database check (spec §5):** before sign-in, the hub reads `thoughts`
with only the publishable key. If any row comes back, the brain is still
open, so the hub refuses to connect and links the student to Express's
`UPGRADE.md`. If the `search-brain` function is missing, the brain predates
Express, and the hub shows the same message.

## Q4. Where student-added recipes live — DEFAULT: GitHub is the source of truth

- Recipes are files in the student's fork, under `plugins/`. Starter tools
  live in `core/tools/`, which students never edit.
- **Add tool screen:** paste a recipe → read the summary → Install. The tool
  runs immediately from browser storage, marked "not saved to your repo yet."
  The hub then offers to download the file and gives one-line instructions for
  putting it in `plugins/`.
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
| `run_ai(prompt, model)` | Calls OpenRouter with the student's key and the model they picked. On a rate-limit or model error, it offers the next model they've chosen, or Manual mode. | Automatic mode and a key. |

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
4. **Repo layout:** `core/` (Paul's) and `plugins/` (the student's).
   `plugins/plugins.json` ships once and is never changed by core updates
   after that.
