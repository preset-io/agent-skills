# Read-Only Dataset And Database Examples

## Key Concepts

| Term | Description |
|---|---|
| Physical dataset | Mapped to an actual table or view in a connected database |
| Virtual dataset | Defined by a custom SQL query, also called a SQL Lab dataset or virtual table |
| Database | A database connection configured in Superset |
| Schema | The database schema that contains the dataset table |

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

## List Schemas For A Database

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/schemas/?q=(force:!f)" | jq '.result'
```

```python
q = rison.dumps({"force": False})
schemas = client.workspace("GET", hostname, f"/database/{db_id}/schemas/?q={q}")["result"]
```

## List Tables In A Schema

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/tables/?q=(schema_name:public,force:!f)" \
  | jq '.result'
```

```python
q = rison.dumps({"schema_name": "public", "force": False})
tables = client.workspace("GET", hostname, f"/database/{db_id}/tables/?q={q}")["result"]
```

## List Datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/?q=(page:0,page_size:25)" | jq '.result'
```

```python
q = rison.dumps({"page": 0, "page_size": 25})
datasets = client.workspace("GET", hostname, f"/dataset/?q={q}")["result"]
for dataset in datasets:
    print(dataset["id"], dataset["table_name"], dataset.get("kind"))
```

Useful filters:

| Goal | Filter expression |
|---|---|
| Physical only | `filters:!((col:sql,opr:dataset_is_null_or_empty,value:!t))` |
| Virtual only | `filters:!((col:sql,opr:dataset_is_null_or_empty,value:!f))` |
| By database | `filters:!((col:database,opr:rel_o_m,value:1))` |

## Get A Dataset

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
