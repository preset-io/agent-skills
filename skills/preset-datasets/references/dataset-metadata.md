# Dataset Metadata

Use this reference for dataset metadata reads.

## Key Concepts

| Term | Description |
|---|---|
| Physical dataset | Mapped to an actual table or view in a connected database |
| Virtual dataset | Defined by a custom SQL query, also called a SQL Lab dataset or virtual table |
| Database | A database connection configured in Superset |
| Schema | The database schema that contains the dataset table |

## List Datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dataset/?q=(page:0,page_size:25)" | jq '.result'
```

```python
import rison

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

Useful dataset endpoints:

| Goal | Endpoint |
|---|---|
| List datasets | `GET /api/v1/dataset/` |
| Get dataset detail | `GET /api/v1/dataset/{id_or_uuid}` |
| Related charts/dashboards | `GET /api/v1/dataset/{id_or_uuid}/related_objects` |
| Drill info | `GET /api/v1/dataset/{pk}/drill_info/` |
| Related fields | `GET /api/v1/dataset/related/{column_name}` |

Virtual dataset metadata can include SQL text. If the user asks to list or print SQL-bearing fields, summarize the expected exposure and get confirmation first.
