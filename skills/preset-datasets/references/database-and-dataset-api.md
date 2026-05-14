# Database And Dataset Workspace API

All examples use the workspace hostname resolved by `preset-workspaces`.

## Database Metadata Reads

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
databases = client.workspace("GET", hostname, f"/database/?q={q}")["result"]
```

Useful database endpoints:

| Goal | Endpoint |
|---|---|
| List databases | `GET /api/v1/database/` |
| Available database names | `GET /api/v1/database/available/` |
| Get database detail | `GET /api/v1/database/{pk}` |
| Catalogs | `GET /api/v1/database/{pk}/catalogs/` |
| Schemas | `GET /api/v1/database/{pk}/schemas/` |
| Tables | `GET /api/v1/database/{pk}/tables/` |
| Table metadata | `GET /api/v1/database/{pk}/table_metadata/` |
| Table extra metadata | `GET /api/v1/database/{pk}/table_metadata/extra/` |
| Related objects | `GET /api/v1/database/{pk}/related_objects/` |
| Function names | `GET /api/v1/database/{pk}/function_names/` |
| Upload schemas | `GET /api/v1/database/{pk}/schemas_access_for_file_upload/` |

Table metadata can expose database structure. Keep page sizes and filters narrow.

## Data-Returning And Credential-Bearing Database Reads

Before calling these endpoints, summarize the workspace, database ID, requested endpoint, expected fields or row limit, and credential-disclosure risk, then get explicit user confirmation:

| Goal | Endpoint |
|---|---|
| Connection configuration | `GET /api/v1/database/{pk}/connection` |
| Table sample rows | `GET /api/v1/database/{pk}/select_star/{table_name}/...` |

Treat connection responses as credential-bearing. They can include SQLAlchemy URIs, `extra` JSON, server certificates, SSH tunnel configuration, or engine-specific connection fields. Do not print or paste these values into logs, examples, PR comments, or handoff notes.

## Dataset Metadata Reads

```python
q = rison.dumps({"page": 0, "page_size": 25})
datasets = client.workspace("GET", hostname, f"/dataset/?q={q}")["result"]
```

Useful dataset endpoints:

| Goal | Endpoint |
|---|---|
| List datasets | `GET /api/v1/dataset/` |
| Get dataset detail | `GET /api/v1/dataset/{id_or_uuid}` |
| Related charts/dashboards | `GET /api/v1/dataset/{id_or_uuid}/related_objects` |
| Drill info | `GET /api/v1/dataset/{pk}/drill_info/` |
| Related fields | `GET /api/v1/dataset/related/{column_name}` |
| Datasource column values | `GET /api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/` |

## Data-Returning Dataset Reads

Distinct values and datasource column values can expose customer data. Confirm the dataset, column, filters, and limit before calling:

| Goal | Endpoint |
|---|---|
| Distinct values | `GET /api/v1/dataset/distinct/{column_name}` |
| Datasource column values | `GET /api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/` |

## Confirmation-Gated Dataset And Database Operations

Do not run these without explicit confirmation:

| Surface | Examples |
|---|---|
| Database mutations | create, update, delete, sync permissions, OAuth, uploads |
| Database validation | test connection, validate parameters, validate SQL |
| Dataset mutations | create, update, delete, duplicate, refresh, get_or_create |
| Column/metric mutations | delete column, delete metric |
| Imports/exports | database or dataset import/export |
| Cache warmup | dataset warm up cache |
