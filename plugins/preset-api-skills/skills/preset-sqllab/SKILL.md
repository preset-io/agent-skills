---
name: preset-sqllab
description: Inspect Preset SQL Lab bootstrap, query history, saved queries, result/export routing, query control, and SQL execution routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-sqllab

Use for SQL Lab capability and query metadata workflows in a resolved Preset workspace.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known. Consult `preset-superset` only when permissions drift matters.
- Run SQL Lab bootstrap/capability metadata reads directly.
- Run the user's own query history and saved-query reads directly when they asked in their own message AND current-user/owner filtering is applied before SQL-bearing fields are fetched (default page 25 records, hard cap 100 without explicit confirmation). If an endpoint returns SQL text before ownership is proven, keep the read confirmation-gated as SQL-text disclosure.
- Route execution, result retrieval/export, query stop, saved-query mutation, and permalinks to `preset-sql-execution`.

## Decision Rules

- Distinguish query history metadata from SQL text, result retrieval, and execution to pick the right endpoint and filters.
- Other users' history or SQL text, and any history read where owner filtering cannot be applied first, require confirmation.
- Route saved query, history, result, stop, permalink, and execution requests separately.
- Avoid SQL execution from this skill.

## Workflow Order

1. Inspect SQL Lab bootstrap state.
2. Route history, saved query, result, stop, permalink, and execution request.
3. Fetch owner-filtered history or saved queries the user asked for with parameterized page limits.
4. Confirm before unowned SQL-text reads; route execution-family operations to `preset-sql-execution`.

## Retrieve

- Combined SQL Lab routing and approval essentials: [references/routing-essentials.md](references/routing-essentials.md)
- SQL Lab availability, database options, UI defaults: [references/sqllab-bootstrap.md](references/sqllab-bootstrap.md)
- Query history reads and SQL text exposure: [references/query-history.md](references/query-history.md)
- Saved query reads, mutations, permalinks: [references/saved-queries.md](references/saved-queries.md)
- SQL execution routing: [references/sql-execution.md](references/sql-execution.md)
- Result retrieval and exports: [references/query-results-and-exports.md](references/query-results-and-exports.md)
- Query stop/cancel: [references/query-control.md](references/query-control.md)
