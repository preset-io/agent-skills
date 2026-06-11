---
name: preset-workspaces
description: Discover Preset teams and workspaces through direct Management API calls, including workspace lookup, hostnames, health/status, and read-only memberships. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-workspaces

Use for read-only team, workspace, hostname, health, and workspace membership discovery.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known.
- Resolve workspace hostnames from Management API responses; never assume or hard-code them.
- Keep this skill read-only.
- Route team membership mutations, invites, roles, seat-limit checks, audit logs, and workspace lifecycle work to `preset-admin`.

## Decision Rules

- Treat Management API team/workspace discovery as read-only.
- Distinguish membership listing from access change.
- Use discovered workspace hostname and status.
- Avoid changing access.

## Workflow Order

1. List teams and workspaces.
2. Resolve workspace hostname and status.
3. Describe membership boundaries.
4. Stop before access changes.

## Retrieve

- Team/workspace listing, lookup, hostname resolution, health: [references/discovery.md](references/discovery.md)
- Workspace membership listing: [references/membership.md](references/membership.md)
- API conventions and environment base URLs: load `preset-api` and then `references/api-conventions.md`.
