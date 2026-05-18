---
name: preset-datasets
description: Inspect datasets, database metadata, table metadata, datasource values, and database/dataset operation routing in a Preset workspace through Superset API calls after resolving a workspace hostname.
---

# preset-datasets

Use this skill for dataset and database metadata inspection in a Preset workspace.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture the workspace version/OpenAPI when endpoint drift matters.
4. Load the focused reference for the task:
   - [references/database-metadata.md](references/database-metadata.md) for database list/detail and available-database metadata.
   - [references/dataset-metadata.md](references/dataset-metadata.md) for dataset list/detail, related objects, columns, and metrics.
   - [references/table-and-schema-metadata.md](references/table-and-schema-metadata.md) for catalogs, schemas, tables, table metadata, and function names.
   - [references/data-returning-reads.md](references/data-returning-reads.md) for table samples, distinct values, and datasource column values.
   - [references/connection-configuration.md](references/connection-configuration.md) for credential-bearing connection routing to `preset-database-connections`.
   - [references/dataset-database-mutations.md](references/dataset-database-mutations.md) for dataset/database mutation, validation, upload, cache, import, and export routing.
5. Use `preset-database-connections` for credential-bearing connection configuration, validation, OAuth, upload, create, update, or delete workflows.

## Scope

Default to metadata reads. Sample rows, distinct values, datasource column values, database connection configuration, and exports can expose customer data, credentials, or database structure, so treat them as data-returning or credential-bearing reads that require explicit confirmation after summarizing the target and limit where applicable.

Do not create, update, delete, duplicate, import, export, refresh schemas, upload files, test databases, validate SQL, or run SQL Lab queries from this skill without explicit confirmation. Route database connection workflows through `preset-database-connections`. For dataset or database mutations, summarize the target workspace, database/dataset IDs, request body or SQL, and expected effect before making the call.
