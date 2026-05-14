# Preset Agent Skills

Agent API guidance for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform. This repository packages skills for authenticating with Preset, discovering workspaces, and inspecting dashboards and datasets through public APIs.

## Package Structure

```text
skills/
  preset-api/SKILL.md
  preset-workspaces/SKILL.md
  preset-dashboards/SKILL.md
  preset-datasets/SKILL.md
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
| [preset-workspaces](skills/preset-workspaces/SKILL.md) | List and inspect teams and workspaces, resolve workspace hostnames, check workspace status, list members, invite users, and update workspace membership with explicit confirmation. |
| [preset-dashboards](skills/preset-dashboards/SKILL.md) | Inspect dashboards, dashboard charts, and dashboard datasets in a workspace. Read-only. |
| [preset-datasets](skills/preset-datasets/SKILL.md) | Inspect database connections, schemas, tables, datasets, columns, and metrics in a workspace. Read-only. |

Broader user administration, RLS, guest-token, import/export, SQL execution, database changes, destructive operations, and other sensitive workflows require separate review before they are documented here. The workspace skill includes limited team-admin membership and invite examples; those require explicit confirmation and appropriate permissions.

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
| Preset Management API | `https://api.app.preset.io/v1/` |
| Workspace Superset API | `https://{workspace_hostname}/api/v1/` |

Full Superset workspace API documentation is available at [superset.apache.org/developer-docs/api](https://superset.apache.org/developer-docs/api/). Treat the Preset Management API examples in this repo as Preset-specific guidance.

## Smoke Test

Run the package shape smoke test before publishing changes:

```bash
./scripts/smoke-test.sh
```

The smoke test checks required skill folders, frontmatter, client manifests, Copilot instructions, and removal of legacy `api/skills` paths.

## Safety Policy

Agents should default to read-only calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, SQL execution, role/RLS change, database connection change, dataset mutation, dashboard mutation, or guest-token creation, summarize the exact target, payload, and expected effect, then get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 - see [`LICENSE`](./LICENSE)
