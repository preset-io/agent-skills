---
name: preset-import-export
description: Inspect and route Superset workspace import/export workflows in Preset. Use when a user needs asset export/import endpoint guidance for dashboards, charts, datasets, databases, saved queries, themes, or all-assets bundles after resolving a workspace hostname.
---

# preset-import-export

Use this skill for Superset workspace import/export workflows.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture the workspace version/OpenAPI before relying on an import/export endpoint.
4. Load [references/import-export.md](references/import-export.md) for endpoint maps, secret-handling rules, and confirmation gates.

## Scope

Imports mutate workspace metadata and may create or change databases, datasets, charts, dashboards, saved queries, and themes. Exports can disclose SQL, dataset metadata, database metadata, tags, and masked credential fields.

Do not import or export without explicit confirmation that names the workspace, endpoint, object IDs or bundle, and expected disclosure or mutation.
