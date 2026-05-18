# Chart Metadata

Use this reference for chart metadata reads that do not fetch chart result data.

All examples use the workspace hostname resolved by `preset-workspaces`.

## List Charts

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
charts = client.workspace("GET", hostname, f"/chart/?q={q}")["result"]
for chart in charts:
    print(chart["id"], chart["slice_name"], chart["viz_type"])
```

Useful chart endpoints:

| Goal | Endpoint |
|---|---|
| List charts | `GET /api/v1/chart/` |
| Get chart detail | `GET /api/v1/chart/{id_or_uuid}` |
| Favorite status | `GET /api/v1/chart/favorite_status/` |
| Related fields | `GET /api/v1/chart/related/{column_name}` |

## Get A Chart

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/chart/{id_or_uuid}" | jq '.result'
```

```python
chart = client.workspace("GET", hostname, f"/chart/{chart_id_or_uuid}")["result"]
print(chart["id"], chart["slice_name"], chart.get("viz_type"))
```

Common chart detail fields include `id`, `uuid`, `slice_name`, `viz_type`, `params`, `query_context`, `datasource_id`, `datasource_type`, `dashboards`, `owners`, and `changed_on_delta_humanized`.

`params` and `query_context` are metadata, but they may reveal metric names, filters, SQL expressions, or dashboard design details. Keep output narrow and do not paste full payloads unless the user asks for them.

Creating or deleting favorites changes user state. Load [dashboard-chart-mutations.md](dashboard-chart-mutations.md) before changing favorites.
