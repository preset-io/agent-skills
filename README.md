# Preset Agent Skills

Agent API guidance for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform. This repository packages skills for authenticating with Preset, discovering workspaces, administering teams/workspaces, and using version-aware Superset workspace APIs through public APIs.

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
```

Each `SKILL.md` stays small and always-loaded; detailed API examples live in `references/` files the agent loads on demand, so the always-on context budget stays tight.

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
| [preset-api](skills/preset-api/SKILL.md) | Authenticate with the Preset Management API. Covers credentials, JWT exchange, base URLs, pagination, Rison query parameters, response handling, and the shared safety policy. Required by all other skills. |
| [preset-workspaces](skills/preset-workspaces/SKILL.md) | List and inspect teams and workspaces, resolve workspace hostnames, check workspace status, and list workspace membership. |
| [preset-admin](skills/preset-admin/SKILL.md) | Manage team memberships, workspace lifecycle, invite lifecycle, role identifiers, seat-limit checks, and audit logs with confirmation-gated mutations. |
| [preset-superset](skills/preset-superset/SKILL.md) | Discover workspace Superset version, OpenAPI, current-user permissions, menu capabilities, and workspace API safety classification. |
| [preset-dashboards](skills/preset-dashboards/SKILL.md) | Inspect dashboards, charts, dashboard charts/datasets/tabs, thumbnails/screenshots, and chart data safety boundaries. |
| [preset-datasets](skills/preset-datasets/SKILL.md) | Inspect database connections, schemas, catalogs, tables, datasets, columns, metrics, table metadata, and data-returning dataset boundaries. |
| [preset-sqllab](skills/preset-sqllab/SKILL.md) | Inspect SQL Lab bootstrap, query history, saved queries, and SQL execution safety boundaries. |
| [preset-import-export](skills/preset-import-export/SKILL.md) | Route Superset workspace import/export workflows with disclosure and mutation gates. |
| [preset-embedding](skills/preset-embedding/SKILL.md) | Inspect embedded dashboard configuration and route guest-token/trusted-domain workflows to security-sensitive review. |

Broader user groups, SCIM, RLS, DAR/permission APIs, guest-token creation, SQL execution, database changes, API key CRUD, billing/payment, and other sensitive workflows require separate review before they are documented here. The admin skill includes team-admin membership, invite, workspace lifecycle, and audit examples; those require explicit confirmation and appropriate permissions. Import/export workflows are documented with disclosure and mutation gates.

## How Skills Compose

For any workspace task, agents walk a fixed dependency chain:

1. **`preset-api`** — exchange `PRESET_CLIENT_ID` / `PRESET_CLIENT_SECRET` for a JWT and build a reusable client.
2. **`preset-workspaces`** — list teams and workspaces; resolve the workspace hostname from the API (never hard-coded).
3. **`preset-superset`** — pin examples to the workspace's actual Superset build via `/version` and `/api/v1/_openapi`; check `/me/roles/` if permissions are uncertain.
4. **Domain skill** — load the focused `references/` file for the operation: `preset-dashboards`, `preset-datasets`, `preset-sqllab`, `preset-import-export`, or `preset-embedding`.
5. **Safety gate** — before any mutation, export, SQL execution, or data-returning read, load [`preset-api/references/safety-policy.md`](skills/preset-api/references/safety-policy.md), summarize target + payload + effect, and get explicit user confirmation.

For Management API admin work (teams, invites, roles, audits, workspace lifecycle), substitute `preset-admin` for steps 3–4.

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

Full Superset workspace API documentation is available at [superset.apache.org/developer-docs/api](https://superset.apache.org/developer-docs/api/). Treat the Preset Management API examples in this repo as Preset-specific guidance.

For Superset workspace calls, prefer the target workspace's own `GET /version` and `GET /api/v1/_openapi` responses over broad public docs when pinning examples to a deployed workspace.

## Smoke Test

Run the package shape smoke test before publishing changes:

```bash
./scripts/smoke-test.sh
```

The smoke test checks required skill folders, frontmatter, client manifests, Copilot instructions, and removal of legacy `api/skills` paths.

For live read-only validation against a workspace, use the live smoke script with API credentials:

```bash
PRESET_CLIENT_ID="..." \
PRESET_CLIENT_SECRET="..." \
PRESET_WORKSPACE_HOSTNAME="workspace.app.preset.io" \
./scripts/live-workspace-smoke.sh
```

When `PRESET_WORKSPACE_HOSTNAME` is set, the script verifies the hostname against the Management API workspace list before sending the bearer token to the workspace. If the hostname is omitted, the script selects the first READY workspace returned by the Management API.

Local dev shells such as `superset.local.preset.zone` are not returned by hosted workspace discovery. Use the local override only for local environments:

```bash
PRESET_API_BASE="http://manager.local.preset.zone/api/v1" \
PRESET_WORKSPACE_HOSTNAME="superset.local.preset.zone" \
PRESET_WORKSPACE_SCHEME="http" \
PRESET_ALLOW_LOCAL_WORKSPACE_HOSTS="true" \
PRESET_OPENAPI_EXPECTED_STATUSES="200,404" \
./scripts/live-workspace-smoke.sh
```

The live smoke script skips SQL text-bearing query and saved-query endpoints by default. Set `PRESET_INCLUDE_SQL_TEXT_ENDPOINTS=true` only after confirming that the target, page size, and expected SQL-text exposure are acceptable.

## Safety Policy

Agents should default to metadata reads. Some `GET` endpoints can expose customer data, SQL text, database connection configuration, or database structure, including chart data, table samples, SQL Lab results, query history, saved queries, distinct values, and exports. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, SQL result retrieval, chart data retrieval, table sample retrieval, query-history retrieval, saved-query retrieval, database connection configuration retrieval, distinct-value retrieval, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 - see [`LICENSE`](./LICENSE)
