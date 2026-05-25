---
name: preset-mcp-discovery
description: Use Superset MCP health, instance, list, detail, schema, and chart-type discovery tools. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-discovery

Use for MCP metadata discovery that does not require result data or persistent changes.

## Always

- Use `preset-mcp` for surface routing if there is any MCP/API ambiguity.
- Start with the narrowest list, detail, health, or schema tool.
- Treat live MCP schemas as authoritative for filter, sort, pagination, and request wrapper fields.
- Do not expose hidden dataset, database, schema, or SQL details after permission errors.

## Decision Rules

- Use `health_check` for basic service availability.
- Use `get_instance_info` for workspace/instance overview.
- Use `list_*` tools to find IDs before `get_*_info` tools.
- Use `get_schema` for valid filter/sort/select fields.
- Use `get_chart_type_schema` before creating or updating complex chart configs.

## Workflow Order

1. Identify the object type: chart, dashboard, dataset, database, schema, or instance.
2. List/search first when the identifier is missing.
3. Fetch details only for the specific object needed.
4. Route to `preset-mcp-data` for result rows, chart data, previews, or rendered SQL.
5. Route to mutation-focused skills before creating or updating objects.

## Retrieve

- Discovery tool map: [references/discovery-tools.md](references/discovery-tools.md)
