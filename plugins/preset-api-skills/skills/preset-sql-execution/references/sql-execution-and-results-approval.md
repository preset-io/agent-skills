# SQL Execution And Results Approval

Use this reference before SQL execution, result retrieval, export, format, or query stop calls.

## Required Confirmation

Before execution or result handling, summarize:

1. Workspace hostname and workflow type.
2. Database ID and database name, if known.
3. Exact SQL text, or an approved redacted summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Whether the SQL is expected to be read-only.
6. Endpoint and request body.
7. Result handling plan and destination, if results will be fetched or exported.

Wait for explicit confirmation. Read-only SQL still requires approval when execution or result retrieval is requested.

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

Use the workspace OpenAPI for the deployed version before relying on request fields. Keep limits narrow. If SQL lacks a limit and the user only needs a sample, ask for approval to add one before execution.

Reusable payload helpers live in `examples/sql_execution.py`.
