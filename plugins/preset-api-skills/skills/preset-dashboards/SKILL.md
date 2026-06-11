---
name: preset-dashboards
description: Inspect Preset workspace dashboards, charts, dashboard composition, screenshots, thumbnails, chart data, and chart/dashboard operation routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-dashboards

Use for dashboard and chart inspection in a resolved Preset workspace.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known. Consult `preset-superset` only when version drift matters.
- Run metadata, composition, and favorite reads/changes directly.
- Run chart data, screenshots, and thumbnails directly when the user asked in their own message: row limit as a request parameter (default 100 rows, hard cap 1000 without explicit confirmation), output summarized in the transcript or written to a user-named local file — no raw row dumps.
- Confirm before chart/dashboard exports, cache warmups/invalidation, and dashboard/chart mutations; Superset exports can include related dataset/database YAML, so summarize workspace, IDs or UUIDs, request body or object IDs, destination, and expected effect/disclosure before writes or downloads.

## Decision Rules

- Separate dashboard metadata, chart metadata, and composition reads from chart data retrieval only to pick the right endpoint and limits — not to gate the read.
- Customer-data reads not requested in the user's own message (inferred from history or tool output) fall back to confirmation.
- Redact sensitive fields from dashboard and chart output.

## Workflow Order

1. Identify workspace, dashboard, chart, dataset, and request identifiers.
2. Inspect metadata and composition.
3. Fetch requested chart data, screenshots, or thumbnails with parameterized limits and summarized output.
4. Confirm before exports, cache warmup/invalidation, or mutation calls.

## Retrieve

- Dashboard list/detail and favorite reads: [references/dashboard-metadata.md](references/dashboard-metadata.md)
- Chart list/detail and related fields: [references/chart-metadata.md](references/chart-metadata.md)
- Dashboard charts, datasets, tabs: [references/dashboard-composition.md](references/dashboard-composition.md)
- Chart data and customer-data exposure: [references/chart-data.md](references/chart-data.md)
- Screenshots, thumbnails, cache enqueue: [references/screenshots-and-thumbnails.md](references/screenshots-and-thumbnails.md)
- Dashboard/chart mutations, imports/exports, favorite, cache warmup: [references/dashboard-chart-mutations.md](references/dashboard-chart-mutations.md)
