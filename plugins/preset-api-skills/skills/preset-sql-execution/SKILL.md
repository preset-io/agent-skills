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

## Retrieve

- Approval gates and endpoint-specific guidance: [references/sql-execution-approval.md](references/sql-execution-approval.md)
- Global sensitive-operation policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
