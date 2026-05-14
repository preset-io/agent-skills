---
name: preset-workspaces
description: List, inspect, and resolve Preset teams and workspaces through the Preset Management API, including workspace hostnames and guarded membership workflows. Use when a user needs team discovery, workspace lookup, workspace health/status, member lists, invitations, or workspace role updates.
---

# preset-workspaces

Use this skill for Preset Management API discovery involving teams, workspaces, and workspace membership. Use `preset-admin` for team membership mutations, workspace lifecycle operations, invite lifecycle management, role identifiers, seat-limit checks, and audit logs.

## Workflow

1. Use `preset-api` first: load its authentication reference, create the reusable Python client as `client`, and configure request conventions.
2. Load [references/discovery.md](references/discovery.md) for read-only team and workspace listing, lookup, hostname resolution, and workspace health checks.
3. Load [references/membership.md](references/membership.md) for membership listing and the legacy guarded workspace invite/update examples.
4. For new administration workflows, route to `preset-admin` and load its focused references.
5. For invitations or role changes, also load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md) and require explicit user confirmation before making the request.

## Guardrails

- Production Management API examples use `https://api.app.preset.io/v1`. For sandbox or staging environments, set `PRESET_API_BASE` as described in `preset-api`.
- Resolve workspace hostnames from `GET /teams/{team_name}/workspaces/`; never assume or hard-code a hostname.
- Treat workspace membership and team invitations as access-control mutations.
- Do not call `GET /team-roles/` with an API-key JWT; resolve `team_role_id` from an approved admin context before invite calls.
- Use `preset-admin` for Phase 3 admin workflows so role, seat-limit, audit, and deferral guidance is loaded.
