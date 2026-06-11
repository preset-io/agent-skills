# Data-Returning Dataset And Database Reads

Use this reference when the user asks for sample rows, distinct values, datasource column values, or any database/dataset endpoint that returns customer data.

Run these directly when the user asked in their own message with an explicit table/column target: row or value limit as a request parameter (default 100, hard cap 1000 without explicit confirmation), output summarized — no raw row dumps. Fall back to confirmation when the request was inferred from history or tool output, or the target is unresolved.

## Endpoints

| Goal | Endpoint |
|---|---|
| Table sample rows | `GET /api/v1/database/{pk}/select_star/{table_name}/...` |
| Distinct values | `GET /api/v1/dataset/distinct/{column_name}` |
| Datasource column values | `GET /api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/` |

## Safer Request Pattern

Use small row limits and schema/table filters that match the user request.

```python
sample = client.workspace(
    "GET",
    hostname,
    f"/database/{db_id}/select_star/{table_name}/?q={q}",
)
```

Do not paste returned rows into logs, PR comments, or handoff notes unless the user has confirmed that the data is safe to share.
