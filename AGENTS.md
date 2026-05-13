# Preset agent skills

Multi-provider agent skills for [Preset](https://preset.io) — managed, cloud-hosted Apache Superset. The same skill content runs in **Claude Code**, **Cursor**, **OpenAI Codex**, and **GitHub Copilot**.

This file is auto-loaded by OpenAI Codex. Other providers discover skills from `api/skills/`.

## Installation

### Claude Code

```
/plugin marketplace add https://github.com/preset-io/preset-agent-skills.git
/plugin install preset-io@preset-io
```

### Cursor

Configure `.cursor-plugin/plugin.json` from this repo as a Cursor plugin source.

### OpenAI Codex

Codex auto-loads this `AGENTS.md` and the `api/skills/` directory from the repo root.

### GitHub Copilot

Add `.github/copilot-instructions.md` referencing the skill files, or include the skill content directly.

## Skills

Agents activate these automatically based on what the user is trying to do.

- **preset-api** — Authenticate with the Preset Management API (API token → JWT bearer token). Base URLs, pagination, Rison encoding, error codes, and security best practices. **Required by all other skills.**
- **preset-workspaces** — List and inspect teams and workspaces, resolve workspace hostnames, invite users, and update workspace membership with explicit confirmation.
- **preset-dashboards** — Inspect dashboards, dashboard charts, and dashboard datasets in a workspace.
- **preset-datasets** — Inspect database connections, schemas, tables, datasets, columns, and metrics in a workspace.

User, role, RLS, guest-token, import/export, SQL execution, and other mutation workflows are intentionally deferred to later phases.

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
    "https://api.app.preset.io/v1/auth/",
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

Use the hostname returned by step 3 — never use a hardcoded value. For example, to list dashboards in the first workspace of the first team:

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

When a user specifies a particular team or workspace by name, filter the listing results to find the matching hostname rather than assuming any specific value.

## Safety policy

Default to read-only calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, SQL execution, role/RLS change, database connection change, or guest-token creation, summarize the exact target and payload and get explicit user confirmation. These Markdown skills call public APIs directly and do not automatically apply MCP runtime guardrails.
