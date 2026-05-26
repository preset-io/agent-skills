# Data Tools

| Goal | MCP Tool | Notes |
|---|---|---|
| Existing chart result rows | `get_chart_data` | Can return customer data in formats such as JSON/CSV/Excel depending on schema. |
| Existing chart preview | `get_chart_preview` | Returns preview URL or formatted content such as ASCII/table/Vega-Lite. |
| Rendered chart SQL | `get_chart_sql` | SQL text can expose business logic and schema. It does not execute the chart query. |
| Semantic-layer result table | `query_dataset` | Use saved metrics and column names from `get_dataset_info`. |

Prefer `query_dataset` when the user asks for metrics by dimensions on a known dataset. Prefer `get_chart_data` when the chart already exists and the user wants its result.

## Safe Data Workflow

1. Resolve the chart or dataset through discovery if the ID, metric, column, or filter is unknown.
2. Choose the narrowest MCP data tool:
   - `get_chart_data` for existing chart result rows.
   - `get_chart_sql` for rendered chart SQL inspection without execution.
   - `get_chart_preview` for existing chart preview output.
   - `query_dataset` for semantic-layer metrics, dimensions, filters, and time ranges.
3. Apply small row limits, narrow selected columns/metrics, narrow time ranges, and compact formats.
4. Summarize the result and avoid pasting large raw payloads.
5. Stop before changing surfaces.

Do not use the REST chart-data endpoint, SQL Lab, dataset REST endpoints, direct API calls, or database access from an MCP data workflow. If the MCP data tool cannot satisfy the request, explain the missing MCP capability and ask before changing surfaces.
