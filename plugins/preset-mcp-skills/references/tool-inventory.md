# Superset MCP Tool Inventory

This inventory is a snapshot of the live Superset MCP server under `superset/superset/mcp_service`. Validate it with `scripts/check-tool-inventory.py` when the Superset checkout is available.

| Tool | Tags | Permission | Read Only | Destructive |
|---|---|---|---|---|
| `add_chart_to_existing_dashboard` | `mutate` | `Dashboard` | no | no |
| `create_virtual_dataset` | `mutate` | `Dataset.write` | no | no |
| `execute_sql` | `mutate` | `SQLLab.execute_sql_query` | no | yes |
| `generate_bug_report` | `core` | none | yes | no |
| `generate_chart` | `mutate` | `Chart` | no | no |
| `generate_dashboard` | `mutate` | `Dashboard` | no | no |
| `generate_explore_link` | `explore` | `Explore` | no | no |
| `get_chart_data` | `data` | `Chart` | yes | no |
| `get_chart_info` | `discovery` | `Chart` | yes | no |
| `get_chart_preview` | `data` | `Chart` | yes | no |
| `get_chart_sql` | `data` | `SQLLab.execute_sql_query` | yes | no |
| `get_chart_type_schema` | `discovery` | none | yes | no |
| `get_dashboard_info` | `discovery` | `Dashboard` | yes | no |
| `get_database_info` | `discovery` | `Database` | yes | no |
| `get_dataset_info` | `discovery` | `Dataset` | yes | no |
| `get_instance_info` | `core` | none | yes | no |
| `get_schema` | `discovery` | `Dataset` | yes | no |
| `health_check` | `core` | none | yes | no |
| `list_charts` | `core` | `Chart` | yes | no |
| `list_dashboards` | `core` | `Dashboard` | yes | no |
| `list_databases` | `core` | `Database` | yes | no |
| `list_datasets` | `core` | `Dataset` | yes | no |
| `open_sql_lab_with_context` | `explore` | `SQLLab.read` | yes | no |
| `query_dataset` | `data` | `Dataset` | yes | no |
| `save_sql_query` | `mutate` | `SavedQuery.write` | no | no |
| `update_chart` | `mutate` | `Chart` | no | yes |
| `update_chart_preview` | `mutate` | `Chart.write` | no | yes |

Do not use old shell/frontend constants as a source of truth for this list.
