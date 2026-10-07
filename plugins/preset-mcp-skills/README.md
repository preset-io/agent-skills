# Preset MCP Skills

Agent guidance for working with the Preset MCP gateway and Superset MCP tools. This package is for MCP tool workflows only.

Do not use this package for direct Preset Management API, Superset REST API, Snowflake Cortex API, curl, Python requests, exports, or database calls. If MCP cannot satisfy the request, stop and explain the missing MCP capability. Do not switch surfaces unless the user explicitly starts a direct API workflow.

## Connecting

The hosted production endpoint is `https://mcp.app.preset.io/mcp` (Streamable HTTP, interactive OAuth sign-in in the browser; no API key, header, or client secret). It is the Preset MCP gateway: one connection that reaches every workspace the signed-in account is authorized for. Staging and sandbox gateways are opt-in only, with a URL the user supplies.

The package bundles a plugin-scoped `preset` server for each plugin format, each in that format's own shape (they differ):

| Target | File | Shape | Official documentation |
|---|---|---|---|
| Portable Agent Plugins / OpenAI plugin | `plugin.json` + `mcp.json` | `{"$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "mcpServers": {"preset": {"type": "streamable-http", "url": "https://mcp.app.preset.io/mcp"}}}` | https://developers.openai.com/plugins/build/plugins (Bundled MCP servers and lifecycle hooks), schema https://agent-plugins.org/schemas/1.0.0/mcp.schema.json |
| OpenAI Codex compatibility | `.codex-plugin/plugin.json` with `"mcpServers": "./.mcp.json"` + `.mcp.json` | `{"mcpServers": {"preset": {"url": "https://mcp.app.preset.io/mcp"}}}` (no `$schema`, no `type`) | https://developers.openai.com/plugins/deploy/submission (Complete metadata examples, Codex format) |
| Claude Code | `.claude-plugin/plugin.json`, inline `mcpServers` | `{"preset": {"type": "http", "url": "https://mcp.app.preset.io/mcp"}}` (`type` is required: an entry with `url` but no `type` is skipped) | https://code.claude.com/docs/en/plugins-reference (`mcpServers`), https://code.claude.com/docs/en/mcp (Plugin-provided MCP servers) |
| Cursor | `.cursor-plugin/plugin.json` with `"mcpServers": "./cursor/mcp.json"` + `cursor/mcp.json` | `{"mcpServers": {"preset": {"url": "https://mcp.app.preset.io/mcp"}}}` | https://cursor.com/docs/reference/plugins (`mcpServers` overrides default `mcp.json` discovery), https://cursor.com/docs/context/mcp |

The shapes differ on purpose; each target reads only its own. The server is plugin-scoped (for example `plugin:preset-mcp-skills:preset` in Claude Code), so it never replaces a connection you configured yourself, and it still needs interactive OAuth sign-in. It carries no credentials. The package declares no `apps` / `.app.json` mapping and no lifecycle hooks (neither is eligible for the public OpenAI directory), and no domain-verification challenge (that is not a plugin configuration field).

Separately, opt-in templates in [connections/](connections/README.md) cover user or project configuration for Claude Code, Cursor, VS Code, and OpenAI Codex (named `preset-gateway`). Claude (claude.ai and Claude Desktop) and ChatGPT are manual steps only. Templates contain the endpoint and nothing else and must not overwrite an existing connection. Per-client steps and official documentation links: [connect-clients.md](skills/preset-mcp-gateway/references/connect-clients.md).

## Choosing A Surface

| Connected surface | Recognize it by | Flow |
|---|---|---|
| Aggregate gateway | `list_workspaces`, `search_workspace_tools`, `call_tool(workspace_id, tool_name, args)` are listed | `list_workspaces`, select an authorized workspace (ask when ambiguous), `list_workspace_services` as needed, `search_workspace_tools`, read the live `inputSchema`, `call_tool` |
| Direct workspace (Superset) MCP | Workspace tools listed directly, or `search_tools` / `call_tool(name, arguments)` with no workspace parameter | Unchanged: call tools with the obvious parameters; read a schema after a validation error |

See [preset-mcp-gateway](skills/preset-mcp-gateway/SKILL.md). Never silently choose a production workspace and never reuse a workspace ID across environments.

## Source Of Truth

The source of truth depends on the connected surface:

- Direct workspace connection: the Superset MCP server is the source of truth for tool names, tags, request schemas, response schemas, annotations, prompts, resources, and RBAC metadata:

  ```text
  superset/superset/mcp_service
  ```

