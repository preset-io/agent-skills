# preset-workspaces

Manage Preset teams and workspaces via the Management API.

> **Prerequisite:** Complete authentication using the **preset-api** skill before calling any endpoint below.
> **Safety:** Membership changes and invitations mutate access. Confirm the exact user, team, workspace, and role with the user before making those calls.

## Key concepts

| Term | Description |
|---|---|
| **Team** | The top-level organizational unit in Preset. Maps to a Preset subscription. |
| **Workspace** | An isolated Superset instance inside a team. Each workspace has its own dashboards, charts, datasets, and users. |
| **Team name** | The stable team identifier used in Management API paths (e.g., `acme-data`). Returned by `GET /v1/teams/` as `name`. |
| **Workspace hostname** | The unique host of a workspace's Superset API (e.g., `1a2b3c4d.us1a.preset.io`). |

## Teams

### List all teams

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/" | jq '.payload'
```

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for t in teams:
    print(t["name"], t.get("title"))
```

**Response fields:**

| Field | Description |
|---|---|
| `name` | Stable team identifier used in subsequent API paths |
| `title` | Human-readable team title |
| `id` | Numeric team ID |
| `created_on` | ISO 8601 creation timestamp |

### Get a specific team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/" | jq '.payload'
```

```python
team = client.mgmt("GET", f"/teams/{team_name}/")["payload"]
```

## Workspaces

### List workspaces for a team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/" | jq '.payload'
```

```python
workspaces = client.mgmt("GET", f"/teams/{team_name}/workspaces/")["payload"]
for ws in workspaces:
    print(ws["title"], ws["hostname"], ws["workspace_status"])
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric workspace ID |
| `title` | Human-readable workspace title |
| `hostname` | Hostname for the workspace's Superset API |
| `workspace_status` | Status enum such as `READY`, `HIBERNATED`, `UPGRADING`, or `ERROR` |
| `region` | Cloud region (e.g., `"us-east-1"`) |

### Get a specific workspace

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/" \
  | jq '.payload'
```

```python
workspace = client.mgmt("GET", f"/teams/{team_name}/workspaces/{workspace_id}/")["payload"]
hostname = workspace["hostname"]
```

### Helper: resolve workspace hostname from title

```python
def get_workspace_hostname(client, team_name, workspace_title):
    """Return the API hostname for a workspace by its display title."""
    workspaces = client.mgmt("GET", f"/teams/{team_name}/workspaces/")["payload"]
    for ws in workspaces:
        if ws["title"].lower() == workspace_title.lower():
            return ws["hostname"]
    raise ValueError(f"Workspace '{workspace_title}' not found in team '{team_name}'")
```

## Workspace membership

### List members of a workspace

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/memberships/" \
  | jq '.payload'
```

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/{workspace_id}/memberships/",
)["payload"]
```

**Response fields:**

| Field | Description |
|---|---|
| `user.id` | Numeric user ID required by role-update requests |
| `user.email` | Member's email address |
| `user.username` | Member's Preset username |
| `workspace_role.role_identifier` | Preset workspace role identifier such as `Admin`, `PresetAlpha`, `PresetBeta`, `PresetGamma`, `PresetDelta`, `PresetReportsOnly`, `PresetDashboardsOnly`, `PresetEpsilon`, `PresetNoAccess`, or `PresetLimitedAdmin` |
| `active` | Whether the membership is active |

### Invite a user to a team and workspace

Resolve the intended team role first. The common member role is usually named `User`, but use the role ID returned by your API response rather than hard-coding it:

```python
roles = client.mgmt("GET", "/team-roles/")["payload"]
team_role_id = next(role["id"] for role in roles if role["name"] == "User")
```

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" \
  -d '{"email": "jdoe@example.com", "team_role_id": 2, "workspace_ids": [123], "workspace_role_identifier": "PresetGamma"}'
```

```python
client.mgmt(
    "POST",
    f"/teams/{team_name}/invites/",
    json={
        "email": "jdoe@example.com",
        "team_role_id": team_role_id,
        "workspace_ids": [workspace_id],
        "workspace_role_identifier": "PresetGamma",
    },
)
```

Use the invite API to add users who are not already workspace members. Use `PUT /teams/{team_name}/workspaces/{workspace_id}/membership` for role updates to existing users.

### Update a member's role

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/membership" \
  -d '{"user_id": 42, "role_identifier": "Admin"}'
```

```python
client.mgmt(
    "PUT",
    f"/teams/{team_name}/workspaces/{workspace_id}/membership",
    json={"user_id": user_id, "role_identifier": "Admin"},
)
```

Resolve `user_id` from the workspace membership response before updating a role:

```python
member = next(
    m for m in members if m["user"]["email"].lower() == "jdoe@example.com"
)
user_id = member["user"]["id"]
```

Valid default `role_identifier` values:

| Identifier | Friendly role |
|---|---|
| `Admin` | Workspace Admin |
| `PresetLimitedAdmin` | Limited Admin |
| `PresetAlpha` | Primary Creator |
| `PresetBeta` | Secondary Creator |
| `PresetGamma` | Limited Creator |
| `PresetDelta` | Visualization Creator |
| `PresetReportsOnly` | Viewer |
| `PresetDashboardsOnly` | Dashboard Viewer |
| `PresetEpsilon` | Dashboard Interactor |
| `PresetNoAccess` | No Access |

## Team membership

### List team members

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/memberships/" | jq '.payload'
```

```python
team_members = client.mgmt("GET", f"/teams/{team_name}/memberships/")["payload"]
```

### Invite a user to a team only

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" \
  -d '{"email": "newmember@example.com", "team_role_id": 2}'
```

```python
client.mgmt(
    "POST",
    f"/teams/{team_name}/invites/",
    json={"email": "newmember@example.com", "team_role_id": team_role_id},
)
```

## Common patterns

### Iterate over all workspaces across all teams

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for team in teams:
    workspaces = client.mgmt("GET", f"/teams/{team['name']}/workspaces/")["payload"]
    for ws in workspaces:
        hostname = ws["hostname"]
        state = ws["workspace_status"]
        print(f"{team['name']} / {ws['title']} — {hostname} ({state})")
```

### Check workspace health before making API calls

```python
def workspace_is_ready(ws):
    return ws["workspace_status"] == "READY"

for ws in workspaces:
    if not workspace_is_ready(ws):
        print(f"Skipping {ws['title']}: workspace is {ws['workspace_status']}")
        continue
    # safe to make Superset API calls
```
