# Visualization Workflows

## Create a Chart

For "create", "make", "build", or "add" a chart with no dashboard target:

1. `list_datasets` or `get_dataset_info` to resolve exact columns and metrics
2. `generate_chart`
3. On a validation error, `get_chart_type_schema` once, fix the config, retry once

Check the response for success or error before claiming the chart exists.

When a dashboard target is named, route to `preset-mcp-dashboard` instead.

## Preview Without Saving

For "show", "visualize", "explore", or "preview" requests with no save intent, use `generate_explore_link` instead of `generate_chart`. This creates a reviewable interactive URL without permanently saving a chart.

## Update Chart

Use `get_chart_info` before `update_chart` so the update is based on the current chart configuration. Do not use SQL execution to modify a chart.
