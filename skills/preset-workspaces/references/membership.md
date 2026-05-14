# Membership Reference

Workspace membership and invite endpoints require team-admin permissions. API-key JWTs are accepted, but requests return `403` if the key owner is not a team admin.

Membership changes and invitations mutate access. Confirm the exact user, team, workspace, and role with the user before making those calls.

## List Workspace Members

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/workspaces/{workspace_id}/memberships/?page_number=1&page_size=100" \
  | jq '.payload'
```

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_name}/workspaces/{workspace_id}/memberships/?page_number=1&page_size=100",
)["payload"]
```

Common response fields:

| Field | Description |
|---|---|
| `user.id` | Numeric user ID required by role-update requests |
| `user.email` | Member email address |
| `user.username` | Member Preset username |
| `user.first_name` | Member first name |
| `user.last_name` | Member last name |
| `workspace_role.role_identifier` | Preset workspace role identifier |
| `workspace_role.name` | Workspace role display name |
| `workspace_role.role_name` | Workspace role name |
| `is_role_from_group` | Whether the workspace role is inherited from a user group |

## Invite A User To A Team And Workspace

Invite requests require a numeric `team_role_id`. Do not call `GET /team-roles/` with the API-key JWT from `preset-api`; that endpoint is not available to user API keys. The value must be supplied out-of-band by an admin, for example through approved environment configuration or a ticket/comment from a team admin. Resolve and verify the intended team role ID before making the invite call.

```python
import os

team_role_id = int(os.environ["PRESET_TEAM_ROLE_ID"])
```

```bash
TEAM_ROLE_ID="${PRESET_TEAM_ROLE_ID:?set PRESET_TEAM_ROLE_ID to the verified team role ID}"
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" \
  -d "{\"email\": \"jdoe@example.com\", \"team_role_id\": $TEAM_ROLE_ID, \"workspace_ids\": [123], \"workspace_role_identifier\": \"PresetGamma\"}"
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

## Update A Member Role

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

## List Team Members

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/memberships/?page_number=1&page_size=100" | jq '.payload'
```

```python
team_members = client.mgmt(
    "GET",
    f"/teams/{team_name}/memberships/?page_number=1&page_size=100",
)["payload"]
```

## Invite A User To A Team Only

```bash
TEAM_ROLE_ID="${PRESET_TEAM_ROLE_ID:?set PRESET_TEAM_ROLE_ID to the verified team role ID}"
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" \
  -d "{\"email\": \"newmember@example.com\", \"team_role_id\": $TEAM_ROLE_ID}"
```

```python
client.mgmt(
    "POST",
    f"/teams/{team_name}/invites/",
    json={"email": "newmember@example.com", "team_role_id": team_role_id},
)
```
