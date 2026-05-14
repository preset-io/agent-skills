# Audit Logs Reference

Audit log APIs are Manager v2 routes. In Manager source they are mounted under `/api/v2/audit/teams/{team_name}/logs`. The public API base already includes the API prefix, so production examples use `https://api.app.preset.io/v2/audit/teams/{team_name}/logs`. Set `PRESET_API_BASE_V2` for non-production environments.

Audit queries are read-only. Audit downloads can expose sensitive activity data and may send email or create a retrievable download token, so require explicit confirmation before `POST /downloads/`.

## Query Audit Logs

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/?page_number=1&page_size=100" \
  | jq '.payload'
```

```python
logs = client.mgmt_v2(
    "GET",
    f"/audit/teams/{team_name}/logs/?page_number=1&page_size=100",
)["payload"]
```

Supported filters:

| Query parameter | Description |
|---|---|
| `entity_type` | Entity type such as `user`, `dataset`, or `database` |
| `entity_name` | Entity display name |
| `entity_id` | Entity immutable ID |
| `action` | One or more friendly action names or action URNs |
| `user` | One or more usernames or emails |
| `workspace_name` | One or more workspace names |
| `start_time` | Inclusive ISO 8601 start datetime |
| `end_time` | Inclusive ISO 8601 end datetime |
| `page_number` | 1-based page number |
| `page_size` | Page size, max 500 |
| `direction` | `asc` or `desc` |
| `order_by` | Sort field |

Use repeated query params for list filters:

```python
logs = client.mgmt_v2(
    "GET",
    f"/audit/teams/{team_name}/logs/"
    "?page_number=1&page_size=100"
    "&action=user:workspace_role_update"
    "&action=invite:create"
    "&user=admin@example.com"
    "&workspace_name=abcd1234",
)["payload"]
```

Allowed `order_by` values:

```text
action, user, entity_id, entity_name, entity_type, timestamp, workspace_name, is_mcp
```

Responses include `meta.count`.

## List Audit Actions

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/actions/" \
  | jq '.payload'
```

```python
actions = client.mgmt_v2(
    "GET",
    f"/audit/teams/{team_name}/logs/actions/",
)["payload"]
```

The response contains friendly `action_name` values and full `action_urn` values. Query accepts friendly names and maps them to URNs in Manager.

Useful Phase 3 actions include:

| Friendly action | Meaning |
|---|---|
| `user:team_role_update` | Team role changed |
| `user:workspace_role_update` | Workspace role changed |
| `invite:create` | Invite created |
| `invite:accept` | Invite accepted |
| `auditlog:download_request` | Audit log download requested |
| `auditlog:download_retrieve` | Audit log download retrieved |

## Request Audit Log Download

Confirmation summary should include the team, filters, `via_email` value, approximate scope if known, and whether a CSV or email-delivered download is expected.

For email-delivered downloads, use `client.mgmt_v2()` because Manager returns JSON:

```python
download = client.mgmt_v2(
    "POST",
    f"/audit/teams/{team_name}/logs/downloads/",
    json={
        "via_email": True,
        "action": ["user:workspace_role_update", "invite:create"],
        "workspace_name": ["abcd1234"],
        "page_number": 1,
        "page_size": 500,
        "order_by": "timestamp",
        "direction": "desc",
    },
)
token = download["payload"]["token"]
```

When `via_email` is true, Manager returns `201` with a token and sends the actual download link later.

For immediate CSV downloads, use `client.mgmt_v2_response()` because the response body is CSV, not JSON:

```python
resp = client.mgmt_v2_response(
    "POST",
    f"/audit/teams/{team_name}/logs/downloads/",
    json={
        "via_email": False,
        "action": ["user:workspace_role_update", "invite:create"],
        "workspace_name": ["abcd1234"],
        "page_number": 1,
        "page_size": 500,
        "order_by": "timestamp",
        "direction": "desc",
    },
)
csv_bytes = resp.content
```

## Retrieve Audit Log Download

```bash
DOWNLOAD_URL="$(
  curl -sS -D - -o /dev/null \
    -H "Authorization: Bearer $TOKEN" \
    "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/downloads/?token={token}" \
    | awk 'tolower($1) == "location:" {print $2}' \
    | tr -d '\r'
)"

curl -sS "$DOWNLOAD_URL"
```

```python
import requests

redirect_resp = client.mgmt_v2_response(
    "GET",
    f"/audit/teams/{team_name}/logs/downloads/?token={token}",
    allow_redirects=False,
)
download_url = redirect_resp.headers["Location"]
csv_resp = requests.get(download_url, timeout=60)
csv_resp.raise_for_status()
csv_bytes = csv_resp.content
```

Download tokens are sensitive. They appear in URL query strings, so do not print them in logs, PR comments, CI output, shell history, proxy/access logs, or handoff notes.

## Common Failures

| Status | Likely cause |
|---|---|
| `400` | invalid date range, unsupported `order_by`, page size over 500, too-large download, or invalid workspace filter |
| `403` | API key owner is not a team admin or audit logs are not enabled for the team |
| `404` | download token not found or team not found |
