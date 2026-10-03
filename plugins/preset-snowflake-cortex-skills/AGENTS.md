# Preset Snowflake Cortex Skills

This package contains installable Snowflake Cortex Agent skills for OpenAI Codex and direct repository readers.

Use these skills only for explicit direct Snowflake Cortex Agent REST and SQL workflows. Do not use this package for Preset/Superset MCP tool workflows, and do not use it for Preset Management API or Superset workspace API work. Do not switch from MCP tools to direct API calls unless the user explicitly approves changing surfaces.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Stay on the available MCP tooling or ask whether to switch surfaces.
- Use this package only when the user asks for Snowflake Cortex Agent account, authentication, privilege, agent management, agent run, or SQL wrapper workflows.
- Preset Management API and Superset workspace API work belongs to the separate `preset-api-skills` package. This package does not use Preset credentials.
- If an MCP workflow lacks the needed capability, stop and ask whether to switch to direct API. Do not silently escalate.

## Skill Routing

Use the `skills/*/SKILL.md` files as the canonical instructions:

- `skills/preset-snowflake-cortex/SKILL.md` - prepare Snowflake Cortex account/auth/role context and route Cortex Agent workflows. Use first.
- `skills/preset-cortex-agents/SKILL.md` - list, describe, create, update, delete, and run Snowflake Cortex Agents with guarded execution.

Detailed examples live in each skill's `references/` directory. Load only the reference files needed for the user's task.

## Client Entry Points

- OpenAI Codex: `.codex-plugin/plugin.json` plus this `AGENTS.md`.
- Claude Code: `.claude-plugin/plugin.json` plus `skills/*/SKILL.md`; Claude plugin installs do not load package-level `AGENTS.md` or `CLAUDE.md` context.
- Gemini CLI: `skills/*/SKILL.md` (this `AGENTS.md` is only for legacy context imports).
- Direct repository readers: this `AGENTS.md`.
- Cursor: `.cursor-plugin/plugin.json`.
- GitHub Copilot: `.github/copilot-instructions.md`.

## Safety Policy

Gates scale with blast radius, reversibility, and disclosure sensitivity. Readiness checks and agent list/describe calls run directly. Require explicit confirmation before any Cortex Agent run and before creating, updating, replacing, or dropping an agent object: summarize the account, role, agent, query, tools, warehouse, budget, output handling, and rollback path first. When an account, role, agent, output destination, or credential boundary cannot be proven from trusted context, fall back to confirmation. The full checklist is in `skills/preset-snowflake-cortex/references/cortex-safety.md`.

Do not expose Snowflake PATs, private keys, OAuth tokens, signed JWTs, session tokens, or governed data returned by agent runs.
