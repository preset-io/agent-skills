# Preset Agent Skills

This package contains installable Preset API skills for OpenAI Codex and other agent clients.

Use these skills only for explicit direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. Do not use this package for Preset/Superset MCP tool workflows, and do not switch from MCP tools to direct API calls unless the user explicitly approves changing surfaces.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Stay on the available MCP tooling or ask whether to switch surfaces.
- Use this package only when the user asks for direct API calls, API credentials, REST endpoints, curl/Python requests, Superset workspace API inspection, or Snowflake Cortex API/operator workflows.
- If an MCP workflow lacks the needed capability, stop and ask whether to switch to direct API. Do not silently escalate.

## Skill Routing

Use the `skills/*/SKILL.md` files as the canonical instructions:

- `skills/preset-api/SKILL.md` - authenticate with the Preset Management API and prepare safe API access. Required before all other Preset API skills.
- `skills/preset-workspaces/SKILL.md` - list teams and workspaces, resolve workspace hostnames, inspect workspace status, and list workspace membership.
- `skills/preset-admin/SKILL.md` - manage team memberships, workspace lifecycle, invite lifecycle, role identifiers, and audit logs with guarded mutations.
- `skills/preset-superset/SKILL.md` - inspect workspace Superset version, OpenAPI, current-user permissions, menu capabilities, and API safety classification.
- `skills/preset-dashboards/SKILL.md` - inspect dashboards, charts, dashboard charts/datasets/tabs, thumbnails/screenshots, and chart data safety boundaries.
- `skills/preset-datasets/SKILL.md` - inspect database connections, schemas, catalogs, tables, datasets, columns, metrics, table metadata, and data-returning dataset boundaries.
- `skills/preset-sqllab/SKILL.md` - inspect SQL Lab bootstrap, query history, saved queries, and SQL execution safety boundaries.
- `skills/preset-import-export/SKILL.md` - route Superset workspace import/export workflows with disclosure and mutation gates.
- `skills/preset-embedding/SKILL.md` - inspect embedded dashboard configuration and route guest-token/trusted-domain workflows to security-sensitive review.
- `skills/preset-guest-tokens/SKILL.md` - create and route embedded dashboard guest-token workflows with explicit approval and token-handling guardrails.
- `skills/preset-embedded-rls/SKILL.md` - review embedded row-level security clauses before guest-token creation.
- `skills/preset-sql-execution/SKILL.md` - run or route SQL Lab execution, result retrieval, exports, query stop, saved-query mutations, and SQL Lab permalink creation with explicit approval.
- `skills/preset-database-connections/SKILL.md` - inspect or route database connection configuration and mutations with credential-aware approval.
- `skills/preset-roles-permissions/SKILL.md` - review and route role, workspace membership, permission, and access-control changes.
- `skills/preset-destructive-imports/SKILL.md` - review and route destructive or overwrite-capable import workflows.
- `skills/preset-snowflake-cortex/SKILL.md` - prepare Snowflake Cortex account/auth/role context and route Cortex Agent workflows.
- `skills/preset-cortex-agents/SKILL.md` - list, describe, create, update, delete, and run Snowflake Cortex Agents with guarded execution.

Detailed examples live in each skill's `references/` directory. Load only the reference files needed for the user's task. Broad `SKILL.md` files are routing and discovery boundaries; focused references are task/risk context-loading boundaries.

## Client Entry Points

- OpenAI Codex: `.codex-plugin/plugin.json` plus this `AGENTS.md`.
- Claude Code: `.claude-plugin/plugin.json` plus `skills/*/SKILL.md`; `CLAUDE.md` mirrors this package guidance for direct repository readers, but it is not plugin-loaded context.
- Cursor: `.cursor-plugin/plugin.json`.
- GitHub Copilot: `.github/copilot-instructions.md`.

## Safety Policy

Default to metadata reads. Some `GET` endpoints can expose customer data, SQL text, database connection configuration, or database structure, including chart data, table samples, SQL Lab results, query history, saved queries, distinct values, and exports. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, Cortex Agent execution, SQL result retrieval, chart data retrieval, table sample retrieval, query-history retrieval, saved-query retrieval, database connection configuration retrieval, distinct-value retrieval, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.

Do not expose credentials, client secrets, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, or signed guest tokens.
