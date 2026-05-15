# Current User And Permissions

Use this reference to inspect the authenticated workspace user and troubleshoot `401` or `403` responses.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/me/" | jq '.result'

curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/me/roles/" | jq '.result'
```

```python
me = client.workspace("GET", hostname, "/me/")["result"]
roles = client.workspace("GET", hostname, "/me/roles/")["result"]
print(me.get("username") or me.get("email"), roles)
```

Use these calls to troubleshoot `401` and `403` responses. Do not infer access from role names alone; verify the endpoint response.

For role, workspace membership, permission, or access-control changes, route to `preset-roles-permissions`.
