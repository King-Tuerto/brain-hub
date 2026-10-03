# Phase 3 — Source Audit of the Real Deere Answer (run 3)

**Auditor:** Nitpick · **Date:** 2026-10-03 · **Answer:**
`tests/fixtures/real-run/deere/answer.md` (run 3) · **Rules:** PLAN §5.

This was a one-off check over the real network, outside the test suite.

## Result: PASS

| Bar (PLAN §5) | Needed | Got |
|---|---|---|
| Cited URLs that resolve | ≥ 90% | **21 of 21 (100%)** |
| Claims spot-checked | ≥ 12 | **24** |
| Spot checks "not supported" without a fix recorded | 0 | **0** (21 supported, 3 partly supported) |

## Method

- **URL status:** each cited URL was fetched once with `curl -L` and a
  browser User-Agent.
- **Retries:** URLs that refused plain `curl` (403) were fetched again with
  the WebFetch tool.
  - SEC EDGAR refuses requests that lack a declared contact User-Agent.
  - Investing.com blocks bots.
  - Both pages were readable through WebFetch. They are counted as
    resolving, and marked below.
- **Spot checks:**
  - **Text files:** text is quoted from the fetched page.
  - **PDFs:** the 10-K, Fed, Census and Kubota files were extracted with
    `pdftotext` in a scratch folder outside the repo, which keeps nothing.
  - **No summaries:** every check was read against the source text, never
    a model's summary of it. One reason: WebFetch's summary of the AASHTO
    page gave the wrong year (see #14 below). The research agent had
    already noted that same misdating.

## Every cited URL

The hub's `extractSources` returned 22 entries for 21 distinct URLs. Entry 15
is not a real citation: the hub produced it itself (see Finding F1).

| # | URL | curl | Readable via WebFetch |
|---|---|---|---|
| 1 | s22.q4cdn.com/…/Deere-Company-2025-10-K.pdf | 200 | yes (PDF) |
| 2 | sec.gov/…/de-20260820xex99d1.htm (Deere Q3 FY26 release) | 403 (SEC bot policy) | yes |
| 3 | sec.gov/…/de-20251126xex99d1.htm (Deere Q4 FY25 release) | 403 (SEC bot policy) | yes |
| 4 | sec.gov/…/ex991toformcat2q2026earnin.htm (Caterpillar Q2 26) | 403 (SEC bot policy) | yes |
| 5 | investing.com/…/caterpillar-q4-2025-slides-… | 403 (bot block) | yes |
| 6 | fool.com/…/deere-de-q3-2026-earnings-call-transcript/ | 200 | yes |
| 7 | komatsu.jp/en/newsroom/2026/20260428_1 | 200 | yes |
| 8 | volvoce.com/…/volvo-ce-demonstrates-better-earnings-in-q4-2025/ | 200 | yes |
| 9 | kubota.com/ir/financial/release/data/136q4e.pdf | 200 | yes (PDF) |
| 10 | investors.cnh.com/…/Reports-Fourth-Quarter-and-Full-Year-2025-Results | 200 | yes |
| 11 | news.agcocorp.com/2026-02-05-AGCO-REPORTS-… | 200 | yes |
| 12 | aem.org/news/section-232-tariff-changes-… | 200 | yes |
| 13 | naco.org/news/iija-authorities-expire-september-30-… | 200 | yes |
| 14 | aashtojournal.transportation.org/house-passes-senate-cr-…-gov't-funding/ | 200 | yes |
| 15 | aashtojournal…/house-passes-senate-cr-to-extend-federal-gov (truncated, F1) | 200 (the site redirects it) | (not a citation) |
| 16 | news.constructconnect.com/september-2026-data-center-report-… | 200 | yes |
| 17 | federalreserve.gov/…/monetary20260916a1.pdf | 200 | yes (PDF) |
| 18 | agc.org/news/2026/09/03/construction-workforce-shortages-… | 200 | yes |
| 19 | census.gov/construction/nrc/pdf/newresconst.pdf | 200 | yes (PDF) |
| 20 | constructionequipment.com/…/john-deere-hitachi-end-jv | 200 | yes |
| 21 | ftc.gov/…/ftc-states-secure-settlement-deere-company-… | 200 | yes |
| 22 | sec.gov/…/de-20260820xex99d2.htm (Deere Q3 FY26 call slides) | 403 (SEC bot policy) | yes |

## Spot checks (24 claims)

S = supported, P = partly supported.

| # | Claim in the answer (shortened) | Source | Verdict | Evidence |
|---|---|---|---|---|
| 1 | **PPA "What it sells":** large tractors, combines, cotton and sugarcane harvesters, tillage, seeding, spraying, precision tech *(one of the 2 unsourced bullets)* | 10-K (cited on the next bullet) | S | 10-K Item 1 lists 4WD/track and row-crop tractors, harvesters, cotton pickers and strippers, sugarcane harvesters, tillage, seeding and application equipment, and precision technology. The claim is true, but its link sits on the sibling bullet, exactly as the checker reports. |
| 2 | **SAT "What it sells":** utility and compact tractors, hay and forage, mowers, golf and turf, utility vehicles *(the other unsourced bullet)* | 10-K (cited on the next bullet) | S | 10-K: "specialty, utility, and compact tractors, hay and forage equipment… mowers… golf course equipment, utility vehicles". Same situation as #1. |
| 3 | SAT turf products sold through Home Depot and Lowe's | 10-K | S | "mass retailers, including The Home Depot and Lowe's" |
| 4 | Since 1837; incorporated in Delaware in 1958; One John Deere Place, Moline | 10-K | S | Exact text on the cover page and in Item 1. |
| 5 | About 73,100 employees, about 32,500 full-time production | 10-K | S | "approximately 73,100 employees, of which approximately 32,500 were full-time production employees" |
| 6 | C&F products incl. Wirtgen brands (Wirtgen, Vögele, Hamm, Kleemann, Benninghoven, Ciber) | 10-K | S | Brand table and product paragraph. |
| 7 | 10-K's competitor lists (construction and agriculture) | 10-K | S | Both lists match Item 1, "Competition". |
| 8 | Off-road emissions rules in the U.S., EU and India need significant engine and after-treatment spending | 10-K | S | Near-verbatim. |
| 9 | Deere plans hybrid-electric and battery-electric construction equipment | 10-K | S | "we plan to deliver hybrid-electric and battery electric equipment solutions to help customers reduce tailpipe emissions" |
| 10 | FY2025: $45.684bn, down 12% from $51.716bn; net income $5.027bn ($18.50) vs $7.100bn; segment sales and operating profit | Deere Q4 FY25 release | S | All figures match. |
| 11 | Q3 FY26: net income $1.379bn ($5.10), up 7%; revenues $12.608bn, up 5%; FY26 guidance $4.75–5.00bn; "2026 will mark the bottom" | Deere Q3 FY26 release | S | All match. |
| 12 | C&F Q3 sales up 18%, operating profit up 84%, 12.1% margin; 9-month C&F $10.079bn; PPA Q3 $3.998bn, down 6% | Deere Q3 FY26 release | S | All match. |
| 13 | Caterpillar Construction Industries Q2 2026: $8.346bn at a 23.3% margin | Caterpillar 8-K | S | Both match. |
| 14 | Highway programs extended only to 11 Dec 2026, at prorated FY2026 levels | AASHTO Journal | S | The page (published 3 Sept 2026) says from October 1, "the beginning of fiscal year 2027, through December 11", at "prorated FY 2026 levels". WebFetch's summary wrongly said 2027. |
| 15 | IIJA authorities expired 30 Sept 2026 | NACo | S | "set to expire on September 30, 2026" |
| 16 | Section 232 tariffs on certain ag and construction equipment cut from 25% to 15%, 8 June 2026 – 31 Dec 2027 | AEM | S | Matches. |
| 17 | Fed raised the target range to 3.75–4.00% on 16 Sept 2026; inflation elevated | FOMC statement PDF | S | "raise the target range… to 3-3/4 to 4 percent"; "Inflation remains elevated." |
| 18 | August 2026 housing starts 1.275m SAAR, 1.2% below August 2025 | Census NRC PDF | S | "1,275,000… 1.2 percent… below the August 2025 rate". See F3. |
| 19 | 87% of contractors have hourly craft openings; 42% say shortages delayed projects | AGC | S | Both figures match. |
| 20 | Data-center starts $84.1bn through July 2026, nearly three times a year earlier | ConstructConnect | S | Matches. |
| 21 | FTC settlement: 10 years, dealer-level repair tools for farmers and independent shops, farm equipment only | FTC | S | "for the next 10 years"; scope is "Deere farm equipment". |
| 22 | Caterpillar expected about $2.6bn of incremental 2026 tariff costs *(weaker source, run notes)* | Investing.com | S (secondary source) | "approximately $2.6 billion in incremental tariff costs". This is a summary of Caterpillar's slides, not the filing, and the answer says so under Limits. |
| 23 | Deere expects a net tariff headwind of about $750m in FY26 and about $1bn in FY27 *(weaker source: Motley Fool transcript)* | Motley Fool transcript | **P** | The transcript says "$1.1 billion in direct tariffs… less $382 million of refunds… approximately 57 ish", which is garbled. $1.1bn − $382m ≈ **$718m**, so "about $750m" slightly overstates it. The FY27 figure ("right around 1 billion") is supported. |
| 24 | SmartGrade adoption up more than 50% YTD; safety solutions up nearly 40%; backlogs "well into fiscal year 27"; three Deere-designed excavators, "more due through 2030"; rental 30–35% of earthmoving *(Motley Fool)* | Motley Fool transcript | **P** | Everything matches except the timing. The transcript says more excavator models roll out "starting this spring through the next 3 to 4 years". That is roughly 2027–2030, so "through 2030" is a stretch. |

Also checked: Komatsu (¥4,132.8bn, 13.7% margin, both sales and profit
forecast to fall), Volvo CE (SEK 81.6bn vs 88.3bn, 13.3%, L120 Electric
deliveries), CNH (ag adjusted EBIT 6.2%; 2026 ag sales down 5% to flat),
AGCO ($10.1bn, 7.7%, 14 PTx products, Fendt share gains in North America),
Kubota (operating profit down 15.9%, 77.3% overseas, ¥3,150bn forecast),
the Deere–Hitachi JV end (spring 2022, three factories) and the Q3 slides
(global forestry "Down ~10%"). All supported.

**Partly supported, no fix needed (#23 and #24):**
- **#23:** the figure is close, its source is labelled in Limits as a
  third-party transcript, and the transcript itself is garbled at that
  point.
- **#24:** only the date ("through 2030") is soft; every figure checks out.
- **Recorded for students:** call-transcript figures should be confirmed
  against Deere's own slides. This answer already notes, under Limits,
  that it used a Motley Fool transcript.

## Findings

- **F1 — core defect in `extractSources` (`core/lib/output.js`).**
  - **What happens:** a URL containing an apostrophe (`…federal-gov't-funding/`)
    is recorded twice.
    - Once in full, from the Markdown link.
    - Once cut off at the `'` (`…federal-gov`), from the bare-URL pass, whose
      character class excludes `'`.
  - **Where it ends up:** the cut-off entry is saved in
    `metadata.hub.sources`.
  - **Harm:** it happens to resolve on this site only because WordPress
    redirects it; on most sites it would be a broken link.
  - **Fix:** skip bare-URL matches that fall inside an already-matched
    Markdown link.
  - For El Código.
- **F2 — the two unsourced claims are true.** Both "What it sells" bullets
  are supported by the 10-K, which the very next bullet cites. The checker
  is right to flag them (DECISIONS #15), and the student sees both lines.
- **F3 — link rot.** Two citations point at "latest release" files that are
  replaced in place:
  - `census.gov/…/newresconst.pdf` (next release 20 Oct 2026);
  - the Fed statement is dated, so it is fine.

  After 20 Oct, claim #18 will no longer match its link. That doesn't
  affect the tests (no test fetches anything). It is worth a line in the
  student guidance: prefer dated URLs.
- **F4 — bot blocks are not dead links.** Five of the 21 URLs answer 403 to
  a plain script (four on SEC, one on Investing.com), yet all are readable
  in a browser. A future automatic link checker (the Phase 5 Checker)
  must not report these as dead.
