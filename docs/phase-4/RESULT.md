# Phase 4 — Result of the Widget Guide Proof

## Attempt 1 (the only attempt) — 2026-10-03

| | |
|---|---|
| **Builder** | Claude **Sonnet** agent. All other project agents ran on Opus. |
| **What it saw** | `WIDGET-GUIDE.md` only, plus the student's request. No code, no examples, no web, one attempt. |
| **Request** | Job and interview prep: paste a job posting; get resume contents, weakness defenses, questions to prepare, and questions to ask. |
| **Output** | `job-interview-prep.recipe.md`, copied byte for byte to `tests/fixtures/phase-4/` |
| **SHA-256** | `355bc6b0248fc350638b254859d006f94a083f82d208917f0c17b5c9423adbc4` (agent's file and fixture identical) |
| **Hand-fixing** | **None** |
| **Hub validator** | **Passed first time**, 0 errors |

**Install summary, as the hub generated it from the agent's recipe:**
- Permissions: search_brain, save_to_brain and run_ai, with exact texts.
- Brain query: "resume background skills experience".
- Web search: "Needs web search".
- Privacy warning: shown, which is correct for search_brain together with run_ai.

**Prompt:**
- Built from the fictional Northwind posting plus stated weaknesses.
- 2,906 characters, with 0 unfilled placeholders.
- Saved as `tests/fixtures/phase-4/prompt.md`.

**Answer:**
- Written by a separate **Haiku** agent acting as the student's AI app.
- It saw only `prompt.md`, and it's saved as `answer.md`.

Browser-test results and Nitpick's verdict follow below once they're in.

## Findings about the guide (for Paul)

1. **The brain query can be too narrow without embeddings.**
   - **What happened:** the agent wrote a fixed four-word query, following
     the guide's "2–6 words". On a brain whose search is keyword-only (no
     AI key, or embeddings failing), every word must appear in one note, so
     it will rarely match.
   - **Proposed guide change:** recommend 1–3 distinctive words, or input
     placeholders, and explain why. Recorded in DECISIONS #16.
2. **The sourcing rule doesn't fit advice tools.**
   - **The score:** the job-prep answer (Haiku) scored **50 claims: 9
     sourced, 0 unverified, 41 unsourced**, with 6 distinct sources. It
     hasn't skipped its sources: most of the answer is coaching
     ("Lead with the metric…", "Say this…"), which no web page can support.
   - **What the hub did:** flagged every unsourced line to the student,
     which is correct but noisy.
   - **Proposed:** an optional recipe field such as `sourcing: advice`, so
     the hub counts only factual statements, or relaxes the rule, for
     coaching tools. That's a recipe-format change, so it's for Paul (see
     DECISIONS #17).
3. **The AI invented the student's accomplishments.**
   - **What happened:** the answer told Maria to lead with "event attendance
     up 40%, member satisfaction 4.5/5". Those figures appear nowhere in her
     inputs; the model made them up.
   - **It misreported its own work:** the agent then said "all factual
     claims sourced", which was false. The hub's count caught it.
   - **Why it matters:** for any resume or profile tool, invented
     achievements are a real-world hazard; a student could copy them into a
     real resume.
   - **Proposed:** the guide should tell recipe writers to instruct the AI
     never to invent the user's experience, and to use visible placeholders
     such as `[your number]` instead. The hub could also add that line to its
     standard block. See DECISIONS #17.
