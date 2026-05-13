# preset-api

Authenticate and interact with the Preset Management API. This skill is a prerequisite for all other preset-* skills.

## Overview

Preset is a managed, cloud-hosted Apache Superset platform. It exposes two API layers:

1. **Preset Management API** (`https://manage.app.preset.io/api/v1/`) — manage teams, workspaces, users, roles, and billing.
2. **Workspace Superset API** (`https://<workspace-hostname>/api/v1/`) — per-workspace operations: dashboards, charts, datasets, databases, saved queries, and SQL execution.

All requests require a bearer token obtained through the authentication flow below.

## Authentication

### Step 1 — Locate your API credentials

API credentials (a client ID and a client secret) are generated from the Preset management console:

1. Log in to [manage.app.preset.io](https://manage.app.preset.io).
2. Click your avatar → **API keys**.
3. Click **Generate a new API key** and copy both the **API Token Name** (client ID) and the **API Token Secret** (client secret).

Store these values as environment variables — never hard-code them:

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

### Step 2 — Exchange credentials for a JWT

```bash
curl -s -X POST "https://manage.app.preset.io/api/v1/auth/" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$PRESET_CLIENT_ID\", \"secret\": \"$PRESET_CLIENT_SECRET\"}" \
  | jq -r '.payload.access_token'
```

```python
import os, requests

resp = requests.post(
    "https://manage.app.preset.io/api/v1/auth/",
    json={
        "name": os.environ["PRESET_CLIENT_ID"],
        "secret": os.environ["PRESET_CLIENT_SECRET"],
    },
)
resp.raise_for_status()
token = resp.json()["payload"]["access_token"]
```

```javascript
const resp = await fetch("https://manage.app.preset.io/api/v1/auth/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: process.env.PRESET_CLIENT_ID,
    secret: process.env.PRESET_CLIENT_SECRET,
  }),
});
const { payload } = await resp.json();
const token = payload.access_token;
```

The JWT is valid for **6 hours**. Cache it and re-request only when it expires (HTTP 401).

### Step 3 — Attach the token to every request

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Helper: authenticated session (Python)

```python
import os, time, requests

class PresetClient:
    MGMT_BASE = "https://manage.app.preset.io/api/v1"

    def __init__(self):
        self._token = None
        self._token_expiry = 0
        self._session = requests.Session()

    def _ensure_token(self):
        if time.time() < self._token_expiry - 60:
            return
        resp = self._session.post(
            f"{self.MGMT_BASE}/auth/",
            json={
                "name": os.environ["PRESET_CLIENT_ID"],
                "secret": os.environ["PRESET_CLIENT_SECRET"],
            },
        )
        resp.raise_for_status()
        self._token = resp.json()["payload"]["access_token"]
        self._token_expiry = time.time() + 6 * 3600  # tokens live 6 h

    def mgmt(self, method, path, **kwargs):
        self._ensure_token()
        self._session.headers.update({"Authorization": f"Bearer {self._token}"})
        resp = self._session.request(method, f"{self.MGMT_BASE}{path}", **kwargs)
        resp.raise_for_status()
        return resp.json()

    def workspace(self, method, workspace_hostname, path, **kwargs):
        """Call the per-workspace Superset API."""
        self._ensure_token()
        self._session.headers.update({
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json",
        })
        url = f"https://{workspace_hostname}/api/v1{path}"
        resp = self._session.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp.json()

client = PresetClient()
```

## Base URLs

| Layer | Base URL |
|---|---|
| Management API | `https://manage.app.preset.io/api/v1` |
| Workspace API (US region) | `https://<workspace-hostname>/api/v1` |

To find a workspace's hostname, call `GET /api/v1/teams/{team_slug}/workspaces/` and inspect the `workspace_status.hostname` field (see **preset-workspaces** skill).

## Common response codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no content |
| `400` | Bad request — check your JSON body |
| `401` | Unauthenticated — re-request a token |
| `403` | Forbidden — check team/workspace permissions |
| `404` | Resource not found |
| `429` | Rate limited — back off and retry with exponential delay |

## Rate limits

The Management API enforces per-IP rate limits. If you receive `429 Too Many Requests`, wait the number of seconds specified in the `Retry-After` response header before retrying.

## Pagination

Management API list endpoints return paginated results:

```json
{
  "payload": [...],
  "total": 42,
  "page": 1,
  "page_size": 25
}
```

Use `?page=N&page_size=100` to paginate. Superset API endpoints use cursor-based pagination with `?q=(page:0,page_size:100)` (Rison-encoded) query parameters.

## Rison encoding for Superset API queries

Many Superset API endpoints accept a `q` parameter encoded in [Rison](https://github.com/Nanonid/rison) format:

```python
# Install: pip install rison
import rison

query = rison.dumps({
    "page": 0,
    "page_size": 25,
    "order_column": "changed_on_delta_humanized",
    "order_direction": "desc",
    "filters": [{"col": "published", "opr": "FilterEqual", "value": True}],
})
# ?q=(filters:!((col:published,opr:FilterEqual,value:!t)),order_column:changed_on_delta_humanized,order_direction:desc,page:0,page_size:25)
```

## Security best practices

- Store `PRESET_CLIENT_ID` and `PRESET_CLIENT_SECRET` in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets).
- Never log or print access tokens.
- Rotate API keys periodically from the Preset management console.
- Scope API keys to the minimum permissions required.
- Tokens expire in 6 hours; implement automatic refresh on 401 errors.
