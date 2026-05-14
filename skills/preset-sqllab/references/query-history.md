# SQL Lab And Query History

All examples use the workspace hostname resolved by `preset-workspaces`.

## SQL Lab Bootstrap

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/sqllab/" | jq '.result'
```

```python
bootstrap = client.workspace("GET", hostname, "/sqllab/")["result"]
```

The bootstrap response helps identify SQL Lab availability, database options, and UI defaults for the authenticated user.

## Query History

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

## Saved Queries

Saved queries can include SQL text. Before listing or retrieving saved query records, summarize the workspace, endpoint, page size or saved query ID, and expected SQL-text exposure, then get explicit user confirmation.

```python
q = rison.dumps({"page": 0, "page_size": 25})
saved = client.workspace("GET", hostname, f"/saved_query/?q={q}")["result"]
```

Useful saved query endpoints:

| Goal | Endpoint |
|---|---|
| List saved queries | `GET /api/v1/saved_query/` |
| Get saved query detail | `GET /api/v1/saved_query/{pk}` |
| Related fields | `GET /api/v1/saved_query/related/{column_name}` |
| Distinct fields | `GET /api/v1/saved_query/distinct/{column_name}` |

## Permalinks

| Goal | Endpoint |
|---|---|
| Read SQL Lab permalink | `GET /api/v1/sqllab/permalink/{key}` |
| Create SQL Lab permalink | `POST /api/v1/sqllab/permalink` |

Creating permalinks writes temporary state and should be confirmation-gated.
