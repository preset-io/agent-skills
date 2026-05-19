# Preset API Skills

Agent API guidance for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform, plus adjacent Snowflake Cortex Agent workflows. This package contains skills for authenticating with Preset, discovering workspaces, administering teams/workspaces, using version-aware Superset workspace APIs, and safely routing Cortex Agent API work.

These skills are for explicit direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. For Model Context Protocol tool workflows, install and use the separate `preset-mcp-skills` package instead. Do not switch from MCP tools to these API skills unless the user explicitly approves changing surfaces.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Route to `preset-mcp-skills`.
- If both API and MCP plugins are installed, MCP intent wins over resource type. A dashboard, chart, dataset, or SQL Lab request should still use MCP guidance when the user asked for MCP.
- Use this package only when the user asks for direct API calls, API credentials, REST endpoints, curl/Python requests, Superset workspace API inspection, or Snowflake Cortex API/operator workflows.
- If an MCP workflow lacks the needed capability, stop and ask whether to switch to direct API. Do not silently escalate.

## Package Structure

```text
skills/
  preset-api/SKILL.md
  preset-workspaces/SKILL.md
  preset-admin/SKILL.md
  preset-superset/SKILL.md
  preset-dashboards/SKILL.md
  preset-datasets/SKILL.md
  preset-sqllab/SKILL.md
  preset-import-export/SKILL.md
  preset-embedding/SKILL.md
  preset-guest-tokens/SKILL.md
  preset-embedded-rls/SKILL.md
  preset-sql-execution/SKILL.md
  preset-database-connections/SKILL.md
  preset-roles-permissions/SKILL.md
  preset-destructive-imports/SKILL.md
  preset-snowflake-cortex/SKILL.md
  preset-cortex-agents/SKILL.md
```

Each `SKILL.md` stays small and always-loaded; detailed API examples live in `references/` files the agent loads on demand, so the always-on context budget stays tight. References are context-loading boundaries after a domain skill has been selected. Phase 6 decomposes dense domain references by task and risk so agents load dashboard metadata, chart data, table samples, SQL results, imports, exports, or embedding changes only when the user request needs that surface. Phase 5 security-sensitive workflows remain separate skills because they need independent routing, explicit confirmation templates, and secret-handling guardrails loaded by construction.

## Supported Clients

| Client | Entry point |
|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` |
| Claude Code | `.claude-plugin/plugin.json` and `CLAUDE.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |

Claude Code uses the plugin manifest for package metadata and `CLAUDE.md` plus the `skills/` directory for convention-based skill discovery. Cursor enumerates skill files directly in `.cursor-plugin/plugin.json`; Codex points at the `skills/` directory through `.codex-plugin/plugin.json`.

## Skills

