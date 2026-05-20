---
name: preset-sqllab
description: Inspect Preset SQL Lab bootstrap, query history, saved queries, result/export routing, query control, and SQL execution routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-sqllab

Use for SQL Lab capability and query metadata workflows in a resolved Preset workspace.

## Always

- Use `preset-api`, `preset-workspaces`, and when drift or permissions matter `preset-superset` first.
- Default to SQL Lab bootstrap/capability metadata.
- Query history and saved-query reads can expose SQL text; get confirmation before listing or retrieving them.
- Route execution, result retrieval/export, query stop, saved-query mutation, and permalinks to `preset-sql-execution`.

## Decision Rules

- Distinguish query history metadata from SQL text, result retrieval, and execution.
- Require approval before reading SQL text, retrieving results, exporting results, stopping queries, or executing SQL.
- Route saved query, history, result, stop, permalink, and execution requests separately.
- Avoid SQL execution from this skill.

## Workflow Order

1. Inspect SQL Lab bootstrap state.
2. Route history, saved query, result, stop, permalink, and execution request.
3. Prepare approval for sensitive read or execution.
4. Stop before SQL text, result retrieval, export, stop, permalink, saved-query mutation, or execution.

## Retrieve

- Combined SQL Lab routing and approval essentials: [references/history-routing-essentials.md](references/history-routing-essentials.md)
- SQL Lab availability, database options, UI defaults: [references/sqllab-bootstrap.md](references/sqllab-bootstrap.md)
- Query history reads and SQL text exposure: [references/query-history.md](references/query-history.md)
- Saved query reads, mutations, permalinks: [references/saved-queries.md](references/saved-queries.md)
- SQL execution routing: [references/sql-execution.md](references/sql-execution.md)
- Result retrieval and exports: [references/query-results-and-exports.md](references/query-results-and-exports.md)
- Query stop/cancel: [references/query-control.md](references/query-control.md)
