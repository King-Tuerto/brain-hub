## Steps

1. Take the pasted syllabus and, optionally, the exam date.
2. If the exam date is **(not provided)**, build a week-by-week study plan that covers every topic in the syllabus, in order, and say that this is what was done because no exam date was given yet.
3. If the exam date is given, count the whole weeks between today and the exam (days ÷ 7, rounded down), then build exactly that many Study Plan entries — each one exactly one calendar week long, in syllabus order, stopping at the last whole week before the exam. **Fix 2 applied here:** the recipe now spells out that every entry is a single 7-day week (with a worked example, e.g. Week 2 = Oct 11–17, not a stretched Oct 11–24) instead of a vague "continuing up to the exam." **Fix 3 applied here:** any syllabus topics that fall after that last whole week are left out of the Study Plan entirely — the recipe now says explicitly not to cram them into the final entry.
4. Drop any administrative item (lab safety quiz, grading, office hours, late-work policy) from Study Plan entries, even if the syllabus schedules it for a specific week.
5. From Week 1's topics only, remove anything a later week already owns (including overlapping structure/function topics, e.g. membrane transport or respiration/photosynthesis), then write exactly five practice questions from what's left — structure-only for organelles/membranes, never function. **Fix 1 applied here:** the recipe now says the Week 1 Practice Questions section may carry at most one short plain-language note above the questions, that note (and the questions themselves) must never contain a bracket tag such as `[unverified]`, and the old "standard curriculum" framing is dropped — if an explanation is needed it must be said in plain words with no source claim attached.
6. Return the Study Plan and Week 1 Practice Questions sections (the hub appends the final Summary).

Spec changed: no

## Spec

**Study Plan Builder** — turns a pasted class syllabus and (optionally) an exam date into a week-by-week study plan plus 5 practice questions on the first week's topics.

**Inputs:**
- *Paste your class syllabus* — required. Example: "Week 1: Cell structure... Week 2: Membrane transport... Week 3-4: Respiration and photosynthesis... Oct 20: Lab safety quiz..."
- *Exam date* — optional. Example: `2026-12-15`.

**Output sections, in order:**
1. **Study Plan** — one entry per calendar week, in syllabus order, starting from this week. Each entry names only study topics from the pasted syllabus (never an administrative item such as a lab safety quiz, grading, office hours, or the late-work policy).
2. **Week 1 Practice Questions** — exactly five questions, built only from Week 1 topics that no later week already owns. For an organelle or other membrane-bound structure, questions cover structure only (shape, parts, location), never function. No bracket tag such as `[unverified]` appears anywhere in this section, including in any note above the questions.
3. **Summary** (added by the hub) — 2–3 sentences.

**Acceptance criteria:**
- **A1:** Every Study Plan entry covers exactly one calendar week (e.g. Week 2 = Oct 11–17, not a longer span); entries follow the syllabus in order, starting this week, and stop at the last whole week before the exam without stretching the final entry's dates; any syllabus topic that falls after that last whole week is left out of the Study Plan rather than crammed into the final entry.
- **A2:** When no exam date is given, the Study Plan covers every topic in the pasted syllabus, organized week by week, and says this is what was done because no exam date was given yet.
- **A3:** No Study Plan entry contains an administrative item (lab safety quiz, grading, office hours, late-work policy), even if the syllabus schedules it for a particular week.
- **A4:** The Week 1 Practice Questions section has exactly five questions, and none of them covers a topic that a later week's Study Plan entry already owns.
- **A5:** Any Week 1 question about a cell organelle or other membrane-bound structure asks about structure only (shape, parts, location), never about its function (e.g. never how mitochondria make ATP, why chloroplasts matter for photosynthesis, or how nuclear pores enable transport), and no question contains a note about what topic it is avoiding.
- **A6:** The Week 1 Practice Questions section, including any note written above the questions, contains no bracket tag such as `[unverified]`, and makes no unsourced "standard curriculum" claim.

**Blank inputs:** If the exam date is left blank, build the Study Plan from the syllabus alone, covering every topic, organized week by week, and say that this is what was done because no exam date was given yet.

