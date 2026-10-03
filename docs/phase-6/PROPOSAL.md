# Phase 6 — Brain Connector Tools: What It Would Change (proposal, not started)

**Author:** El Código · **Date:** 2026-10-03 · **Status:** waiting for Paul.

Paul told Claude to stop before Phase 6. It changes the brain connector,
which lives in **other repos**, and the repo rule says Claude only edits
`brain-hub`. Everything below came from reading, not editing:
`open-brain-express` main @ `14890f1`, plus vendor documentation checked on
2026-10-03.

## Goal (spec §13, Phase 6)

Add "list hub tools" and "get hub tool" to the brain's connector, so that
from the **Claude phone app**, "run a company analysis on X" works and saves
to the brain.

## The finding that shapes everything: auth

**Today:**
- The Express connector (`supabase/functions/open-brain-mcp/index.ts`) is
  deployed with `--no-verify-jwt`.
- It guards itself with one shared secret, `MCP_ACCESS_KEY`, which has to
  arrive in an **`Authorization` header**.
- Students connect **Claude Desktop** through `mcp-remote` with
  `--header Authorization:...` (Session-3-Connect).

**Phones can't do that.** Custom connectors in the Claude apps (web,
Desktop, Cowork and mobile) and in ChatGPT authenticate with **OAuth or no
authentication**. There's no field to type a custom header. So the current
key-in-header connector can't be added from a phone at all.

Vendor facts, checked October 3, 2026:
- **Claude:**
  - Custom connectors (remote MCP) work on Free (one connector), Pro, Max,
    Team and Enterprise.
  - Adding them on mobile is in beta; web and Desktop are the main path.
  - Claude connects from Anthropic's cloud, so the server must be public.
  - Auth is OAuth.
  - Sources: [Get started with custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp),
    [Use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities).
- **ChatGPT:**
  - Custom MCP connectors support OAuth, No Authentication or Mixed.
  - Full MCP was first rolled out to Business, Enterprise and Edu, and
    OpenAI now says all eligible users can connect custom MCP servers.
  - Workspace admins may have to enable it.
  - Source: [Developer mode and MCP apps in ChatGPT](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt).
- **Re-verify** these at the start of the build; they move fast.

### Auth options — **⚑ Paul decides**

