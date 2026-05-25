---
name: preset-mcp
description: Route Superset MCP tool workflows, source-of-truth checks, and surface-boundary decisions. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp

Use for Superset MCP intent, MCP tool routing, and MCP/API surface-boundary decisions.

## Always

- Stay on MCP tools for MCP intent.
- Treat `superset/superset/mcp_service` as the only source of truth for MCP tool names, schemas, tags, annotations, prompts, resources, and RBAC metadata.
- Follow the live MCP tool schema when calling a tool; these skills are workflow guidance, not schema definitions.
- Do not use direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls from this package.
- If MCP cannot satisfy the request, stop and explain the missing MCP capability. Do not switch surfaces.

## Decision Rules

- MCP intent includes MCP tools, MCP clients, Superset MCP, Preset MCP, MCP resources, MCP prompts, tool discovery, and MCP tool errors.
- Direct API intent includes API credentials, REST endpoints, OpenAPI, curl/Python requests, Management API, workspace API, and Snowflake Cortex APIs.
- If the user mixes MCP and API language, ask which surface they want before taking action.
- Use a domain skill after routing: discovery, data, visualization, dashboard, sqllab, datasets, or troubleshooting.

## Workflow Order

1. Identify whether the user requested MCP or direct API.
2. For MCP, choose the narrowest MCP domain skill.
3. Use the live MCP tool schema for parameters.
4. Stop before any non-MCP surface unless the user starts a new direct API workflow.

## Retrieve

- Tool categories and loading strategy: [references/tool-categories.md](references/tool-categories.md)
- Surface boundary examples: [references/surface-boundary.md](references/surface-boundary.md)
