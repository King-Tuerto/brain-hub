## Steps

1. Take in the pasted syllabus and the exam date (or note that none was given).
2. Build the week-by-week Study Plan: dated weeks from today through the exam week if a date was given, or numbered weeks covering the whole syllabus if not.
3. Applied fix [A4, Test 2]: rebuilt the rule for the first week's wrong answer options so it covers every option, not just question stems — an option may not name a week 2+ topic even in passing (such as describing what a first-week concept lacks compared to something from a later week), and any distractor that would need a later-week term is rebuilt from other first-week material instead.
4. Draft the 5 practice questions on the first week's topics only, then re-check every stem and every option, word by word, against the list of week 2+ topics, rewriting anything that touches one.
5. Return the Study Plan and Practice Questions; the hub appends the Summary.

Spec changed: no

## Spec

**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all about topics from the first week only. No question, including its answer options, may mention, preview, or require understanding of any topic from week 2 or later — not even as an "introduction to" a later topic, as background needed to answer, or as the scenario or framing the question is built around (for example, a comparison to a later topic, or a situation that assumes it).
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan only, with no question — including any multiple-choice answer options — mentioning, framing, or depending on any topic from week 2 or later.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not invent or guess one. It builds the plan using week numbers instead of dates and tells the student it did so because no exam date was given.

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan until your exam, plus 5 practice questions on week one.
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
    help: Include the topics or schedule listed for each week or unit.
  - id: exam_date
    label: Exam date
    type: text
    required: false
    placeholder: 2026-12-10
output:
  sections: [Study Plan, Practice Questions]
---
I'm a university student using this tool at the start of the semester.

Today's date: {{today}}

My syllabus:
{{syllabus}}

My exam date: {{exam_date}}

If my exam date is (not provided), do not invent one. Build the plan using week
numbers instead (Week 1, Week 2, and so on) covering every week my syllabus
lists, and say in the Study Plan that you used week numbers because no exam
date was given.

If my exam date is provided, build the plan with one entry for every week from
today up to and including the week of my exam date, using the topics from my
syllabus for each week in the order the syllabus presents them. If the
syllabus has more or fewer weeks than fit before the exam date, say so.

Give me exactly 5 practice questions based only on the first week's topics
from my syllabus. Do not write a question — including any multiple-choice
answer options — that mentions, previews, or acts as an "introduction to" any
topic from week 2 or later, and do not write a question that can only be
answered using, or is framed around (such as a comparison to, or a scenario
built on), a concept from week 2 or later — every question, and every answer
option, must be fully self-contained within the first week's topics.

Build the wrong (incorrect) answer options using only first-week material.
Never let an option name, or be built around, a later week's topic — not even
in passing, such as describing what a first-week concept lacks or how it
differs compared to something that is itself a later week's topic. If a
distractor would only make sense by referencing a week 2+ term, replace it
with one built entirely from other first-week material instead (a different
first-week structure, step, or concept).

Before giving me the final answer, check every answer option — not just the
question stems — word by word against the list of week 2 or later topics, and
rewrite any option that names one or depends on one, even in passing. Then
re-check each of the 5 questions one by one — the stem and every answer
option — against the first week's topic list, and rewrite any question that
touches a week 2 or later topic in any way, including through its framing,
scenario, or an incidental word choice, until none do.
---
```

exam-study-planner.recipe.md

## Summary

Applied the Tester's fix [A4, Test 2] to the Exam Study Planner (id: exam-study-planner): wrong-answer options must never name or depend on a week 2+ topic, even in passing, and any distractor needing a later-week term is rebuilt from first-week material instead. Version raised from 1.0.3 to 1.0.4, same id, acceptance criteria A1–A5 unchanged, and the Spec itself did not change.
