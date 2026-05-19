# Preset Agent Skills

This repository is a catalog of installable Claude plugin packages. The root is not itself an installable plugin.

Use the package under `plugins/` that matches the user's requested surface:

- Direct API workflows: [`plugins/preset-api-skills/CLAUDE.md`](plugins/preset-api-skills/CLAUDE.md)
- MCP tool workflows: [`plugins/preset-mcp-skills/CLAUDE.md`](plugins/preset-mcp-skills/CLAUDE.md)
- CLI workflows: [`plugins/preset-cli-skills/README.md`](plugins/preset-cli-skills/README.md) is a placeholder only and is not installable yet.

If both API and MCP packages are present, route by the user's requested surface, not by resource type. MCP intent wins for Preset/Superset MCP, MCP tools, MCP clients, or Copilot/MCP behavior. Do not switch from MCP tools to direct API guidance unless the user explicitly approves changing surfaces.
