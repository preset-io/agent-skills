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

Each skill keeps the always-loaded instructions small and stores detailed API examples in `references/` files loaded on demand.

## Supported Clients

| Client | Entry point |
|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` |
| Claude Code | `.claude-plugin/plugin.json` and `CLAUDE.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |

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

## Safety Policy

Agents should default to metadata reads. Some `GET` endpoints can expose customer data or database structure, including chart data, table samples, SQL Lab results, distinct values, and exports. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, SQL result retrieval, chart data retrieval, table sample retrieval, distinct-value retrieval, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 - see [`LICENSE`](./LICENSE)
