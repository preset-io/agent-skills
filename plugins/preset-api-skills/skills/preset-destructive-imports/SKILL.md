---
name: preset-destructive-imports
description: Review destructive, overwrite-capable, sparse-update, all-assets restore, database import, and secret-bearing Preset import workflows through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-destructive-imports

Use for imports that can overwrite, replace, or materially change workspace assets.

## Always

- Use `preset-api`, `preset-workspaces`, `preset-superset`, and `preset-import-export` first.
- Treat overwrite and sparse-update imports as destructive.
- Never print import secrets or database passwords.
- Confirm destination workspace, bundle contents, overwrite behavior, secrets, expected changes, and rollback plan before live testing or import calls.

## Decision Rules

- Classify overwrite-capable, sparse-update, all-assets restore, database import, and secret-bearing import as destructive.
- Require destructive approval wording before import.
- Require backup or rollback plan.
- Inspect bundle metadata without applying changes.

## Workflow Order

1. Inspect bundle metadata.
2. Classify destructive impact.
3. Prepare backup, rollback, secret-handling, and approval summary.
4. Stop before import execution.

## Retrieve

- Destructive import review and approval checklist: [references/destructive-import-approval.md](references/destructive-import-approval.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
