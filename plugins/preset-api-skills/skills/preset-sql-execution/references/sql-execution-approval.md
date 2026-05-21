# SQL Execution Approval

SQL execution can expose customer data, run expensive warehouse work, or have side effects in connected engines.

Use this file to route to the narrow approval reference:

- SQL execution, result retrieval, exports, format, or query stop: [sql-execution-and-results-approval.md](sql-execution-and-results-approval.md)
- Saved query create/update/delete/import/export or SQL Lab permalink creation: [saved-query-and-permalink-approval.md](saved-query-and-permalink-approval.md)

Before calling SQL execution, result, export, stop, saved-query mutation, or SQL Lab permalink endpoints, summarize the workspace, database, exact SQL or approved redacted SQL summary, expected result size or row limit, read-only expectation, endpoint, request body, result handling destination, and rollback path when applicable.

Wait for explicit confirmation.

Do not paste SQL text, result rows, exported files, saved-query contents, or permalink payloads into logs, PR comments, or handoff notes unless the user explicitly approves that disclosure channel.

Endpoint families include `/api/v1/sqllab/execute/`, `/api/v1/sqllab/results/`, `/api/v1/query/stop`, `/api/v1/saved_query/`, and `/api/v1/sqllab/permalink`.
