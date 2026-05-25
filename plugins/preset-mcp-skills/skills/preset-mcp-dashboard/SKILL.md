---
name: preset-mcp-dashboard
description: Use Superset MCP tools for dashboard inspection, dashboard creation, and adding charts to dashboards. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-dashboard

Use for dashboard workflows through MCP.

## Always

- Use `list_dashboards` and `get_dashboard_info` for dashboard discovery.
- Use `add_chart_to_existing_dashboard` when the user wants to add a chart to an existing dashboard.
- Use `generate_dashboard` only for a brand-new dashboard.
- Never create a new dashboard as a silent fallback after add-to-existing fails.
- Report permission-denied results directly and ask before changing the plan.

## Decision Rules

- Existing dashboard target present: use `add_chart_to_existing_dashboard`.
- New dashboard request: use `generate_dashboard` with known chart IDs.
- Dashboard analysis without result rows: stay on metadata/detail tools.
- Dashboard chart data: route to `preset-mcp-data`.
- Chart creation before dashboard assembly: route to `preset-mcp-visualization`.

## Workflow Order

1. Resolve dashboard and chart IDs.
2. Inspect existing dashboard details when modifying one.
3. Add to existing or create new according to user intent.
4. Use only URLs and status returned by MCP tools.

## Retrieve

- Dashboard workflows: [references/dashboard-workflows.md](references/dashboard-workflows.md)
