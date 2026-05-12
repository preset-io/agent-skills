# preset-dashboards

Create, retrieve, update, export, and import dashboards in a Preset workspace via the Superset API.

> **Prerequisite:** Complete authentication and resolve the workspace hostname using the **preset-api** and **preset-workspaces** skills.

## Key concepts

| Term | Description |
|---|---|
| **Dashboard** | A collection of charts and text elements arranged in a layout. |
| **Slug** | Optional URL-friendly identifier for a dashboard (e.g., `sales-overview`). |
| **Published** | When `true`, the dashboard is visible to all workspace members with at least Viewer access. |
| **Embedded** | Dashboards can be embedded in external applications via Preset's embedded SDK. |

All Superset API calls use the workspace hostname:

```
https://{workspace_hostname}/api/v1/dashboard/
```

## List dashboards

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/?q=(page:0,page_size:25)" | jq '.result'
```

```python
import rison  # pip install rison

q = rison.dumps({"page": 0, "page_size": 25})
result = client.workspace("GET", hostname, f"/dashboard/?q={q}")
dashboards = result["result"]
for d in dashboards:
    print(d["id"], d["title"], "published:", d["published"])
```

**Useful filter examples (Rison-encoded `q` parameter):**

| Goal | Filter |
|---|---|
| Published only | `filters:!((col:published,opr:FilterEqual,value:!t))` |
| By title substring | `filters:!((col:title,opr:DashboardTitleOrSlugFilter,value:Sales))` |
| Sort by last modified | `order_column:changed_on_delta_humanized,order_direction:desc` |

## Get a single dashboard

```bash
# By numeric ID
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}" | jq '.result'

# By slug
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{slug}" | jq '.result'
```

```python
dashboard = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}")["result"]
print(dashboard["title"], dashboard["url"])
```

**Response fields:**

| Field | Description |
|---|---|
| `id` | Numeric dashboard ID |
| `title` | Display name |
| `slug` | URL-safe identifier (may be `null`) |
| `published` | Whether the dashboard is published |
| `url` | Relative URL path within the workspace |
| `position_json` | JSON string describing the layout |
| `json_metadata` | JSON string with filters, cross-filters, and other metadata |
| `charts` | List of chart titles included in the dashboard |
| `owners` | List of owner objects (id, username, email) |
| `changed_by` | Last modifier |
| `changed_on_utc` | ISO 8601 last-modified timestamp |

## Create a dashboard

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dashboard/" \
  -d '{
    "title": "Q3 Revenue Overview",
    "slug": "q3-revenue-overview",
    "published": false,
    "owners": [1]
  }'
```

```python
new_dash = client.workspace(
    "POST",
    hostname,
    "/dashboard/",
    json={
        "title": "Q3 Revenue Overview",
        "slug": "q3-revenue-overview",
        "published": False,
        "owners": [1],  # list of user IDs
    },
)
dashboard_id = new_dash["id"]
```

**Required fields:** `title`

**Optional fields:** `slug`, `published`, `owners`, `position_json`, `json_metadata`, `css`

## Update a dashboard

```bash
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}" \
  -d '{"title": "Q3 Revenue Overview (Final)", "published": true}'
```

```python
client.workspace(
    "PUT",
    hostname,
    f"/dashboard/{dashboard_id}",
    json={"title": "Q3 Revenue Overview (Final)", "published": True},
)
```

Only include fields you want to change — unspecified fields are left untouched.

## Export dashboards

Export one or more dashboards as a ZIP file containing JSON definitions. Useful for backup, version control, and migration between workspaces.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/export/?q=!(1,2,3)" \
  -o dashboards_export.zip
```

```python
import rison

ids = rison.dumps([dashboard_id_1, dashboard_id_2])
resp = client._session.get(
    f"https://{hostname}/api/v1/dashboard/export/?q={ids}",
)
with open("dashboards_export.zip", "wb") as f:
    f.write(resp.content)
