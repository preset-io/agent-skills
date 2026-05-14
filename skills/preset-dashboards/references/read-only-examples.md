# Read-Only Dashboard Examples

All Superset API calls use the workspace hostname returned by the Management API:

```text
https://{workspace_hostname}/api/v1/dashboard/
```

## Key Concepts

| Term | Description |
|---|---|
| Dashboard | A collection of charts and text elements arranged in a layout |
| Slug | Optional URL-friendly identifier for a dashboard |
| Published | When `true`, the dashboard is visible to workspace members with access |

## List Dashboards

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/?q=(page:0,page_size:25)" | jq '.result'
```

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
result = client.workspace("GET", hostname, f"/dashboard/?q={q}")
dashboards = result["result"]
for dashboard in dashboards:
    print(
        dashboard["id"],
        dashboard["dashboard_title"],
        "published:",
        dashboard["published"],
    )
```

Useful Rison filters:

| Goal | Filter |
|---|---|
| Published only | `filters:!((col:published,opr:eq,value:!t))` |
| By title or slug substring | `filters:!((col:dashboard_title,opr:title_or_slug,value:Sales))` |
| Sort by last modified | `order_column:changed_on_delta_humanized,order_direction:desc` |

## Get A Dashboard

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}" | jq '.result'

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
| `owners` | Owner objects with `id`, `first_name`, and `last_name` |

## Get Dashboard Charts

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/charts" | jq '.result'
```

```python
charts = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/charts")["result"]
for chart in charts:
    print(chart["id"], chart["slice_name"], chart["viz_type"])
```

## Get Dashboard Datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id}/datasets" | jq '.result'
```

```python
datasets = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/datasets")["result"]
for dataset in datasets:
    print(dataset["id"], dataset["table_name"])
```
