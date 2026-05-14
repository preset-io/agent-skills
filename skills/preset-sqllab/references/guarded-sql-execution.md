# Guarded SQL Execution And Result Handling

SQL execution is high impact even when the SQL is read-only. It can expose customer data, run expensive warehouse work, or create side effects in engines that allow non-read statements.

Use `preset-sql-execution` for SQL execution, result retrieval, result export, query stop, and saved-query mutation workflows. This reference remains as the SQL Lab endpoint map; the focused Phase 5 skill owns the approval template.

## Confirmation Required

Before calling SQL execution or result export endpoints, summarize:

1. Workspace hostname.
2. Database ID and database name, if known.
3. SQL text or an exact summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Whether the SQL is expected to be read-only.
6. Endpoint and request body.

Wait for explicit confirmation.

## SQL Lab Execution Endpoints

| Goal | Endpoint |
|---|---|
| Estimate query cost | `POST /api/v1/sqllab/estimate/` |
| Execute SQL | `POST /api/v1/sqllab/execute/` |
| Get execution result | `GET /api/v1/sqllab/results/` |
| Export result CSV | `GET /api/v1/sqllab/export/{client_id}/` |
| Streaming CSV export | `POST /api/v1/sqllab/export_streaming/` |
| Format SQL | `POST /api/v1/sqllab/format_sql/` |
| Stop query | `POST /api/v1/query/stop` |

## Saved Query Mutations

Saved query create, update, delete, import, and export are confirmation-gated because they mutate workspace metadata or disclose SQL text and database references.

| Goal | Endpoint |
|---|---|
| Create saved query | `POST /api/v1/saved_query/` |
| Update saved query | `PUT /api/v1/saved_query/{pk}` |
| Delete saved query | `DELETE /api/v1/saved_query/{pk}` |
| Bulk delete saved queries | `DELETE /api/v1/saved_query/` |
| Export saved queries | `GET /api/v1/saved_query/export/` |
| Import saved queries | `POST /api/v1/saved_query/import/` |
