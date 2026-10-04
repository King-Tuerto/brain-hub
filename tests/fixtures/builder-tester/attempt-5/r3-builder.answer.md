## Steps

1. The student pastes their syllabus and, if they know it, their exam date.
2. The tool reads the syllabus week by week and, if an exam date was given, lines up each week against today's date; if no exam date was given, it numbers the weeks instead and says so.
3. It writes one Study Plan entry per week, using only topics the syllabus actually lists, in the syllabus's own order.
4. It writes exactly 5 practice questions on the first week's topics only, then re-checks each question — its stem, its answer options, and the scenario it's framed around — against the first week's topic list, rewriting anything that touches a later week. Applied Fix 1 ([A4, Test 2]) by extending that check to explicitly cover multiple-choice answer options, not just the question stem, so a later-week term can't hide in a distractor. Applied Fix 2 ([A4, Test 3]) by extending that check to explicitly cover the framing a question is built around — a comparison, a scenario, a situation — so a question can't lean on later-week material without naming it outright.
5. The hub adds the Summary section automatically.

Spec changed: yes

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
version: 1.0.2
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

Before giving me the final answer, re-check each of the 5 questions one by
one — the stem and every answer option — against the first week's topic
list, and rewrite any question that touches a week 2 or later topic in any
way, including through its framing or scenario, until none do.
```
exam-study-planner.recipe.md

## Summary

Applied the Tester's two Practice Questions fixes to Exam Study Planner (v1.0.1 → v1.0.2): the no-later-week rule in A4 and the recipe body now explicitly covers multiple-choice answer options as well as question stems, and explicitly covers scenario or comparison framing that leans on later-week material. All other inputs, outputs, and acceptance criteria (A1, A2, A3, A5) are unchanged.
