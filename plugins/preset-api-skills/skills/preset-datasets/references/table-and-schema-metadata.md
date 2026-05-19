# Table And Schema Metadata

Use this reference for catalogs, schemas, tables, table metadata, table extra metadata, and database function names.

## List Schemas For A Database

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/database/{id}/schemas/?q=(force:!f)" | jq '.result'
```

```python
import rison

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

## Endpoint Map

| Goal | Endpoint |
|---|---|
| Catalogs | `GET /api/v1/database/{pk}/catalogs/` |
| Schemas | `GET /api/v1/database/{pk}/schemas/` |
| Tables | `GET /api/v1/database/{pk}/tables/` |
| Table metadata | `GET /api/v1/database/{pk}/table_metadata/` |
| Table extra metadata | `GET /api/v1/database/{pk}/table_metadata/extra/` |
| Function names | `GET /api/v1/database/{pk}/function_names/` |
| Upload schemas | `GET /api/v1/database/{pk}/schemas_access_for_file_upload/` |

Table metadata can expose database structure. Keep page sizes and filters narrow.

Do not fetch sample rows from table endpoints through this reference. For row-returning calls, load [data-returning-reads.md](data-returning-reads.md) and confirm the target and limit.
