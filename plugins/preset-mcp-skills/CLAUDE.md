# Preset MCP Skills

This package contains installable Preset/Superset MCP skills for Claude Code and other agent clients.

Use these skills only for Superset MCP tool workflows. Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, or Preset MCP, use this package and stay on MCP tools.
- If MCP lacks a needed capability, stop and explain the missing MCP capability. Do not switch to direct API.
- Use `preset-api-skills` only when the user explicitly asks for direct API credentials, REST endpoints, curl/Python requests, Superset workspace API inspection, or Snowflake Cortex API/operator workflows.
- Do not load API skills from an MCP skill unless the user explicitly starts a separate direct API workflow.

## Skill Routing

Use the `skills/*/SKILL.md` files as the canonical instructions:

- `skills/preset-mcp/SKILL.md` - MCP-only surface boundary, source of truth, tool inventory, and routing.
- `skills/preset-mcp-discovery/SKILL.md` - health, instance, list/detail, schema, and chart-type discovery.
- `skills/preset-mcp-data/SKILL.md` - chart data, chart previews, rendered chart SQL, and dataset query results.
- `skills/preset-mcp-visualization/SKILL.md` - Explore links, chart configuration discovery, chart previews, saved charts, and chart updates.
- `skills/preset-mcp-dashboard/SKILL.md` - dashboard inspection, dashboard creation, and adding charts to dashboards.
- `skills/preset-mcp-sqllab/SKILL.md` - SQL execution, SQL Lab links, and saved SQL queries through MCP.
- `skills/preset-mcp-datasets/SKILL.md` - dataset inspection, semantic-layer querying, and virtual dataset creation.
- `skills/preset-mcp-troubleshooting/SKILL.md` - health checks, validation errors, permission errors, response-size issues, and bug reports.

## Source Of Truth

The live Superset MCP server under `superset/superset/mcp_service` is the source of truth for tool names, schemas, tags, annotations, prompts, resources, and RBAC metadata. These skills are workflow and safety guidance only.

Detailed package-level inventory lives in `references/tool-inventory.md` and `references/tool-inventory.json`. Validate drift with `scripts/check-tool-inventory.py` when a local Superset checkout is available.
