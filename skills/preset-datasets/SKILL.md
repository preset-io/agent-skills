---
name: preset-datasets
description: Inspect datasets and database metadata in a Preset workspace through read-only Superset API calls. Use when a user needs to list database connections, schemas, tables, datasets, columns, metrics, or inspect one database or dataset after resolving a workspace hostname.
---

# preset-datasets

Use this skill for read-only dataset and database metadata inspection in a Preset workspace.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Load [references/read-only-examples.md](references/read-only-examples.md) for database, schema, table, dataset, column, and metric inspection examples.

## Scope

This skill is read-only. Do not create or update databases, datasets, columns, metrics, imports, exports, schema refreshes, or SQL Lab queries from this skill. For any future dataset or database mutation workflow, first summarize the target workspace, database/dataset IDs, request body or SQL, and expected effect, then get explicit user confirmation.