- Preset MCP gateway: the gateway (`preset-io/mcp-gateway`, `src/mcp_gateway/app.py`) defines the top-level tools (`list_workspaces`, `list_workspace_services`, `search_workspace_tools`, `call_tool`, `get_workspace_catalog`, and the Knowledge tools). Superset defines only the workspace tools reached through `search_workspace_tools` and `call_tool`, and each workspace's live `inputSchema` is authoritative for those.

These skills describe durable workflows and safety boundaries. They do not replace live MCP tool schemas.

## Skills

| Skill | Use For |
|---|---|
| [preset-mcp](skills/preset-mcp/SKILL.md) | MCP-only surface selection, routing, tool inventory, and no-API boundary |
| [preset-mcp-gateway](skills/preset-mcp-gateway/SKILL.md) | Preset MCP gateway: client connection, aggregate vs direct surface selection, workspace selection, `search_workspace_tools` and `call_tool`, optional-service and failure handling |
| [preset-mcp-discovery](skills/preset-mcp-discovery/SKILL.md) | Health, instance, list, detail, schema, and chart-type discovery |
| [preset-mcp-data](skills/preset-mcp-data/SKILL.md) | Chart data, chart previews, rendered chart SQL, and dataset query results |
| [preset-mcp-visualization](skills/preset-mcp-visualization/SKILL.md) | Explore links, chart configuration discovery, chart previews, saved charts, and chart updates |
| [preset-mcp-dashboard](skills/preset-mcp-dashboard/SKILL.md) | Dashboard inspection, dashboard creation, and adding charts to dashboards |
| [preset-mcp-sqllab](skills/preset-mcp-sqllab/SKILL.md) | SQL execution, SQL Lab links, and saved SQL queries through MCP |
| [preset-mcp-datasets](skills/preset-mcp-datasets/SKILL.md) | Dataset inspection, semantic-layer querying, and virtual dataset creation |
| [preset-mcp-troubleshooting](skills/preset-mcp-troubleshooting/SKILL.md) | Health checks, validation errors, permission errors, response-size issues, and bug reports |
| [tableau-to-preset](skills/tableau-to-preset/SKILL.md) | Convert a Tableau workbook (.twb/.twbx) to a Preset dashboard via MCP tools |

## Tool Inventory

The current MCP tool inventory is stored in [references/tool-inventory.json](references/tool-inventory.json) and summarized in [references/tool-inventory.md](references/tool-inventory.md). Check it against a local Superset checkout with:

```bash
python3 plugins/preset-mcp-skills/scripts/check-tool-inventory.py \
  --mcp-root ../superset/superset/mcp_service
```

Set `SUPERSET_MCP_SERVICE_PATH` instead of passing `--mcp-root` when the Superset checkout is elsewhere.

## Supported Clients

| Client | Skills Entry Point | Gateway Connection |
|---|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` | Template [codex.config.toml](connections/codex.config.toml) |
| Claude Code | `.claude-plugin/plugin.json` and `skills/*/SKILL.md` | Template [claude-code.mcp.json](connections/claude-code.mcp.json) or `claude mcp add` |
| Cursor | `.cursor-plugin/plugin.json` | Template [cursor.mcp.json](connections/cursor.mcp.json) |
| VS Code (GitHub Copilot) | `.github/copilot-instructions.md` | Template [vscode.mcp.json](connections/vscode.mcp.json) |
| Claude (claude.ai, Claude Desktop), ChatGPT | skill ZIPs / not applicable | Manual steps only (see [connections](connections/README.md)) |

## Verification

- Mocked tests (run in CI by `scripts/smoke-test.sh`, `node --test tests/mcp-gateway.test.mjs`): fixture-based walkthroughs against a mocked gateway (multi-workspace gateway, direct workspace, disabled service, malformed or missing request wrapper), validation of the client connection templates, and a stale-claim check (`scripts/check-mcp-gateway-claims.mjs`) that fails on outdated statements about who defines the gateway's top-level tools. They prove the documented guidance is consistent with the gateway source contract; they do not call a live service.
- Authenticated canaries (manual, read-only, not part of CI, no checked-in credentials): sign in to the gateway with a real account, call `list_workspaces`, `list_workspace_services`, `search_workspace_tools` for a read-only tool, and one read-only `call_tool` in a workspace you are authorized for. Run one only when you are explicitly authorized, never against customer writes, and record the date and gateway commit it was run against.

## Safety Policy

MCP has runtime guardrails such as tool-level RBAC metadata, read/write/destructive annotations, request validation, response guards, and response-size controls. Still, MCP tools can return customer data, SQL text, schema details, and persistent workspace changes. Use the narrowest MCP tool that satisfies the request, keep result limits small, and never fabricate URLs or IDs.

When a task asks for direct API behavior, use `preset-api-skills` instead. When a task asks for MCP behavior, stay in this package.
