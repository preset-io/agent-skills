# Dashboard Workflows

| Goal | MCP Tool |
|---|---|
| Find dashboards | `list_dashboards` |
| Inspect dashboard metadata/layout/charts | `get_dashboard_info` |
| Create a new dashboard from chart IDs | `generate_dashboard` |
| Add a chart to an existing dashboard | `add_chart_to_existing_dashboard` |

If `add_chart_to_existing_dashboard` reports a permission problem, tell the user they lack edit rights and ask before creating a new dashboard. Do not silently pivot to `generate_dashboard`.
