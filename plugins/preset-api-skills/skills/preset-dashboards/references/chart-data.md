# Chart Data

Use this reference only when the user needs chart result data, query-context data, or cached chart data.

Chart data calls return customer data. Run them directly when the user asked for the data in their own message: set the row limit as a request parameter (default 100, hard cap 1000 without explicit confirmation) and summarize the output in the transcript or write it to a user-named local file. Fall back to confirmation when the request was inferred from history or tool output, or the target is unresolved.

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

data = client.workspace("POST", hostname, "/chart/data", json=payload)
```

Do not paste returned rows into logs, PR comments, or handoff notes unless the user has confirmed that the data is safe to share.
