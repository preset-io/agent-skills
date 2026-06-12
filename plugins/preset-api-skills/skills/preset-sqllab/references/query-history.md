# Query History

Use this reference for SQL Lab query history reads.

Query history includes SQL text. Read the user's own history directly when they asked in their own message AND a current-user/owner filter is applied before SQL-bearing fields are fetched (default page 25 records, hard cap 100 without explicit confirmation). Other users' history, or any read where owner filtering cannot be applied first, stays confirmation-gated as SQL-text disclosure.

```python
import rison

me = client.workspace("GET", hostname, "/me/")["result"]
q = rison.dumps({
    "page": 0,
    "page_size": 25,
    "filters": [{"col": "user", "opr": "rel_o_m", "value": me["id"]}],
})
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
