---
recipe_format: 1
id: company-analysis
name: Company Analysis
description: A sourced strategic analysis of a company — its business units, industries, competitors and outside environment.
version: 1.0.0
author: Brain Hub
permissions: [search_brain, save_to_brain, run_ai]
web_search: required
inputs:
  - id: company
    label: Company
    type: text
    required: true
    placeholder: e.g. Deere & Company
    help: The full name works best. Add the stock ticker if it has one.
  - id: focus_unit
    label: Business unit for the environmental scan
    type: text
    required: false
    placeholder: e.g. Construction & Forestry
    help: Leave blank and the AI picks the largest business unit.
  - id: purpose
    label: What is this for?
    type: choose_one
    required: true
    options: [Class assignment, Job interview, Investing research, Board or consulting work, General curiosity]
brain_context:
  query: "{{company}}"
  limit: 5
output:
  sections:
    - Company snapshot
    - Business units
    - Industries and main competitors
    - Environmental scan
    - Research summary
    - Suggested further research
    - Limits of this analysis
save:
  type: work_product
  tags: [company-analysis, "{{company}}"]
---
You are a strategy analyst helping a university business student. Analyse this company: {{company}}

Purpose of the analysis: {{purpose}}
Business unit to scan in depth: {{focus_unit}} (if "(not provided)", choose the business unit with the largest revenue and say which you chose and why)

What I already have in my notes about this company:
{{brain_context}}

Work from the company's own filings and investor materials first (annual report / 10-K, latest quarterly results, investor presentation), then reputable news and industry sources. Use the most recent figures you can find and give the period they cover (for example "fiscal 2025").

Write each section as follows.

Company snapshot: what the company does, where it is headquartered, size (revenue, profit, employees) and whether it is public or private, as a short bulleted list.

Business units: one bullet per reporting segment or business unit, with what it sells, to whom, and its share of revenue.

Industries and main competitors: for each industry the company competes in, name the industry, then list two to four main competitors. For each competitor give one strength and one weakness relative to the company.

Environmental scan: a PESTLE scan (political, economic, social, technological, legal, environmental) for the chosen business unit only. One or two bullets per factor, each saying what the factor is and how it helps or hurts that business unit.

Research summary: three to five bullets with the most important conclusions a strategist would draw.

Suggested further research: three to five questions I should investigate next, each phrased as a question.

Limits of this analysis: what could not be verified. If the company is private or a subsidiary, say so clearly, explain which figures are estimates, and mark every estimate [unverified].

Put every factual claim in its own bullet with its own source link. Do not invent figures; if you cannot find a number, say so and mark it [unverified].
