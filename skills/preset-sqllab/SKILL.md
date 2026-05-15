---
name: preset-sqllab
description: Inspect SQL Lab and query-history metadata in a Preset workspace through Superset API calls. Use when a user needs SQL Lab bootstrap data, query history, saved query metadata, SQL Lab permalink routing, or SQL execution safety guidance after resolving a workspace hostname.
---

# preset-sqllab

Use this skill for SQL Lab and query metadata workflows in a Preset workspace.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI and current-user roles when endpoint drift or permissions matter.
4. Load [references/query-history.md](references/query-history.md) for SQL Lab bootstrap, query history, saved query, and permalink examples.
5. Use `preset-sql-execution` before any SQL execution, result retrieval, result export, query stop, saved-query mutation, or SQL Lab permalink creation.

## Scope

Default to SQL Lab bootstrap and capability metadata only. Query history and saved-query reads can return SQL text, so get explicit confirmation before listing or retrieving them. Do not execute SQL, stop queries, export result sets, create/update/delete saved queries, import saved queries, or create permalinks without routing through `preset-sql-execution` and getting explicit confirmation.

SQL can read customer data, run expensive warehouse work, or expose database metadata. Always summarize the workspace, database, SQL text, expected row limit, and expected effect before execution.
