# Import Workflows

Use this reference for Superset workspace import endpoint guidance.

Imports mutate workspace metadata. Database imports can require passwords, SSH tunnel passwords, private keys, private key passwords, or encrypted extra secrets.

Use `preset-destructive-imports` for overwrite, sparse-update, all-assets restore, database import, or secret-bearing import workflows.

## Import Endpoints

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
6. Rollback or restore plan.

Never print import secrets or embed them in Markdown examples.
