# Preset MCP Skills

Agent guidance for deterministic Preset/Superset Model Context Protocol workflows.

Use this package when the user is interacting with a Preset or Superset MCP server, MCP tools, MCP clients, or Copilot/MCP behavior. These skills teach agents how to stay on the MCP tool surface, discover available context, and avoid falling back to direct HTTP APIs without approval.

## Package Structure

```text
skills/
  preset-mcp/SKILL.md
```

## Boundary

MCP workflows must stay on MCP tools unless the user explicitly approves changing surfaces. Do not load direct API skills or call Preset Management API, Superset REST API, or Snowflake Cortex API endpoints as an implicit fallback.

If MCP lacks the needed capability, explain the limitation and ask whether the user wants to switch to the API surface.

## Supported Clients

| Client | Entry point |
|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` |
| Claude Code | `.claude-plugin/plugin.json` and `CLAUDE.md` |
| Cursor | `.cursor-plugin/plugin.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |

## Validation

From the repository root:

```bash
./scripts/smoke-test.sh
```

## License

Apache 2.0 - see [`LICENSE`](../../LICENSE)
