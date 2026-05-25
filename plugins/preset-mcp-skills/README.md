# Preset MCP Skills

Agent guidance for working with Superset MCP tools. This package is for MCP tool workflows only.

Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls. If MCP cannot satisfy the request, stop and explain the missing MCP capability. Do not switch surfaces unless the user explicitly starts a direct API workflow.

## Source Of Truth

The Superset MCP server is the source of truth for tool names, tags, request schemas, response schemas, annotations, prompts, resources, and RBAC metadata:

```text
superset/superset/mcp_service
```

These skills describe durable workflows and safety boundaries. They do not replace live MCP tool schemas.

## Skills

| Skill | Use For |
|---|---|
| [preset-mcp](skills/preset-mcp/SKILL.md) | MCP-only surface selection, routing, tool inventory, and no-API boundary |
| [preset-mcp-discovery](skills/preset-mcp-discovery/SKILL.md) | Health, instance, list, detail, schema, and chart-type discovery |
| [preset-mcp-data](skills/preset-mcp-data/SKILL.md) | Chart data, chart previews, rendered chart SQL, and dataset query results |
| [preset-mcp-visualization](skills/preset-mcp-visualization/SKILL.md) | Explore links, chart configuration discovery, chart previews, saved charts, and chart updates |
| [preset-mcp-dashboard](skills/preset-mcp-dashboard/SKILL.md) | Dashboard inspection, dashboard creation, and adding charts to dashboards |
| [preset-mcp-sqllab](skills/preset-mcp-sqllab/SKILL.md) | SQL execution, SQL Lab links, and saved SQL queries through MCP |
| [preset-mcp-datasets](skills/preset-mcp-datasets/SKILL.md) | Dataset inspection, semantic-layer querying, and virtual dataset creation |
| [preset-mcp-troubleshooting](skills/preset-mcp-troubleshooting/SKILL.md) | Health checks, validation errors, permission errors, response-size issues, and bug reports |

## Tool Inventory

The current MCP tool inventory is stored in [references/tool-inventory.json](references/tool-inventory.json) and summarized in [references/tool-inventory.md](references/tool-inventory.md). Check it against a local Superset checkout with:

```bash
python3 plugins/preset-mcp-skills/scripts/check-tool-inventory.py \
  --mcp-root ../superset/superset/mcp_service
```

Set `SUPERSET_MCP_SERVICE_PATH` instead of passing `--mcp-root` when the Superset checkout is elsewhere.

## Supported Clients

| Client | Entry Point |
|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` |
| Claude Code | `.claude-plugin/plugin.json` and `skills/*/SKILL.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |

## Safety Policy

MCP has runtime guardrails such as tool-level RBAC metadata, read/write/destructive annotations, request validation, response guards, and response-size controls. Still, MCP tools can return customer data, SQL text, schema details, and persistent workspace changes. Use the narrowest MCP tool that satisfies the request, keep result limits small, and never fabricate URLs or IDs.

When a task asks for direct API behavior, use `preset-api-skills` instead. When a task asks for MCP behavior, stay in this package.
