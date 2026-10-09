# Preset MCP Gateway Connections

Opt-in templates for connecting an MCP client to the hosted Preset MCP gateway yourself (user-level or project-level configuration), for people who do not install the plugin or want their own connection. The plugin manifests separately bundle a plugin-scoped `preset` server for each target's own format:

| Target | File | Shape | Official documentation |
|---|---|---|---|
| Portable Agent Plugins / OpenAI Codex plugin | `plugin.json` + `mcp.json` (Codex discovers the root `mcp.json` by default; `.codex-plugin/plugin.json` declares no `mcpServers`) | `{"$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "mcpServers": {"preset": {"type": "streamable-http", "url": "https://mcp.app.preset.io/mcp"}}}` | https://developers.openai.com/plugins/build/plugins (Bundled MCP servers and lifecycle hooks), schema https://agent-plugins.org/schemas/1.0.0/mcp.schema.json |
| Claude Code | `.claude-plugin/plugin.json`, inline `mcpServers` | `{"preset": {"type": "http", "url": "https://mcp.app.preset.io/mcp"}}` (`type` is required: an entry with `url` but no `type` is skipped) | https://code.claude.com/docs/en/plugins-reference (`mcpServers`), https://code.claude.com/docs/en/mcp (Plugin-provided MCP servers) |
| Cursor | `.cursor-plugin/plugin.json` with `"mcpServers": "./cursor/mcp.json"` + `cursor/mcp.json` | `{"mcpServers": {"preset": {"url": "https://mcp.app.preset.io/mcp"}}}` | https://cursor.com/docs/reference/plugins (`mcpServers` overrides default `mcp.json` discovery), https://cursor.com/docs/context/mcp |

The shapes differ on purpose; each target reads only its own. There is deliberately no root `.mcp.json`: Claude Code auto-discovers that path and rejects a `url` entry without `type`, while Codex reads the root `mcp.json`. The server is plugin-scoped (for example `plugin:preset-mcp-skills:preset` in Claude Code), so it never replaces a connection you configured yourself, and it still needs interactive OAuth sign-in. It carries no credentials. The package declares no `apps` / `.app.json` mapping and no lifecycle hooks (neither is eligible for the public OpenAI directory), and no domain-verification challenge (that is not a plugin configuration field).

The templates below use the name `preset-gateway` so they never collide with the plugin-scoped `preset` server or an existing connection.

- Production endpoint: `https://mcp.app.preset.io/mcp` (the `remotes[0].url` in `server.json` of `preset-io/mcp-gateway`). The supported path is always `/mcp`.
- Authentication is interactive OAuth in the browser. The templates contain no API key, token, header, client ID, or client secret, and none should be added. Do not register a confidential OAuth client for this endpoint; clients register themselves (dynamic client registration, or the client's published client metadata document).
- Staging, sandbox, and other environments are opt-in only. Use one only when its operator gives you that URL, copy a template, replace the URL, and give the server a different name (for example `preset-gateway-staging`). Never reuse a workspace ID from one environment in another.

  Opt-in example for a non-production gateway (placeholder host; use only a URL the environment's operator gave you, and never copy a workspace ID from another environment):

  ```bash
  claude mcp add --transport http preset-gateway-staging https://<operator-supplied-gateway-host>/mcp
  ```

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
