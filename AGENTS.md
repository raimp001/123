# SciFlowLabs — Agent & AI Conventions

Guidelines for AI coding assistants (Cursor, etc.) working on this codebase. Inspired by patterns from [system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools).

## Communication

- **Clarity over brevity.** Optimize for skimmability; use `###` headings, **bold** for key terms, bullet points for lists.
- **Never refer to tool names.** Describe actions naturally (e.g. "I'll search the codebase" not "I'll use codebase_search").
- **State assumptions and continue.** Avoid optional confirmations like "let me know if that's okay" unless blocked.
- **Code citations:** Use the format `\`\`\`startLine:endLine:path/to/file.tsx\`\`\`` when referencing code in the repo.

## Code Style

- **Naming:** Use descriptive names. Functions = verbs; variables = nouns. Avoid 1–2 char names.
- **Control flow:** Prefer guard clauses and early returns. Handle errors and edge cases first.
- **Error handling:** Never catch without meaningful handling. Avoid swallowing errors.
- **Comments:** Explain "why" not "how." No inline comments; use docstrings or block comments above.
- **Formatting:** Match existing style. Prefer multi-line over complex ternaries. Wrap long lines.

## Project Structure

- **API routes:** `app/api/*/route.ts` — Next.js App Router conventions.
- **Database:** Supabase (PostgreSQL). Schemas in `lib/db/`. Use `createClient()` (server) or `createClient()` from `@/lib/supabase/client`.
- **Lab fields:** Canonical columns are `institution_affiliation`, `location_country`, `description`, `specializations`. Use `toCanonicalLabWrite()` from `lib/normalize/lab.ts` before writes.
- **Bounties:** State machine in `lib/machines/bounty-machine.ts`. OpenClaw pre-screens new bounties.

## Key Concepts

| Term | Meaning |
|------|---------|
| Bounty | Funded research project. Funders post; labs propose and deliver milestones. |
| Escrow | Locked funds until milestone approval. |
| Staking | USDC labs lock when proposing; slashable on breach. |
| Verification tier | Lab trust level: unverified, basic, verified, trusted, institutional. |
| OpenClaw | Automated ethics/safety screening for bounties. |

## When Editing

- Run `read_lints` on edited files. Fix linter errors before finishing.
- Prefer parallel tool calls when gathering context (read multiple files at once).
- If a task spans multiple steps, use a todo list; mark completed before reporting.
