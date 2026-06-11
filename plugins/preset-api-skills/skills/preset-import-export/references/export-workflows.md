# Export Workflows

Use this reference for Superset workspace export endpoint guidance.

Exports can disclose SQL text, dashboard layout, dataset metadata, database metadata, tags, object UUIDs, and credential-bearing engine or `extra` fields. Object-scoped chart/dashboard exports the user explicitly requested run directly to a user-named local file when the bundle cannot contain database config. All-assets, database, dataset, and saved-query exports — and any export whose bundle may carry credentials — stay confirmation-gated.

## Export Endpoints

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

Before a gated export, summarize:

1. Workspace hostname.
2. Export endpoint.
3. Object IDs or whether this is an all-assets export.
4. Expected included related objects.
5. Where the archive will be written.
6. Expected disclosure, including SQL or credential-bearing metadata.

Load [bundle-secrets-and-disclosure.md](bundle-secrets-and-disclosure.md) before inspecting or sharing export bundle contents.
