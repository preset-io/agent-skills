---
name: preset-roles-permissions
description: Review and route Preset role, workspace membership, permission, and access-control changes through direct API calls with explicit approval. Use only for direct API workflows when a user asks to change team roles, workspace roles, role identifiers, permission grants, DAR/RLS-adjacent access, or effective access. Do not use for MCP-only work.
---

# preset-roles-permissions

Use this skill for permission-sensitive role and access-control workflows.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. For Management API role work, use this skill alongside `preset-admin`; load `preset-admin` role identifier and membership references for the concrete endpoints and payload fields.
3. For workspace API permission checks, use `preset-superset` to inspect `/me/`, `/me/roles/`, and OpenAPI availability.
4. Load [references/role-permission-changes.md](references/role-permission-changes.md) before any role or permission mutation.
5. Load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md), summarize the target principal, current access, new access, seat impact, and rollback path, then get explicit user confirmation.

## Guardrails

- Treat role and permission changes as `permission_write`.
- Do not guess role IDs or custom role identifiers.
- Do not bypass `preset-admin` role identifier guidance for team and workspace membership changes; this skill adds the approval and access-review gate.
- Do not use internal `/api-internal/*`, billing, SCIM, or unsupported permission APIs from this skill.
