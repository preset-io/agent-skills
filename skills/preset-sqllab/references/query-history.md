# Query History

Use this reference for SQL Lab query history reads.

Query history can include SQL text. Before listing or retrieving query records, summarize the workspace, endpoint, page size or query ID, and expected SQL-text exposure, then get explicit user confirmation.

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
queries = client.workspace("GET", hostname, f"/query/?q={q}")["result"]
```

Useful query endpoints:

| Goal | Endpoint |
|---|---|
| List query history | `GET /api/v1/query/` |
| Get query detail | `GET /api/v1/query/{pk}` |
| Query updates since timestamp | `GET /api/v1/query/updated_since` |
| Related fields | `GET /api/v1/query/related/{column_name}` |

Do not paste SQL into logs or comments unless the user asks and it is safe to share.
