---
name: preset-mcp-data
description: Use Superset MCP data-returning tools for chart data, chart previews, rendered chart SQL, and dataset query results. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-data

Use when the user needs data returned through MCP tools.

## Always

- Use MCP tools only; do not switch to REST chart-data, SQL Lab, or dataset endpoints.
- Treat returned rows, rendered SQL, chart previews, and dataset query results as potentially sensitive.
- Keep row limits, selected columns, metrics, filters, and formats narrow.
- Use discovery tools first when identifiers, metrics, columns, or chart IDs are unknown.
- Do not use data tools as a workaround after data-model permission denial.

## Decision Rules

- Use `get_chart_data` for existing chart result data.
- Use `get_chart_preview` for renderable existing chart previews.
- Use `get_chart_sql` to inspect rendered chart SQL without executing it.
- Use `query_dataset` for semantic-layer metrics, dimensions, filters, and time ranges.
- Route chart creation to `preset-mcp-visualization`.

## Workflow Order

1. Confirm the user asked for result data, preview content, SQL text, or semantic-layer output.
2. Resolve the object and schema through discovery if needed.
3. Choose `get_chart_data`, `get_chart_sql`, `get_chart_preview`, or `query_dataset` according to the requested output.
4. Request a small result with narrow fields, row limits, and the least revealing format.
5. Summarize data carefully; do not paste large raw payloads.

## Retrieve

- Data tool routing: [references/data-tools.md](references/data-tools.md)
