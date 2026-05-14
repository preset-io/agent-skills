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

## Scope

Default to metadata reads. Sample rows, distinct values, datasource column values, and exports can expose customer data or database structure, so treat them as data-returning reads that require target and limit confirmation.

Do not create or update databases, datasets, columns, metrics, imports, exports, schema refreshes, uploads, database tests, SQL validation, or SQL Lab queries from this skill without explicit confirmation. For dataset or database mutations, summarize the target workspace, database/dataset IDs, request body or SQL, and expected effect before making the call.
