# BRAIN HUB — Spec and Phasing Plan v1.0 (Oct 3, 2026)

Paste this whole document into a fresh Claude window to start the build.

## How to work with me (Paul)
- I'm non-technical but build a lot. Give me technical steps ONE AT A TIME and wait for me.
- Be brutally honest and keep answers short unless I ask for more.
- Use my TDD workflow through the agent system: El Código writes the spec for a task, Nitpick writes the test plan, El Código codes to pass the tests, Nitpick reviews. No freelancing outside that flow.
- Every Claude Code prompt starts with the explicit project path.
- Save finished work products and session summaries to my Open Brain.
- HARD CONSTRAINT: never suggest or create a test Supabase project. Test brain changes against a local throwaway Postgres, or report them as unverified.

## 1. What we're building
A Boardroom-style web app (also installable as a PWA) that students fork to their own GitHub. It connects to their Open Brain if they have one, but works fully without one. It comes with a few starter tools, and students can add their own tools by having any AI (Claude, ChatGPT, etc.) build them from an AI-readable guide.

## 2. Who it's for
- GCU PM Club students, many already building an Open Brain (Express).
- Phone-first users. Every screen must work well on a phone.
- Secondary: me, for investing, board, and consulting research.

## 3. Goals
1. Give students a personal command center they like using and want to show off.
2. Make the brain valuable without requiring it: with a brain, tools pull context and save results.
3. Teach good AI practice: sources, checking, breaking work down, evals.
4. Let students extend the hub with their own tools.

## 4. Non-goals (v1)
- No central database run by me. Each student's data stays in their own brain.
- No user accounts or backend of our own.
- No marketplace or payments.
- No offline mode (brain and AI need internet).

