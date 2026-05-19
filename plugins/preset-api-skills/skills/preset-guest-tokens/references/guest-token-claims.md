# Guest Token Claims

Guest tokens grant signed embedded access for external viewers. They are security-sensitive credentials.

## Endpoint

| Goal | Endpoint |
|---|---|
| Create guest token | `POST /api/v1/security/guest_token/` |

Confirm the target workspace supports the endpoint through `/api/v1/_openapi` before relying on the payload shape.

## Required Confirmation

Before creating a guest token, summarize:

1. Workspace hostname.
2. Embedded dashboard UUID or resource ID.
3. External user identity claims.
4. Exact resources array.
5. Exact RLS clauses, or state that none will be included.
6. Token handling plan, including where the token will be delivered.
7. Expected expiration behavior, if known.

Wait for explicit confirmation.

## Payload Shape

Use neutral placeholder claims in examples:

```python
payload = {
    "user": {
        "username": "external-user-id",
        "first_name": "External",
        "last_name": "Viewer",
    },
    "resources": [
        {"type": "dashboard", "id": embedded_dashboard_uuid},
    ],
    "rls": [
        {"clause": "tenant_id = 'approved-tenant-id'"},
    ],
}

guest_token = client.workspace(
    "POST",
    hostname,
    "/security/guest_token/",
    json=payload,
)["token"]
```

Never print signed guest tokens. Return them only through the approved delivery channel for the embedding runtime.

## RLS Handling

If row-level security is required, prepare the `rls` entries with `preset-embedded-rls` first. Do not guess tenant, customer, account, or region filters.

If the request does not include RLS, explicitly state that the embedded viewer may see all data allowed by the dashboard, datasets, and workspace permissions.
