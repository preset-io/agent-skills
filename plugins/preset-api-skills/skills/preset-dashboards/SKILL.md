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
4. Load the focused reference for the task:
   - [references/dashboard-metadata.md](references/dashboard-metadata.md) for dashboard list/detail and favorite-status reads.
   - [references/chart-metadata.md](references/chart-metadata.md) for chart list/detail and related-field reads.
   - [references/dashboard-composition.md](references/dashboard-composition.md) for dashboard charts, datasets, and tabs.
   - [references/chart-data.md](references/chart-data.md) for chart data endpoints that can expose customer data.
   - [references/screenshots-and-thumbnails.md](references/screenshots-and-thumbnails.md) for screenshot, thumbnail, and cache-enqueue behavior.
   - [references/dashboard-chart-mutations.md](references/dashboard-chart-mutations.md) for dashboard/chart mutation, import/export, favorite, and cache-warmup routing.

## Scope

Default to metadata reads. Chart data and exports can expose customer data, so treat them as data-returning reads that require explicit confirmation after summarizing the target and limit where applicable.

Do not create, update, import, export, embed, copy, favorite/unfavorite, warm cache, or issue guest tokens from this skill without explicit confirmation. For dashboard or chart mutations, summarize the target workspace, dashboard/chart IDs or UUIDs, request body, and expected effect before making the call.
