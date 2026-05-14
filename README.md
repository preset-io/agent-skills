# Preset Agent Skills

Agent API guidance for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform. This repository helps coding agents authenticate with Preset, discover workspaces, and inspect dashboards and datasets through the public APIs.

## Entry Points

- **OpenAI Codex:** reads `AGENTS.md` from the repo root.
- **Claude Code:** reads `CLAUDE.md` from the repo root.
- **Cursor:** use `.cursor-plugin/plugin.json` as the Cursor plugin manifest.
- **GitHub Copilot:** reference the Markdown skill files from `.github/copilot-instructions.md`, or include the relevant guidance directly.

Native plugin packaging for clients that require additional manifests is planned separately. The canonical skill content in this repository is currently Markdown under `api/skills/`.

## Skills

Use these skill files based on the task:

| Skill | Description |
|---|---|
| [preset-api](api/skills/preset-api.md) | Authenticate with the Preset Management API (client ID + secret to JWT bearer token). Covers base URLs, pagination, Rison-encoded query parameters, error codes, rate limits, and security best practices. Required by all other skills. |
| [preset-workspaces](api/skills/preset-workspaces.md) | List and inspect teams and workspaces, resolve workspace hostnames, invite users, and update workspace membership with explicit confirmation. |
| [preset-dashboards](api/skills/preset-dashboards.md) | Inspect dashboards, dashboard charts, and dashboard datasets in a workspace. |
| [preset-datasets](api/skills/preset-datasets.md) | Inspect database connections, schemas, tables, datasets, columns, and metrics in a workspace. |

User, role, RLS, guest-token, import/export, SQL execution, and other sensitive mutation workflows require separate review before they are documented here.

## Quick start

### 1 — Generate API credentials

1. Log in to [manage.app.preset.io](https://manage.app.preset.io).
2. Click your avatar → **API keys** → **Generate a new API key**.
3. Copy the **API Token Name** (client ID) and **API Token Secret** (client secret).

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

### 2 — Authenticate

```python
import os, requests

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

The JWT is valid for 5 hours by default. See **api/skills/preset-api.md** for a reusable client with automatic token refresh.

Use `PRESET_API_BASE` to target non-production environments; production examples use `https://api.app.preset.io/v1`.

### 3 — Discover your workspaces

```python
teams = requests.get(
    "https://api.app.preset.io/v1/teams/", headers=headers
)
teams.raise_for_status()
teams = teams.json()["payload"]

for team in teams:
    resp = requests.get(
        f"https://api.app.preset.io/v1/teams/{team['name']}/workspaces/",
        headers=headers,
    )
    resp.raise_for_status()
    workspaces = resp.json()["payload"]
    for ws in workspaces:
        print(team["name"], "/", ws["title"], "→", ws["hostname"])
```

### 4 — Call workspace APIs

Use the hostname returned by step 3 — never use a hardcoded value:

```python
# Derive hostname from the workspace listing — do not hardcode it
first_team = teams[0]
resp = requests.get(
    f"https://api.app.preset.io/v1/teams/{first_team['name']}/workspaces/",
    headers=headers,
)
resp.raise_for_status()
first_workspace = resp.json()["payload"][0]
hostname = first_workspace["hostname"]

resp = requests.get(
    f"https://{hostname}/api/v1/dashboard/",
    headers=headers,
)
resp.raise_for_status()
dashboards = resp.json()["result"]
```

## API reference

| Layer | Base URL |
|---|---|
| Preset Management API | `https://api.app.preset.io/v1/` |
| Workspace Superset API | `https://{workspace_hostname}/api/v1/` |

Full Superset workspace API documentation is available at [superset.apache.org/developer-docs/api](https://superset.apache.org/developer-docs/api/). Treat the Preset Management API examples in this repo as Preset-specific guidance.

## Safety policy

Agents should default to read-only calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, SQL execution, role/RLS change, database connection change, or guest-token creation, summarize the exact target, payload, and expected effect, then get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 — see [`LICENSE`](./LICENSE)
