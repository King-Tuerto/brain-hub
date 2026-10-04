## Test plan

No changes: the tests are the same as last time.

Every criterion in the Spec (A1 to A6) matches what the previous tests already check. The A1 checks marked *(new)* (no "Exam Day" entry, no single-day labels) and the A4 checks marked *(changed)* (later-week topic words must not appear in questions, options, answers or answer explanations) already match the current Spec, so they are copied word for word.

Coverage:

| Criterion | Test 1 | Test 2 | Test 3 |
|---|---|---|---|
| Section order | ✓ | ✓ | ✓ |
| A1: one entry per week through the exam week, exam week not split | ✓ | | ✓ |
| A2: no exam date → exactly 8 weeks, and a line saying so | | ✓ | |
| A3: exactly 5 practice questions | ✓ | ✓ | ✓ |
| A4: practice questions use only Week 1 topics | ✓ | ✓ | ✓ |
| A5: every week names a syllabus topic | ✓ | ✓ | ✓ |
| A6: Summary is 2–3 sentences | ✓ | ✓ | ✓ |

## Test cases

### Test 1: normal use

**Inputs to type**
- **Class syllabus:** `ECON 101. Week 1: Scarcity and opportunity cost. Week 2: Supply and demand. Week 3: Elasticity. Week 4: Consumer choice. Week 5: Production costs. Week 6: Monopoly. Week 7: Inflation. Final exam covers all weeks.`
- **Exam date:** `2026-11-18`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 7 week entries (blocks starting 2026-10-04, 10-11, 10-18, 10-25, 11-01, 11-08 and 11-15; the last one contains 2026-11-18). Count them: 7, not 6 and not 8.
- [A1] No line in the answer says 8 weeks was assumed, and the words "no exam date" do not appear.
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-11-18 on its own). Every entry label names a week or a date range.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences. Count sentences by the full stops, question marks or exclamation marks that end them.

### Test 2: edge case, optional input left blank

**Inputs to type**
- **Class syllabus:** `BIO 110. Week 1: Cell structure. Week 2: Mitosis. Week 3: Meiosis. Week 4: Genetics. Week 5: Evolution. Week 6: Ecology. Week 7: Photosynthesis. Week 8: Enzymes. Final exam covers all weeks.`
- **Exam date:** leave blank

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A2] The Study Plan section has exactly 8 week entries. Count them: 8.
- [A2] One line in the answer contains both "8 weeks" (or "eight weeks") and the words "exam date".
- [A2] No exam date (no date in YYYY-MM-DD or written-out form) is presented as the exam date.
- [A5] Each of the 8 week entries contains at least one of these words: cell, mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzymes (any capitalisation; singular or plural counts).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] *(changed)* Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A1] *(new)* No entry in the Study Plan section is labelled "Exam Day", and no entry is labelled with a single day (a weekday name Monday–Sunday or a single date such as 2026-10-07 on its own). The Study Plan has one entry only, not a day-by-day list.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] *(changed)* If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options, answers or answer explanations; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.

## How to run them

1. Open the Syllabus Study Planner tool.
2. Run it once for Test 1: type exactly the inputs listed under Test 1, then copy the whole answer.
3. Run it again for Test 2 with exactly the Test 2 inputs (leave the exam date blank), and copy the whole answer.
4. Run it again for Test 3 with exactly the Test 3 inputs, and copy the whole answer.
5. Open a **new chat** (not the chat that built the tool) and paste in the "Tester 2 — grade" prompt.
6. In that prompt, paste the Spec, these test cases, and the three answers, labelled Test 1, Test 2 and Test 3.

## Summary

Retest of the Syllabus Study Planner tests: no changes, because every acceptance criterion (A1–A6) in the Spec already matches the previous tests. The three tests cover a normal ECON 101 run to a 2026-11-18 exam, a BIO 110 run with no exam date (8 weeks assumed), and a two-week syllabus with the exam in the current week.
