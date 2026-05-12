# preset-users

Manage users, roles, and row-level security in a Preset workspace via the Superset API, and manage team/workspace membership via the Management API.

> **Prerequisite:** Complete authentication and resolve the workspace hostname using the **preset-api** and **preset-workspaces** skills.

## Key concepts

| Term | Description |
|---|---|
| **Workspace role** | Coarse-grained access level: `Admin`, `Editor`, or `Viewer`. Granted through the Management API. |
| **Superset role** | Fine-grained permission set applied per user inside a workspace (e.g., `Alpha`, `Gamma`, custom roles). |
| **Row-level security (RLS)** | SQL `WHERE` clause filters applied per role to restrict which rows a user can see in a dataset. |
| **Guest token** | Short-lived token for embedded dashboards — see **preset-dashboards** for details. |

---

## Workspace roles (Management API)

These roles are set at the workspace level and apply to all resources within the workspace.

| Role | Description |
|---|---|
| `Admin` | Full access including user management and workspace settings. |
| `Editor` | Can create and edit dashboards, charts, and datasets. |
| `Viewer` | Read-only access to published dashboards. |

See **preset-workspaces** for the full membership management API (add member, update role).

---

## Superset users (Workspace Superset API)

### List users

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/security/users/" | jq '.result'
```

```python
users = client.workspace("GET", hostname, "/security/users/")["result"]
for user in users:
    print(user["id"], user["username"], user["email"], [r["name"] for r in user["roles"]])
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric user ID |
| `username` | Username (typically the email address) |
| `first_name` / `last_name` | Display name |
| `email` | Email address |
| `active` | Whether the account is active |
| `roles` | List of `{"id": ..., "name": ...}` role objects |

### Get the current user

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/me/" | jq '.result'
```

```python
me = client.workspace("GET", hostname, "/me/")["result"]
my_id = me["id"]
```

---

## Superset roles (Workspace Superset API)

### List roles

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/security/roles/" | jq '.result'
```

```python
roles = client.workspace("GET", hostname, "/security/roles/")["result"]
for role in roles:
    print(role["id"], role["name"])
```

**Built-in roles:**

| Role | Description |
|---|---|
| `Admin` | Full platform access |
| `Alpha` | Can create charts and datasets; cannot manage users |
| `Gamma` | Read-only access to published dashboards and specific datasets |
| `sql_lab` | Access to SQL Lab |
| `Public` | Unauthenticated / guest access (usually disabled) |

### Get a single role

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/security/roles/{id}" | jq '.result'
```

### Create a custom role

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/security/roles/" \
  -d '{"name": "Finance Viewers"}'
```

```python
new_role = client.workspace(
    "POST",
    hostname,
    "/security/roles/",
    json={"name": "Finance Viewers"},
)
role_id = new_role["id"]
```

### List permissions available for a role

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/security/roles/{id}/permissions/" | jq '.result'
```

```python
perms = client.workspace("GET", hostname, f"/security/roles/{role_id}/permissions/")["result"]
```

### Grant permissions to a role

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/security/roles/{id}/permissions/" \
  -d '{"permission_view_menu_ids": [10, 42, 87]}'
```

```python
client.workspace(
    "POST",
    hostname,
    f"/security/roles/{role_id}/permissions/",
    json={"permission_view_menu_ids": [10, 42, 87]},
)
```

---

## Assign roles to users

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/security/users/{user_id}" \
  -d '{"roles": [1, 5]}'
```

```python
# Assign roles by their numeric IDs
client.workspace(
    "PUT",
    hostname,
    f"/security/users/{user_id}",
    json={"roles": [role_id_1, role_id_2]},
)
```

> **Note:** This replaces the user's entire role list. Always include all desired roles, not just the new ones.

### Helper: add a role to a user without removing existing roles

```python
def add_role_to_user(client, hostname, user_id, role_id):
    user = client.workspace("GET", hostname, f"/security/users/{user_id}")["result"]
    existing_role_ids = [r["id"] for r in user["roles"]]
    if role_id not in existing_role_ids:
        client.workspace(
            "PUT",
            hostname,
            f"/security/users/{user_id}",
            json={"roles": existing_role_ids + [role_id]},
        )
