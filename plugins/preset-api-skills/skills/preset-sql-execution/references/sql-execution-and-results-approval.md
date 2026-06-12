# SQL Execution And Results Approval

Use this reference for SQL execution, result retrieval, export, format, or query stop calls.

Direct path: a single-statement SELECT requested in the user's own message against a resolved target, with a bounded row limit and parser-confident classification, executes without confirmation; its results are retrieved directly with summarized output.

## Required Confirmation (write/DDL, unresolved classification, stop, exports)

Before gated execution or result handling, summarize:

1. Workspace hostname and workflow type.
2. Database ID and database name, if known.
3. Exact SQL text, or an approved redacted summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Whether the SQL is expected to be read-only.
6. Endpoint and request body.
7. Result handling plan and destination, if results will be fetched or exported.

Wait for explicit confirmation. A statement is not read-only merely because it starts with SELECT — when parser confidence is low or the statement is ambiguous, treat it as gated.

## Endpoints

| Goal | Endpoint |
|---|---|
| Estimate query cost | `POST /api/v1/sqllab/estimate/` |
| Execute SQL | `POST /api/v1/sqllab/execute/` |
| Get execution result | `GET /api/v1/sqllab/results/` |
| Export result CSV | `GET /api/v1/sqllab/export/{client_id}/` |
| Streaming CSV export | `POST /api/v1/sqllab/export_streaming/` |
| Format SQL | `POST /api/v1/sqllab/format_sql/` |
| Stop query | `POST /api/v1/query/stop` |

Use the workspace OpenAPI for the deployed version before relying on request fields. Keep limits narrow. If SQL lacks a limit, add a bounded default (100 rows) and say so in the summary.

Reusable payload helpers live in [../examples/sql_execution.py](../examples/sql_execution.py).
