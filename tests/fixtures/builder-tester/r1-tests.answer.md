## Test plan

No previous test cases were provided, so these are new tests written before the tool is run.

How weeks are counted in every test: Week 1 is the 7 days starting today (2026-10-04 to 2026-10-10), Week 2 is 2026-10-11 to 2026-10-17, and so on. The exam week is the 7-day block that contains the exam date.

| Criterion | What it checks | Covered by |
|---|---|---|
| A1 | One Study Plan entry per week from today through the exam week | Test 1, Test 3 |
| A2 | No exam date: exactly 8 weeks, plus a line saying 8 weeks was assumed | Test 2 (and Test 1 and Test 3 check that the 8-week line does not appear when a date is given) |
| A3 | Exactly 5 practice questions | Test 1, Test 2, Test 3 |
| A4 | Practice questions and answer options use no later-week topic words | Test 1, Test 2, Test 3 |
| A5 | Every Study Plan week names at least one syllabus topic | Test 1, Test 2, Test 3 |
| A6 | Summary is 2–3 sentences | Test 1, Test 2, Test 3 |

Every criterion is covered by at least one test.

## Test cases

### Test 1: normal use

**Inputs to type**
- **Class syllabus:** `ECON 101. Week 1: Scarcity and opportunity cost. Week 2: Supply and demand. Week 3: Elasticity. Week 4: Consumer choice. Week 5: Production costs. Week 6: Monopoly. Week 7: Inflation. Final exam covers all weeks.`
- **Exam date:** `2026-11-18`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 7 week entries (blocks starting 2026-10-04, 10-11, 10-18, 10-25, 11-01, 11-08 and 11-15; the last one contains 2026-11-18). Count them: 7, not 6 and not 8.
- [A1] No line in the answer says 8 weeks was assumed, and the words "no exam date" do not appear.
- [A5] Each of the 7 week entries contains at least one of these words: scarcity, opportunity cost, supply, demand, elasticity, consumer choice, production, monopoly, inflation (any capitalisation; plurals count).
- [A3] The Practice Questions section contains exactly 5 questions. Count them: 5.
- [A3] Each of the 5 questions has an answer shown.
- [A4] Write down which of these words appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
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
- [A4] Write down which of these words appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. Every word from that list that does NOT appear in the first week entry must appear nowhere in the Practice Questions section (questions, options or answers; any capitalisation; plurals count).
- [A6] The Summary section has 2 or 3 sentences.

### Test 3: tricky but fair (very short syllabus, exam this week)

**Inputs to type**
- **Class syllabus:** `Week 1: Photosynthesis. Week 2: Respiration.`
- **Exam date:** `2026-10-07`

**Expected**
- [Order] The answer has the sections Study Plan, Practice Questions and Summary, in that order.
- [A1] The Study Plan section has exactly 1 week entry (2026-10-07 falls in the first block, 2026-10-04 to 2026-10-10). Count them: 1.
- [A1] No line in the answer says 8 weeks was assumed; the words "8 weeks" and "eight weeks" do not appear.
- [A5] The single week entry contains the word "photosynthesis" or "respiration" (any capitalisation).
- [A3] The Practice Questions section contains exactly 5 questions, each with an answer shown.
- [A4] If the word "respiration" does NOT appear in the Study Plan's week entry, then "respiration" appears nowhere in the Practice Questions section (questions, options or answers; any capitalisation).
- [A6] The Summary section has 2 or 3 sentences.

## How to run them

1. Open the Syllabus Study Planner tool.
2. Run it once for Test 1: type exactly the inputs listed under Test 1 (copy and paste the syllabus text so nothing changes).
3. Copy the whole answer, from the first line to the last.
4. Run the tool again for Test 2 with exactly the Test 2 inputs. Leave Exam date blank. Copy the whole answer.
5. Run the tool again for Test 3 with exactly the Test 3 inputs. Copy the whole answer.
6. Open a new chat. Do not use the chat that built the tool.
7. Paste "Tester 2 — grade" into it, then paste this Spec and these test cases, then the three answers labelled Test 1, Test 2 and Test 3.

## Summary

Tests for the Syllabus Study Planner: a normal economics syllabus with exam date 2026-11-18 (7 weeks), a biology syllabus with no exam date (8 weeks assumed), and a two-week syllabus with an exam on 2026-10-07 (1 week). Every acceptance criterion A1–A6 is checked by counting entries, questions and sentences, or by looking for later-week topic words in the practice questions.
