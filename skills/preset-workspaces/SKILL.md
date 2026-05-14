---
name: preset-workspaces
description: List, inspect, and resolve Preset teams and workspaces through the Preset Management API, including workspace hostnames and read-only workspace membership listing. Use when a user needs team discovery, workspace lookup, workspace health/status, or member lists.
---

# preset-workspaces

Use this skill for Preset Management API discovery involving teams, workspaces, and workspace membership. Use `preset-admin` for team membership mutations, workspace lifecycle operations, invite lifecycle management, role identifiers, seat-limit checks, and audit logs.

## Workflow

1. Use `preset-api` first: load its authentication reference, create the reusable Python client as `client`, and configure request conventions.
2. Load [references/discovery.md](references/discovery.md) for read-only team and workspace listing, lookup, hostname resolution, and workspace health checks.
3. Load [references/membership.md](references/membership.md) for workspace membership listing.
4. For administration workflows, route to `preset-admin` and load its focused references.

## Guardrails

- Production Management API examples use `https://api.app.preset.io/v1`. For sandbox or staging environments, set `PRESET_API_BASE` as described in `preset-api`.
- Resolve workspace hostnames from `GET /teams/{team_name}/workspaces/`; never assume or hard-code a hostname.
- Treat workspace membership changes and team invitations as access-control mutations handled by `preset-admin`.
- Do not call `GET /team-roles/` with an API-key JWT; route role and invite workflows to `preset-admin`.
- Use `preset-admin` for Phase 3 admin workflows so role, seat-limit, audit, and deferral guidance is loaded.
