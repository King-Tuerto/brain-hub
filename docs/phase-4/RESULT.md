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
2. **The sourcing rule doesn't fit opinion tools.** See the source-check
   result below once the answer is in.
