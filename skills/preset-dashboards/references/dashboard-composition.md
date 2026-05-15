# Dashboard Composition

Use this reference when the user needs the objects that make up a dashboard: charts, datasets, tabs, and layout metadata.

## Dashboard Charts

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id_or_slug}/charts" | jq '.result'
```

```python
charts = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/charts")["result"]
for chart in charts:
    print(chart["id"], chart["slice_name"], chart["viz_type"])
```

## Dashboard Datasets

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id_or_slug}/datasets" | jq '.result'
```

```python
datasets = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/datasets")["result"]
for dataset in datasets:
    print(dataset["id"], dataset["table_name"])
```

## Dashboard Tabs

```python
tabs = client.workspace("GET", hostname, f"/dashboard/{dashboard_id}/tabs")["result"]
for tab in tabs:
    print(tab.get("id"), tab.get("label"))
```

Useful composition endpoints:

| Goal | Endpoint |
|---|---|
| Get dashboard detail and layout fields | `GET /api/v1/dashboard/{id_or_slug}` |
| Get dashboard charts | `GET /api/v1/dashboard/{id_or_slug}/charts` |
| Get dashboard datasets | `GET /api/v1/dashboard/{id_or_slug}/datasets` |
| Get dashboard tabs | `GET /api/v1/dashboard/{id_or_slug}/tabs` |

Composition reads are metadata reads. If the user asks for actual chart results, load [chart-data.md](chart-data.md) and get explicit confirmation before fetching data.
