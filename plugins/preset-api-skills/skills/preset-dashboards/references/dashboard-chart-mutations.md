# Dashboard And Chart Mutations

Use this reference for dashboard/chart operations that change workspace metadata, cache state, or import/export state.

Run directly: favorite create/delete (own-user state, trivially reversible) with an explicit object target; object-scoped chart/dashboard exports the user requested to a user-named local file when the bundle cannot contain database connection config or secret-bearing metadata.

Do not run these without explicit confirmation:

| Surface | Examples |
|---|---|
| Create/update/delete | dashboard/chart `POST`, `PUT`, `DELETE` |
| Dashboard layout mutations | filters, colors, chart customizations |
| Copies and imports | dashboard copy, dashboard/chart import |
| Broad or secret-bearing exports | all-assets export, exports whose bundle may carry database config |
| Cache and screenshot generation | chart warm up cache, chart `cache_screenshot`, dashboard `cache_dashboard_screenshot` |

Before a dashboard or chart mutation, summarize:

1. Workspace hostname.
2. Dashboard/chart IDs or UUIDs.
3. Endpoint and HTTP method.
4. Request body or object IDs.
5. Expected metadata, user-state, cache, import, or export effect.
6. Rollback path when one exists.

Exports can disclose dashboard layout, chart query context, dataset metadata, object UUIDs, and SQL expressions. For broader export workflows, use `preset-import-export`.

Imports mutate workspace metadata. For overwrite, sparse-update, all-assets restore, database import, or secret-bearing import workflows, use `preset-destructive-imports`.
