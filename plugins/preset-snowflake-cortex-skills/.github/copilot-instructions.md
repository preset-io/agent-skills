# Preset Snowflake Cortex Skills

Use the skill files in this package when helping with explicit direct Snowflake Cortex Agent REST and SQL work. Do not use this package for Preset/Superset MCP tool workflows or for Preset Management API and Superset workspace API work, and do not switch to direct API calls unless the user explicitly approves changing surfaces.

Surface selection:

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Stay on the available MCP tooling or ask whether to switch surfaces.
- Use this package only when the user asks for Snowflake Cortex Agent account, authentication, privilege, agent management, agent run, or SQL wrapper workflows.
- Preset Management API and Superset workspace API work belongs to `preset-api-skills`.

- `skills/preset-snowflake-cortex/SKILL.md` for Snowflake Cortex account/auth/role setup and Cortex Agent routing.
- `skills/preset-cortex-agents/SKILL.md` for Cortex Agent list, describe, create, update, delete, run, streaming, and SQL-wrapper workflows.

Gates scale with blast radius, reversibility, and disclosure sensitivity. Readiness checks and agent list/describe calls run directly. Require explicit confirmation before any Cortex Agent run and before creating, updating, replacing, or dropping an agent object, after summarizing the account, role, agent, query, tools, warehouse, budget, output handling, and rollback path. Never print Snowflake credentials or tokens.

Treat broad `SKILL.md` files as routing boundaries and focused `references/` files as task/risk context-loading boundaries. Load only the reference needed for the user request.
