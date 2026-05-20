---
name: preset-import-export
description: Inspect and route direct Superset import/export workflows for dashboards, charts, datasets, databases, saved queries, themes, and asset bundles. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-import-export

Use for workspace asset import/export endpoint selection and disclosure review.

## Always

- Use `preset-api`, `preset-workspaces`, and `preset-superset` first.
- Treat imports as mutations and exports as potential disclosure of SQL, metadata, UUIDs, tags, and credential-bearing fields.
- Require confirmation naming workspace, endpoint, object IDs or bundle, and expected disclosure or mutation.
- Route overwrite, sparse-update, all-assets restore, database import, and secret-bearing import to `preset-destructive-imports`.

## Retrieve

- Export endpoints and approvals: [references/export-workflows.md](references/export-workflows.md)
- Import endpoints and mutation routing: [references/import-workflows.md](references/import-workflows.md)
- Bundle disclosure and secret redaction: [references/bundle-secrets-and-disclosure.md](references/bundle-secrets-and-disclosure.md)
- OpenAPI checks and safe smoke validation: [references/validation-and-smoke.md](references/validation-and-smoke.md)
