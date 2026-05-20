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

## Retrieve

- Destructive import review and approval checklist: [references/destructive-import-approval.md](references/destructive-import-approval.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
