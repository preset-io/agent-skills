# Table And Schema Metadata

Use this reference for catalogs, schemas, tables, table metadata, table extra metadata, and database function names.

Reusable Python snippets live in `examples/table_and_schema_metadata.py`; load that file only when implementation detail is needed.

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

Use Rison query parameters for schema/table filters, for example `force:!f` and `schema_name:<schema>`.

Table metadata can expose database structure. Keep page sizes and filters narrow.

Do not fetch sample rows from table endpoints through this reference. For row-returning calls, load [data-returning-reads.md](data-returning-reads.md) and confirm the target and limit.
