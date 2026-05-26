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

## Ordered Discovery Flow

1. Run `health_check` for MCP service availability, uptime, dependency, or readiness questions.
2. Run `get_instance_info` for workspace identity, feature, count, or instance overview questions.
3. Use `get_schema` before building filters, sorts, field selections, or unfamiliar request wrappers.
4. Use `list_*` before `get_*_info` when the user provides a name instead of an ID.
5. Fetch details only for the object needed.
6. Summarize discovered capabilities, identifiers, and next MCP tool options.
7. Stop before result-data reads, mutations, SQL execution, or direct API calls unless the user asks for that separate workflow.

Discovery tools answer metadata and capability questions. Route returned rows, chart data, previews, rendered SQL, and semantic-layer output to `preset-mcp-data`.
