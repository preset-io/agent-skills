# Preset MCP Skills

Use `skills/preset-mcp/SKILL.md` when helping with Preset/Superset MCP servers, MCP tools, MCP clients, or Copilot/MCP behavior.

Stay on the MCP tool surface. Do not switch to direct Preset API, Superset REST API, Snowflake Cortex API, or CLI workflows unless the user explicitly approves changing surfaces.

Prefer read-only MCP discovery first: check MCP availability, inspect instance context, list relevant resources, then load details or schemas before using data-returning or mutating tools.

Before SQL execution, chart data retrieval, preview retrieval, dashboard/chart mutation, saved-query mutation, or any operation that can expose customer data or change persistent resources, summarize the exact MCP tool, target object, input payload, expected exposure, and expected effect, then get explicit user confirmation.
