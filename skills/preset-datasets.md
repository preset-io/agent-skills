# preset-datasets

Manage datasets (tables and SQL views) and database connections in a Preset workspace via the Superset API.

> **Prerequisite:** Complete authentication and resolve the workspace hostname using the **preset-api** and **preset-workspaces** skills.

## Key concepts

| Term | Description |
|---|---|
| **Physical dataset** | Mapped to an actual table or view in a connected database. |
| **Virtual dataset** | Defined by a custom SQL query (also called a "SQL Lab dataset" or virtual table). |
| **Database** | A database connection configured in Superset (e.g., a Snowflake or BigQuery connection). |
| **Schema** | The database schema that contains the dataset's table. |

## Databases

### List database connections

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

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric database ID |
| `database_name` | Human-readable connection name |
| `backend` | Database engine (e.g., `snowflake`, `bigquery`, `postgresql`) |
| `expose_in_sqllab` | Whether the connection is available in SQL Lab |
| `allow_run_async` | Whether async query execution is enabled |

### Get a single database connection

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}" | jq '.result'
```

```python
db = client.workspace("GET", hostname, f"/database/{db_id}")["result"]
```

### List schemas for a database

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/schemas/?q=(force:!f)" | jq '.result'
```

```python
schemas = client.workspace("GET", hostname, f"/database/{db_id}/schemas/")["result"]
```

### List tables in a schema

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/tables/?q=(schema_name:public,force:!f)" \
  | jq '.result'
```

```python
q = rison.dumps({"schema_name": "public", "force": False})
tables = client.workspace("GET", hostname, f"/database/{db_id}/tables/?q={q}")["result"]
```

### Create a database connection

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/database/" \
  -d '{
    "database_name": "Production Snowflake",
    "sqlalchemy_uri": "snowflake://user:password@account/db/schema",
    "expose_in_sqllab": true,
    "allow_run_async": true
  }'
```

```python
new_db = client.workspace(
    "POST",
    hostname,
    "/database/",
    json={
        "database_name": "Production Snowflake",
        "sqlalchemy_uri": "snowflake://user:password@account/db/schema",
        "expose_in_sqllab": True,
        "allow_run_async": True,
    },
)
db_id = new_db["id"]
```

### Test a database connection

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/database/test_connection" \
  -d '{"sqlalchemy_uri": "postgresql+psycopg2://user:pass@host:5432/mydb"}'
```

```python
result = client.workspace(
    "POST",
    hostname,
    "/database/test_connection",
    json={"sqlalchemy_uri": "postgresql+psycopg2://user:pass@host:5432/mydb"},
)
print(result["message"])  # "OK" on success
```

### Update a database connection

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/database/{id}" \
  -d '{"database_name": "Production Snowflake (Updated)"}'
```

```python
client.workspace(
    "PUT",
    hostname,
    f"/database/{db_id}",
    json={"database_name": "Production Snowflake (Updated)"},
)
```

### Delete a database connection

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}"
```

> ⚠️ Deleting a database also removes all datasets and charts that depend on it.

## Datasets

### List datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/?q=(page:0,page_size:25)" | jq '.result'
```

```python
q = rison.dumps({"page": 0, "page_size": 25})
datasets = client.workspace("GET", hostname, f"/dataset/?q={q}")["result"]
for ds in datasets:
    print(ds["id"], ds["table_name"], ds["kind"])  # kind: "physical" or "virtual"
```

**Useful filters:**

| Goal | Filter expression |
|---|---|
| Physical only | `filters:!((col:is_sqllab_view,opr:FilterEqual,value:!f))` |
| Virtual only | `filters:!((col:is_sqllab_view,opr:FilterEqual,value:!t))` |
| By database | `filters:!((col:database,opr:DatasetIsNullOrEmptyFilter,value:1))` |

### Get a single dataset

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/{id}" | jq '.result'
```

```python
dataset = client.workspace("GET", hostname, f"/dataset/{dataset_id}")["result"]
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric dataset ID |
| `table_name` | Dataset name as shown in the UI |
| `schema` | Database schema |
| `sql` | The SQL query (virtual datasets only) |
| `kind` | `"physical"` or `"virtual"` |
| `columns` | List of column definitions |
| `metrics` | List of metric definitions |
| `database.id` | ID of the parent database connection |
| `owners` | List of owner objects |
| `cache_timeout` | Query cache timeout in seconds (`null` = use database default) |

