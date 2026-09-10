# Dashboard Workflows

| Goal | MCP Tool |
|---|---|
| Find dashboards | `list_dashboards` |
| Inspect dashboard metadata/layout/charts | `get_dashboard_info` |
| Create a new dashboard from chart IDs | `generate_dashboard` |
| Add a chart to an existing dashboard | `add_chart_to_existing_dashboard` |
| Remove a chart from a dashboard | `remove_chart_from_dashboard` |
| Inspect stored chart positions | `get_dashboard_layout` |
| Change layout, title, theme, CSS, or cross-filtering | `update_dashboard` |

If `add_chart_to_existing_dashboard` reports a permission problem, tell the user they lack edit rights and ask before creating a new dashboard. Do not silently pivot to `generate_dashboard`.

## Layout

Both `generate_dashboard` and `update_dashboard` accept `position_json`, Superset's layout tree — chart placement is not limited to the auto-arranged grid. The grid is 12 columns wide and row heights are in 8px units; set `width`/`height` under each `CHART-<id>` component's `meta`.

`position_json` fully replaces the existing layout, so author the whole tree in one call: every chart must be reachable from `ROOT_ID` and each component's `parents` must list its full ancestor chain. `get_dashboard_layout` reports the stored per-chart `width`/`height` but not the raw tree, so it verifies a write rather than enabling an incremental edit.

`generate_dashboard` is for new dashboards only. To re-lay-out an existing one, use `update_dashboard` — never re-create it.