```

The ZIP contains:
- `metadata.yaml` — export format version
- `dashboards/{title}.yaml` — dashboard definition
- `charts/{title}.yaml` — each chart used
- `datasets/{name}.yaml` — each dataset referenced
- `databases/{name}.yaml` — database connections

## Import dashboards

Import a previously exported ZIP file:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/import/" \
  -F "formData=@dashboards_export.zip" \
  -F 'passwords={"databases/MyDB.yaml": "db-password"}' \
  -F "overwrite=true"
```

```python
with open("dashboards_export.zip", "rb") as f:
    client._session.post(
        f"https://{hostname}/api/v1/dashboard/import/",
        files={"formData": ("export.zip", f, "application/zip")},
        data={
            "passwords": '{"databases/MyDB.yaml": "db-password"}',
            "overwrite": "true",
        },
    )
```

Set `overwrite=true` to replace existing dashboards with matching UUIDs.

## Get dashboard charts

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/charts" | jq '.result'
```

```python
charts = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/charts")["result"]
for chart in charts:
    print(chart["id"], chart["slice_name"], chart["viz_type"])
```

## Get dashboard datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/datasets" | jq '.result'
```

```python
datasets = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/datasets")["result"]
```

## Embed configuration

Retrieve the embedded configuration for a dashboard (guest token settings):

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/embedded" | jq '.result'
```

Set or update the embedded configuration:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/embedded" \
  -d '{"allowed_domains": ["https://your-app.example.com"]}'
```

```python
client.workspace(
    "POST",
    hostname,
    f"/dashboard/{dashboard_id}/embedded",
    json={"allowed_domains": ["https://your-app.example.com"]},
)
```

## Generate a guest token for embedding

Guest tokens allow external users to view embedded dashboards without a Preset account:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://{workspace_hostname}/api/v1/security/guest_token/" \
  -d '{
    "user": {"username": "guest", "first_name": "Guest", "last_name": "User"},
    "resources": [{"type": "dashboard", "id": "{dashboard_uuid}"}],
    "rls": []
  }'
```

```python
guest_token_resp = client.workspace(
    "POST",
    hostname,
    "/security/guest_token/",
    json={
        "user": {
            "username": "guest",
            "first_name": "Guest",
            "last_name": "User",
        },
        "resources": [{"type": "dashboard", "id": dashboard_uuid}],
        "rls": [],  # row-level security rules, if needed
    },
)
guest_token = guest_token_resp["token"]
```

The `dashboard_uuid` is found in the `GET /api/v1/dashboard/{id}` response under the `uuid` field.

## Copy a dashboard across workspaces

```python
import zipfile, io

# 1. Export from source workspace
ids = rison.dumps([source_dashboard_id])
export_resp = client._session.get(
    f"https://{source_hostname}/api/v1/dashboard/export/?q={ids}",
)
zip_bytes = export_resp.content

# 2. Import into target workspace
client._session.post(
    f"https://{target_hostname}/api/v1/dashboard/import/",
    files={"formData": ("export.zip", io.BytesIO(zip_bytes), "application/zip")},
    data={"overwrite": "true"},
)
```

## Filter and layout metadata

The `position_json` field describes where charts appear on the dashboard grid. It's a JSON-encoded string:

```json
{
  "DASHBOARD_VERSION_KEY": "v2",
  "ROOT_ID": {"type": "ROOT", "id": "ROOT_ID", "children": ["GRID_ID"]},
  "GRID_ID": {"type": "GRID", "id": "GRID_ID", "children": ["ROW-abc"], "parents": ["ROOT_ID"]},
  "ROW-abc": {
    "type": "ROW", "id": "ROW-abc", "children": ["CHART-123"],
    "meta": {"background": "BACKGROUND_TRANSPARENT"}
  },
  "CHART-123": {
    "type": "CHART", "id": "CHART-123",
    "meta": {"chartId": 42, "width": 6, "height": 50},
    "parents": ["ROOT_ID", "GRID_ID", "ROW-abc"]
  }
}
```

The grid uses a 12-column system. `width` values sum to 12 per row.
