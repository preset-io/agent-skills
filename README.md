# preset-agent-skills

Phase 1 seed API skills for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform. This PR ships Markdown guidance for direct API use; native Claude/Codex plugin packaging and `skills/**/SKILL.md` layout are deferred to Phase 2.

## Current usage

### Claude Code

Native Claude plugin packaging is not included in Phase 1. Until `.claude-plugin/plugin.json` and `skills/**/SKILL.md` exist, use the Markdown files in `api/skills/` as reference material.

### Cursor

Configure `.cursor-plugin/plugin.json` from this repo as a Cursor plugin source.

### OpenAI Codex

Codex auto-loads `AGENTS.md` from the repo root, which references the Phase 1 Markdown skill files.

### GitHub Copilot

Add `.github/copilot-instructions.md` referencing the skill files, or include the skill content in your repository's Copilot instructions.

## Skills

Agents activate these automatically based on the user's request.

| Skill | Description |
|---|---|
| **preset-api** | Authenticate with the Preset Management API (client ID + secret → JWT bearer token). Covers base URLs, pagination, Rison-encoded query parameters, error codes, rate limits, and security best practices. **Required by all other skills.** |
| **preset-workspaces** | List and inspect teams and workspaces, resolve workspace hostnames, invite users, and update workspace membership with explicit confirmation. |
| **preset-dashboards** | Inspect dashboards, dashboard charts, and dashboard datasets in a workspace. |
| **preset-datasets** | Inspect database connections, schemas, tables, datasets, columns, and metrics in a workspace. |

User, role, RLS, guest-token, import/export, SQL execution, and other mutation workflows are intentionally deferred to later phases.

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
token = resp.json()["payload"]["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
```

The JWT is valid for 5 hours by default. See **api/skills/preset-api.md** for a reusable client with automatic token refresh.

Use `PRESET_API_BASE` to target non-production environments; production examples use `https://api.app.preset.io/v1`.

### 3 — Discover your workspaces

```python
teams = requests.get(
    "https://api.app.preset.io/v1/teams/", headers=headers
).json()["payload"]

for team in teams:
    workspaces = requests.get(
        f"https://api.app.preset.io/v1/teams/{team['name']}/workspaces/",
        headers=headers,
    ).json()["payload"]
    for ws in workspaces:
        print(team["name"], "/", ws["title"], "→", ws["hostname"])
```

### 4 — Call workspace APIs

Use the hostname returned by step 3 — never use a hardcoded value:

```python
# Derive hostname from the workspace listing — do not hardcode it
first_team = teams[0]
first_workspace = requests.get(
    f"https://api.app.preset.io/v1/teams/{first_team['name']}/workspaces/",
    headers=headers,
).json()["payload"][0]
hostname = first_workspace["hostname"]

dashboards = requests.get(
    f"https://{hostname}/api/v1/dashboard/",
    headers=headers,
).json()["result"]
```

## API reference

| Layer | Base URL |
|---|---|
| Preset Management API | `https://api.app.preset.io/v1/` |
| Workspace Superset API | `https://{workspace_hostname}/api/v1/` |

Full Superset workspace API documentation is available at [superset.apache.org/developer-docs/api](https://superset.apache.org/developer-docs/api/). Treat the Preset Management API examples in this repo as Preset-specific guidance.

## Safety policy

Agents should default to read-only calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, SQL execution, role/RLS change, database connection change, or guest-token creation, summarize the exact target and payload and get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.

## License

Apache 2.0 — see [`LICENSE`](./LICENSE)
