# Data Tools

| Goal | MCP Tool | Notes |
|---|---|---|
| Existing chart result rows | `get_chart_data` | Can return customer data in formats such as JSON/CSV/Excel depending on schema. |
| Existing chart preview | `get_chart_preview` | Returns preview URL or formatted content such as ASCII/table/Vega-Lite. |
| Rendered chart SQL | `get_chart_sql` | SQL text can expose business logic and schema. It does not execute the chart query. |
| Semantic-layer result table | `query_dataset` | Use saved metrics and column names from `get_dataset_info`. |

Prefer `query_dataset` when the user asks for metrics by dimensions on a known dataset. Prefer `get_chart_data` when the chart already exists and the user wants its result.
