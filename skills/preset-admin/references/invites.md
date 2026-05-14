# Invites Reference

Invite endpoints require team-admin permissions. Creating, canceling, or resending invites changes access and sends or affects email delivery. Load the safety policy and get explicit confirmation before mutating invites.

Invite payloads use both numeric `team_role_id` and string workspace role identifiers. See [role-identifiers.md](role-identifiers.md) before selecting roles.

## List Pending Invites

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" | jq '.payload'
```

```python
invites = client.mgmt("GET", f"/teams/{team_name}/invites/")["payload"]
```

Common response fields:

| Field | Description |
|---|---|
| `id` | Numeric invite ID for cancel/resend |
| `email` | Invitee email |
| `team_role_id` | Numeric team role ID |
| `workspace_ids` | Workspace IDs included in the invite |
| `workspace_role_identifier` | Workspace role applied by the invite |

## Create One Invite

Preflight seat limits first:

```python
limits = client.mgmt("GET", f"/teams/{team_name}/user-limit/")["payload"]
```

Confirmation summary should include:

- invitee email
- team name
- numeric `team_role_id` and role name
- workspace IDs and titles, if any
- `workspace_role_identifier`
- seat-limit preflight result

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/" \
  -d '{"email":"jdoe@example.com","team_role_id":2,"workspace_ids":[123],"workspace_role_identifier":"PresetGamma"}'
```

```python
invite = client.mgmt(
    "POST",
    f"/teams/{team_name}/invites/",
    json={
        "email": "jdoe@example.com",
        "team_role_id": team_role_id,
        "workspace_ids": [workspace_id],
        "workspace_role_identifier": "PresetGamma",
    },
)["payload"]
```

Use `workspace_ids` and `workspace_role_identifier` when granting workspace access as part of the invite. Omit them for a team-only invite.

## Create Many Invites

Bulk invite requests use `POST /teams/{team_name}/invites/many/` and accept up to 50 invite entries per request.

```python
payload = {
    "invites": [
        {
            "email": "analyst@example.com",
            "team_role_id": team_role_id,
            "workspace_ids": [workspace_id],
            "workspace_role_identifier": "PresetReportsOnly",
        },
        {
            "email": "creator@example.com",
            "team_role_id": team_role_id,
            "workspace_ids": [workspace_id],
            "workspace_role_identifier": "PresetGamma",
        },
    ]
}

created = client.mgmt(
    "POST",
    f"/teams/{team_name}/invites/many/",
    json=payload,
)["payload"]
```

Confirmation for bulk invites should summarize every email and role. Do not hide invite details behind "same as above" when asking for approval.

## Cancel A Pending Invite

```bash
curl -s -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/{invite_id}/"
```

```python
client.mgmt("DELETE", f"/teams/{team_name}/invites/{invite_id}/")
```

Confirm the invite ID, email, team, and expected cancellation effect before deleting.

## Resend A Pending Invite

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v1/teams/{team_name}/invites/resend/{invite_id}/"
```

```python
client.mgmt("POST", f"/teams/{team_name}/invites/resend/{invite_id}/")
```

Confirm the invite ID, email, and team before resending.

## Common Failures

| Status | Likely cause |
|---|---|
| `400` | duplicate invite, user already accepted, workspace outside team, invalid workspace role, invite pending limit reached, or seat limit reached |
| `403` | API key owner is not a team admin or invite email domain is not allowed |
| `404` | invite, team, or workspace not found |
