# Query Control

Use this reference for stopping or canceling running SQL Lab queries.

Stopping a query mutates execution state. Use `preset-sql-execution` before stopping a query.

| Goal | Endpoint |
|---|---|
| Stop query | `POST /api/v1/query/stop` |

Before stopping a query, summarize:

1. Workspace hostname.
2. Query ID, client ID, or other target identifier.
3. Current query status when known.
4. Expected effect on the running warehouse query or Superset task.
5. Any user-visible impact.

Wait for explicit confirmation before calling the endpoint.
