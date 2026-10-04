# Brain Hub — Widget Guide (recipe format v1, guide v1.1)

**v1 approved October 3, 2026 (end of Phase 1). v1.1 revisions approved by
Paul the same day after the Phase 4 test** (DECISIONS #16–#18). Recipes
written for v1 still work.

This document is written for an AI. A student pastes it into Claude, ChatGPT,
or any other AI and asks for a tool. Follow it exactly. A recipe that follows
these rules installs and runs with no hand-fixing.

---

## 1. What you are writing

A **recipe**: one plain-text file that describes a tool. It contains no code.
The hub reads it and does everything else: it draws the form, searches the
student's brain, builds the prompt, runs the AI (or hands the prompt to the
student to paste), shows the result, and saves it if the student asks.

A recipe is data, not a program. **Never** put JavaScript, HTML tags, or
links to scripts in a recipe. The hub will refuse it.

**A recipe is shared.** Students pass tools to each other, so everyone who
installs this recipe sends its prompt as their own. Write the prompt for
"the student using this tool", never for one named person:

- **Wrong:** "I'm Maria Lopez".
- **Right:** "I'm a university student".

Put the author's name only in the `author` field.

## 2. File shape

The file is named `<id>.recipe.md`. It has two parts:

1. **Front matter:** YAML between two `---` lines at the very top. This
   describes the tool.
2. **Body:** everything after the second `---`. This is the prompt template.

```
---
(front matter: YAML)
---
(prompt template: plain text with {{placeholders}})
```

Output **only** the file contents. No commentary before or after it, and
don't wrap it in a code fence.

## 3. Front matter fields

| Field | Required | Rules |
|---|---|---|
| `recipe_format` | yes | Always `1`. |
| `id` | yes | Lowercase letters, digits and dashes, 3–40 characters, starting with a letter. Must match the file name. Example: `networking-prep`. |
| `name` | yes | Shown on the tile. 40 characters max. |
| `description` | yes | One sentence saying what the student gets. 160 characters max. |
| `version` | yes | `MAJOR.MINOR.PATCH`, starting at `1.0.0`. |
| `author` | yes | The student's name or handle. This is the only place a personal name belongs. |
| `permissions` | yes | A list drawn **only** from: `search_brain`, `save_to_brain`, `run_ai`. See §6. |
| `web_search` | yes | `required`, `helpful` or `none`. See §6a. |
| `sourcing` | no | `facts` (the default) or `advice`. See §6b. |
| `inputs` | yes | 1–8 fields. See §4. |
| `brain_context` | no | What to search the brain for. See §5. Requires `search_brain`. |
| `output` | yes | `sections:` a list of 2–10 heading names the answer must contain, in order. |
| `save` | no | How results are saved. See §7. Requires `save_to_brain`. |

Any other field is an error.

## 4. Inputs

Each input is a list item with these keys:

| Key | Required | Rules |
|---|---|---|
| `id` | yes | Lowercase letters, digits and underscores. Unique in this recipe. Used as `{{id}}` in the template. |
| `label` | yes | The question shown to the student. Keep it short; phones are narrow. Don't write "(optional)": the hub adds it to every input with `required: false`. |
| `type` | yes | One of `text` (one line), `long_text` (a paragraph or pasted document), `choose_one`, `number`. |
| `required` | yes | `true` or `false`. |
| `options` | only for `choose_one` | A list of 2–12 short strings. |
| `help` | no | One line of guidance under the field. |
| `placeholder` | no | Example text shown greyed out in the box. |

**Optional inputs.** When the student leaves an optional input blank, the
hub fills its placeholder with `(not provided)`. For every optional input,
the body must say what the AI should do then. For example: "If my
weaknesses are (not provided), cover the two most common gaps for this kind
of role and say that is what you did."

## 5. Brain context (optional)

```yaml
brain_context:
  query: "{{company}}"
  limit: 5
```

- **Keep `query` to 1–3 distinctive words, or a single input placeholder.**
  Some brains search by keyword only (when their AI search is unavailable),
  and then **every word in the query must appear in the same note**. A query
  like "resume background skills experience" almost never matches; "resume"
  or `{{company}}` does.
