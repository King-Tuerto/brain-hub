## Steps

1. Read the Tester's three fixes: all three point at the same problem in acceptance criterion A4 — practice questions straying past the first week's topics, either by previewing a later topic ("introduction to...") or by needing a later week's concept to answer.
2. Tightened A4's wording so it rules out both failure modes directly: questions must stay inside the first week's topics and must not require or introduce any later week's concept.
3. Updated the Output section's description of Practice Questions to match the tightened A4 wording, so the Spec is internally consistent.
4. Added the self-check from fix 3 (Test 3) to the recipe's prompt body: before giving the final answer, the AI re-checks each of the 5 questions against the first week's topic list and rewrites any that touch week 2 or later.
5. Kept the id (`exam-study-planner`), all inputs, and A1, A2, A3, A5 exactly as they were, and raised the version from 1.0.0 to 1.0.1.

Spec changed: yes

## Spec

**Tool name:** Exam Study Planner — turns a pasted syllabus into a week-by-week study plan up to the exam date, ending with 5 practice questions on the first week's topics.

**Inputs:**
- **Paste your class syllabus** (required) — example: "Week 1: Supply and demand; Week 2: Market structures; Week 3: Elasticity; …"
- **Exam date** (optional) — example: "2026-12-10"

**Output** — the answer must have these sections, in order:
1. **Study Plan** — one entry per week, each naming that week's topics taken from the syllabus. If an exam date was given, weeks are dated from today through the exam week. If not, weeks are numbered instead.
2. **Practice Questions** — exactly 5 questions, all about topics from the first week only. No question may mention, preview, or require understanding of any topic from week 2 or later — not even as an "introduction to" a later topic or as background needed to answer.
3. **Summary** — added automatically by the hub; 2–3 sentences.

**Acceptance criteria:**
- A1: The Study Plan has one entry for every week from today through the week containing the exam date, when an exam date was given.
- A2: When the exam date is left blank, the Study Plan is organized by week number instead of calendar dates, and the answer says it did this because no exam date was given.
- A3: Every topic named in the Study Plan comes from the pasted syllabus, in the order the syllabus presents them.
- A4: The Practice Questions section contains exactly 5 questions, all about topics from the first week of the plan only, with no question mentioning or depending on any topic from week 2 or later.
- A5: The answer ends with a Summary section.

**Blank inputs:** If the exam date is left blank, the tool does not invent or guess one. It builds the plan using week numbers instead of dates and tells the student it did so because no exam date was given.

## Recipe

```recipe
---
recipe_format: 1
id: exam-study-planner
name: Exam Study Planner
description: Turn your syllabus into a week-by-week study plan until your exam, plus 5 practice questions on week one.
version: 1.0.1
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
from my syllabus. Do not write a question that mentions, previews, or acts as
an "introduction to" any topic from week 2 or later, and do not write a
question that can only be answered using a concept from week 2 or later —
every question must be fully answerable using only the first week's topics.

Before giving me the final answer, re-check each of the 5 questions one by
one against the first week's topic list, and rewrite any question that
touches a week 2 or later topic, in any way, until none do.
```
exam-study-planner.recipe.md

## Summary

Revised the Exam Study Planner recipe to version 1.0.1 after three Tester fixes all converged on the same gap: practice questions bleeding into later-week topics, either by preview or by required background knowledge. A4 and the Practice Questions output description were tightened to bar both, and the recipe prompt now ends with an explicit self-check that reviews all 5 questions against the first week's topics before the answer is finalized.
