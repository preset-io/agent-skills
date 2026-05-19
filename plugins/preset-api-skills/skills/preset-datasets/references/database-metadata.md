# Database Metadata

Use this reference for database metadata reads that do not expose credential-bearing connection configuration.

## List Database Connections

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/?q=(page:0,page_size:50)" | jq '.result'
```

```python
import rison

q = rison.dumps({"page": 0, "page_size": 50})
dbs = client.workspace("GET", hostname, f"/database/?q={q}")["result"]
for db in dbs:
    print(db["id"], db["database_name"], db["backend"])
```

Common database fields:

| Field | Description |
|---|---|
| `id` | Numeric database ID |
| `database_name` | Human-readable connection name |
| `backend` | Database engine, such as `snowflake`, `bigquery`, or `postgresql` |
| `expose_in_sqllab` | Whether the connection is available in SQL Lab |
| `allow_run_async` | Whether async query execution is enabled |

## Get A Database Connection

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}" | jq '.result'
```

```python
db = client.workspace("GET", hostname, f"/database/{db_id}")["result"]
print(db["database_name"], db["backend"])
```

Useful database metadata endpoints:

| Goal | Endpoint |
|---|---|
| List databases | `GET /api/v1/database/` |
| Available database names | `GET /api/v1/database/available/` |
| Get database detail | `GET /api/v1/database/{pk}` |
| Related objects | `GET /api/v1/database/{pk}/related_objects/` |

For `GET /api/v1/database/{pk}/connection`, load [connection-configuration.md](connection-configuration.md) and route to `preset-database-connections`.
