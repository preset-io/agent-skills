# API Conventions Reference

## API Layers

| Layer | Base URL |
|---|---|
| Preset Management API | `https://api.app.preset.io/v1` |
| Workspace Superset API | `https://<workspace-hostname>/api/v1` |

Call `GET /teams/{team_name}/workspaces/` through the Management API and inspect the top-level `hostname` field before calling workspace APIs.

For sandbox or staging environments, set `PRESET_API_BASE` to the matching public Management API host.

## Headers

```text
Authorization: Bearer <token>
Content-Type: application/json
```

## Common Response Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created |
| `204` | Success, no content |
| `400` | Bad request, check the JSON body |
| `401` | Unauthenticated, re-request a token |
| `403` | Forbidden, check team/workspace permissions |
| `404` | Resource not found |
| `429` | Rate limited, back off and retry |

The Management API enforces per-IP rate limits. If you receive `429 Too Many Requests`, wait the number of seconds specified in the `Retry-After` response header before retrying.

## Management API Pagination

Management API endpoints that use Manager pagination return results with a `meta.count` total:

```json
{
  "payload": [],
  "meta": {
    "count": 42
  }
}
```

Use `?page_number=1&page_size=100` for paginated Management API endpoints. `page_number` is 1-based. Some Management API list endpoints are not paginated and return only `payload`.

## Superset API Pagination And Rison

Superset API list endpoints use page-number pagination inside the Rison-encoded `q` parameter, such as:

```text
?q=(page:0,page_size:100)
```

Many Superset API endpoints accept a `q` parameter encoded in [Rison](https://github.com/Nanonid/rison) format:

```python
# Install: pip install rison
import rison

query = rison.dumps({
    "page": 0,
    "page_size": 25,
    "order_column": "changed_on_delta_humanized",
    "order_direction": "desc",
    "filters": [{"col": "published", "opr": "eq", "value": True}],
})
```

Example encoded value:

```text
?q=(filters:!((col:published,opr:eq,value:!t)),order_column:changed_on_delta_humanized,order_direction:desc,page:0,page_size:25)
```
