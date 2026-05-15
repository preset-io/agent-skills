# Dashboards And Charts Workspace API

All examples use the workspace hostname resolved by `preset-workspaces`.

## Dashboard Reads

```python
import rison

q = rison.dumps({"page": 0, "page_size": 25})
dashboards = client.workspace("GET", hostname, f"/dashboard/?q={q}")["result"]
```

Useful dashboard endpoints:

| Goal | Endpoint |
|---|---|
| List dashboards | `GET /api/v1/dashboard/` |
| Get dashboard detail | `GET /api/v1/dashboard/{id_or_slug}` |
| Get dashboard charts | `GET /api/v1/dashboard/{id_or_slug}/charts` |
| Get dashboard datasets | `GET /api/v1/dashboard/{id_or_slug}/datasets` |
| Get dashboard tabs | `GET /api/v1/dashboard/{id_or_slug}/tabs` |
| Favorite status | `GET /api/v1/dashboard/favorite_status/` |

## Chart Reads

```python
q = rison.dumps({"page": 0, "page_size": 25})
charts = client.workspace("GET", hostname, f"/chart/?q={q}")["result"]
```

Useful chart endpoints:

| Goal | Endpoint |
|---|---|
| List charts | `GET /api/v1/chart/` |
| Get chart detail | `GET /api/v1/chart/{id_or_uuid}` |
| Favorite status | `GET /api/v1/chart/favorite_status/` |
| Related fields | `GET /api/v1/chart/related/{column_name}` |

## Data-Returning Chart Reads

Chart data calls can return customer data. Before calling them, summarize the workspace, chart ID, result format, result type, and expected data exposure.

| Goal | Endpoint |
|---|---|
| Saved chart data | `GET /api/v1/chart/{pk}/data/` |
| Query-context chart data | `POST /api/v1/chart/data` |
| Cached chart data | `GET /api/v1/chart/data/{cache_key}` |

Use `result_type=samples` or a small query limit only when that answers the user request.

## Thumbnails And Screenshots

Thumbnail and screenshot endpoints depend on workspace feature flags and background screenshot infrastructure.

| Goal | Endpoint |
|---|---|
| Chart screenshot cache | `GET /api/v1/chart/{pk}/cache_screenshot/` |
| Chart screenshot | `GET /api/v1/chart/{pk}/screenshot/{digest}/` |
| Chart thumbnail | `GET /api/v1/chart/{pk}/thumbnail/{digest}/` |
| Dashboard screenshot cache | `POST /api/v1/dashboard/{pk}/cache_dashboard_screenshot/` |
| Dashboard screenshot | `GET /api/v1/dashboard/{pk}/screenshot/{digest}/` |
| Dashboard thumbnail | `GET /api/v1/dashboard/{pk}/thumbnail/{digest}/` |

Cache creation can enqueue work, so confirm before calling cache endpoints.
`cache_screenshot` is a `GET` endpoint but still triggers background work; treat it as confirmation-gated.

## Confirmation-Gated Dashboard And Chart Operations

Do not run these without explicit confirmation:

| Surface | Examples |
|---|---|
| Create/update/delete | dashboard/chart `POST`, `PUT`, `DELETE` |
| Dashboard layout mutations | filters, colors, chart customizations |
| Copies and imports | dashboard copy, dashboard/chart import |
| Exports | dashboard/chart export, export as example |
| Favorites | favorite create/delete changes user state |
| Cache and screenshot generation | chart warm up cache, chart `cache_screenshot`, dashboard `cache_dashboard_screenshot` |
