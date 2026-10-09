# Preset MCP Skills

Use these skill files only for Preset MCP gateway and Superset MCP tool workflows. Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls.

Surface selection:

- MCP intent stays on MCP tools.
- If MCP lacks a capability, stop and explain the missing MCP capability. Do not switch to direct API.
- Direct API workflows belong to `preset-api-skills` and require explicit user intent.

Skill routing:

- `skills/preset-mcp/SKILL.md` for MCP-only surface boundary and routing.
- `skills/preset-mcp-gateway/SKILL.md` for the Preset MCP gateway (`https://mcp.app.preset.io/mcp`): client connection, aggregate gateway vs direct workspace surface selection, workspace selection (ask when ambiguous), `search_workspace_tools` and `call_tool`, and failure handling.
- `skills/preset-mcp-discovery/SKILL.md` for health, instance, list/detail, schema, and chart-type discovery.
- `skills/preset-mcp-data/SKILL.md` for chart data, chart previews, rendered chart SQL, and dataset query results.
- `skills/preset-mcp-visualization/SKILL.md` for Explore links, chart configuration discovery, chart previews, saved charts, and chart updates.
- `skills/preset-mcp-dashboard/SKILL.md` for dashboard inspection and dashboard mutations.
- `skills/preset-mcp-sqllab/SKILL.md` for SQL execution, SQL Lab links, and saved SQL queries.
- `skills/preset-mcp-datasets/SKILL.md` for dataset inspection, semantic-layer querying, and virtual dataset creation.
- `skills/preset-mcp-troubleshooting/SKILL.md` for health checks, validation errors, permission errors, response-size issues, and bug reports.
- `skills/tableau-to-preset/SKILL.md` for converting a Tableau workbook (.twb/.twbx) to a Preset dashboard via MCP tools.

Source of truth: on a direct workspace connection, the live Superset MCP server under `superset/superset/mcp_service`; on the Preset MCP gateway, the gateway defines the top-level tools and each workspace's live `inputSchema` from `search_workspace_tools` defines the workspace tools.