## Recipe

```recipe
---
recipe_format: 1
id: study-plan-builder
name: Study Plan Builder
description: Turns your pasted class syllabus into a week-by-week study plan plus 5 practice questions on week 1.
version: 1.0.4
author: Brain Hub student
permissions: [run_ai]
web_search: none
sourcing: advice
inputs:
  - id: syllabus
    label: Paste your class syllabus
    type: long_text
    required: true
    help: Paste the whole syllabus, including the week-by-week topic list if it has one.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: "2026-12-15"
    help: Leave blank if you don't know it yet.
output:
  sections: [Study Plan, Week 1 Practice Questions]
---
I'm a university student at the start of a semester, using my syllabus to build a study plan.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), don't guess one. Instead, build the study plan
from the syllabus alone: cover every topic in it, organized week by week, and say
that this is what you did because no exam date was given yet.

If my exam date is provided, first count the whole weeks from today's date to the
exam date: take the whole number of days between the two dates and divide by 7,
rounding down. That count is how many Study Plan entries to build. Build them one
per calendar week, in syllabus order, starting from this week: each entry covers
exactly 7 days, never more and never fewer (for example, if this week started
Oct 4, the next entry is Oct 11-17, not Oct 11-24). For example, a run on
2026-10-04 with an exam on 2027-02-26 is 20 weeks, not 19, and every one of those
20 entries is a single 7-day week. Stop at the last whole week that count allows,
even if the syllabus still has topics left after it. Leave any such later syllabus
topics out of the Study Plan entirely: never cram them into the final entry, and
never stretch the final entry's dates to reach the exam date.

Break the syllabus into that week-by-week study plan, naming the topics to study
each week. Use only topics that appear in the syllabus I pasted. A Study Plan
entry is a study topic only: never put an administrative item such as a lab
safety quiz, grading, office hours, or the late-work policy into a Study Plan
entry, even if the syllabus schedules it for a particular week.

Then look at only the first week's topics in that plan. Before writing any
questions, check each candidate topic against every later week's topics in the
plan, and drop anything a later week already owns — even if it overlaps with a
Week 1 topic (for example, don't let a Week 1 question drift into membrane
permeability if that's a Week 2 topic, or into respiration or photosynthesis if
those are Weeks 3-4 topics). Write exactly five practice questions using only
what is left of the first week's topics after that check.

When a Week 1 topic is a cell organelle or another membrane-bound structure
(such as the nucleus, a mitochondrion, or a chloroplast), write questions about
its structure only — shape, parts, and where it sits in the cell — never about
how it enables or carries out a function, such as how mitochondria make ATP
through respiration, why chloroplasts matter for photosynthesis, or how nuclear
pores enable selective communication between the nucleus and cytoplasm. Never
put a note inside a question saying what not to discuss; instead write a
question that doesn't raise that function in the first place. The same applies
to any membrane: if a later week owns membrane permeability and transport,
don't ask a Week 1 question about transport or selective passage through any
membrane, including the nuclear envelope's pores. Never write a practice
question about an administrative item such as a lab safety quiz.

Write the Week 1 Practice Questions section as the five questions and, if you
need one, at most a single short plain-language note above them (for example,
noting that a topic was left out because a later week already covers it). Never
put a bracket tag such as [unverified] anywhere in this section, in the
questions or in that note. Never describe the questions as following "standard
curriculum" or any other unsourced claim about what is standard; if you explain
your selection, say it in your own words with no source attached.
```
study-plan-builder.recipe.md

## Summary

Applied the Tester's three fixes to Study Plan Builder: Study Plan entries are now locked to exactly one 7-day calendar week each, syllabus topics past the last whole week before the exam are dropped instead of crammed in, and the Week 1 Practice Questions section (questions and any note above them) can no longer carry a bracket tag or an unsourced "standard curriculum" claim. No acceptance criteria changed — A1 and A6 are satisfied by recipe behavior changes only — so the id stayed `study-plan-builder` and the version moved from 1.0.3 to 1.0.4.