- **Prefer an input placeholder**, such as the company, the event or the
  course, over generic words. It finds the student's own earlier work on the
  same subject.
- `limit` is 1–10. The default is 5.
- The hub runs the search **before** building the prompt and puts the results
  where the template says `{{brain_context}}`.
- With no brain connected, or nothing found, `{{brain_context}}` becomes
  `(No personal notes available.)`. Write the template so it still makes
  sense then, and never ask the AI to fill the gap with guesses about the
  student.

## 6. Permissions

| Permission | Allows |
|---|---|
| `search_brain` | Run the `brain_context` search. Required if `brain_context` is present. |
| `save_to_brain` | Show the "Save to brain" button. Required if `save` is present. |
| `run_ai` | Send the prompt to the AI automatically (Automatic mode). Without it, the tool only offers copy-paste. |

Building the prompt and downloading the result are always allowed. Ask only
for what the tool needs.

**Before installing, the student sees an install summary** that shows:

- each permission, in plain English;
- the exact `brain_context` query, with inputs shown as `[their label]`;
- the `web_search` and `sourcing` settings;
- a warning when a recipe asks for both `search_brain` and `run_ai`:
  *"In Automatic mode, notes from your brain are sent to OpenRouter and the
  AI company behind the model you picked."*

So keep the query narrow, and don't ask for `search_brain` unless the tool
really uses the student's notes.

## 6a. Web search

| Value | Use when | What the hub does |
|---|---|---|
| `required` | The answer is only useful with **current facts from the web**: a real company's results, an event, prices, news, laws. | **Automatic mode with paid search on:** turns on OpenRouter web search. **Automatic mode with paid search off:** warns before running and steers the student to Manual mode, where their AI app searches the web for free. **Manual mode:** adds a line to the prompt telling the AI to search the web and cite what it finds. |
| `helpful` | The tool works from what the student pasted, and **looking things up improves it**. Example: interview prep from a pasted job posting, where researching the employer adds value. | Same as `required`, except that with paid search off it runs without search and labels the result "no web search". |
| `none` | The tool **only reworks what the student gave it**: rewriting, summarising, formatting, quizzing. | Never searches. |

How to choose:
- Pick `required` only if the answer would be wrong or empty without the
  web.
- `required` makes the AI promise sources. An AI app that can't browse may
  then invent links. When the student's own input is the main material,
  choose `helpful`.
- Paid search costs money per call, so it's off until the student turns it
  on in Settings.

## 6b. Sourcing

| Value | Use when | What the hub asks of the AI and checks |
|---|---|---|
| `facts` (default) | Research and analysis tools, where the answer is mostly claims about the world. | Every factual claim needs a source link or `[unverified]`. The hub counts every list item, table row and paragraph. |
| `advice` | Coaching tools, where the answer is mostly recommendations: interview prep, study plans, writing feedback. | Only factual statements need sources: figures, dates, names, statistics, claims about real organisations. The hub counts only lines containing a figure, a percentage or an amount (ignoring `[placeholders]`), so an invented statistic is still caught, and suggested wording in quotation marks is not counted. |

## 7. Save rules (optional)

```yaml
save:
  type: work_product
  tags: [networking, "{{event_name}}"]
```

- `type` is one of: `work_product`, `personal_note`, `job_history`, `profile`.
- If `type` is `profile`, add `profile_part:` with one of: `skills`,
  `experience`, `job-history`, `education`, `goals`.
- `tags` is a list of 1–5 short tags. Tags may use input placeholders.
- Never write the summary yourself. The hub tells the AI to finish every
  answer with a `## Summary` section, and saves that.
- The hub never saves on its own. The student presses the button.

## 8. The prompt template (the body)

Write it as instructions to an AI, in the voice of "the student using this
tool" (see §1). You may use:

| Placeholder | Becomes |
|---|---|
| `{{<input id>}}` | What the student typed. An empty optional input becomes `(not provided)` (see §4). |
| `{{brain_context}}` | The brain search results, or the no-notes text from §5. |
| `{{today}}` | Today's date, `YYYY-MM-DD`. |

**Don't** write rules about sources, section order, the summary or invented
facts. The hub appends a standard block to every prompt that:

