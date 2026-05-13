# preset-agent-skills

Multi-provider agent skills for [Preset](https://preset.io) — managed, cloud-hosted Apache Superset. The same shared skill content runs in **Claude Code**, **Cursor**, **OpenAI Codex**, and **GitHub Copilot**.

## Installation

### Claude Code

```
/plugin marketplace add https://github.com/preset-io/preset-agent-skills.git
/plugin install preset-io@preset-io
```

### Cursor

Configure `.cursor-plugin/plugin.json` from this repo as a Cursor plugin source.

### OpenAI Codex

Codex auto-loads `AGENTS.md` from the repo root, which references all skills.

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

## Team Deployment (Claude Code)

To make this plugin available to your entire team automatically, add the following to your project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "preset-io": {
      "source": {
        "source": "github",
        "repo": "preset-io/preset-agent-skills"
      }
    }
  },
  "enabledPlugins": {
    "preset-io@preset-io": true
  }
}
```

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

The JWT is valid for 6 hours. See **api/skills/preset-api.md** for a reusable client with automatic token refresh.

Use `PRESET_API_BASE` to target non-production environments; production examples use `https://api.app.preset.io/v1`.

### 3 — Discover your workspaces

```python
teams = requests.get(
    "https://api.app.preset.io/v1/teams/", headers=headers
).json()["payload"]

for team in teams:
    workspaces = requests.get(
        f"https://api.app.preset.io/v1/teams/{team['slug']}/workspaces/",
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
    f"https://api.app.preset.io/v1/teams/{first_team['slug']}/workspaces/",
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