## 5. Architecture
- Static web app on GitHub Pages, installable PWA. Same pattern as Open Brain Express.
- **Core vs. plug-ins separation:** students only add or change files in the plug-ins area, never core files, so GitHub "Sync fork" pulls my updates without conflicts.
- **One-time setup screen:** (a) connect brain (optional), (b) pick AI mode and, if automatic, enter an OpenRouter key.
- **Credentials:** brain key and AI key are entered in the browser and stored there. NEVER written to any file in the repo (forks may be public).
- Only upgraded brains may connect (the June cohort's open-database issue must be fixed first). Hub should detect and warn.

## 6. Screens
1. **Setup:** connect brain, choose AI mode, set OpenRouter key with a reminder to set a spending limit.
2. **Home dashboard:** name, profile snapshot, recent saved work, simple progress stats, tool tiles.
3. **Tool runner:** auto-drawn form → build prompt → run (automatic or manual) → show result with sources → "Save to brain" / "Download."
4. **Add tool:** paste a recipe, see a plain-English summary of what it will do and what it can access, then install.
5. **Settings:** reconnect, switch modes, export.

## 7. AI modes (every tool supports both)
- **Automatic:** hub calls OpenRouter. Free models are rate-limited and rotate, so never hard-code a model; let the user pick and fall back gracefully on errors. Web search through the API is billed.
- **Manual (copy-paste):** hub builds the prompt, one tap copies it and opens the student's AI app, one tap pastes the answer back. Runs on their subscription at no extra cost. Must be smooth on phones.
- Building the prompt never calls an AI. It's template + inputs + brain context.

## 8. Tool recipe format (the heart of the system)
A tool is a recipe with:
- **Name, description, version, author**
- **Inputs:** list of fields (label, type: text / long text / choose-one / number, required or optional). The hub auto-draws the form.
- **Brain context:** what to search the brain for before building the prompt (optional).
- **Prompt template:** with placeholders for inputs and brain context.
- **Output rules:** required sections; every factual claim must carry a source link.
- **Save rules:** short summary + tags + full report attached.
- **Permissions:** which hub functions it may use.

Advanced plug-ins with their own custom screen are a second type, allowed later.

Single source rule: each recipe is written once. The hub screen, copy-paste prompts, and the brain connector (Phase 6) all read the same recipe.

## 9. Hub functions available to tools (limited on purpose)
- Search my brain
- Save to my brain (summary + full report + tags)
- Build prompt
- Run AI (automatic mode only)
Tools never get raw database access.

## 10. Saving to the brain
- Student chooses what to save (button, never auto-save).
- Save a short searchable summary, with the full report attached.
- Tag by type (work product, personal note, job history, etc.) and date-stamp.
- Allow archiving.
- Without a brain: download only, with a nudge about what a brain would add.
- OPEN QUESTION: can Express store full documents, or does it need a small upgrade?

## 11. Starter tools
1. **Company analysis** (Phase 3): business units, industries, main competitors per industry with strengths and weaknesses, environmental scan for a chosen business unit, research summary, suggested further research. Flag limits for private companies. Every claim sourced.
2. **Job and interview prep** (later): paste a job posting, get what a strong resume should include, how to defend known weaknesses, questions to prepare for, and smart questions to ask.
3. **Checker specialist** (Phase 5): grades any tool output against a rubric (sources present, claims supported, sections covered), returns a score and specific fixes. Also runs the citation check: verify each claim against its link.

Later ideas: student profile builder, networking prep, gap-based learning suggestions, curated content funnel, builder specialist, evals.

## 12. Widget guide (WIDGET-GUIDE.md)
An AI-readable document explaining exactly how to write a recipe that plugs in. A student pastes it into any AI and asks for a tool. Success test: a different AI builds a working tool from the guide with no hand-fixing.

## 13. Phasing plan
Each phase runs through the TDD workflow and ends with Nitpick sign-off and my hands-on check.

**Phase 1 — Spec lock (1–2 sessions)**
Finalize recipe format, hub functions, screen list, and WIDGET-GUIDE.md draft. Resolve open questions (section 15).
Done when: recipe format and guide are written and I've approved them.

**Phase 2 — Hub core (3–5 sessions)**
Setup screen, brain connection, both AI modes, recipe engine with auto-drawn forms, save to brain, download, dashboard shell, PWA install.
Done when: a dummy recipe runs end to end in both modes, with and without a brain, on a phone and a laptop.

**Phase 3 — First tool: company analysis (2–3 sessions)**
Done when: a real company runs end to end, every claim has a source, and results save to and are found again in the brain.

**Phase 4 — Prove the widget guide (1 session)**
Give the guide to a different AI and have it build a second tool.
Done when: it installs and works with no hand-fixing.

**Phase 5 — Checker specialist (2–3 sessions)**
Done when: it catches planted errors (missing sources, unsupported claims) in test outputs.

**Phase 6 — Brain connector tools (1–2 sessions)**
Add "list hub tools" and "get hub tool" to the brain's connector so Claude/ChatGPT can run workflows from the phone app.
Done when: from the Claude phone app, "run a company analysis on X" works and saves to the brain.

**Phase 7 — Student pilot (about 1 week elapsed)**
A few PM Club students fork, set up, and use it. Fix what they hit.

Estimate: 10–16 sessions, 2–4 weeks part-time. Usable first version after Phase 3.

## 14. Risks to watch
- Phone copy-paste friction.
- Free OpenRouter limits and rotating models.
- Brain noise if saving isn't curated.
- Shared recipes misusing a classmate's brain (mitigated by limited functions and install summary).
- Building the platform before proving the product: keep Phase 3 tight and real.

## 15. Open questions for Phase 1
1. Repo name and location (suggest King-Tuerto org).
2. Does Express need an upgrade to store full documents?
3. Use the brain database's login as the hub login, or no login?
4. Store student-added recipes in GitHub, in the brain, or both?
5. Which Claude and ChatGPT plans currently allow custom connectors (verify before Phase 6)?
6. How much structure the student profile needs inside a free-form brain.

## First step
Start Phase 1. Ask me question 1 from section 15, then work through the rest one at a time.
