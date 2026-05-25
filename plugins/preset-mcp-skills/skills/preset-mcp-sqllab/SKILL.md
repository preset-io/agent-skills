---
name: preset-mcp-sqllab
description: Use Superset MCP tools for SQL execution, SQL Lab links, and saved SQL queries. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-sqllab

Use for SQL Lab workflows through MCP.

## Always

- Use MCP tools only; do not switch to SQL Lab REST endpoints.
- Treat SQL execution as high impact because SQL can mutate data depending on database permissions.
- Confirm the target database and exact SQL when they are not already explicit.
- Use `open_sql_lab_with_context` when the user wants a prefilled SQL Lab link rather than execution.
- Use `save_sql_query` only when the user wants a persistent saved query.

## Decision Rules

- Execute now: `execute_sql`.
- Open editor with context: `open_sql_lab_with_context`.
- Save for later: `save_sql_query`.
- Chart from SQL: route to `preset-mcp-datasets` for `create_virtual_dataset`, then `preset-mcp-visualization`.
- Dataset metric/dimension query without raw SQL: use `preset-mcp-data` / `query_dataset`.

## Workflow Order

1. Resolve database ID through discovery if missing.
2. Use SQL Lab link when execution is not necessary.
3. Execute only the requested SQL against the requested database.
4. Keep result output concise.
5. Save SQL only after the user asks for persistence.

## Retrieve

- SQL Lab workflows: [references/sqllab-workflows.md](references/sqllab-workflows.md)
