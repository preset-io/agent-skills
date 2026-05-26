# Troubleshooting

| Symptom | MCP Action |
|---|---|
| Server availability unclear | Call `health_check` with no arguments. |
| User asks to report an MCP problem | Call `generate_bug_report`. |
| Invalid parameters | Re-read the live tool schema and use the request wrapper if required. |
| Permission denied | Treat permission denied as authoritative. Stop and explain the denied MCP operation. |
| Response too large | Narrow with page size, filters, identifiers, row limits, or a more specific tool. |
| Unsupported chart type/capability | Use supported chart schemas from `get_chart_type_schema` or explain the limitation. |

No permission workaround: do not search alternate tools, REST APIs, or direct APIs to expose restricted data.
For permission denied, stop or generate bug report when requested.
Stop before direct API or REST API calls.

Do not use direct REST/API calls to bypass MCP validation, permissions, or missing tools.
