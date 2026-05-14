# Workspace Management Reference

Use `preset-workspaces` for read-only discovery and hostname resolution. Use this reference when the task involves workspace lifecycle management or membership edge cases.

Workspace create, update, delete, un-hibernate, and membership role changes are sensitive administration workflows. Load the safety policy and get explicit confirmation before mutating.

## Create A Workspace

Confirmation summary should include the target `team_name`, workspace title, region or cluster selection, whether example data will be loaded, and any public dashboard or embedding-related setting.

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/" \
  -d '{"title":"Analytics","region":"us-east-1","load_examples":true}'
```

```python
workspace = client.mgmt(
    "POST",
    f"/teams/{team_name}/workspaces/",
    json={
        "title": "Analytics",
        "region": "us-east-1",
        "load_examples": True,
    },
)["payload"]
```

Common request fields:

| Field | Description |
|---|---|
| `title` | Required workspace title |
| `region` | Region for workspace placement |
| `cluster_id` | Explicit cluster ID, when approved |
| `load_examples` | Whether to load examples; defaults true in Manager |
| `icon`, `color`, `descr` | Workspace display metadata |
| `allow_public_dashboards` | Public dashboard setting |

## Update A Workspace

`PUT` updates the workspace resource, but Manager does not treat every omitted field as preserved. Some omitted optional fields are passed to the manager as `None` or `False`, which can clear display metadata or disable boolean settings. Always read the current workspace first and send the full desired state for fields managed by this endpoint.

Confirmation summary should include the target `team_name`, workspace ID, current title, current hostname, every field being preserved, every field being changed, and the expected effect.

```bash
CURRENT_WORKSPACE="$(curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/")"

CURRENT_WORKSPACE="$CURRENT_WORKSPACE" jq -n '{
  title: "Analytics",
  descr: (env.CURRENT_WORKSPACE | fromjson | .payload.descr),
  color: (env.CURRENT_WORKSPACE | fromjson | .payload.color),
  icon: (env.CURRENT_WORKSPACE | fromjson | .payload.icon),
  allow_public_dashboards: (env.CURRENT_WORKSPACE | fromjson | .payload.allow_public_dashboards)
}' \
| curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/" \
  -d @-
```

```python
current = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/{workspace_id}/",
)["payload"]

payload = {
    "title": "Analytics",
    "descr": current.get("descr"),
    "color": current.get("color"),
    "icon": current.get("icon"),
    "allow_public_dashboards": current.get("allow_public_dashboards", False),
}

updated = client.mgmt(
    "PUT",
    f"/teams/{team_name}/workspaces/{workspace_id}/",
    json=payload,
)["payload"]
```

Do not include secrets such as `slack_token` unless the user explicitly asks and provides an approved secret-handling path. Treat AI Assist, embedding, MCP, and Copilot settings as separate sensitive configuration changes, not incidental workspace metadata updates.

## Delete A Workspace

Deleting a workspace is destructive. Confirmation must name the team, workspace ID, workspace title, hostname, and expected deletion effect.

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/"
```

```python
client.mgmt("DELETE", f"/teams/{team_name}/workspaces/{workspace_id}/")
```

## Un-Hibernate A Workspace

Un-hibernating may resume compute and incur runtime cost. Confirm the target `team_name`, workspace title, stable workspace `name`, hostname, and expected cost or availability effect before calling this endpoint.

```bash
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_name}/un-hibernate/"
```

```python
workspace = client.mgmt(
    "PATCH",
    f"/teams/{team_name}/workspaces/{workspace_name}/un-hibernate/",
)["payload"]
```

Use the stable workspace `name`, not the display title.

## Workspace Membership Edge Cases

The read-only workspace membership list lives in `preset-workspaces`. These details are important for admin work:

- `GET /teams/{team_name}/workspaces/{workspace_id_or_name}/memberships/` accepts either a numeric workspace ID or `name-<workspace_name>`.
- Use `user_name_or_email` to search members.
- The response is paginated and returns `meta.count`.
- `is_role_from_group` means the visible role is inherited from a group. Updating a direct user role may not change effective access.

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/name-{workspace_name}/memberships/"
    "?page_number=1&page_size=100"
    "&user_name_or_email=jdoe@example.com",
)["payload"]
```

## Workspace User Access

This read-only endpoint returns workspace access information suitable for non-admin displays:

```python
access = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/{workspace_name}/user-access/",
)["payload"]
```

## Defer Adjacent Workspace Admin APIs

Do not use this skill for database connection creation/update/test, embedded guest tokens, embedded access-token keys, trusted domains, homepage settings, workspace cloning, hibernation recovery, internal health checks, or internal `/api-internal/*` workspace operations. See [deferrals.md](deferrals.md).
