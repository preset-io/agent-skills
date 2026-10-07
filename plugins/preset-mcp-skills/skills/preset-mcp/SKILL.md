---
name: preset-mcp
description: Route Superset MCP tool workflows, source-of-truth checks, and surface-boundary decisions. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp

Use for Superset MCP intent, MCP tool routing, and MCP/API surface-boundary decisions.

## Always

- Stay on MCP tools for MCP intent.
- Name the connected surface first. A direct workspace connection's tool names, schemas, tags, annotations, prompts, resources, and RBAC metadata come from the live Superset MCP service (`superset/superset/mcp_service`). The Preset MCP gateway defines its own top-level tools (`list_workspaces`, `list_workspace_services`, `search_workspace_tools`, `call_tool`, and others); Superset defines only the workspace tools reached through them. Use `preset-mcp-gateway` on a gateway.
- Direct connection: call tools directly with the obvious parameters; fetch a tool's schema only after a validation error. Gateway: read the live `inputSchema` from `search_workspace_tools` before `call_tool`. These skills are workflow guidance, not schema definitions.
- Do not use direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls from this package.
- If MCP cannot satisfy the request, stop and explain the missing MCP capability. Do not switch surfaces.

## Decision Rules

- MCP intent includes MCP tools, MCP clients, Superset MCP, Preset MCP, MCP resources, MCP prompts, tool discovery, and MCP tool errors.
- Direct API intent includes API credentials, REST endpoints, OpenAPI, curl/Python requests, Management API, workspace API, and Snowflake Cortex APIs.
- If the user starts with MCP intent and mentions direct API only as a fallback, keep MCP intent. Say: "No API fallback. Direct API is a different surface and requires separate explicit approval. Stop before API calls."
- When the session is connected through MCP tools and the user has not named a surface, default to MCP and proceed; ask only when the user explicitly mixes both surfaces in one request.
- Gateway tools listed (`list_workspaces`, `search_workspace_tools`) or the user wants to connect a client: use `preset-mcp-gateway` before any domain skill.
- Use a domain skill after routing: discovery, data, visualization, dashboard, sqllab, datasets, or troubleshooting. On a gateway, domain-skill tools are workspace tools called through `call_tool` with a `workspace_id`.

## Workflow Order

1. Identify whether the user requested MCP or direct API.
2. For MCP, identify the surface (gateway or direct workspace), then choose the narrowest MCP domain skill.
3. Direct: call the tool with the obvious parameters and consult its schema only after a validation error. Gateway: select the workspace, search, read the schema, then `call_tool`.
4. If MCP lacks a requested capability, explain the missing MCP capability.
5. Ask before changing surfaces and stop before API calls.

## Retrieve

- Gateway connection and multi-workspace flow: the `preset-mcp-gateway` skill
- Tool categories and loading strategy: [references/tool-categories.md](references/tool-categories.md)
- Surface boundary examples: [references/surface-boundary.md](references/surface-boundary.md)
