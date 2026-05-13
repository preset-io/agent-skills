# preset-dashboards

Inspect dashboards in a Preset workspace via the Superset API.

> **Prerequisite:** Complete authentication and resolve the workspace hostname using the **preset-api** and **preset-workspaces** skills.
> **Phase 1 scope:** This seed skill is read-only. Dashboard create/update, import/export, embedded configuration, and guest-token creation are intentionally deferred to later phases and require explicit user confirmation before implementation.

## Key concepts

| Term | Description |
|---|---|
| **Dashboard** | A collection of charts and text elements arranged in a layout. |
| **Slug** | Optional URL-friendly identifier for a dashboard (e.g., `sales-overview`). |
| **Published** | When `true`, the dashboard is visible to workspace members with access to it. |

All Superset API calls use the workspace hostname returned by the Management API:

```text
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
    print(d["id"], d["dashboard_title"], "published:", d["published"])
```

Useful filter examples for the Rison-encoded `q` parameter:

| Goal | Filter |
|---|---|
| Published only | `filters:!((col:published,opr:eq,value:!t))` |
| By title or slug substring | `filters:!((col:dashboard_title,opr:title_or_slug,value:Sales))` |
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
print(dashboard["dashboard_title"], dashboard["url"])
```

Common response fields:

| Field | Description |
|---|---|
| `id` | Numeric dashboard ID |
| `uuid` | Stable dashboard UUID |
| `dashboard_title` | Display name |
| `slug` | URL-safe identifier, when present |
| `published` | Whether the dashboard is published |
| `url` | Relative URL path within the workspace |
| `position_json` | JSON string describing the layout |
| `json_metadata` | JSON string with filters, cross-filters, and other metadata |
| `charts` | Chart summaries included in the dashboard |
| `owners` | Owner objects with id, username, and email |

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
for dataset in datasets:
    print(dataset["id"], dataset["table_name"])
```

## Mutation boundary

Do not create, update, import, export, embed, or issue guest tokens from this Phase 1 seed skill. For any future dashboard mutation workflow, first summarize the target workspace, dashboard IDs or UUIDs, request body, and expected effect, then get explicit user confirmation.
