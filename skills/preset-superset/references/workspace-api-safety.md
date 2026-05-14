# Workspace API Safety Classification

Default to metadata reads. HTTP method alone is not enough to decide whether an endpoint is safe.

## Metadata Reads

These are generally safe for normal discovery when the user has requested the workspace target:

| Surface | Examples |
|---|---|
| Version and OpenAPI | `/version`, `/api/v1/_openapi` |
| Current user | `/api/v1/me/`, `/api/v1/me/roles/` |
| Object metadata | dashboard, chart, dataset, database list/detail endpoints |
| Related metadata | `related`, `favorite_status`, owner summaries, menu |

## Data-Returning Reads

These can expose customer data, sample rows, SQL results, or database structure. Before calling them, summarize the workspace, endpoint, object ID, row limit or page size, and expected returned data:

| Surface | Examples |
|---|---|
| Chart data | `/api/v1/chart/{pk}/data/`, `/api/v1/chart/data` |
| Database samples | `/api/v1/database/{pk}/select_star/...` |
| Distinct values | `/api/v1/dataset/distinct/{column_name}`, datasource column values |
| SQL Lab results | `/api/v1/sqllab/results/`, `/api/v1/sqllab/export/{client_id}/` |
| Exports | `/api/v1/assets/export/`, dashboard/chart/dataset/database/saved query exports |

Prefer page sizes and query limits that answer the user request with the least data exposure.

## Confirmation-Gated Operations

Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation:

1. Identify the exact team, workspace, dashboard, dataset, database, query, user, role, or token target.
2. Summarize the endpoint, HTTP method, request body, and expected effect.
3. Explain whether the action changes access, data, credentials, metadata, cache, or execution state.
4. Get explicit user confirmation before making the call.

Never expose credentials, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, signed guest tokens, or exported secret values in logs, examples, PR comments, or handoff notes.
