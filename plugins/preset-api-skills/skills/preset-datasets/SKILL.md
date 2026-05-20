---
name: preset-datasets
description: Inspect Preset workspace datasets, database metadata, schemas, tables, columns, metrics, and dataset/database workflow routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-datasets

Use for dataset and database metadata inspection in a resolved Preset workspace.

## Always

- Use `preset-api`, `preset-workspaces`, and when drift matters `preset-superset` first.
- Default to metadata reads.
- Treat samples, distinct values, datasource values, connection configuration, and exports as sensitive reads requiring confirmation.
- Route credential-bearing database connection work to `preset-database-connections`.
- Require confirmation before dataset/database mutations, uploads, cache changes, imports, exports, validation, or SQL execution.
- Do not create, update, delete, duplicate, import, export, refresh schemas, upload files, test databases, validate SQL, or run SQL Lab queries from this skill without confirmation and focused routing.

## Decision Rules

- Treat schema, table, dataset, column, and metric inspection as read-only metadata.
- Distinguish metadata inspection from data-returning reads.
- Use database identity from discovered environment facts or API results.
- Avoid credential-bearing connection fields; route those to `preset-database-connections`.

## Workflow Order

1. Resolve database connection.
2. Inspect schemas, tables, datasets, columns, and metrics metadata.
3. Prepare approval before sample, distinct value, datasource value, or data reads.
4. Redact connection secrets and route credential-bearing work away from this skill.

## Retrieve

- Database list/detail and available database metadata: [references/database-metadata.md](references/database-metadata.md)
- Dataset list/detail, columns, metrics, related objects: [references/dataset-metadata.md](references/dataset-metadata.md)
- Catalogs, schemas, tables, table metadata, functions: [references/table-and-schema-metadata.md](references/table-and-schema-metadata.md)
- Samples, distinct values, datasource values: [references/data-returning-reads.md](references/data-returning-reads.md)
- Connection configuration routing: [references/connection-configuration.md](references/connection-configuration.md)
- Dataset/database mutations and routing: [references/dataset-database-mutations.md](references/dataset-database-mutations.md)
