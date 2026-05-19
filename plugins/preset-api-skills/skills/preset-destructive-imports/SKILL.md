---
name: preset-destructive-imports
description: Review and route destructive or overwrite-capable Preset import workflows through direct Superset API calls with explicit approval. Use only for direct API workflows when a user asks to import assets with overwrite, sparse update, database passwords, replacement bundles, destructive changes, or all-assets restore workflows. Do not use for MCP-only work.
---

# preset-destructive-imports

Use this skill for import workflows that can overwrite, replace, or materially change workspace assets.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI before relying on import fields.
4. Use `preset-import-export` for general import/export endpoint maps.
5. Load [references/destructive-import-approval.md](references/destructive-import-approval.md) before any overwrite, sparse-update, all-assets import, database import, or secret-bearing import.
6. Load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md), summarize the bundle, overwrite behavior, secrets, expected changes, and rollback plan, then get explicit user confirmation.

## Guardrails

- Do not live-test imports without explicit user approval.
- Never print import secrets or database passwords.
- Treat overwrite and sparse-update imports as potentially destructive.
- Confirm destination workspace and bundle contents before calling an import endpoint.
