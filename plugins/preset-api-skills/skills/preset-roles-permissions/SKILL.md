---
name: preset-roles-permissions
description: Review Preset role, workspace membership, permission, access-control, DAR/RLS-adjacent, and effective-access changes through direct API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-roles-permissions

Use as the approval and access-review gate for permission-sensitive workflows.

## Always

- Use `preset-api` first.
- Use this skill alongside `preset-admin` role identifier and membership references for Management API role work.
- Use `preset-superset` for workspace current-user roles, permissions, and OpenAPI availability.
- Treat role and permission changes as `permission_write`.
- Do not guess role IDs or custom role identifiers.
- Require confirmation of target principal, current access, new access, seat impact, and rollback path.

## Decision Rules

- Classify role and permission changes as access mutations.
- Resolve role identifiers before effect summary.
- Require approval with target and effect.
- Avoid applying role or permission changes until approval is explicit.

## Workflow Order

1. Inspect membership roles and permissions.
2. Resolve target and role identifiers.
3. Summarize access effect, seat impact, and rollback path.
4. Stop before role or permission change.

## Retrieve

- Role/permission mutation guidance and approval checks: [references/role-permission-changes.md](references/role-permission-changes.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
