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
4. Load the focused reference for the task:
   - [references/export-workflows.md](references/export-workflows.md) for export endpoint maps and approval details.
   - [references/import-workflows.md](references/import-workflows.md) for import endpoint maps and mutation routing.
   - [references/bundle-secrets-and-disclosure.md](references/bundle-secrets-and-disclosure.md) for export bundle disclosure and secret redaction rules.
   - [references/validation-and-smoke.md](references/validation-and-smoke.md) for OpenAPI checks and safe smoke-validation patterns.
5. Use `preset-destructive-imports` for overwrite, sparse-update, all-assets restore, database import, or secret-bearing import workflows.

## Scope

Imports mutate workspace metadata and may create or change databases, datasets, charts, dashboards, saved queries, and themes. Exports can disclose SQL, dataset metadata, database metadata, tags, object UUIDs, and credential-bearing engine or `extra` fields.

Do not import or export without explicit confirmation that names the workspace, endpoint, object IDs or bundle, and expected disclosure or mutation. Route destructive or overwrite-capable imports through `preset-destructive-imports`.
