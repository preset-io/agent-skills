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

## Retrieve

- SQL Lab availability, database options, UI defaults: [references/sqllab-bootstrap.md](references/sqllab-bootstrap.md)
- Query history reads and SQL text exposure: [references/query-history.md](references/query-history.md)
- Saved query reads, mutations, permalinks: [references/saved-queries.md](references/saved-queries.md)
- SQL execution routing: [references/sql-execution.md](references/sql-execution.md)
- Result retrieval and exports: [references/query-results-and-exports.md](references/query-results-and-exports.md)
- Query stop/cancel: [references/query-control.md](references/query-control.md)
