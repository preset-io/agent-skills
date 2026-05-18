# Menu And Feature Discovery

Use this reference to inspect workspace UI capabilities visible to the authenticated user.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/menu/" | jq '.result'
```

```python
menu = client.workspace("GET", hostname, "/menu/")["result"]
```

The menu response is useful for checking whether workspace UI features such as SQL Lab, charts, dashboards, reports, and admin views are visible to the authenticated user.

Menu visibility is not authorization for mutations. For endpoint-specific access, verify with the target endpoint or inspect current-user permissions. For security-sensitive operations, route to the focused skill named in [workspace-api-safety.md](workspace-api-safety.md).
