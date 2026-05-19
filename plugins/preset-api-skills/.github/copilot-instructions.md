# Preset Agent Skills

Use the skill files in this package when helping with direct Preset API work. If the user is working through Preset/Superset MCP tools, use the separate `preset-mcp-skills` package instead and do not switch to direct API calls unless the user explicitly approves changing surfaces.

- `skills/preset-api/SKILL.md` for authentication, API conventions, pagination, Rison, and safety policy.
- `skills/preset-workspaces/SKILL.md` for read-only team and workspace discovery, hostname resolution, and workspace membership listing.
- `skills/preset-admin/SKILL.md` for team memberships, workspace lifecycle, invite lifecycle, role identifiers, and audit logs.
- `skills/preset-superset/SKILL.md` for workspace Superset version, OpenAPI, current-user permissions, menu capabilities, and API safety classification.
- `skills/preset-dashboards/SKILL.md` for dashboard, chart, dashboard chart/dataset/tab, screenshot, thumbnail, and chart data routing.
- `skills/preset-datasets/SKILL.md` for database, schema, catalog, table, dataset, column, metric, table metadata, and data-returning dataset routing.
- `skills/preset-sqllab/SKILL.md` for SQL Lab bootstrap, query history, saved queries, and SQL execution safety boundaries.
- `skills/preset-import-export/SKILL.md` for Superset workspace import/export routing.
- `skills/preset-embedding/SKILL.md` for embedded dashboard configuration reads and guest-token/trusted-domain deferrals.
- `skills/preset-guest-tokens/SKILL.md` for embedded dashboard guest-token workflows with explicit approval and token-handling guardrails.
- `skills/preset-embedded-rls/SKILL.md` for embedded row-level security clause review before guest-token creation.
- `skills/preset-sql-execution/SKILL.md` for SQL Lab execution, result retrieval, exports, query stop, saved-query mutations, and SQL Lab permalink creation.
- `skills/preset-database-connections/SKILL.md` for database connection configuration and mutation workflows.
- `skills/preset-roles-permissions/SKILL.md` for role, workspace membership, permission, and access-control changes.
- `skills/preset-destructive-imports/SKILL.md` for destructive or overwrite-capable import workflows.
- `skills/preset-snowflake-cortex/SKILL.md` for Snowflake Cortex account/auth/role setup and Cortex Agent routing.
- `skills/preset-cortex-agents/SKILL.md` for Cortex Agent list, describe, create, update, delete, run, streaming, and SQL-wrapper workflows.

Default to metadata reads. Some `GET` endpoints can expose customer data, SQL text, database connection configuration, or database structure, including chart data, table samples, SQL Lab results, query history, saved queries, distinct values, and exports. Before any mutation, data-returning read, SQL text read, database connection configuration read, audit download, SQL execution, Cortex Agent execution, import, export, role/RLS change, database connection change, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.

Treat broad `SKILL.md` files as routing boundaries and focused `references/` files as task/risk context-loading boundaries. Load only the reference needed for the user request.
