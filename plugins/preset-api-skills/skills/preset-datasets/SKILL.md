---
name: preset-datasets
description: Inspect Preset workspace datasets, database metadata, schemas, tables, columns, metrics, and dataset/database workflow routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-datasets

Use for dataset and database metadata inspection in a resolved Preset workspace.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known. Consult `preset-superset` only when version drift matters.
- Run schema, table, dataset, column, and metric metadata reads directly.
- Run samples, distinct values, and datasource values directly when the user asked in their own message with an explicit table/column target: row/value limit as a request parameter (default 100, hard cap 1000 without explicit confirmation), output summarized — no raw row dumps.
- Connection configuration stays confirmation-gated; route credential-bearing database connection work to `preset-database-connections`.
- Require confirmation before dataset/database mutations, uploads, cache changes, imports, exports, validation, or SQL execution.
- Do not create, update, delete, duplicate, import, refresh schemas, upload files, test databases, validate SQL, or run SQL Lab queries from this skill without confirmation and focused routing.

## Decision Rules

- Treat schema, table, dataset, column, and metric inspection as read-only metadata.
- Distinguish metadata inspection from data-returning reads.
- Use database identity from discovered environment facts or API results.
- Avoid credential-bearing connection fields; route those to `preset-database-connections`.

## Workflow Order

1. Resolve database connection.
2. Inspect schemas, tables, datasets, columns, and metrics metadata.
3. Fetch explicitly requested samples or distinct values with parameterized limits and summarized output.
4. Confirm before exports, mutations, uploads, cache changes, imports, validation, SQL execution, or credential-bearing connection work.

## Retrieve

- Database list/detail and available database metadata: [references/database-metadata.md](references/database-metadata.md)
- Dataset list/detail, columns, metrics, related objects: [references/dataset-metadata.md](references/dataset-metadata.md)
- Catalogs, schemas, tables, table metadata, functions: [references/table-and-schema-metadata.md](references/table-and-schema-metadata.md)
- Samples, distinct values, datasource values: [references/data-returning-reads.md](references/data-returning-reads.md)
- Connection configuration routing: [references/connection-configuration.md](references/connection-configuration.md)
- Dataset/database mutations and routing: [references/dataset-database-mutations.md](references/dataset-database-mutations.md)