### Create a physical dataset

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dataset/" \
  -d '{
    "database": 1,
    "schema": "public",
    "table_name": "orders",
    "owners": [1]
  }'
```

```python
new_dataset = client.workspace(
    "POST",
    hostname,
    "/dataset/",
    json={
        "database": db_id,
        "schema": "public",
        "table_name": "orders",
        "owners": [user_id],
    },
)
dataset_id = new_dataset["id"]
```

### Create a virtual dataset (custom SQL)

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dataset/" \
  -d '{
    "database": 1,
    "schema": "public",
    "table_name": "monthly_revenue",
    "sql": "SELECT DATE_TRUNC('"'"'month'"'"', order_date) AS month, SUM(revenue) AS total_revenue FROM orders GROUP BY 1",
    "owners": [1]
  }'
```

```python
new_virtual = client.workspace(
    "POST",
    hostname,
    "/dataset/",
    json={
        "database": db_id,
        "schema": "public",
        "table_name": "monthly_revenue",
        "sql": "SELECT DATE_TRUNC('month', order_date) AS month, SUM(revenue) AS total_revenue FROM orders GROUP BY 1",
        "owners": [user_id],
    },
)
```

### Update a dataset

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dataset/{id}" \
  -d '{"description": "Monthly revenue aggregated from the orders table", "cache_timeout": 3600}'
```

```python
client.workspace(
    "PUT",
    hostname,
    f"/dataset/{dataset_id}",
    json={
        "description": "Monthly revenue aggregated from the orders table",
        "cache_timeout": 3600,
    },
)
```

### Refresh dataset schema (sync columns from database)

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/{id}/refresh"
```

```python
client.workspace("PUT", hostname, f"/dataset/{dataset_id}/refresh")
```

Use this after altering a table in your database to sync new columns into the dataset definition.

### Delete a dataset

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/{id}"
```

```python
client.workspace("DELETE", hostname, f"/dataset/{dataset_id}")
```

> ⚠️ Deleting a dataset also removes all charts that depend on it.

## Dataset columns and metrics

### Add a calculated column

```python
dataset = client.workspace("GET", hostname, f"/dataset/{dataset_id}")["result"]
existing_columns = dataset["columns"]

existing_columns.append({
    "column_name": "revenue_usd",
    "expression": "revenue / 100.0",
    "type": "FLOAT",
    "verbose_name": "Revenue (USD)",
    "description": "Revenue converted from cents to USD",
    "filterable": True,
    "groupby": False,
})

client.workspace(
    "PUT",
    hostname,
    f"/dataset/{dataset_id}",
    json={"columns": existing_columns},
)
```

### Add a metric

```python
dataset = client.workspace("GET", hostname, f"/dataset/{dataset_id}")["result"]
existing_metrics = dataset["metrics"]

existing_metrics.append({
    "metric_name": "total_revenue",
    "expression": "SUM(revenue)",
    "verbose_name": "Total Revenue",
    "description": "Sum of all revenue",
    "metric_type": "sum",
    "d3format": "$,.2f",
})

client.workspace(
    "PUT",
    hostname,
    f"/dataset/{dataset_id}",
    json={"metrics": existing_metrics},
)
```

## Export and import datasets

### Export datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/export/?q=!(1,2,3)" \
  -o datasets_export.zip
```

### Import datasets

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/import/" \
  -F "formData=@datasets_export.zip" \
  -F 'passwords={"databases/MyDB.yaml": "db-password"}' \
  -F "overwrite=true"
```

## SQL Lab — execute queries

Run ad-hoc SQL queries against a connected database:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/sqllab/execute/" \
  -d '{
    "database_id": 1,
    "schema": "public",
    "sql": "SELECT COUNT(*) AS n FROM orders",
    "runAsync": false
  }'
```

```python
result = client.workspace(
    "POST",
    hostname,
    "/sqllab/execute/",
    json={
        "database_id": db_id,
        "schema": "public",
        "sql": "SELECT COUNT(*) AS n FROM orders",
        "runAsync": False,
    },
)
rows = result["data"]   # list of row dicts
columns = result["columns"]  # list of {"name": ..., "type": ...}
print(rows)
```

For long-running queries, set `"runAsync": true` and poll `GET /api/v1/query/{query_id}` for status.
