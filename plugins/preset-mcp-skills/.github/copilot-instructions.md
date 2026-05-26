# Preset MCP Skills

Use these skill files only for Superset MCP tool workflows. Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls.

Surface selection:

- MCP intent stays on MCP tools.
- If MCP lacks a capability, stop and explain the missing MCP capability. Do not switch to direct API.
- Direct API workflows belong to `preset-api-skills` and require explicit user intent.

Skill routing:

- `skills/preset-mcp/SKILL.md` for MCP-only surface boundary and routing.
- `skills/preset-mcp-discovery/SKILL.md` for health, instance, list/detail, schema, and chart-type discovery.
- `skills/preset-mcp-data/SKILL.md` for chart data, chart previews, rendered chart SQL, and dataset query results.
- `skills/preset-mcp-visualization/SKILL.md` for Explore links, chart configuration discovery, chart previews, saved charts, and chart updates.
- `skills/preset-mcp-dashboard/SKILL.md` for dashboard inspection and dashboard mutations.
- `skills/preset-mcp-sqllab/SKILL.md` for SQL execution, SQL Lab links, and saved SQL queries.
- `skills/preset-mcp-datasets/SKILL.md` for dataset inspection, semantic-layer querying, and virtual dataset creation.
- `skills/preset-mcp-troubleshooting/SKILL.md` for health checks, validation errors, permission errors, response-size issues, and bug reports.

The live Superset MCP server under `superset/superset/mcp_service` is the source of truth for tools and schemas.
