---
name: preset-dashboards
description: Inspect dashboards and charts in a Preset workspace through Superset API calls. Use when a user needs dashboard metadata, chart metadata, dashboard charts/datasets/tabs, chart data safety guidance, or dashboard/chart operation routing after resolving a workspace hostname.
---

# preset-dashboards

Use this skill for dashboard and chart inspection in a Preset workspace.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture the workspace version/OpenAPI when endpoint drift matters.
4. Load [references/read-only-examples.md](references/read-only-examples.md) for basic dashboard list/detail/chart/dataset examples.
5. Load [references/charts-and-dashboard-api.md](references/charts-and-dashboard-api.md) for the fuller dashboard/chart API map, chart data warnings, screenshots, thumbnails, exports, imports, and mutation routing.

## Scope

Default to metadata reads. Chart data and exports can expose customer data, so treat them as data-returning reads that require target and limit confirmation.

Do not create, update, import, export, embed, copy, favorite/unfavorite, warm cache, or issue guest tokens from this skill without explicit confirmation. For dashboard or chart mutations, summarize the target workspace, dashboard/chart IDs or UUIDs, request body, and expected effect before making the call.
