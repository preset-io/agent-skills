# Destructive Import Approval

Imports can create, overwrite, or replace dashboards, charts, datasets, databases, saved queries, themes, and all-assets bundles. Database imports can include passwords, SSH tunnel passwords, private keys, private key passwords, or encrypted extra secrets.

## Confirmation Required

Before running any import that uses `overwrite`, sparse update, all-assets restore behavior, database credentials, or replacement bundles, summarize:

1. Destination workspace hostname.
2. Import endpoint.
3. Bundle path and contained object types.
4. Object IDs, UUIDs, or names expected to be created or changed.
5. Whether `overwrite`, sparse update, passwords, or secret fields are provided.
6. Expected destructive effect.
7. Rollback or backup plan.

Wait for explicit confirmation.

## Endpoints

| Surface | Endpoint |
|---|---|
| All assets | `POST /api/v1/assets/import/` |
| Dashboards | `POST /api/v1/dashboard/import/` |
| Charts | `POST /api/v1/chart/import/` |
| Datasets | `POST /api/v1/dataset/import/` |
| Databases | `POST /api/v1/database/import/` |
| Saved queries | `POST /api/v1/saved_query/import/` |
| Themes | `POST /api/v1/theme/import/` |

## Validation Pattern

Prefer OpenAPI checks and bundle inspection before live import. Do not live-test imports on customer workspaces. Use a staging/dev workspace first, and only after the destination, overwrite behavior, and rollback plan are confirmed.

