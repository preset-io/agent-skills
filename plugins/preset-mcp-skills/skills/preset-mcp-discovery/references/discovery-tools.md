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

## Discovery Flow

1. Run `health_check` only for MCP service availability, uptime, dependency, or readiness questions.
2. Run `get_instance_info` only for workspace identity, feature, count, or instance overview questions.
3. Use `list_*` before `get_*_info` when the user provides a name instead of an ID; do not repeat an identical list call, but follow pagination or refine the search filter when the target is not in the returned page.
4. Fetch details only for the object needed.
5. When a call fails on filters, sorts, field selections, or request wrappers, fix it against `get_schema` instead of guessing again.
6. Route result-data reads, mutations, and SQL execution to their domain skills; stop before direct API calls.

Discovery tools answer metadata and capability questions. Route returned rows, chart data, previews, rendered SQL, and semantic-layer output to `preset-mcp-data`.
