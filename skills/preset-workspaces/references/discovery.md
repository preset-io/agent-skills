# Team And Workspace Discovery Reference

## Key Concepts

| Term | Description |
|---|---|
| Team | The top-level organizational unit in Preset. Maps to a Preset subscription. |
| Workspace | An isolated Superset instance inside a team. |
| Team name | Stable team identifier used in Management API paths. Returned by `GET /teams/` as `name`. |
| Workspace hostname | Unique host of a workspace's Superset API. |

## List Teams

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/" | jq '.payload'
```

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for team in teams:
    print(team["name"], team.get("title"))
```

Common response fields:

| Field | Description |
|---|---|
| `name` | Stable team identifier used in subsequent API paths |
| `title` | Human-readable team title |
| `id` | Numeric team ID |
| `created_on` | ISO 8601 creation timestamp |

## Get A Team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/" | jq '.payload'
```

```python
team = client.mgmt("GET", f"/teams/{team_name}/")["payload"]
```

## List Workspaces For A Team

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/" | jq '.payload'
```

```python
workspaces = client.mgmt("GET", f"/teams/{team_name}/workspaces/")["payload"]
for ws in workspaces:
    print(ws["title"], ws["hostname"], ws["workspace_status"])
```

Common response fields:

| Field | Description |
|---|---|
| `id` | Numeric workspace ID |
| `title` | Human-readable workspace title |
| `hostname` | Hostname for the workspace's Superset API |
| `workspace_status` | Status enum such as `READY`, `HIBERNATED`, `UPGRADING`, or `ERROR` |
| `region` | Cloud region |

## Get A Workspace

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/" \
  | jq '.payload'
```

```python
workspace = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/{workspace_id}/",
)["payload"]
hostname = workspace["hostname"]
```

## Resolve Workspace Hostname By Title

```python
def get_workspace_hostname(client, team_name, workspace_title):
    workspaces = client.mgmt("GET", f"/teams/{team_name}/workspaces/")["payload"]
    for ws in workspaces:
        if ws["title"].lower() == workspace_title.lower():
            return ws["hostname"]
    raise ValueError(f"Workspace '{workspace_title}' not found in team '{team_name}'")
```

When a user specifies a particular team or workspace by name, filter listing results to find the matching hostname rather than assuming a specific value.

## Iterate Across All Workspaces

```python
teams = client.mgmt("GET", "/teams/")["payload"]
for team in teams:
    workspaces = client.mgmt("GET", f"/teams/{team['name']}/workspaces/")["payload"]
    for ws in workspaces:
        hostname = ws["hostname"]
        state = ws["workspace_status"]
        print(f"{team['name']} / {ws['title']} - {hostname} ({state})")
```

## Check Workspace Health Before Workspace API Calls

```python
def workspace_is_ready(ws):
    return ws["workspace_status"] == "READY"


for ws in workspaces:
    if not workspace_is_ready(ws):
        print(f"Skipping {ws['title']}: workspace is {ws['workspace_status']}")
        continue
    # Safe to make Superset API calls.
```
