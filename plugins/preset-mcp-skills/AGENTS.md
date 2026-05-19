# Preset MCP Skills

This package contains installable Preset/Superset MCP skills for OpenAI Codex and other agent clients.

## Skill Routing

Use `skills/preset-mcp/SKILL.md` when the user is working through a Preset or Superset MCP server, MCP tools, MCP clients, or Copilot/MCP behavior.

Stay on the MCP tool surface. Do not load direct Preset API, Superset REST API, Snowflake Cortex API, or CLI skills as a fallback. If MCP tools do not provide the needed capability, stop and ask whether the user wants to switch surfaces before using direct API guidance.

If both API and MCP plugins are installed, MCP intent wins over resource type. A dashboard, chart, dataset, or SQL Lab request should still use MCP guidance when the user asked for MCP.

## Client Entry Points

- OpenAI Codex: `.codex-plugin/plugin.json` plus this `AGENTS.md`.
- Claude Code: `.claude-plugin/plugin.json` plus `CLAUDE.md`.
- Cursor: `.cursor-plugin/plugin.json`.
- GitHub Copilot: `.github/copilot-instructions.md`.

## Safety Policy

Prefer read-only MCP discovery before any data-returning or mutating tool call. Before SQL execution, chart data retrieval, preview retrieval, dashboard/chart mutation, saved-query mutation, or any operation that can expose customer data or change persistent resources, summarize the exact MCP tool, target object, input payload, expected exposure, and expected effect, then get explicit user confirmation.

Do not print credentials, bearer tokens, connection strings, database passwords, SQLAlchemy URIs, or signed tokens.
