---
name: preset-mcp-discovery
description: Use Superset MCP health, instance, list, detail, schema, and chart-type discovery tools. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-discovery

Use for MCP metadata discovery that does not require result data or persistent changes.

## Always

- Use the single narrowest tool that answers the question; discovery calls are for missing IDs, names, or schemas — not a mandatory ladder.
- Do not repeat a list call you already made; reuse earlier results instead of re-listing with different parameters.
- When a call fails on filter, sort, pagination, or request wrapper fields, fix it against the live tool schema rather than guessing again.
- Do not expose hidden dataset, database, schema, or SQL details after permission errors.

## Decision Rules

- Use `health_check` and `get_instance_info` only when the user asks about service health or the workspace itself.
- Use `list_*` tools once to find IDs when the identifier is missing; pick a `page_size` that covers the request in one call.
- Use `get_*_info` for details of a specific known object.
- Use `get_schema` only when a request fails or valid filter/sort/select fields are genuinely unknown.

## Workflow Order

1. If the needed ID or name is already known, skip listing and act on it.
2. Otherwise list/search once for the object type in question.
3. Fetch details only for the specific object needed.
4. Route to `preset-mcp-data` for result rows, chart data, previews, or rendered SQL.
5. Route to mutation-focused skills before creating or updating objects.

## Retrieve

- Discovery tool map: [references/discovery-tools.md](references/discovery-tools.md)
