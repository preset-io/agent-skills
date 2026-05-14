---
name: preset-admin
description: Manage Preset teams, workspaces, memberships, invites, role identifiers, and audit logs through the Preset Management API with confirmation-gated mutations. Use when a user needs team membership changes, workspace lifecycle operations, invite lifecycle management, role lookup, seat-limit checks, or audit log queries/downloads.
---

# preset-admin

Use this skill for Preset Management API administration workflows that go beyond read-only workspace discovery.

## Workflow

1. Use `preset-api` first: load its authentication and API convention references, create the reusable Python client as `client`, and configure request conventions.
2. For role-sensitive operations, load [references/role-identifiers.md](references/role-identifiers.md) before choosing any role value.
3. Use `preset-roles-permissions` for permission-sensitive role changes, workspace membership role updates, or access-control review.
4. Load the focused reference for the task:
   - [references/team-memberships.md](references/team-memberships.md) for team users, role changes, removals, and seat checks.
   - [references/workspace-management.md](references/workspace-management.md) for workspace create, update, delete, un-hibernate, and membership edge cases.
   - [references/invites.md](references/invites.md) for pending invites, single and bulk invites, cancellation, and resend.
   - [references/audit-logs.md](references/audit-logs.md) for audit log query, action lookup, and download requests.
5. Before any `POST`, `PUT`, `PATCH`, `DELETE`, audit download, role change, invite, workspace lifecycle action, or member removal, also load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md) and get explicit user confirmation.
6. If the requested workflow is not in the focused references, check [references/deferrals.md](references/deferrals.md) before improvising from adjacent Manager endpoints.

## Guardrails

- Default to read-only calls and preflight checks.
- Treat team roles, workspace roles, invites, group-derived roles, audit downloads, and workspace lifecycle actions as sensitive administration workflows.
- Resolve team names, workspace IDs, workspace names, user IDs, invite IDs, and role identifiers from API responses before mutating anything.
- Do not rely on static role tables when the team payload exposes `workspace_roles`; custom and feature-gated roles can change what is valid for a team.
- Do not use internal `/api-internal/*` Manager routes, billing/payment routes, SCIM provisioning routes, API key CRUD, permission/DAR/RLS APIs, or database connection mutations from this skill.
