# Workspace Version And OpenAPI Discovery

Superset workspace API examples should be pinned to the workspace runtime where possible. The public Superset API docs may describe unreleased or broader API surfaces.

## Capture Workspace Version

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/version" | jq .
```

```python
version = client.workspace_root("GET", hostname, "/version")
```

`workspace_root()` is for Superset endpoints that sit at the server root, such as `/version` or `/healthcheck`. Use `workspace()` for all `/api/v1/...` paths.

Useful fields, when present:

| Field | Description |
|---|---|
| `version_string` | Superset runtime version string |
| `version_sha` | Short build or Git SHA |
| `build_number` | Deployment build identifier, when configured |

## Fetch Workspace OpenAPI

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/_openapi" > superset-openapi.json
```

```python
openapi = client.workspace("GET", hostname, "/_openapi")
paths = openapi.get("paths", {})
for path in sorted(paths):
    if path.startswith("/api/v1/dashboard"):
        print(path, sorted(paths[path]))
```

Use the OpenAPI response to verify that documented endpoints exist in the target workspace before writing or executing examples. If OpenAPI discovery returns `404` or is disabled in a local/dev shell, fall back to the pinned Superset source/routes for that workspace build and verify candidate endpoints with read-only metadata calls before using them.
