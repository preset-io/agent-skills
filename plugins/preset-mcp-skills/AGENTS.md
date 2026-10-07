# Preset MCP Skills

This package contains installable Preset/Superset MCP skills for OpenAI Codex and direct repository readers.

Use these skills only for Preset MCP gateway and Superset MCP tool workflows. Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, or Preset MCP, use this package and stay on MCP tools.
- If MCP lacks a needed capability, stop and explain the missing MCP capability. Do not switch to direct API.
- Use `preset-api-skills` only when the user explicitly asks for direct API credentials, REST endpoints, curl/Python requests, or Superset workspace API inspection. Snowflake Cortex API/operator workflows belong to `preset-snowflake-cortex-skills`.
- Do not load API skills from an MCP skill unless the user explicitly starts a separate direct API workflow.

## Skill Routing

Use the `skills/*/SKILL.md` files as the canonical instructions:

- `skills/preset-mcp/SKILL.md` - MCP-only surface boundary, source of truth, tool inventory, and routing.
- `skills/preset-mcp-gateway/SKILL.md` - Preset MCP gateway (`https://mcp.app.preset.io/mcp`): client connection, aggregate gateway vs direct workspace surface selection, workspace selection, `search_workspace_tools` and `call_tool`, optional-service and failure handling.
- `skills/preset-mcp-discovery/SKILL.md` - health, instance, list/detail, schema, and chart-type discovery.
- `skills/preset-mcp-data/SKILL.md` - chart data, chart previews, rendered chart SQL, and dataset query results.
- `skills/preset-mcp-visualization/SKILL.md` - Explore links, chart configuration discovery, chart previews, saved charts, and chart updates.
- `skills/preset-mcp-dashboard/SKILL.md` - dashboard inspection, dashboard creation, and adding charts to dashboards.
- `skills/preset-mcp-sqllab/SKILL.md` - SQL execution, SQL Lab links, and saved SQL queries through MCP.
- `skills/preset-mcp-datasets/SKILL.md` - dataset inspection, semantic-layer querying, and virtual dataset creation.
- `skills/preset-mcp-troubleshooting/SKILL.md` - health checks, validation errors, permission errors, response-size issues, and bug reports.
- `skills/tableau-to-preset/SKILL.md` - guided workflow for converting a Tableau workbook (.twb/.twbx) to a Preset dashboard via MCP tools.

## Source Of Truth

- Direct workspace connection: the live Superset MCP server under `superset/superset/mcp_service` is the source of truth for tool names, schemas, tags, annotations, prompts, resources, and RBAC metadata.
- Preset MCP gateway: the gateway (`preset-io/mcp-gateway`) defines its own top-level tools (`list_workspaces`, `list_workspace_services`, `search_workspace_tools`, `call_tool`, `get_workspace_catalog`, Knowledge tools). Superset defines only the workspace tools reached through them, and the `inputSchema` returned by `search_workspace_tools` for the chosen workspace is authoritative.

These skills are workflow and safety guidance only.

Detailed package-level inventory of workspace tools lives in `references/tool-inventory.md` and `references/tool-inventory.json`. Validate drift with `scripts/check-tool-inventory.py` when a local Superset checkout is available.

## Gateway Connection

Production endpoint: `https://mcp.app.preset.io/mcp`, interactive OAuth only. Never embed credentials, tokens, or client secrets, never create a confidential OAuth client, and never overwrite an existing connection. Staging and sandbox gateways are opt-in with a user-supplied URL. Templates and manual steps: `connections/README.md`. On a gateway, ask the user when the workspace is ambiguous, never silently choose a production workspace, and never reuse a workspace ID across environments.