```

---

## Row-level security (RLS)

RLS rules add automatic `WHERE` clause filters to queries, scoping what data a user or role can see.

### List RLS rules

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/rowlevelsecurity/" | jq '.result'
```

```python
rules = client.workspace("GET", hostname, "/rowlevelsecurity/")["result"]
for rule in rules:
    print(rule["id"], rule["name"], rule["clause"])
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric RLS rule ID |
| `name` | Human-readable rule name |
| `clause` | SQL `WHERE` clause appended to queries (without the `WHERE` keyword) |
| `filter_type` | `"Regular"` (whitelist) or `"Base"` (blacklist/override) |
| `tables` | Datasets this rule applies to |
| `roles` | Roles this rule applies to |

### Create an RLS rule

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/rowlevelsecurity/" \
  -d '{
    "name": "Finance team filter",
    "clause": "department = '"'"'finance'"'"'",
    "filter_type": "Regular",
    "tables": [3, 7],
    "roles": [5]
  }'
```

```python
new_rule = client.workspace(
    "POST",
    hostname,
    "/rowlevelsecurity/",
    json={
        "name": "Finance team filter",
        "clause": "department = 'finance'",
        "filter_type": "Regular",
        "tables": [dataset_id_1, dataset_id_2],
        "roles": [role_id],
    },
)
rule_id = new_rule["id"]
```

### Update an RLS rule

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/rowlevelsecurity/{id}" \
  -d '{"clause": "department IN ('"'"'finance'"'"', '"'"'accounting'"'"')"}'
```

```python
client.workspace(
    "PUT",
    hostname,
    f"/rowlevelsecurity/{rule_id}",
    json={"clause": "department IN ('finance', 'accounting')"},
)
```

---

## Common patterns

### Bulk-provision users into a workspace

```python
new_members = [
    {"email": "alice@example.com", "role": "Editor"},
    {"email": "bob@example.com",   "role": "Viewer"},
    {"email": "carol@example.com", "role": "Admin"},
]

for member in new_members:
    try:
        client.mgmt(
            "POST",
            f"/teams/{team_slug}/workspaces/{workspace_id}/memberships/",
            json={
                "role_identifier": member["role"],
                "user": {"username": member["email"]},
            },
        )
        print(f"Added {member['email']} as {member['role']}")
    except Exception as e:
        print(f"Failed to add {member['email']}: {e}")
```

### Audit workspace access

```python
members = client.mgmt(
    "GET",
    f"/teams/{team_slug}/workspaces/{workspace_id}/memberships/",
)["payload"]

print(f"{'Email':<40} {'Role':<10} {'Active'}")
print("-" * 60)
for m in members:
    print(f"{m['user']['email']:<40} {m['role_identifier']:<10} {m['active']}")
```

### Apply RLS for multi-tenant dashboards

A common pattern for embedding dashboards is to create one RLS rule per tenant:

```python
tenants = [
    {"name": "Acme Corp",  "filter": "tenant_id = 'acme'",  "role_id": 10},
    {"name": "Globex Inc", "filter": "tenant_id = 'globex'", "role_id": 11},
]

dataset_ids = [3, 7, 12]  # datasets that have a tenant_id column

for tenant in tenants:
    client.workspace(
        "POST",
        hostname,
        "/rowlevelsecurity/",
        json={
            "name": f"RLS — {tenant['name']}",
            "clause": tenant["filter"],
            "filter_type": "Regular",
            "tables": dataset_ids,
            "roles": [tenant["role_id"]],
        },
    )
```

Then generate a guest token with the appropriate role so embedded users only see their tenant's data (see **preset-dashboards** for the guest token API).
