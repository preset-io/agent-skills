# Validation And Smoke Patterns

Use this reference for safe import/export validation.

## Preferred Validation

For smoke validation, prefer OpenAPI presence checks for import/export endpoints:

```python
openapi = client.workspace("GET", hostname, "/_openapi")
paths = openapi.get("paths", {})
assert "/api/v1/assets/export/" in paths
assert "/api/v1/dashboard/import/" in paths
```

Verify candidate endpoints against the target workspace's own `/api/v1/_openapi` response before relying on public docs.

## Live Smoke Limits

- Do not live-test imports without explicit approval.
- Do not live-test exports unless the user explicitly approves the disclosure and destination path.
- Do not inspect exported archive contents without applying [bundle-secrets-and-disclosure.md](bundle-secrets-and-disclosure.md).
- Do not use production workspaces for import smoke tests unless the user explicitly approves the exact bundle and rollback plan.

Use `preset-destructive-imports` before testing overwrite, sparse-update, all-assets restore, database import, or secret-bearing import workflows.
