# preset-datasets

Inspect datasets and database metadata in a Preset workspace via the Superset API.

> **Prerequisite:** Complete authentication and resolve the workspace hostname using the **preset-api** and **preset-workspaces** skills.
> **Phase 1 scope:** This seed skill is read-only. Database connection changes, dataset creation/update, schema refresh, import/export, metric/column edits, and SQL Lab execution are intentionally deferred to later phases and require explicit user confirmation before implementation.

## Key concepts

| Term | Description |
|---|---|
| **Physical dataset** | Mapped to an actual table or view in a connected database. |
| **Virtual dataset** | Defined by a custom SQL query, also called a SQL Lab dataset or virtual table. |
| **Database** | A database connection configured in Superset. |
| **Schema** | The database schema that contains the dataset's table. |

## List database connections

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

## Get a single database connection

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}" | jq '.result'
```

```python
db = client.workspace("GET", hostname, f"/database/{db_id}")["result"]
print(db["database_name"], db["backend"])
```

## List schemas for a database

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/schemas/?q=(force:!f)" | jq '.result'
```

```python
q = rison.dumps({"force": False})
schemas = client.workspace("GET", hostname, f"/database/{db_id}/schemas/?q={q}")["result"]
```

## List tables in a schema

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/tables/?q=(schema_name:public,force:!f)" \
  | jq '.result'
```

```python
q = rison.dumps({"schema_name": "public", "force": False})
tables = client.workspace("GET", hostname, f"/database/{db_id}/tables/?q={q}")["result"]
```

## List datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/?q=(page:0,page_size:25)" | jq '.result'
```

```python
q = rison.dumps({"page": 0, "page_size": 25})
datasets = client.workspace("GET", hostname, f"/dataset/?q={q}")["result"]
for ds in datasets:
    print(ds["id"], ds["table_name"], ds.get("kind"))
```

Useful filters:

| Goal | Filter expression |
|---|---|
| Physical only | `filters:!((col:is_sqllab_view,opr:FilterEqual,value:!f))` |
| Virtual only | `filters:!((col:is_sqllab_view,opr:FilterEqual,value:!t))` |
| By database | `filters:!((col:database,opr:DatasetIsNullOrEmptyFilter,value:1))` |

## Get a single dataset

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/{id}" | jq '.result'
```

```python
dataset = client.workspace("GET", hostname, f"/dataset/{dataset_id}")["result"]
print(dataset["table_name"], dataset["schema"], dataset["database"]["id"])
```

Common dataset fields:

| Field | Description |
|---|---|
| `id` | Numeric dataset ID |
| `table_name` | Dataset name as shown in the UI |
| `schema` | Database schema |
| `sql` | SQL query for virtual datasets, when visible |
| `kind` | `physical` or `virtual`, when present |
| `columns` | Column definitions |
| `metrics` | Metric definitions |
| `database.id` | ID of the parent database connection |
| `owners` | Owner objects |

## Mutation boundary

Do not create or update databases, datasets, columns, metrics, imports, exports, schema refreshes, or SQL Lab queries from this Phase 1 seed skill. For any future dataset or database mutation workflow, first summarize the target workspace, database/dataset IDs, request body or SQL, and expected effect, then get explicit user confirmation.
