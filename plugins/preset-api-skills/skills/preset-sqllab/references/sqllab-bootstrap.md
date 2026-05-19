# SQL Lab Bootstrap

Use this reference for SQL Lab availability, database options, permissions, and UI defaults.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://{workspace_hostname}/api/v1/sqllab/" | jq '.result'
```

```python
bootstrap = client.workspace("GET", hostname, "/sqllab/")["result"]
```

The bootstrap response helps identify SQL Lab availability, database options, and UI defaults for the authenticated user.

This is metadata discovery. If the user asks to execute SQL, fetch result sets, export result sets, or stop a running query, route to `preset-sql-execution`.
