---
name: preset-superset
description: Discover and validate direct Superset workspace API capabilities: version, OpenAPI, current user, permissions, menu, and API safety. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-superset

Use before domain-specific workspace API calls when endpoint drift, permissions, or feature availability matter.

## Always

- Use `preset-api` for auth/client setup and `preset-workspaces` for hostname resolution.
- Send bearer tokens only to workspace hostnames resolved from the Preset Management API.
- Prefer the workspace `/api/v1/_openapi` and `/version` over generic Superset docs.
- Keep this skill read-only discovery.

## Retrieve

- Version and OpenAPI: [references/version-and-openapi.md](references/version-and-openapi.md)
- Current user and roles: [references/current-user-and-permissions.md](references/current-user-and-permissions.md)
- Menu and feature discovery: [references/menu-and-feature-discovery.md](references/menu-and-feature-discovery.md)
- Safety classification for data, export, credential, or execution endpoints: [references/workspace-api-safety.md](references/workspace-api-safety.md)

## Do Not

- Do not run SQL, fetch chart data, export/import assets, mutate workspace objects, issue guest tokens, or change access controls from this skill.
