# Query Results And Exports

Use this reference for SQL Lab result retrieval, CSV/JSON exports, and cached result handling.

SQL result endpoints can expose customer data. Use `preset-sql-execution` before result retrieval or export.

## Endpoints

| Goal | Endpoint |
|---|---|
| Get execution result | `GET /api/v1/sqllab/results/` |
| Export result CSV | `GET /api/v1/sqllab/export/{client_id}/` |
| Streaming CSV export | `POST /api/v1/sqllab/export_streaming/` |

Before fetching or exporting results, summarize:

1. Workspace hostname.
2. Query ID or client ID.
3. Result format and destination.
4. Expected row count, byte size, or limit.
5. Expected customer data exposure.

Do not paste returned rows into logs, PR comments, or handoff notes unless the user confirms that the data is safe to share.
