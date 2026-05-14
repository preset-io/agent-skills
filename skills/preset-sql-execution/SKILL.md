---
name: preset-sql-execution
description: Run or route SQL Lab execution, result retrieval, exports, and query stop operations in a Preset workspace with explicit approval. Use when a user asks to execute SQL, fetch SQL results, export query results, estimate SQL cost, format SQL, or stop a running query.
---

# preset-sql-execution

Use this skill for SQL execution and result-handling workflows. SQL execution is high impact even when the SQL appears read-only.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI and current-user roles when permissions matter.
4. Use `preset-sqllab` for SQL Lab bootstrap, query history, and saved-query context.
5. Load [references/sql-execution-approval.md](references/sql-execution-approval.md) before any SQL execution, result retrieval, result export, query stop, or saved-query mutation.
6. Load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md), summarize the SQL, database, expected effect, expected row limit, and endpoints, then get explicit user confirmation.

## Guardrails

- Do not execute SQL without explicit confirmation of the exact SQL text.
- Do not assume SQL is read-only. Some engines allow side effects in statements that look harmless.
- Do not fetch or export result sets unless the user confirms the target, size, and destination.
- Do not stop a query unless the user confirms the target query/client ID and expected effect.

