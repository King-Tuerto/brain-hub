# Phase 4 — Prove the Widget Guide: El Código's Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `phase-4-guide-proof`
(built on the Phase 3 branch, whose PR #3 is awaiting Paul's merge). Paul was
away; calls made for him are in `docs/DECISIONS.md` #16 onward.

## Done when (spec §13)

A different AI builds a second tool from `WIDGET-GUIDE.md` alone, and it
**installs and works with no hand-fixing**. Proved by automated tests
(laptop, iPhone and Android emulation) and Nitpick's sign-off.

## Method

1. **The builder:**
   - **Model:** a **Sonnet** agent. Every other agent in this project ran
     on Opus, so this is a different model.
   - **What it sees:** only `WIDGET-GUIDE.md`, plus the spec's request for
     starter tool #2, word for word: job and interview prep — paste a job
     posting; get what a strong resume should include, how to defend known
     weaknesses, questions to prepare for, and smart questions to ask.
   - **What it doesn't see:** no repo code, no examples, no web, and only
     one attempt.
2. **No hand-fixing.** The agent's file is copied **byte for byte** to
   `tests/fixtures/phase-4/`. Its SHA-256 is recorded in
   `docs/phase-4/RESULT.md`, and a test checks the fixture still matches that
   hash.
3. **Install like a student, two ways:**
   - **Paste:** into Add tool. There must be no `recipe-errors`; the
     install summary shows the agent's permissions, query, web search and
     warning; Install puts a tile on Home.
   - **plugins/:** the file served through the fake GitHub listing of
     `plugins/`. Its tile appears with no manifest edit.
4. **Run it like a student:**
   - **Inputs:** fill them with the fictional posting in
     `tests/fixtures/phase-4/job-posting.md` (Northwind Analytics, a made-up
     company, so no real employer is misrepresented).
   - **Prompt:** run in Manual mode; `prompt-box` must contain the posting.
   - **Answer:** a second independent agent, acting as the student's AI app,
     answers that exact prompt. Its answer is `answer.md`, and it never sees
     the recipe or the hub.
   - **Result:** pasting the answer renders it with no `missing-sections`.
   - **Save:** with the stand-in brain connected, Save writes a row whose
     `metadata.hub.tool` is the agent's tool id.
5. **Reported, not graded:** the source-check score of the job-prep answer.
   Interview advice is mostly opinion, so the score tests the guide's
   one-size sourcing rule, and it goes on Paul's list rather than being a
   pass/fail bar.

## What counts as a failure of the guide

Any of these means the guide failed:
- a validation error;
- a missing or unrenderable section;
- a placeholder left unfilled in the prompt;
- a tool that installs but can't run;
- anything El Código had to change in the recipe.

The fix then goes into **the guide**, not the recipe. The test is repeated
with a fresh Sonnet agent, and every attempt is recorded in `RESULT.md`.
