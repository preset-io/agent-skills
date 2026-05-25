---
name: preset-mcp-visualization
description: Use Superset MCP tools for Explore links, chart configuration discovery, chart previews, saved charts, and chart updates. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-visualization

Use for chart and Explore workflows through MCP.

## Always

- Prefer `generate_explore_link` for interactive exploration and unsaved previews.
- Use `generate_chart` only when the user wants a saved chart or the workflow explicitly needs persistence.
- Use `get_dataset_info` and `get_chart_type_schema` before building nontrivial chart configs.
- Use saved metrics as saved metrics; do not treat metric names as raw columns.
- Never fabricate URLs. Use URLs returned by MCP tools.

## Decision Rules

- Use `generate_explore_link` for "show", "visualize", "explore", or "preview" requests.
- Use `generate_chart` with save semantics only for saved chart intent.
- Use `update_chart` to change an existing saved chart.
- Use `update_chart_preview` only for cached preview form data.
- Route adding charts to dashboards to `preset-mcp-dashboard`.

## Workflow Order

1. Resolve dataset and available columns/metrics.
2. Discover chart schema for the intended chart type when needed.
3. Generate an Explore link for review unless the user explicitly asked to save.
4. Save or update only when persistence is requested.
5. Report success based on the tool response, not assumption.

## Retrieve

- Visualization workflow details: [references/visualization-workflows.md](references/visualization-workflows.md)
