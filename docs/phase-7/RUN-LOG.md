# Phase 7 — End-to-end run of the student guide

**Who:** El Código, acting as a new student · **Date:** 2026-10-03
**Guide:** `START-HERE.md` (final version, after Nitpick's G1–G10). Nitpick
ran `EMPIEZA-AQUI.md` independently; see `NITPICK-SIGNOFF.md`.
**Site:** `King-Tuerto/brain-hub-pilot-test`, a fresh public copy of this
branch, published at https://king-tuerto.github.io/brain-hub-pilot-test/.

## Step 1 — Make your own copy

- **Not done literally.** GitHub refuses to let an account fork its own repo:
  "A single user account cannot own both a parent and fork". Paul's account
  has no organisations.
- **Done instead:** a fresh public repo created from this branch, starting
  in the state a new fork starts in, with Pages **off**. Its address
  returned 404 before Step 2.
- **Still unproven:** the Fork button, and Sync fork in Step 6. Both are on
  `PILOT-CHECKLIST.md`, along with whether Actions being off on new forks
  blocks the first Pages build.

## Step 2 — Turn on your website

- **Set exactly as written:** Source "Deploy from a branch", main,
  `/ (root)`. A script did it through GitHub's API, the equivalent of the
  Settings screen.
- **Live after 23 seconds,** inside the guide's "one or two minutes".
- **`npm run test:live` against the copy:** both core recipes are served
  byte for byte, and Home shows both tools on laptop, iPhone and Android
  with no errors.

## Steps 3–5 — the student's phone (`tests/pilot/guide-run.mjs`)

**How the run worked:**
- **Real site and phone browsers:** WebKit as an iPhone 13, and Chromium as
  a Pixel 7.
- **Buttons found by the guide's own words:** each button is matched from
  the start of the name the guide gives.
- **Persistent phone storage:** the student leaves for the "AI app" and
  comes back, and the storage survives the trip.
- **The "AI app":** independent agents with live web access, which saw only
  what the student would paste.

| | iPhone, no brain | Android, local stand-in brain |
|---|---|---|
| Step 3 | Manifest "Brain Hub", standalone, 3 icons; service worker registered | Manifest OK. The service worker reads "not registered" inside the script's persistent profile but is **active** in a normal Android session (checked separately). |
| Step 4 | "Hi, Sofia", 2 tools, "No brain" | Open check passed against the real RLS: the probe's 401 is the expected refusal. "Hi, Diego", 2 tools, "Brain connected" |
| Step 5: Run, Copy prompt, Open | 2,950-char prompt; "Copied."; Open → claude.ai | Same prompt; "Copied."; Open → chatgpt.com |
| AI app | Independent research agent, live web; Costco Wholesale (NASDAQ: COST); ~1,780 words, 16 sources | The same real answer |
| Coming back | Prompt still there | Prompt still there; **"Paste answer" filled the box from the real clipboard** |
| Result | Every section present; source check "All 45 factual claims have a source or are marked [unverified]" | Same |
| Check this answer | "Score so far: 50 / 50", then the check prompt (15,341 chars) went to an independent web fact-checker and its table was pasted back with **Score it**: **95 / 100, Strong**. 36 supported, 8 partly, 0 not supported, 0 unreachable, and 8 specific fixes, e.g. "Replace the Clark link with a live source" (that page now returns 410). | Same |
| Keep | Download → `company-analysis-2026-10-03.md` | Download (same name), then **Save to brain** → "Saved to your brain." The save was **found again** on Home (1 recent item) and by brain search for "Costco" (1 result) |
| Page errors | None | None, apart from the probe's expected 401 |

## What the run found, and what was done

1. **A real app gap.**
   - **What happened:** after "Check this answer", a student who left for
     the AI app and came back after the phone reloaded the hub found the
     check panel closed and its prompt gone.
   - **Fixed:** the open panel is now remembered (`st.checkOpen`), and the
     run shows it reopen.
2. **A real update delay.**
   - **What happened:** GitHub Pages sends `max-age=600`, so after **Sync
     fork** an installed app could run old code for about 10 minutes.
   - **Fixed:** the service worker now revalidates every shell file
     (`cache: 'no-cache'`, a cheap 304 when nothing changed). The guide
     says "within a few minutes; close and reopen the app if it still looks
     old".
3. **Not app problems — the test tooling's:**
   - a loose button match ("ChatGPT" also appears in the Manual button's
     description);
   - reading "Copied." and the pasted text too early;
   - the stand-in brain forgetting sessions between stages and using the
     suite's fixed clock;
   - an over-tall screenshot.

   All are fixed in the script. Nitpick separately confirmed the script
   hides no app problem.
4. **"Refused to apply a stylesheet" in WebKit.**
   - **Cause:** Playwright's own screenshot injects a `<style>`, and the
     hub's CSP correctly refuses it. That was reproduced with no app action
     at all.
   - **Handling:** it's ignored **only** while the script itself is taking
     a screenshot.
5. **The guide** was fixed for every Nitpick finding:
   - the Checker steps now name **Copy check prompt** and **Score it**;
   - "Score so far … / 50" is explained as not final;
   - Save explains its **Save** tap;
   - the "Could not reach that brain" causes are corrected;
   - Step 4 now says to tap **Next**;
   - "Make your own tools" now covers GitHub's **Add file** → **Create new
     file** → **Commit changes**, and **Refresh tools**;
   - the Spanish wording is improved, and English phone labels are given
     alongside.

## Not proven here (see `PILOT-CHECKLIST.md`)

- the Fork button, Sync fork, and the first Pages build on a real fork;
- Add to Home Screen, and setup inside the installed iPhone app;
- the real clipboard on iPhone (WebKit in Playwright can't read it);
- a real Open Brain on Supabase (Prove-first item);
- how real students find the guide's length and wording.
