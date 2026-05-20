# Saved Query And Permalink Approval

Use this reference before saved-query mutation, saved-query import/export, or SQL Lab permalink creation.

Saved query workflows are confirmation-gated because they mutate workspace metadata or disclose SQL text and database references. SQL Lab permalinks write temporary state that can expose query context.

## Required Confirmation

Before saved-query workflows, summarize the workspace, target saved query ID/name, SQL-text exposure, mutation type, endpoint and request body, export/import destination when applicable, and rollback path.

Before creating a SQL Lab permalink, summarize the workspace, endpoint, payload, SQL-text exposure, and expected lifetime/scope.

Wait for explicit confirmation.

## Saved Query Endpoints

| Goal | Endpoint |
|---|---|
| Create saved query | `POST /api/v1/saved_query/` |
| Update saved query | `PUT /api/v1/saved_query/{pk}` |
| Delete saved query | `DELETE /api/v1/saved_query/{pk}` |
| Bulk delete saved queries | `DELETE /api/v1/saved_query/` |
| Export saved queries | `GET /api/v1/saved_query/export/` |
| Import saved queries | `POST /api/v1/saved_query/import/` |

## SQL Lab Permalinks

| Goal | Endpoint |
|---|---|
| Read SQL Lab permalink | `GET /api/v1/sqllab/permalink/{key}` |
| Create SQL Lab permalink | `POST /api/v1/sqllab/permalink` |
