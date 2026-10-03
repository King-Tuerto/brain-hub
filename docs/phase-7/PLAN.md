# Phase 7 prep — Student Guide: El Código's Plan

**Author:** El Código · **Date:** 2026-10-03 · **Branch:** `phase-7-pilot-prep`
Paul's instruction: prepare Phase 7 so it's ready to hand out. That means a
short student guide in English and Spanish, matching the Express style and
phone-first, covering fork, Pages on, setup and the first company analysis.
Claude runs it end to end as a new student on a fresh copy, then merges when
Nitpick signs off. Phase 6 is deferred (DECISIONS #20).

## Deliverables

1. **`START-HERE.md` and `EMPIEZA-AQUI.md`**, linked from the top of
   `README.md`. Six steps:
   1. make your copy (fork);
   2. turn on Pages;
   3. put it on your phone;
   4. set up;
   5. first company analysis (including the optional Check and Save or
      Download);
   6. get updates (Sync fork).

   Plus "make your own tools" and a symptom-first troubleshooting table.
   - **Style:** as Express. Time estimates, "ask your AI, not the person who
     sent you this", one action per line, no jargon.
   - **Spanish:** every app button and message is quoted **exactly as on
     screen, in English** (the app is English-only), with a Spanish gloss
     the first time.
2. **Parity by content, not by counting markers.** This was a lesson from
   Express. The EN and ES guides have the same links and code values in the
   same order, the same number of sections and the same troubleshooting
   rows.
3. **Labels match the app.** Every button and message the guides tell a
   student to tap or look for exists, verbatim, in `core/app.js`.
4. **`tests/pilot/guide-run.mjs`:** a script that runs Steps 3–5 on a
   **real published copy** in a phone browser. It finds buttons by the
   guide's words, not by test ids. It keeps a persistent phone profile
   across stages (the student leaves for the AI app and comes back).
   Optionally it uses the local stand-in brain to prove Save and re-find.

## The end-to-end run (`docs/phase-7/RUN-LOG.md`)

1. **Fresh copy.** GitHub forbids an account forking its own repo, so
   `King-Tuerto/brain-hub-pilot-test` was created as a fresh public copy of
   this branch, with Pages **off**: the state a fresh fork starts in.
   - The Fork button and Sync fork go on PILOT-CHECKLIST.
2. **Step 2, exactly as written:** "Deploy from a branch", main, `/`
   (root). Record the time until the site is live, and run
   `npm run test:live` against it.
3. **Steps 3–5 on iPhone (WebKit), no brain:**
   - setup with Skip and Manual (Claude);
   - Company Analysis for **Costco Wholesale (NASDAQ: COST)**, so it's a
     different company from the Deere fixtures and nothing is replayed;
   - **Run**: the prompt is handed to an independent research agent with
     live web search, acting as the AI app, and its answer is pasted back;
   - the source check is read;
   - **Check this answer**: the check prompt goes to an independent web
     fact-checker, and its table is pasted back, giving the score and
     fixes;
   - **Download**.
4. **Steps 3–5 on Android (Chromium), with the stand-in brain:**
   - connect (the open check passes against the real RLS);
   - Manual (ChatGPT), the same company and the same real answer;
   - **Save to brain**;
   - **found again** on Home and by brain search.
5. **Pass bar:**
   - every guide step can be done with the guide's own words;
   - no page errors except the open-check probe's expected 401;
   - the real answer shows every section, with the source check ≥95%
     (DECISIONS #15);
   - the Checker produces a complete score;
   - the download is named `company-analysis-YYYY-MM-DD.md`;
   - the save is found again.

   Anything a guide got wrong is fixed in the guide, then re-run.

## Run findings so far (recorded honestly)

- **The live-site Jekyll bug** (DECISIONS #19) was found while preparing
  this, and it's fixed on main.
- **"Refused to apply a stylesheet" on iPhone** came from Playwright's
  screenshot injecting a `<style>`. The hub's CSP is correctly refusing it,
  so it's not an app error, and the run script ignores it during its own
  screenshots only.
- **Three first-run problems were the script's, not the app's:**
  - a loose button match ("ChatGPT" also appears in the Manual button's
    description);
  - reading "Copied." too early;
  - the stand-in forgetting sessions between stages and using the suite's
    fixed clock.

  All three are fixed in the script.

## Nitpick's part

- Review both guides against the live app and each other.
- Do an **independent run following the Spanish guide** on the fresh copy.
- Add tests:
  - parity (links and code values in order, section and row counts);
  - every quoted UI label exists in `core/app.js`;
  - both guides are linked from `README.md`;
  - nothing in the guides points at a path that doesn't exist in the repo.
- Write `docs/phase-7/NITPICK-SIGNOFF.md`. Then Claude merges, runs
  `npm run test:live`, and saves the brain summary.