| Skill | Description |
|---|---|
| [preset-api](skills/preset-api/SKILL.md) | Authenticate with the Preset Management API. Covers credentials, JWT exchange, base URLs, pagination, Rison query parameters, response handling, and the shared safety policy. Required by the other direct API skills in this package. |
| [preset-workspaces](skills/preset-workspaces/SKILL.md) | List and inspect teams and workspaces, resolve workspace hostnames, check workspace status, and list workspace membership. |
| [preset-admin](skills/preset-admin/SKILL.md) | Manage team memberships, workspace lifecycle, invite lifecycle, role identifiers, seat-limit checks, and audit logs with confirmation-gated mutations. |
| [preset-superset](skills/preset-superset/SKILL.md) | Discover workspace Superset version, OpenAPI, current-user permissions, menu capabilities, and workspace API safety classification. |
| [preset-dashboards](skills/preset-dashboards/SKILL.md) | Inspect dashboards, charts, dashboard charts/datasets/tabs, thumbnails/screenshots, and chart data safety boundaries. |
| [preset-datasets](skills/preset-datasets/SKILL.md) | Inspect database connections, schemas, catalogs, tables, datasets, columns, metrics, table metadata, and data-returning dataset boundaries. |
| [preset-sqllab](skills/preset-sqllab/SKILL.md) | Inspect SQL Lab bootstrap, query history, saved queries, and SQL execution safety boundaries. |
| [preset-import-export](skills/preset-import-export/SKILL.md) | Route Superset workspace import/export workflows with disclosure and mutation gates. |
| [preset-embedding](skills/preset-embedding/SKILL.md) | Inspect embedded dashboard configuration and route guest-token/trusted-domain workflows to security-sensitive review. |
| [preset-guest-tokens](skills/preset-guest-tokens/SKILL.md) | Create and route embedded dashboard guest-token workflows with explicit approval and token-handling guardrails. |
| [preset-embedded-rls](skills/preset-embedded-rls/SKILL.md) | Review row-level security clauses for embedded analytics and guest-token workflows. |
| [preset-sql-execution](skills/preset-sql-execution/SKILL.md) | Run or route SQL Lab execution, result retrieval, result export, query stop, saved-query mutation, and SQL Lab permalink creation with explicit approval. |
| [preset-database-connections](skills/preset-database-connections/SKILL.md) | Inspect or route database connection configuration, validation, OAuth, upload, and mutation workflows with credential-aware approval. |
| [preset-roles-permissions](skills/preset-roles-permissions/SKILL.md) | Review and route role, workspace membership, permission, and access-control changes with explicit approval. |
| [preset-destructive-imports](skills/preset-destructive-imports/SKILL.md) | Review and route destructive or overwrite-capable import workflows with explicit approval. |
| [preset-snowflake-cortex](skills/preset-snowflake-cortex/SKILL.md) | Prepare Snowflake Cortex account, authentication, role, warehouse, and safety context before Cortex Agent workflows. |
| [preset-cortex-agents](skills/preset-cortex-agents/SKILL.md) | List, describe, create, update, delete, and run Snowflake Cortex Agents through REST, SQL DDL, or SQL wrapper APIs with explicit approval. |

Broader user groups, SCIM, unsupported DAR/permission APIs, API key CRUD, billing/payment, and other sensitive workflows still require separate review before they are documented here. The Phase 5 skills add explicit routing and loaded-by-construction guardrails for guest tokens, embedded RLS, SQL execution and saved-query workflows, database connections, role/permission changes, and destructive imports. The Cortex skills are Snowflake API/operator guidance and are not Preset embedded-chatbot runtime instructions.

## How Skills Compose

For any workspace task, agents walk a fixed dependency chain:

1. **`preset-api`** — exchange `PRESET_CLIENT_ID` / `PRESET_CLIENT_SECRET` for a JWT and build a reusable client.
2. **`preset-workspaces`** — list teams and workspaces; resolve the workspace hostname from the API (never hard-coded).
3. **`preset-superset`** — pin examples to the workspace's actual Superset build via `/version` and `/api/v1/_openapi`; check `/me/roles/` if permissions are uncertain.
4. **Domain skill** — load the focused task/risk `references/` file for the operation: `preset-dashboards`, `preset-datasets`, `preset-sqllab`, `preset-import-export`, or `preset-embedding`.
5. **Safety gate** — before any mutation, export, SQL execution, or data-returning read, load [`preset-api/references/safety-policy.md`](skills/preset-api/references/safety-policy.md), summarize target + payload + effect, and get explicit user confirmation.

For Management API admin work (teams, invites, roles, audits, workspace lifecycle), substitute `preset-admin` for steps 3–4.

For Phase 5 operations, use the focused security-sensitive skill directly after the foundational setup: `preset-guest-tokens`, `preset-embedded-rls`, `preset-sql-execution`, `preset-database-connections`, `preset-roles-permissions`, or `preset-destructive-imports`. These skills exist so risky workflows load their confirmation templates and secret-handling rules by construction.

For Snowflake Cortex Agent work, use `preset-snowflake-cortex` first to establish Snowflake account, authentication, role, warehouse, region/cross-region inference, and safety context. Then use `preset-cortex-agents` for Cortex Agent object discovery, object management through REST or SQL DDL, REST runs, streaming response handling, or the `SNOWFLAKE.CORTEX.DATA_AGENT_RUN` SQL wrapper. Cortex Agent execution is confirmation-gated because it can invoke tools, use warehouses, consume model budget, and expose governed Snowflake data.

