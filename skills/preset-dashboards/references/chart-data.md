# Chart Data

Use this reference only when the user needs chart result data, query-context data, or cached chart data.

Chart data calls can return customer data. Before calling them, summarize the workspace, chart ID, result format, result type, row limit or query limit, and expected data exposure, then get explicit user confirmation.

## Endpoints

| Goal | Endpoint |
|---|---|
| Saved chart data | `GET /api/v1/chart/{pk}/data/` |
| Query-context chart data | `POST /api/v1/chart/data` |
| Cached chart data | `GET /api/v1/chart/data/{cache_key}` |

## Safer Request Pattern

Use the narrowest result type that answers the question. Prefer small limits and sample result types for exploratory work.

```python
payload = {
    "datasource": {"id": dataset_id, "type": "table"},
    "queries": [
        {
            "columns": ["country"],
            "metrics": ["count"],
            "row_limit": 10,
        }
    ],
    "result_format": "json",
    "result_type": "samples",
}

# Confirmation must happen before this call.
data = client.workspace("POST", hostname, "/chart/data", json=payload)
```

Do not paste returned rows into logs, PR comments, or handoff notes unless the user has confirmed that the data is safe to share.
