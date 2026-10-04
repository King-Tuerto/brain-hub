## Test plan

**Changes made since last time:**
- Changed the [A4] check in Test 1, Test 2 and Test 3. Why: criterion A4 in the Spec now also bans any other form of a later week's topic word (for example "produce", "produced", "producing" for "production"). The old checks only counted plurals, so each one now lists the exact extra word forms that are not allowed.
- Nothing else changed. Every other check is copied word for word, because no other criterion was changed or removed and none were added.

**Coverage:**

| Criterion | Test 1 | Test 2 | Test 3 |
|---|---|---|---|
| A1: one entry per week up to and including the exam week, no day-by-day or Exam Day entries | Yes | | Yes |
| A2: no exam date means 8 weeks, plus a line saying so | | Yes | |
| A3: exactly 5 practice questions | Yes | Yes | Yes |
| A4: practice questions use only Week 1 topics, in any word form | Yes | Yes | Yes |
| A5: every week names a syllabus topic | Yes | Yes | Yes |
| A6: Summary is 2–3 sentences | Yes | Yes | Yes |

Every test also checks that the sections come in the right order (Study Plan, Practice Questions, Summary).

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
- [A4] *(changed)* Write down which of these topics appear in the Study Plan's first week entry: supply, demand, elasticity, consumer choice, production, monopoly, inflation. For every topic from that list that does NOT appear in the first week entry, none of its words below may appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation):
  - supply: supply, supplies, supplied, supplying, supplier, suppliers
  - demand: demand, demands, demanded, demanding
  - elasticity: elasticity, elasticities, elastic, inelastic
  - consumer choice: consumer, consumers, consume, consumes, consumed, consuming, consumption
  - production: production, produce, produces, produced, producing, producer, producers, productive, productivity
  - monopoly: monopoly, monopolies, monopolist, monopolists, monopolistic, monopolize, monopolized
  - inflation: inflation, inflate, inflates, inflated, inflating, inflationary
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
- [A4] *(changed)* Write down which of these topics appear in the Study Plan's first week entry: mitosis, meiosis, genetics, evolution, ecology, photosynthesis, enzyme. For every topic from that list that does NOT appear in the first week entry, none of its words below may appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation):
  - mitosis: mitosis, mitoses, mitotic
  - meiosis: meiosis, meioses, meiotic
  - genetics: genetics, genetic, genetically, geneticist, geneticists
  - evolution: evolution, evolutionary, evolve, evolves, evolved, evolving
  - ecology: ecology, ecological, ecologically, ecologist, ecologists
  - photosynthesis: photosynthesis, photosynthetic, photosynthesize, photosynthesizes, photosynthesized, photosynthesizing
  - enzyme: enzyme, enzymes, enzymatic
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
- [A4] *(changed)* If the word "respiration" does NOT appear in the Study Plan's week entry, then none of these words appear anywhere in the Practice Questions section (questions, answer options, answers or answer explanations; any capitalisation): respiration, respirations, respiratory, respire, respires, respired, respiring.
- [A6] The Summary section has 2 or 3 sentences.

## How to run them

1. Open the Syllabus Study Planner tool.
2. Run it once for Test 1. Type exactly the inputs listed under Test 1, "Inputs to type". Copy the whole answer it gives you.
3. Run it again for Test 2, with exactly the Test 2 inputs (leave the exam date blank). Copy the whole answer.
4. Run it again for Test 3, with exactly the Test 3 inputs. Copy the whole answer.
5. Open a **new chat**, not the chat that built the tool, and open "Tester 2 — grade".
6. Paste in the Spec, these test cases, and the three answers. Label the answers "Test 1", "Test 2" and "Test 3".

## Summary

Retest plan for the Syllabus Study Planner: the three earlier tests are kept the same, except the A4 practice-question check, which now bans every form of a later week's topic word (such as "produced" for "production"). The tests cover a normal economics syllabus with an exam date, a biology syllabus with no exam date (8 weeks assumed), and a two-topic syllabus with the exam in the current week.
