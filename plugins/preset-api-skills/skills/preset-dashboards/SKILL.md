---
name: preset-dashboards
description: Inspect Preset workspace dashboards, charts, dashboard composition, screenshots, thumbnails, chart data, and chart/dashboard operation routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-dashboards

Use for dashboard and chart inspection in a resolved Preset workspace.

## Always

- Use `preset-api`, `preset-workspaces`, and when drift matters `preset-superset` first.
- Default to metadata reads.
- Treat chart data, screenshots, thumbnails, exports, cache warmups, favorite changes, and dashboard/chart mutations as confirmation-gated.
- Summarize workspace, dashboard/chart IDs or UUIDs, request body, and expected effect before writes.

## Retrieve

- Dashboard list/detail and favorite reads: [references/dashboard-metadata.md](references/dashboard-metadata.md)
- Chart list/detail and related fields: [references/chart-metadata.md](references/chart-metadata.md)
- Dashboard charts, datasets, tabs: [references/dashboard-composition.md](references/dashboard-composition.md)
- Chart data and customer-data exposure: [references/chart-data.md](references/chart-data.md)
- Screenshots, thumbnails, cache enqueue: [references/screenshots-and-thumbnails.md](references/screenshots-and-thumbnails.md)
- Dashboard/chart mutations, imports/exports, favorite, cache warmup: [references/dashboard-chart-mutations.md](references/dashboard-chart-mutations.md)
