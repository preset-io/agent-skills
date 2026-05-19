# Dataset And Database Mutations

Use this reference for dataset/database operations that mutate workspace metadata, validate database inputs, import/export assets, or enqueue work.

Do not run these without explicit confirmation:

| Surface | Examples |
|---|---|
| Database mutations | create, update, delete, sync permissions, OAuth, uploads |
| Database validation | test connection, validate parameters, validate SQL |
| Dataset mutations | create, update, delete, duplicate, refresh, get_or_create |
| Column/metric mutations | delete column, delete metric |
| Imports/exports | database or dataset import/export |
| Cache warmup | dataset warm up cache |

Before a dataset or database mutation, summarize:

1. Workspace hostname.
2. Database/dataset IDs, table names, schema names, or upload targets.
3. Endpoint and HTTP method.
4. Request body or SQL.
5. Expected metadata, credential, cache, validation, import, or export effect.
6. Rollback path when one exists.

Route credential-bearing connection workflows through `preset-database-connections`.

Route overwrite, sparse-update, all-assets restore, database import, or secret-bearing import workflows through `preset-destructive-imports`.
