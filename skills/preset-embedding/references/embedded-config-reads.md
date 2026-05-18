# Embedded Configuration Reads

Use this reference for embedded dashboard configuration reads.

Embedding endpoints depend on workspace feature flags and permissions. If embedding is disabled, embedded endpoints can return `404`.

## Dashboard Embedded Configuration

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/dashboard/{id_or_slug}/embedded" | jq .
```

```python
embedded = client.workspace(
    "GET",
    hostname,
    f"/dashboard/{dashboard_id_or_slug}/embedded",
)
```

`404` can mean no embedded configuration exists for the dashboard, the feature flag is disabled, or the authenticated user lacks access.

## Embedded Dashboard By UUID

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/embedded_dashboard/{uuid}" | jq .
```

```python
embedded = client.workspace("GET", hostname, f"/embedded_dashboard/{embedded_uuid}")
```

Optional query parameters include `uiConfig`, `show_filters`, `expand_filters`, `native_filters_key`, and `permalink_key`.

For allowed-domain interpretation, load [trusted-domains-and-origins.md](trusted-domains-and-origins.md).
