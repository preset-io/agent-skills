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
| **preset-workspaces** | List and inspect teams and workspaces. Add, update, and remove workspace members. Audit team and workspace access. |
| **preset-dashboards** | Create, retrieve, update, and delete dashboards. Export/import dashboard bundles across workspaces. Configure embedded dashboards and generate guest tokens. |
| **preset-datasets** | Manage database connections (create, test, update, delete). Manage datasets — physical tables and virtual SQL-defined views. Add columns and metrics. Sync schema changes. Execute SQL Lab queries. |
| **preset-users** | Manage Superset users and fine-grained roles. Create and assign custom roles. Apply row-level security (RLS) rules for multi-tenant and per-role data access control. |

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
    "https://manage.app.preset.io/api/v1/auth/",
    json={
        "name": os.environ["PRESET_CLIENT_ID"],
        "secret": os.environ["PRESET_CLIENT_SECRET"],
    },
)
token = resp.json()["payload"]["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
```

The JWT is valid for 6 hours. See **skills/preset-api.md** for a reusable client with automatic token refresh.

### 3 — Discover your workspaces

```python
teams = requests.get(
    "https://manage.app.preset.io/api/v1/teams/", headers=headers
).json()["payload"]

for team in teams:
    workspaces = requests.get(
        f"https://manage.app.preset.io/api/v1/teams/{team['slug']}/workspaces/",
        headers=headers,
    ).json()["payload"]
    for ws in workspaces:
        print(team["name"], "/", ws["title"], "→", ws["workspace_status"]["hostname"])
```

### 4 — Call workspace APIs

```python
hostname = "1a2b3c4d.us1a.preset.io"  # from the workspace listing

dashboards = requests.get(
    f"https://{hostname}/api/v1/dashboard/",
    headers=headers,
).json()["result"]
```

## API reference

| Layer | Base URL |
|---|---|
| Preset Management API | `https://manage.app.preset.io/api/v1/` |
| Workspace Superset API | `https://{workspace_hostname}/api/v1/` |

Full API documentation is available at [docs.preset.io](https://docs.preset.io).

## License

Apache 2.0 — see [`LICENSE`](./LICENSE)