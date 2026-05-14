# Import And Export Workflows

All examples use the workspace hostname resolved by `preset-workspaces`.

## Export Endpoints

Exports can disclose SQL text, dashboard layout, dataset metadata, database metadata, tags, masked credential fields, and object UUIDs. Confirm before calling.

| Surface | Endpoint |
|---|---|
| All assets | `GET /api/v1/assets/export/` |
| Dashboards | `GET /api/v1/dashboard/export/` |
| Dashboard as example | `GET /api/v1/dashboard/{pk}/export_as_example/` |
| Charts | `GET /api/v1/chart/export/` |
| Datasets | `GET /api/v1/dataset/export/` |
| Databases | `GET /api/v1/database/export/` |
| Saved queries | `GET /api/v1/saved_query/export/` |
| Themes | `GET /api/v1/theme/export/` |

Before exporting, summarize:

1. Workspace hostname.
2. Export endpoint.
3. Object IDs or whether this is an all-assets export.
4. Expected included related objects.
5. Where the archive will be written.

## Import Endpoints

Imports mutate workspace metadata. Database imports can require passwords, SSH tunnel passwords, private keys, private key passwords, or encrypted extra secrets.

| Surface | Endpoint |
|---|---|
| All assets | `POST /api/v1/assets/import/` |
| Dashboards | `POST /api/v1/dashboard/import/` |
| Charts | `POST /api/v1/chart/import/` |
| Datasets | `POST /api/v1/dataset/import/` |
| Databases | `POST /api/v1/database/import/` |
| Saved queries | `POST /api/v1/saved_query/import/` |
| Themes | `POST /api/v1/theme/import/` |

Before importing, summarize:

1. Workspace hostname.
2. Import endpoint.
3. Bundle path and contained object types.
4. Whether overwrite, sparse update, or passwords are provided.
5. Expected objects created or changed.

Never print import secrets or embed them in Markdown examples.

## Validation Pattern

For Phase 4 smoke validation, prefer OpenAPI presence checks for import/export endpoints. Do not live-test imports. Do not live-test exports unless the user explicitly approves the disclosure and destination path.
