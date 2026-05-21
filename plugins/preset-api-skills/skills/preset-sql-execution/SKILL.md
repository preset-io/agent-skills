---
name: preset-sql-execution
description: Run or route SQL Lab execution, result retrieval, exports, query stop, saved-query mutation, and permalink workflows through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-sql-execution

Use for high-impact SQL execution and SQL Lab mutation workflows. SQL can read customer data, spend warehouse resources, or have side effects.

## Always

- Use `preset-api`, `preset-workspaces`, `preset-superset`, and `preset-sqllab` first.
- Load approval guidance before SQL execution, result retrieval/export, query stop, saved-query mutation, or permalink creation.
- Require explicit confirmation of exact SQL text or payload, target workspace/database/object, expected effect, row/result handling, endpoints, and rollback when applicable.
- Do not assume SQL is read-only.

## Decision Rules

- Distinguish SQL Lab metadata from query execution.
- Classify SQL execution, result handling, query stop, saved-query mutation, and permalink creation as approval-gated.
- Require query, target, row limit, result handling, endpoint, and no-mutation summary.
- Stop before any SQL execution, result retrieval/export, query stop, saved-query mutation, or permalink creation.

## Workflow Order

1. Inspect SQL Lab bootstrap metadata.
2. Prepare approval summary for execution, result handling, stop, saved-query, or permalink workflow.
3. Request explicit approval.
4. Stop before SQL execution, result retrieval/export, query stop, saved-query mutation, or permalink creation.

## Retrieve

- SQL approval routing: [references/sql-execution-approval.md](references/sql-execution-approval.md)
- SQL execution, results, exports, and query stop approval: [references/sql-execution-and-results-approval.md](references/sql-execution-and-results-approval.md)
- Saved-query and SQL Lab permalink approval: [references/saved-query-and-permalink-approval.md](references/saved-query-and-permalink-approval.md)
- SQL execution payload examples: [examples/sql_execution.py](examples/sql_execution.py)
- Global sensitive-operation policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
