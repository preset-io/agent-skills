# Discovery Tools

| Goal | MCP Tool |
|---|---|
| Check service availability | `health_check` |
| Instance overview and counts | `get_instance_info` |
| List charts, dashboards, datasets, databases | `list_charts`, `list_dashboards`, `list_datasets`, `list_databases` |
| Object details | `get_chart_info`, `get_dashboard_info`, `get_dataset_info`, `get_database_info` |
| Valid fields and filters | `get_schema` |
| Chart configuration schema | `get_chart_type_schema` |

Use IDs, UUIDs, or slugs accepted by the live schema. Do not invent identifiers. If a user gives a name, search or list first.
