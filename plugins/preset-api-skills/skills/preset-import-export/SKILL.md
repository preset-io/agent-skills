---
name: preset-import-export
description: Inspect and route direct Superset import/export workflows for dashboards, charts, datasets, databases, saved queries, themes, and asset bundles. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-import-export

Use for workspace asset import/export endpoint selection and disclosure review.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known.
- Run object-scoped chart/dashboard exports directly when the user asked in their own message, the download goes to a user-named local file, and the bundle cannot contain database connection config or secret-bearing metadata.
- Treat imports as mutations, and broad/ambiguous exports or database/dataset/saved-query exports as potential disclosure of SQL, metadata, UUIDs, tags, and credential-bearing fields — confirmation-gated, naming workspace, endpoint, object IDs or bundle, and expected disclosure or mutation.
- Route overwrite, sparse-update, all-assets restore, database import, and secret-bearing import to `preset-destructive-imports`.

## Decision Rules

- Distinguish export disclosure from import mutation.
- Classify overwrite imports as destructive.
- Disclose bundle secret handling.
- Require validation before import.

## Workflow Order

1. Inspect request and bundle metadata.
2. Choose export or import path.
3. Run explicitly requested object-scoped non-secret exports to a user-named local file.
4. Confirm before broad exports, secret-bearing bundles, or any import execution.

## Retrieve

- Export endpoints and approvals: [references/export-workflows.md](references/export-workflows.md)
- Import endpoints and mutation routing: [references/import-workflows.md](references/import-workflows.md)
- Bundle disclosure and secret redaction: [references/bundle-secrets-and-disclosure.md](references/bundle-secrets-and-disclosure.md)
- OpenAPI checks and safe smoke validation: [references/validation-and-smoke.md](references/validation-and-smoke.md)
