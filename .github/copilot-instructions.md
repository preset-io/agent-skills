# Preset Agent Skills

Use the skill files in this repository when helping with Preset API work:

- `skills/preset-api/SKILL.md` for authentication, API conventions, pagination, Rison, and safety policy.
- `skills/preset-workspaces/SKILL.md` for read-only team and workspace discovery, hostname resolution, and workspace membership listing.
- `skills/preset-admin/SKILL.md` for team memberships, workspace lifecycle, invite lifecycle, role identifiers, and audit logs.
- `skills/preset-superset/SKILL.md` for workspace Superset version, OpenAPI, current-user permissions, menu capabilities, and API safety classification.
- `skills/preset-dashboards/SKILL.md` for dashboard, chart, dashboard chart/dataset/tab, screenshot, thumbnail, and chart data routing.
- `skills/preset-datasets/SKILL.md` for database, schema, catalog, table, dataset, column, metric, table metadata, and data-returning dataset routing.
- `skills/preset-sqllab/SKILL.md` for SQL Lab bootstrap, query history, saved queries, and SQL execution safety boundaries.
- `skills/preset-import-export/SKILL.md` for Superset workspace import/export routing.
- `skills/preset-embedding/SKILL.md` for embedded dashboard configuration reads and guest-token/trusted-domain deferrals.

Default to metadata reads. Some `GET` endpoints can expose customer data or database structure, including chart data, table samples, SQL Lab results, distinct values, and exports. Before any mutation, data-returning read, audit download, SQL execution, import, export, role/RLS change, database connection change, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.
