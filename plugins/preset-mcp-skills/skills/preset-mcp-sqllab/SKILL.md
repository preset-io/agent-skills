---
name: preset-mcp-sqllab
description: Use Superset MCP tools for SQL execution, SQL Lab links, and saved SQL queries. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-sqllab

Use for SQL Lab workflows through MCP.

## Always

- Use MCP tools only; do not switch to SQL Lab REST endpoints.
- Resolve exact table and column names with `get_dataset_info` (or a prior result) before writing SQL; never guess names or casing.
- Run read-only SELECT queries directly when the target is unambiguous; do not ask for confirmation first.
- Confirm before executing SQL that writes or alters data (INSERT/UPDATE/DELETE/DDL), or when multiple databases plausibly match.
- Use `open_sql_lab_with_context` when the user wants a prefilled SQL Lab link rather than execution.
- Use `save_sql_query` only when the user wants a persistent saved query.

## Decision Rules

- Execute now: `execute_sql`.
- Open editor with context: `open_sql_lab_with_context`.
- Save for later: `save_sql_query`.
- Chart from SQL: route to `preset-mcp-datasets` for `create_virtual_dataset`, then `preset-mcp-visualization`.
- Dataset metric/dimension query without raw SQL: use `preset-mcp-data` / `query_dataset`.

## Workflow Order

1. Resolve the schema first: `get_dataset_info` for the dataset's exact table, columns, and database ID.
2. Write the SQL against those exact names and execute once with `execute_sql`.
3. Use a SQL Lab link instead when execution is not necessary.
4. Keep result output concise.
5. Save SQL only after the user asks for persistence.

## Retrieve

- SQL Lab workflows: [references/sqllab-workflows.md](references/sqllab-workflows.md)
