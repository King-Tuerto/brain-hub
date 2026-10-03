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

9. **Phase 3 test company: Deere & Company** (El Código, Paul away). It's
   public, with four reporting segments in different industries, which gives
   real material for the business-unit, competitor and PESTLE sections.
   Construction & Forestry was picked for the scan.
10. **The "AI app" in the real run is an independent research agent**
    (El Código, Paul away). Automatic mode needs Paul's OpenRouter key, which
    isn't to be used.
    - Manual mode is the free path most students will take: the hub builds
      the prompt, an AI with web search answers it, and the answer is pasted
      back.
    - The agent sees only the prompt, never the hub's code or tests.
11. **"Saved and found again" is proven on a local stand-in brain**
    (Paul's instruction).
    - **What it is:** Express's real migration in local Postgres (PGlite),
      behind the hub's exact HTTP calls.
    - **What that covers:** the real RLS, dedup and hybrid search, with
      keyword-only search because there are no embeddings.
    - **Still unverified:** the round trip against a real Supabase brain.
12. **Source check = a mechanical count, not a judgement** (El Código, Paul
    away).
    - **What it counts:** each list item, table row or paragraph outside
      Summary needs a link or `[unverified]`. Questions and lead-in lines
      ending in `:` aren't claims.
    - **What it doesn't do:** judge whether a source actually supports its
      claim. That's the Phase 5 Checker. Phase 3 does a one-off human-style
      spot audit instead (`docs/phase-3/SOURCE-AUDIT.md`).

13. **Saved `content` = summary + a context line** (El Código, Phase 3, Paul
    away). This changes Q2, where `content` was the summary only.
    - **The context line** is `<Tool name>: <input values>`: every non-long
      input of up to 120 characters, joined with ` · `, after a blank line.
    - **Why:** without embeddings (a brain whose AI key is missing, or the
      stand-in), search is keyword-only and needs every query word. The next
      run's brain query is built from the same inputs, e.g.
      "Deere & Company (NYSE: DE)". A summary that never repeats the ticker
      would never be found again (Nitpick A4).
    - **Side effects:** the student edits only the summary; the line is added
      at save. Two saves with the same summary for different inputs are now
      separate rows.
14. **Same summary + same inputs saved twice = one row, the latest report
    wins** (Nitpick A5). That's Express's dedup index doing its job; the
    earlier report is replaced, not kept.

15. **"Every claim has a source" means the hub guarantees it's checked and
    shown, not that every AI answer is perfect** (El Código, Phase 3, Paul
    away). **⚑ For Paul to confirm.**
    - **The real runs:** three independent real Deere runs scored 49/60, then
      52/53 (after the checker fixes), then 51/53 sourced.
    - **Run 3's two gaps:** two product-list bullets ("What it sells: …")
      whose source, the 10-K, sits on the next bullet. The hub's source
      check lists both lines to the student.
    - **Why not keep going:** re-running until an AI scores 53/53 would be
      luck, and letting a bullet inherit from its sibling would hide real
      gaps.
    - **The done-when bar is therefore:**
      - every unsourced claim in a real answer appears in `source-check`;
      - at least 95% of claims are sourced or marked `[unverified]`;
      - the source audit confirms that the cited pages exist and support
        their claims.
    - Run 3 (`deere/answer.md`) is the Phase 3 real-run fixture. Runs 1 and 2
      are regression fixtures.

16. **Proposed guide change (not made): brain-query advice** (El Código,
    Phase 4, Paul away). **⚑ For Paul.**
    - **The problem:** WIDGET-GUIDE §5 says queries should be 2–6 words. The
      Sonnet agent followed it with a fixed four-word query, "resume
      background skills experience". Without embeddings, search needs every
      word in one note, so that query will rarely find anything.
    - **The proposed change:** advise 1–3 distinctive words or an input
      placeholder, and say why.
    - **Why it isn't made yet:** changing the approved guide in the middle
      of the Phase 4 test would muddy what the test proved.

17. **Two proposed changes from Phase 4 (not made)** (El Código, Paul
    away). **⚑ For Paul.**
    - **(a) Optional `sourcing: advice`:** for coaching tools such as job
      prep. The job-prep answer was 41/50 "unsourced" because advice can't
      be cited.
    - **(b) A standard rule against inventing the user's facts:** add a line
      to the hub's standard block, and to the guide, such as *"Never invent
      facts about me (numbers, achievements, dates); use a placeholder like
      [your number]."* The Haiku answer invented a student's attendance and
      satisfaction figures.
    - **Recommendation:** (b) soon, because it's cheap and protects
      students. (a) after the pilot shows how often it matters.
    - **Nitpick's further guide weaknesses** (Phase 4 sign-off). None blocks
      sign-off; all are guide-text changes for Paul.
      - **(c) The prompt body is shared.** The Sonnet recipe says "I'm Maria
        Lopez", so everyone who installs it would claim to be Maria. The
        guide should say the body goes to every installer and must not
        contain the author's personal details.
      - **(d) No help choosing `web_search`.** `required` invites invented
        links when the AI app can't browse. The guide should explain when
        each value fits.
      - **(e) Optional inputs.** The guide should tell authors to say what
        the AI does with "(not provided)".
    - **If Paul approves (b)–(e) plus #16:** revise the guide, then rerun
      Phase 4 with a fresh Sonnet agent to prove the revised guide.

18. **Paul's answers on returning (October 3, 2026)** — DECIDED.
    - **PRs #3 and #4:** merge both. Done, in that order.
    - **#15:** accepted. The sourcing bar is ≥95% sourced or `[unverified]`,
      with every gap shown to the student.
    - **#16 and #17 (a)–(e):** all approved. "Never invent facts about me"
      becomes a **standard rule the hub appends to every prompt**, not just
      guide advice. Then the Phase 4 test is rerun with a fresh agent.
    - **#8 (Supabase-only addresses):** OK.
    - **The two accepted risks:** accepted (the open check may write one
      empty row on an old open brain; Express detection may not fire on real
      Supabase).
    - **#9–#14:** accepted.
    - **The stray Desktop folder:** Paul deleted it.
    - **PILOT-CHECKLIST:** gains "real Supabase brain save and re-find".
    - **Phase 5 (Checker):** build it through El Código → Nitpick. **Claude
      merges it when Nitpick signs off.** The guide revision and the Phase 4
      rerun ride on the same branch, so they ship with that merge.
    - **STOP before Phase 6.** It changes the brain connector (the MCP
      server in another repo), which the repo rule forbids. Claude writes up
      what Phase 6 would change in the other repos and waits.

---

**Phase 1 closed October 3, 2026.** Paul approved these decisions and
`WIDGET-GUIDE.md`, with changes 5 and 6 above and the Q3 and Q4 revisions
made at approval.
