# MCP Tool Categories

Use the live Superset MCP server as the source of truth. Current durable categories:

| Tag | Purpose | Representative Tools |
|---|---|---|
| `core` | Health, overview, lists, bug report | `health_check`, `get_instance_info`, `list_charts`, `list_dashboards`, `list_datasets`, `list_databases`, `generate_bug_report` |
| `discovery` | Detailed metadata and schema discovery | `get_chart_info`, `get_dashboard_info`, `get_dataset_info`, `get_database_info`, `get_schema`, `get_chart_type_schema` |
| `data` | Data-returning or SQL-text reads | `get_chart_data`, `get_chart_preview`, `get_chart_sql`, `query_dataset` |
| `explore` | UI link generation | `generate_explore_link`, `open_sql_lab_with_context` |
| `mutate` | Persistent or cached workspace changes | `generate_chart`, `update_chart`, `update_chart_preview`, `generate_dashboard`, `add_chart_to_existing_dashboard`, `execute_sql`, `save_sql_query`, `create_virtual_dataset` |

Use the smallest set of calls that fulfills the request. Reach for discovery tools only when an ID, name, or schema is actually missing; go directly to data or mutation tools when the user's intent already calls for them.
