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
4. Load [references/read-only-examples.md](references/read-only-examples.md) for basic database, schema, table, dataset, column, and metric inspection examples.
5. Load [references/database-and-dataset-api.md](references/database-and-dataset-api.md) for the fuller database/dataset API map, table metadata, datasource values, data-returning reads, imports, exports, and mutation routing.
6. Use `preset-database-connections` for credential-bearing connection configuration, validation, OAuth, upload, create, update, or delete workflows.

## Scope

Default to metadata reads. Sample rows, distinct values, datasource column values, database connection configuration, and exports can expose customer data, credentials, or database structure, so treat them as data-returning or credential-bearing reads that require explicit confirmation after summarizing the target and limit where applicable.

Do not create, update, delete, duplicate, import, export, refresh schemas, upload files, test databases, validate SQL, or run SQL Lab queries from this skill without explicit confirmation. Route database connection workflows through `preset-database-connections`. For dataset or database mutations, summarize the target workspace, database/dataset IDs, request body or SQL, and expected effect before making the call.
