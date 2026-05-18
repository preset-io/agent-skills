# Saved Queries

Use this reference for saved-query reads and mutation routing.

Saved queries can include SQL text. Before listing or retrieving saved query records, summarize the workspace, endpoint, page size or saved query ID, and expected SQL-text exposure, then get explicit user confirmation.

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
saved = client.workspace("GET", hostname, f"/saved_query/?q={q}")["result"]
```

Useful saved-query read endpoints:

| Goal | Endpoint |
|---|---|
| List saved queries | `GET /api/v1/saved_query/` |
| Get saved query detail | `GET /api/v1/saved_query/{pk}` |
| Related fields | `GET /api/v1/saved_query/related/{column_name}` |
| Distinct fields | `GET /api/v1/saved_query/distinct/{column_name}` |

Saved query create, update, delete, import, and export are confirmation-gated because they mutate workspace metadata or disclose SQL text and database references.

Use `preset-sql-execution` before saved-query mutations.

| Goal | Endpoint |
|---|---|
| Create saved query | `POST /api/v1/saved_query/` |
| Update saved query | `PUT /api/v1/saved_query/{pk}` |
| Delete saved query | `DELETE /api/v1/saved_query/{pk}` |
| Bulk delete saved queries | `DELETE /api/v1/saved_query/` |
| Export saved queries | `GET /api/v1/saved_query/export/` |
| Import saved queries | `POST /api/v1/saved_query/import/` |

## SQL Lab Permalinks

Reading SQL Lab permalinks can expose query context. Creating permalinks writes temporary state. Use `preset-sql-execution` before creating SQL Lab permalinks.

| Goal | Endpoint |
|---|---|
| Read SQL Lab permalink | `GET /api/v1/sqllab/permalink/{key}` |
| Create SQL Lab permalink | `POST /api/v1/sqllab/permalink` |
