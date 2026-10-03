# Starter tool 2 — Job & Interview Prep: El Código's Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `starter-job-prep`
Paul asked for the job-and-interview-prep tool from the Phase 4 test to become
a proper starter tool (spec §11, tool 2), through El Código → Nitpick, with
the "never invent facts" rule verified.

## The tool: `core/tools/job-interview-prep.recipe.md`

- **Based on** the Phase 4 rerun recipe, which a Sonnet agent built from
  guide v1.1, passed first time and invented nothing. The Phase 4 fixture
  itself stays untouched; this is a new core file.
- **`sourcing: advice`, `web_search: helpful`.** The posting is the main
  material; researching the employer helps.
- **Inputs:**
  - `company_name` (required);
  - `job_posting` (required);
  - **`my_background`** (optional, new): students without a brain can paste
    a few true lines about themselves, so the advice is personal without
    the AI guessing;
  - `weaknesses` (optional).
- **Brain query:** `{{company_name}}`. A single placeholder is the guide v1.1
  advice for keyword-only search. It finds the student's earlier work on the
  same employer. Their experience comes from `my_background`, or from their
  notes when the brain search returns them.
- **Sections:** Resume essentials, Handling your gaps, Questions to prepare
  for, Smart questions to ask, plus Summary.
- **The body:** says what to do when each optional input is blank, and repeats
  the hub-wide no-invention rule in the tool's own terms: "Use only the
  background above and my notes as facts about me … placeholders such as
  [your project] or [your result]".
- **Registered** as the third core tool in `core/tools/index.json`.

## Verifying "never invent facts" (real answers, not fixtures I wrote)

Two prompts are built by the hub from the fictional Northwind posting:

| Case | Inputs | Answered by | Pass bar |
|---|---|---|---|
| **A** | No background, no gaps | A fresh **Haiku** agent as the AI app | Uses placeholders where the student's details belong. No figure appears in a first-person or accomplishment sentence unless it's a placeholder. |
| **B** | A short, specific, true background (5 events, attendance 22 → 41, a sign-up tracker, a summer 2026 moving-company internship) and gaps (no SQL, never worked in software) | A fresh **Sonnet** agent | Every figure attached to the student also appears in her background. No new employers, titles, dates or numbers. The gaps are addressed honestly. |

- **The mechanical check:** Nitpick's invention check (Phase 5) runs on both,
  and a human-style read confirms its result.
- **If either answer invents a fact:** that's a finding against the tool. The
  wording is fixed and the case rerun with a fresh agent; it is never
  waved through.

## Tests (Nitpick)

- **Unit:**
  - the recipe parses, with the exact inputs, permissions, sourcing,
    web_search, query and sections;
  - every optional input has its blank-case instruction;
  - no personal name in the body;
  - `index.json` lists it;
  - both prompt fixtures equal what `buildPrompt` makes now, and contain
    `NO_INVENTION_RULE`;
  - the invention check passes on A and B, and fails on the v1.0 Phase 4
    answer (the control).
- **E2E (all three projects):**
  - the tile appears;
  - case B runs in Manual mode: `prompt-box` equals the fixture, and pasting
    the answer gives no missing sections;
  - advice-mode `source-check` is shown;
  - Save writes `metadata.hub.tool = 'job-interview-prep'` to the stand-in;
  - tests that counted two core tools are updated to three.
- **Live:** after merging, `npm run test:live` expects three tool tiles.
