---
name: preset-mcp-visualization
description: Use Superset MCP tools for Explore links, chart configuration discovery, chart previews, saved charts, and chart updates. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-visualization

Use for chart and Explore workflows through MCP.

## Always

- Treat "create", "make", "build", or "add" a chart as saved-chart intent: use `generate_chart` directly.
- Use `generate_explore_link` for "show", "visualize", "explore", or "preview" requests with no save intent.
- Use `get_dataset_info` once to resolve exact column and metric names before building the config.
- Use `get_chart_type_schema` only for unfamiliar or complex chart types, or after a config validation error — not for simple bar, line, pie, table, or big-number charts.
- Use saved metrics as saved metrics; do not treat metric names as raw columns.
- `generate_chart` request shape: top-level `dataset_id` (not `datasource_id`), chart fields nested inside `config`, and `config.chart_type` is one of `xy`, `table`, `pie`, `pivot_table`, `mixed_timeseries`, `handlebars`, `big_number` — not a Superset `viz_type` string.
- Never fabricate URLs. Use URLs returned by MCP tools.

## Decision Rules

- Creation intent ("create/make/build a chart"): `generate_chart`. Do not substitute an unsaved Explore link.
- Preview intent ("show/visualize/explore/preview"): `generate_explore_link`.
- Use `update_chart` to change an existing saved chart.
- Use `update_chart_preview` only for cached preview form data.
- Route adding charts to dashboards to `preset-mcp-dashboard`.

## Workflow Order

1. Resolve the dataset and its exact columns/metrics with one `get_dataset_info` call.
2. Build the config and call the tool matching the user's intent (create → `generate_chart`).
3. If the call returns a validation error, do not retry the same config blindly: fetch `get_chart_type_schema` once, fix the config against it, and retry once.
4. Report success based on the tool response, not assumption.

## Retrieve

- Visualization workflow details: [references/visualization-workflows.md](references/visualization-workflows.md)
