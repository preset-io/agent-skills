# SQL Execution Approval

SQL execution can expose customer data, run expensive warehouse work, or create side effects in connected engines.

## Confirmation Required

Before calling SQL execution, result, export, stop, saved-query mutation, or SQL Lab permalink endpoints, summarize:

1. Workspace hostname and workflow type: SQL execution, result handling, saved-query mutation, or SQL Lab permalink creation.
2. Database ID and database name, if known.
3. Exact SQL text, or an approved redacted summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Whether the SQL is expected to be read-only.
6. Endpoint and request body.
7. Result handling plan and destination, if results will be fetched or exported.
8. Target saved query ID/name, SQL-text exposure, mutation type, and rollback path, if saved queries will be created, updated, deleted, exported, or imported.
9. SQL Lab permalink payload and expected lifetime/scope, if a permalink will be created.

Wait for explicit confirmation.

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

## SQL Lab Permalinks

Creating SQL Lab permalinks writes temporary state that can expose query context. Confirm the workspace, endpoint, payload, SQL-text exposure, and expected lifetime/scope before creating one.

| Goal | Endpoint |
|---|---|
| Read SQL Lab permalink | `GET /api/v1/sqllab/permalink/{key}` |
| Create SQL Lab permalink | `POST /api/v1/sqllab/permalink` |

## Execution Pattern

Use the workspace OpenAPI for the deployed version before relying on request fields:

```python
payload = {
    "database_id": database_id,
    "sql": sql_text,
    "json": True,
    "runAsync": False,
}

result = client.workspace(
    "POST",
    hostname,
    "/sqllab/execute/",
    json=payload,
)
```

Keep limits narrow. If the SQL lacks a limit and the user only needs a sample, ask for approval to add one before execution.
