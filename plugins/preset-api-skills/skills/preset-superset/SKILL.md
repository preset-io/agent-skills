---
name: preset-superset
description: Discover and validate the direct Superset workspace API surface for a Preset workspace. Use only for direct API workflows before domain-specific workspace API skills when a user needs workspace version, OpenAPI, current-user permissions, menu capabilities, or API safety classification. Do not use for MCP-only work.
---

# preset-superset

Use this skill to prepare safe, version-aware Superset workspace API access.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Load the focused reference for the task:
   - [references/version-and-openapi.md](references/version-and-openapi.md) to capture `/version` and `/api/v1/_openapi`.
   - [references/current-user-and-permissions.md](references/current-user-and-permissions.md) to inspect `/api/v1/me/` and `/api/v1/me/roles/`.
   - [references/menu-and-feature-discovery.md](references/menu-and-feature-discovery.md) to inspect `/api/v1/menu/` and visible workspace capabilities.
   - [references/workspace-api-safety.md](references/workspace-api-safety.md) before calling endpoints that return customer data, exports, credentials, or execution results.

Only send bearer tokens to workspace hostnames resolved from the Preset Management API, except for explicit local-dev smoke validation against known local hosts.

## Scope

This skill is read-only discovery. Do not use it to run SQL, fetch chart data, export assets, import assets, mutate dashboard state, mutate datasets/databases, issue guest tokens, or change access controls.

Treat the public Superset API documentation as broad reference material. For Preset workspace calls, prefer the workspace's own `/api/v1/_openapi` response and `/version` metadata when available.
