# Preset agent skills

Multi-provider agent skills for [Preset](https://preset.io) — managed, cloud-hosted Apache Superset. The same skill content runs in **Claude Code**, **Cursor**, **OpenAI Codex**, and **GitHub Copilot**.

This file is auto-loaded by OpenAI Codex. Other providers discover skills from `skills/`.

## Installation

### Claude Code

```
/plugin marketplace add https://github.com/preset-io/preset-agent-skills.git
/plugin install preset-io@preset-io
```

### Cursor

Configure `.cursor-plugin/plugin.json` from this repo as a Cursor plugin source.

### OpenAI Codex

Codex auto-loads this `AGENTS.md` and the `skills/` directory from the repo root.

### GitHub Copilot

Add `.github/copilot-instructions.md` referencing the skill files, or include the skill content directly.

## Skills

Agents activate these automatically based on what the user is trying to do.

- **preset-api** — Authenticate with the Preset Management API (API token → JWT bearer token). Base URLs, pagination, Rison encoding, error codes, and security best practices. **Required by all other skills.**
- **preset-workspaces** — List and inspect teams and workspaces. Manage workspace membership (add/remove/update roles). Audit access.
- **preset-dashboards** — Create, retrieve, update, and delete dashboards. Export/import dashboard bundles. Manage embedded dashboard configuration and generate guest tokens for embedding.
- **preset-datasets** — Manage database connections and datasets (physical tables and virtual SQL views). Manage columns, metrics, and cache settings. Execute SQL queries via SQL Lab.
- **preset-users** — Manage Superset users and roles. Apply row-level security (RLS) rules for multi-tenant and fine-grained data access control.

See [`README.md`](./README.md) for installation instructions and team deployment.

---

## Quick-start

### 1 — Set credentials

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

Generate API keys at [manage.app.preset.io](https://manage.app.preset.io) → avatar → **API keys**.

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
hostname = "1a2b3c4d.us1a.preset.io"  # from step 3

dashboards = requests.get(
    f"https://{hostname}/api/v1/dashboard/",
    headers=headers,
).json()["result"]
```
