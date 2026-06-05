# Preset Agent Skills

This repository is a catalog of installable Claude plugin packages. The root is not itself an installable plugin.

Installable packages:

- Direct API workflows: [`plugins/preset-api-skills/AGENTS.md`](plugins/preset-api-skills/AGENTS.md)
- MCP tool workflows: [`plugins/preset-mcp-skills/AGENTS.md`](plugins/preset-mcp-skills/AGENTS.md)
- CLI (`sup`) workflows: [`plugins/preset-cli-skills/AGENTS.md`](plugins/preset-cli-skills/AGENTS.md)

If multiple packages are present, route by the user's requested surface, not by resource type. MCP intent wins for Preset/Superset MCP, MCP tools, MCP clients, or Copilot/MCP behavior. CLI intent (`sup`, shell, CI/CD scripts, batch exports) uses `preset-cli-skills`. Direct HTTP/SDK code uses `preset-api-skills`. Do not switch surfaces unless the user explicitly approves the switch.
