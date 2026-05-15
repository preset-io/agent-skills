# Screenshots And Thumbnails

Use this reference for chart and dashboard screenshot or thumbnail workflows.

Thumbnail and screenshot endpoints depend on workspace feature flags and background screenshot infrastructure.

## Endpoints

| Goal | Endpoint |
|---|---|
| Chart screenshot cache | `GET /api/v1/chart/{pk}/cache_screenshot/` |
| Chart screenshot | `GET /api/v1/chart/{pk}/screenshot/{digest}/` |
| Chart thumbnail | `GET /api/v1/chart/{pk}/thumbnail/{digest}/` |
| Dashboard screenshot cache | `POST /api/v1/dashboard/{pk}/cache_dashboard_screenshot/` |
| Dashboard screenshot | `GET /api/v1/dashboard/{pk}/screenshot/{digest}/` |
| Dashboard thumbnail | `GET /api/v1/dashboard/{pk}/thumbnail/{digest}/` |

## Safety Notes

Screenshot and thumbnail reads can disclose rendered dashboard or chart content. Confirm before retrieving image content from sensitive dashboards.

Cache creation can enqueue work. `cache_screenshot` is a `GET` endpoint but still triggers background work, so treat it as confirmation-gated.

Before calling cache endpoints, summarize the target dashboard or chart, the endpoint, and whether background work will be enqueued.
