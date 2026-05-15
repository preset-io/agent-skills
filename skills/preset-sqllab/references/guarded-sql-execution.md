# Guarded SQL Execution And Result Handling

SQL execution is high impact even when the SQL is read-only. It can expose customer data, run expensive warehouse work, or create side effects in engines that allow non-read statements.

Use `preset-sql-execution` for SQL execution, result retrieval, result export, query stop, saved-query mutation, and SQL Lab permalink creation workflows. This reference remains as the SQL Lab endpoint map.

For confirmation requirements, use [../../preset-sql-execution/references/sql-execution-approval.md](../../preset-sql-execution/references/sql-execution-approval.md). The focused Phase 5 skill owns the approval template.

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
