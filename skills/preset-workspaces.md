# preset-workspaces

Manage Preset teams and workspaces via the Management API.

> **Prerequisite:** Complete authentication using the **preset-api** skill before calling any endpoint below.

## Key concepts

| Term | Description |
|---|---|
| **Team** | The top-level organizational unit in Preset. Maps to a Preset subscription. |
| **Workspace** | An isolated Superset instance inside a team. Each workspace has its own dashboards, charts, datasets, and users. |
| **Team slug** | A URL-safe identifier for the team (e.g., `acme-data`). Returned by `GET /api/v1/teams/`. |
| **Workspace hostname** | The unique host of a workspace's Superset API (e.g., `1a2b3c4d.us1a.preset.io`). |

## Teams

### List all teams

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/" | jq '.payload'
```

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for t in teams:
    print(t["name"], t["slug"])
```

**Response fields:**

| Field | Description |
|---|---|
| `name` | Human-readable team name |
| `slug` | URL-safe team identifier used in subsequent calls |
| `id` | Numeric team ID |
| `created_on` | ISO 8601 creation timestamp |

### Get a specific team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/" | jq '.payload'
```

```python
team = client.mgmt("GET", f"/teams/{team_slug}/")["payload"]
```

## Workspaces

### List workspaces for a team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/workspaces/" | jq '.payload'
```

```python
workspaces = client.mgmt("GET", f"/teams/{team_slug}/workspaces/")["payload"]
for ws in workspaces:
    print(ws["title"], ws["workspace_status"]["hostname"])
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric workspace ID |
| `title` | Human-readable workspace title |
| `workspace_status.hostname` | Hostname for the workspace's Superset API |
| `workspace_status.state` | `"running"`, `"starting"`, `"stopped"`, etc. |
| `region` | Cloud region (e.g., `"us-east-1"`) |

### Get a specific workspace

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/workspaces/{workspace_id}/" \
  | jq '.payload'
```

```python
workspace = client.mgmt("GET", f"/teams/{team_slug}/workspaces/{workspace_id}/")["payload"]
hostname = workspace["workspace_status"]["hostname"]
```

### Helper: resolve workspace hostname from title

```python
def get_workspace_hostname(client, team_slug, workspace_title):
    """Return the API hostname for a workspace by its display title."""
    workspaces = client.mgmt("GET", f"/teams/{team_slug}/workspaces/")["payload"]
    for ws in workspaces:
        if ws["title"].lower() == workspace_title.lower():
            return ws["workspace_status"]["hostname"]
    raise ValueError(f"Workspace '{workspace_title}' not found in team '{team_slug}'")
```

## Workspace membership

### List members of a workspace

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/workspaces/{workspace_id}/memberships/" \
  | jq '.payload'
```

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_slug}/workspaces/{workspace_id}/memberships/",
)["payload"]
```

**Response fields:**

| Field | Description |
|---|---|
| `user.email` | Member's email address |
| `user.username` | Member's Preset username |
| `role_identifier` | `"Admin"`, `"Editor"`, or `"Viewer"` |
| `active` | Whether the membership is active |

### Add a member to a workspace

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/workspaces/{workspace_id}/memberships/" \
  -d '{"role_identifier": "Editor", "user": {"username": "jdoe@example.com"}}'
```

```python
client.mgmt(
    "POST",
    f"/teams/{team_slug}/workspaces/{workspace_id}/memberships/",
    json={
        "role_identifier": "Editor",  # "Admin", "Editor", or "Viewer"
        "user": {"username": "jdoe@example.com"},
    },
)
```

Valid `role_identifier` values: `"Admin"`, `"Editor"`, `"Viewer"`.

### Update a member's role

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/workspaces/{workspace_id}/memberships/{membership_id}/" \
  -d '{"role_identifier": "Admin"}'
```

```python
client.mgmt(
    "PUT",
    f"/teams/{team_slug}/workspaces/{workspace_id}/memberships/{membership_id}/",
    json={"role_identifier": "Admin"},
)
```

## Team membership

### List team members

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/memberships/" | jq '.payload'
```

```python
team_members = client.mgmt("GET", f"/teams/{team_slug}/memberships/")["payload"]
```

### Invite a user to a team

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://manage.app.preset.io/api/v1/teams/{team_slug}/memberships/" \
  -d '{"email": "newmember@example.com", "role_identifier": "Member"}'
```

```python
client.mgmt(
    "POST",
    f"/teams/{team_slug}/memberships/",
    json={"email": "newmember@example.com", "role_identifier": "Member"},
)
```

## Common patterns

### Iterate over all workspaces across all teams

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for team in teams:
    workspaces = client.mgmt("GET", f"/teams/{team['slug']}/workspaces/")["payload"]
    for ws in workspaces:
        hostname = ws["workspace_status"]["hostname"]
        state = ws["workspace_status"]["state"]
        print(f"{team['name']} / {ws['title']} — {hostname} ({state})")
```

### Check workspace health before making API calls

```python
def workspace_is_ready(ws):
    return ws["workspace_status"]["state"] == "running"

for ws in workspaces:
    if not workspace_is_ready(ws):
        print(f"Skipping {ws['title']}: workspace is {ws['workspace_status']['state']}")
        continue
    # safe to make Superset API calls
```
