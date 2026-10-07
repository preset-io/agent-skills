# Preset MCP Gateway Connections

Opt-in templates for connecting an MCP client to the hosted Preset MCP gateway. Nothing here is loaded automatically: the plugin manifests do not declare an MCP server, so installing this package never creates, changes, or replaces a connection. Copy a template yourself.

- Production endpoint: `https://mcp.app.preset.io/mcp` (the `remotes[0].url` in `server.json` of `preset-io/mcp-gateway`). The supported path is always `/mcp`.
- Authentication is interactive OAuth in the browser. The templates contain no API key, token, header, client ID, or client secret, and none should be added. Do not register a confidential OAuth client for this endpoint; clients register themselves (dynamic client registration, or the client's published client metadata document).
- Staging, sandbox, and other environments are opt-in only. Use one only when its operator gives you that URL, copy a template, replace the URL, and give the server a different name (for example `preset-gateway-staging`). Never reuse a workspace ID from one environment in another.
- Server name: the templates use `preset-gateway`. Before adding it, check whether the client already has a server by that name or with that URL (`claude mcp list`, `codex mcp list`, the client's MCP settings). If one exists, keep it and stop, or choose a different name. Never overwrite or merge over an existing connection.

| Client | Template | Goes in | Official documentation |
|---|---|---|---|
| Claude Code | [claude-code.mcp.json](claude-code.mcp.json) | `.mcp.json` (project scope) or `claude mcp add --transport http preset-gateway https://mcp.app.preset.io/mcp` | https://code.claude.com/docs/en/mcp |
| Cursor | [cursor.mcp.json](cursor.mcp.json) | `.cursor/mcp.json` or `~/.cursor/mcp.json` | https://cursor.com/docs/context/mcp |
| VS Code (GitHub Copilot) | [vscode.mcp.json](vscode.mcp.json) | `.vscode/mcp.json` | https://code.visualstudio.com/docs/agents/reference/mcp-configuration, https://code.visualstudio.com/docs/copilot/customization/mcp-servers |
| OpenAI Codex | [codex.config.toml](codex.config.toml) | `~/.codex/config.toml` or a trusted project's `.codex/config.toml` | https://learn.chatgpt.com/docs/extend/mcp?surface=cli |
| Claude (claude.ai, Claude Desktop) | manual steps only | Customize > Connectors > Add custom connector | https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp |
| ChatGPT | manual steps only | ChatGPT Plugins > Add custom MCP server | https://developers.openai.com/apps-sdk/deploy/connect-chatgpt |

[clients.json](clients.json) is the machine-readable index of the table, including each client's sign-in step and the date the formats were verified. `tests/mcp-gateway.test.mjs` validates the templates against it (JSON/TOML shape, endpoint, no credential fields). Other clients (Gemini CLI, Windsurf, and so on) have no template here because their formats were not verified; follow the client's own remote-MCP documentation with the same endpoint and never copy a template across clients.

## After connecting

Sign in when the client opens the browser. A first call to `list_workspaces` with no arguments confirms sign-in. If the client lists `list_workspaces` and `search_workspace_tools`, it is on the gateway; follow `skills/preset-mcp-gateway/SKILL.md`.