## Quick Start

Generate API credentials from [manage.app.preset.io](https://manage.app.preset.io) by opening your avatar menu, selecting **API keys**, and generating a new API key.

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

Authenticate with the Preset Management API:

```python
import os
import requests

resp = requests.post(
    "https://api.app.preset.io/v1/auth/",
    json={
        "name": os.environ["PRESET_CLIENT_ID"],
        "secret": os.environ["PRESET_CLIENT_SECRET"],
    },
)
resp.raise_for_status()
token = resp.json()["payload"]["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
```

Discover workspaces before calling workspace APIs:

```python
teams = requests.get(
    "https://api.app.preset.io/v1/teams/",
    headers=headers,
)
teams.raise_for_status()
teams = teams.json()["payload"]

for team in teams:
    resp = requests.get(
        f"https://api.app.preset.io/v1/teams/{team['name']}/workspaces/",
        headers=headers,
    )
    resp.raise_for_status()
    for workspace in resp.json()["payload"]:
        print(team["name"], "/", workspace["title"], "-", workspace["hostname"])
```

Use the returned hostname for workspace Superset API calls. Do not hard-code workspace hostnames.

## API Reference

| Layer | Base URL |
|---|---|
| Preset Management API v1 | `https://api.app.preset.io/v1/` |
| Preset Management API v2 | `https://api.app.preset.io/v2/` |
| Workspace Superset API | `https://{workspace_hostname}/api/v1/` |
| Snowflake Cortex REST API | `https://<account_identifier>.snowflakecomputing.com/api/v2/` |

Full Superset workspace API documentation is available at [superset.apache.org/developer-docs/api](https://superset.apache.org/developer-docs/api/). Treat the Preset Management API examples in this repo as Preset-specific guidance.

For Superset workspace calls, prefer the target workspace's own `GET /version` and `GET /api/v1/_openapi` responses over broad public docs when pinning examples to a deployed workspace.

## Smoke Test

From the repository root, run the package shape smoke test before publishing changes:

```bash
./scripts/smoke-test.sh
```

The smoke test checks required skill folders, frontmatter, client manifests, Copilot instructions, package boundaries, and removal of legacy root `skills/` paths.

For live read-only validation against a workspace, use the live smoke script with API credentials:

```bash
PRESET_CLIENT_ID="..." \
PRESET_CLIENT_SECRET="..." \
PRESET_WORKSPACE_HOSTNAME="workspace.app.preset.io" \
./plugins/preset-api-skills/scripts/live-workspace-smoke.sh
```

When `PRESET_WORKSPACE_HOSTNAME` is set, the script verifies the hostname against the Management API workspace list before sending the bearer token to the workspace. If the hostname is omitted, the script selects the first READY workspace returned by the Management API.

Local dev shells such as `superset.local.preset.zone` are not returned by hosted workspace discovery. Use the local override only for local environments:

```bash
PRESET_API_BASE="http://manager.local.preset.zone/api/v1" \
PRESET_WORKSPACE_HOSTNAME="superset.local.preset.zone" \
PRESET_WORKSPACE_SCHEME="http" \
PRESET_ALLOW_LOCAL_WORKSPACE_HOSTS="true" \
PRESET_OPENAPI_EXPECTED_STATUSES="200,404" \
./plugins/preset-api-skills/scripts/live-workspace-smoke.sh
```

The live smoke script skips SQL text-bearing query and saved-query endpoints by default. Set `PRESET_INCLUDE_SQL_TEXT_ENDPOINTS=true` only after confirming that the target, page size, and expected SQL-text exposure are acceptable.

## Safety Policy

Agents should default to metadata reads. Some `GET` endpoints can expose customer data, SQL text, database connection configuration, or database structure, including chart data, table samples, SQL Lab results, query history, saved queries, distinct values, and exports. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, Cortex Agent execution, SQL result retrieval, chart data retrieval, table sample retrieval, query-history retrieval, saved-query retrieval, database connection configuration retrieval, distinct-value retrieval, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 - see [`LICENSE`](../../LICENSE)
