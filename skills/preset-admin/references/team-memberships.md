# Team Memberships Reference

Team membership endpoints require team-admin permissions for list, role-change, and removal workflows. API-key JWTs are accepted on the documented endpoints, but requests return `403` if the key owner lacks the required team permissions.

Changing a team role or removing a user changes access. Load the safety policy and get explicit confirmation before making `PATCH` or `DELETE` requests.

## List Team Members

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/memberships/?page_number=1&page_size=100" \
  | jq '.payload'
```

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_name}/memberships/?page_number=1&page_size=100",
)["payload"]
```

Useful filters:

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_name}/memberships/"
    "?page_number=1&page_size=100"
    "&user_name_or_email=jdoe@example.com"
    "&user_type=CREATOR",
)["payload"]
```

The response includes `meta.count` when paginated.

Common response fields:

| Field | Description |
|---|---|
| `user.id` | Numeric user ID for role updates or removal |
| `user.email` | Member email address |
| `team_role.id` | Numeric team role ID |
| `team_role.name` | Team role display name |
| `is_role_from_group` | Whether the team role comes from a group |
| `user_type` | Enterprise creator/viewer classification when present |
| `creator_on_workspaces` | Workspaces where the user has creator access |
| `viewer_on_workspaces` | Workspaces where the user has viewer access |

## Get One Team Member

```python
member = client.mgmt(
    "GET",
    f"/teams/{team_name}/memberships/{user_id}/",
)["payload"]
```

## Seat Limit Preflight

Use this before creating invites or upgrading a viewer to a creator role.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/user-limit/" | jq '.payload'
```

```python
limits = client.mgmt("GET", f"/teams/{team_name}/user-limit/")["payload"]
print(limits)
```

For invite links that are checked before login, Manager also exposes this unauthenticated seat check:

```bash
curl -s \
  "https://api.app.preset.io/v1/teams/{team_name}/has-seats-remaining/" | jq '.payload'
```

Enterprise teams split viewer and creator capacity. Treat missing or exhausted creator seats as a blocker before inviting or upgrading a user to a creator workspace role.

## Update A Team Role

Requires numeric `team_role_id`. See [role-identifiers.md](role-identifiers.md).

Confirmation summary should include:

- team name
- user ID and email
- `current_role`: current team role ID and role name
- `new_role`: new numeric `team_role_id` and role name
- whether the role came from a group

```bash
TEAM_ROLE_ID="${PRESET_TEAM_ROLE_ID:?set PRESET_TEAM_ROLE_ID to the verified team role ID}"
curl -s -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/memberships/{user_id}/" \
  -d "{\"team_role_id\": $TEAM_ROLE_ID}"
```

```python
updated = client.mgmt(
    "PATCH",
    f"/teams/{team_name}/memberships/{user_id}/",
    json={"team_role_id": team_role_id},
)["payload"]
```

Manager rejects changes that would remove the last team admin.

## Remove A Team Member

Confirmation summary should include the team name, user ID, email, current team role, and expected access removal.

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/memberships/{user_id}/"
```

```python
client.mgmt("DELETE", f"/teams/{team_name}/memberships/{user_id}/")
```

Manager rejects removing yourself from a team.

## Groups For A Member

Use this read-only call when `is_role_from_group` is true or when a role appears inherited.

```python
groups = client.mgmt(
    "GET",
    f"/teams/{team_name}/memberships/{user_id}/groups/",
)["payload"]
```

Group role assignment endpoints exist, but group and SCIM provisioning are intentionally deferred from this skill. See [deferrals.md](deferrals.md).