- requires the `output.sections` headings, in order, as `##` headings;
- requires sources as set by `sourcing` (§6b), with anything unsourced
  marked `[unverified]`;
- tells the AI to start statements about its own method, or about what it
  couldn't verify, with `Note:`. Those don't need a source;
- **tells the AI never to invent facts about the student** (numbers,
  achievements, dates, names). It must use a placeholder like `[your number]`
  instead. That includes example sentences the student might copy, such as
  sample resume bullets: every number in them must be a placeholder like
  `[X%]`;
- requires a final `## Summary` of 2–3 sentences.

The hub then checks the answer:
- **Sources:** it counts which claims have one. Labels (a short line that's
  entirely bold), questions, lead-ins ending in `:` and `Note:` lines aren't
  counted.
- **Sections:** it checks every section is there.
- **Shortfalls:** it shows any gap to the student.

Repeating the standard rules in the template is harmless, but it wastes
space.

Any `{{...}}` that isn't listed above is an error.

## 9. Validation (the hub checks all of this when installing)

1. Front matter parses as YAML, and every required field is present.
2. `recipe_format` is `1`. `id` matches the file name and the pattern in §3.
3. Every `{{placeholder}}` in the body and in `brain_context.query` or
   `save.tags` is either an input `id`, `brain_context`, or `today`.
4. `brain_context` is present only if `search_brain` is in `permissions`.
   The same goes for `save` and `save_to_brain`.
5. No `<script`, `<iframe`, `javascript:` or other HTML tags anywhere.
6. Limits are respected: 1–8 inputs, 2–10 sections, 1–5 tags, file under
   20 KB.
7. `web_search` is one of `required`, `helpful`, `none`. `sourcing`, if
   present, is `facts` or `advice`.

The hub **can't** check the rules in §1, §4 and §5 about names, optional
inputs and narrow queries. Check those yourself; §11 lists them.

## 10. Complete example

```
---
recipe_format: 1
id: networking-prep
name: Networking Prep
description: Get ready for a networking event — who to meet, what to say, what to ask.
version: 1.0.0
author: Paul Waterman
permissions: [search_brain, save_to_brain, run_ai]
web_search: required
inputs:
  - id: event_name
    label: Event name
    type: text
    required: true
  - id: event_details
    label: Paste the event page or invite
    type: long_text
    required: false
    help: Speakers, companies attending, agenda — whatever you have.
  - id: goal
    label: Main goal
    type: choose_one
    required: true
    options: [Find a job, Find a mentor, Learn an industry, Meet founders]
brain_context:
  query: "{{event_name}}"
  limit: 5
output:
  sections: [Who to meet, My 30-second introduction, Questions to ask, Follow-up plan]
save:
  type: work_product
  tags: [networking, "{{event_name}}"]
---
I'm a university student going to a networking event on {{today}}.

Event: {{event_name}}
Details: {{event_details}}
My main goal: {{goal}}

What I already know about myself and my contacts:
{{brain_context}}

If the details are (not provided), research the event from its name alone
and say what you could not find.

Research the event and the organisations attending. Tell me who is most worth
meeting given my goal, write a 30-second introduction in my voice using only
what you know about me, give me five specific questions that show I did my
homework, and give me a follow-up plan for the week after.
```

## 11. Before you hand it over

- [ ] Output is only the file, starting with `---`.
- [ ] Every input `id` used in the body exists, and every placeholder is valid.
- [ ] Permissions match what the recipe uses.
- [ ] `web_search` is chosen with §6a: `required` only if the answer needs
      the web.
- [ ] `sourcing: advice` if the tool mostly gives recommendations (§6b).
- [ ] The body names no real person. It speaks as "the student using this
      tool" (§1).
- [ ] The body says what to do with each optional input left blank (§4).
- [ ] `brain_context.query` is 1–3 distinctive words or one placeholder (§5).
- [ ] The template still makes sense when there's no brain, without guessing
      about the student.
- [ ] Tell the student the file name, `<id>.recipe.md`, and that it goes in
      the `plugins/` folder of their copy of the hub. Nothing else needs
      editing; the hub finds it on its own.
