# Membership Reference

Use this reference for read-only workspace membership listing. Use `preset-admin` for team membership management, invite lifecycle workflows, workspace role changes, seat-limit checks, and role identifier guidance.

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
| `user.id` | Numeric user ID |
| `user.email` | Member email address |
| `user.username` | Member Preset username |
| `user.first_name` | Member first name |
| `user.last_name` | Member last name |
| `workspace_role.role_identifier` | Preset workspace role identifier |
| `workspace_role.name` | Workspace role display name |
| `workspace_role.role_name` | Workspace role name |
| `is_role_from_group` | Whether the workspace role is inherited from a user group |

The response is paginated. Use `preset-admin` before acting on any user ID or role identifier from this response.
