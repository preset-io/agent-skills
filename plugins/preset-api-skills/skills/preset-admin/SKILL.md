---
name: preset-admin
description: Manage Preset teams, workspaces, memberships, invites, role identifiers, seat checks, and audit logs through direct Management API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-admin

Use for Preset Management API administration beyond read-only workspace discovery.

## Always

- Use `preset-api` first for auth/client setup.
- Default to read-only preflight and ID/role lookup.
- Resolve team, workspace, user, invite, and role identifiers from API responses before mutations.
- Get explicit confirmation before role changes, invites, member removals, workspace lifecycle actions, audit downloads, or any write.
- Use `preset-roles-permissions` for permission-sensitive role/access changes.

## Retrieve

- Team users, role changes, removals, seats: [references/team-memberships.md](references/team-memberships.md)
- Workspace create/update/delete/un-hibernate: [references/workspace-management.md](references/workspace-management.md)
- Invites, cancellation, resend, bulk invite: [references/invites.md](references/invites.md)
- Audit log lookup and downloads: [references/audit-logs.md](references/audit-logs.md)
- Role identifiers: [references/role-identifiers.md](references/role-identifiers.md)
- Unsupported or adjacent Manager endpoints: [references/deferrals.md](references/deferrals.md)
- Approval policy before writes/downloads: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)

## Do Not

- Do not use internal `/api-internal/*`, billing/payment, SCIM, API key CRUD, permission/DAR/RLS, or database connection mutation routes from this skill.