| Option | How | Security | Work |
|---|---|---|---|
| **A. OAuth via Supabase Auth** | The connector becomes an OAuth-protected MCP server; students sign in with their brain's email and password. | Best: per-user, revocable, no shared secret. | Most. Needs Supabase's OAuth server support (verify it's available on the free plan) or a small OAuth bridge, plus the MCP auth discovery endpoints. |
| **B. Secret URL** | Authless connector at `…/open-brain-mcp/k/<long random key>`. The key lives in the path. | Weaker: anyone with the URL has full brain access, and URLs leak more easily than headers (logs, screenshots). Mitigations: a long random key, a one-step rotate instruction, and read-only by default. | Small. |
| **C. Desktop only** | Keep the header key; add the hub tools for Claude Desktop only. | Unchanged. | Smallest, but fails the spec's "from the phone app". |

**Recommendation:** **B for the Phase 7 pilot, A before wider rollout.**

Whichever is chosen, the connector should get a **separate key** for hub
tools rather than reusing `MCP_ACCESS_KEY`, so a leaked phone URL can be
rotated without breaking Desktop.

## Changes by repo

### 1. `open-brain-express` (the student brain) — the main change

**Connector** (`supabase/functions/open-brain-mcp/index.ts`, 316 lines
today):
- **New tool `list_hub_tools`:** reads the student's hub fork. It returns
  id, name, description and inputs for core and plugin tools. It never
  returns tools from any repo other than the configured one.
- **New tool `get_hub_tool(id)`:** returns the recipe plus a "runbook" that
  tells Claude:
  1. ask the student for each input;
  2. call `search_brain` with the recipe's query;
  3. fill the template;
  4. **append the hub's standard block verbatim** (single source, below);
  5. answer;
  6. offer to save.
- **New tool `save_hub_result(tool_id, inputs, summary, report, sources)`:**
  writes the **same row shape the hub writes**:
  - `source: 'brain-hub'`;
  - `metadata.hub` (with `tool`, `tool_version`, `type`, `tags`, `report`,
    `sources` and `source_check`);
  - the summary plus the context line (DECISIONS #13);
  - through `_shared/save-thought.ts`, so it upserts on the dedup index.

  The existing `add_thought` would save the wrong shape, and the hub
  wouldn't show the result.
- **New secret `HUB_REPO`** (`owner/repo`). It's set once, like
  `OWNER_USER_ID`; the connector never accepts it as a tool argument.
- **Optional secret `GITHUB_TOKEN`** (fine-grained, public read).
  Unauthenticated GitHub API calls are limited to 60 an hour per IP, and
  Supabase's edge functions share outbound IPs, so the limit could run out
  for reasons no student can see.
  - **Fallback:** read `core/tools/index.json` and `plugins/plugins.json`
    through `raw.githubusercontent.com`, which isn't rate-limited the same
    way. But that brings back the manifest students were promised they'd
    never edit.
  - **⚑ Paul decides:** require the token, or accept the fallback.
- **Auth change:** per the option chosen above.

**Docs:** Session-3-Connect (add a "phone" path), UPGRADE (the new secrets,
redeploy), TROUBLESHOOTING (connector symptoms).
- **All in English AND Spanish.** The brain has recorded parity failures
  between the language versions before, so compare content, not block
  counts.

**Tests:** extend the repo's tests. Deno unit tests for the three tools,
plus a PGlite run of `save_hub_result` against the real migration. That's
the same method as the hub's stand-in, and needs no Supabase project.

### 2. `open-brain-student` (the course)

- **What changes:** if the course level that builds the connector
  (`open-brain-mcp`) is still taught, it needs the same three tools and auth
  change. Otherwise students who took the course get a connector that can't
  run hub tools.
- **Watch out:** the brain records that Student previously fell about nine
  days behind Express because ports weren't carried over. Scope Phase 6 to
  **both** repos from the start.
- Its default branch is `master`.

### 3. `Open-Brain` (Paul's own brain) — optional

- **Not needed for students.** Paul's connector is a different, persona-aware
  server.
- **Only if** Paul wants to run hub tools from his own phone.
- **Hazards if it's touched:** the standing hazards in its CLAUDE.md apply
  in full. Never `db push`; drop function overloads by name; redeploy every
  reader.

### 4. `brain-hub` (this repo) — allowed now, small

- **Single source for the standard rules.** The rule strings (the source,
  Note and no-invention rules, and the Summary line) move from
  `core/lib/prompt.js` into `core/rules.json`. Both the hub and the
  connector read that file (the connector from the fork's raw URL), so the
  phone path and the hub can never drift apart.
- **Settings:** add a "Use your tools from your phone" card with the
  connector steps.
- **Tests:** the rules file, and a contract test pinning `save_hub_result`'s
  row shape to `buildSaveRow`'s.

## Other risks

- **Prompt injection through recipes.** `get_hub_tool` hands recipe text to
  Claude as instructions.
  - **Why it's acceptable:** the recipes come only from the student's own
    configured repo, which is the same trust the hub's own-fork rule
    assumes.
  - **What would break it:** a `HUB_REPO` pointed at a classmate's repo
    would need the same review step the hub has (DECISIONS M5/R1). The
    connector can't show a review screen, so it should refuse to serve
    recipes that changed since a stored hash until the student re-approves
    them in the hub.
- **Citation check on the phone.** The Checker works the same way: the
  Claude app has web access, so the phone path may actually be *better* at
  the citation check.
- **The pilot can't prove all of this.** It can prove the student
  experience, but the plan-by-plan availability should be re-checked on
  the day.

## Decisions waiting for Paul

1. **Auth:** A (OAuth), B (secret URL, recommended for the pilot) or C
   (Desktop only).
2. **GitHub access:** require `GITHUB_TOKEN`, or accept the manifest
   fallback.
3. **Scope:** Express and Student together (recommended), and whether
   Paul's own brain is included.
4. **Permission:** for Claude to edit those repos for Phase 6, which lifts
   the repo rule for named repos only.

## Rough size

- **Option B:** one to two sessions per repo (Express, then a Student port),
  plus a small hub change.
- **Option A:** add one to two sessions for OAuth.
