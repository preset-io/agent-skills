# Connect a Client

Production gateway: `https://mcp.app.preset.io/mcp`. Streamable HTTP, interactive OAuth in the browser, no API key and no header. The client holds only a gateway-issued token. Source: `server.json` and `README.md` (Quickstart) in `preset-io/mcp-gateway`.

## Ground rules

- Use the production URL unless the user explicitly asks for staging, sandbox, or another gateway and supplies its URL. Never default to or guess a non-production host.
- Never put a token, password, API key, `Authorization` header, OAuth client ID, or client secret into a config file, chat message, or command. Do not create a confidential OAuth client for the user; clients register themselves. If a client offers "use your own OAuth client", leave it off unless a Preset administrator issued that client.
- Never overwrite an existing connection. Check what is already configured first. If a server with this URL or the name `preset-gateway` exists, keep it, or add a new one under a different name only if the user wants a second connection.
- Edit client configuration only when the user asks you to set the client up. Prefer showing the snippet and the destination.
- Do not claim support for a client that is not in the table. Send the user to that client's own remote-MCP documentation with the same URL.

## Clients

Machine-readable index: `connections/clients.json`. User-level templates live in `connections/` of the package (`claude-code.mcp.json`, `cursor.mcp.json`, `vscode.mcp.json`, `codex.config.toml`) and are opt-in copies. They are separate from the plugin-bundled server described below.

| Client | How | Sign in | Official documentation |
|---|---|---|---|
| Claude Code | `claude mcp add --transport http preset-gateway https://mcp.app.preset.io/mcp`, or project `.mcp.json` with `{"mcpServers": {"preset-gateway": {"type": "http", "url": "https://mcp.app.preset.io/mcp"}}}` | `/mcp` in Claude Code, or `claude mcp login preset-gateway` | https://code.claude.com/docs/en/mcp |
| Cursor | `.cursor/mcp.json` or `~/.cursor/mcp.json` with `{"mcpServers": {"preset-gateway": {"url": "https://mcp.app.preset.io/mcp"}}}` | Authenticate the server in Cursor's MCP settings when prompted | https://cursor.com/docs/context/mcp |
| VS Code (GitHub Copilot) | `.vscode/mcp.json` with `{"servers": {"preset-gateway": {"type": "http", "url": "https://mcp.app.preset.io/mcp"}}}`, or the `MCP: Add Server` command | Browser opens on first connection | https://code.visualstudio.com/docs/agents/reference/mcp-configuration and https://code.visualstudio.com/docs/copilot/customization/mcp-servers |
| OpenAI Codex (CLI, IDE extension, ChatGPT desktop app) | `~/.codex/config.toml` (or a trusted project's `.codex/config.toml`) with `[mcp_servers.preset-gateway]` and `url = "https://mcp.app.preset.io/mcp"` | `codex mcp login preset-gateway` | https://learn.chatgpt.com/docs/extend/mcp?surface=cli |
| Claude (claude.ai, Claude Desktop) | Manual: Customize > Connectors > + Add > Add custom connector; name, URL, Continue. Keep "Use Claude's published identity (Recommended)" or "Register automatically". Team and Enterprise: an Owner adds it, members click Connect | In the connector flow | https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp |
| ChatGPT | Manual: ChatGPT Plugins > plus > Add custom MCP server; name, description, URL including `/mcp`, authentication, create. Plan and workspace settings decide availability | In the creation flow | https://developers.openai.com/apps-sdk/deploy/connect-chatgpt |

Formats were verified against these pages on 2026-10-07.

## What the package bundles

Installing this package registers a plugin-scoped `preset` server pointing at the production endpoint, in each target's own format. Do not copy one target's shape into another.

| Target | File | Shape | Official documentation |
|---|---|---|---|
| Portable Agent Plugins / OpenAI plugin | `plugin.json` + `mcp.json` | `{"$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", "mcpServers": {"preset": {"type": "streamable-http", "url": "https://mcp.app.preset.io/mcp"}}}` | https://developers.openai.com/plugins/build/plugins (Bundled MCP servers and lifecycle hooks), schema https://agent-plugins.org/schemas/1.0.0/mcp.schema.json |
| OpenAI Codex compatibility | `.codex-plugin/plugin.json` with `"mcpServers": "./.mcp.json"` + `.mcp.json` | `{"mcpServers": {"preset": {"url": "https://mcp.app.preset.io/mcp"}}}` (no `$schema`, no `type`) | https://developers.openai.com/plugins/deploy/submission (Complete metadata examples, Codex format) |
| Claude Code | `.claude-plugin/plugin.json`, inline `mcpServers` | `{"preset": {"type": "http", "url": "https://mcp.app.preset.io/mcp"}}` (`type` is required: an entry with `url` but no `type` is skipped) | https://code.claude.com/docs/en/plugins-reference (`mcpServers`), https://code.claude.com/docs/en/mcp (Plugin-provided MCP servers) |
| Cursor | `.cursor-plugin/plugin.json` with `"mcpServers": "./cursor/mcp.json"` + `cursor/mcp.json` | `{"mcpServers": {"preset": {"url": "https://mcp.app.preset.io/mcp"}}}` | https://cursor.com/docs/reference/plugins (`mcpServers` overrides default `mcp.json` discovery), https://cursor.com/docs/context/mcp |

The shapes differ on purpose; each target reads only its own. The server is plugin-scoped (for example `plugin:preset-mcp-skills:preset` in Claude Code), so it never replaces a connection you configured yourself, and it still needs interactive OAuth sign-in. It carries no credentials. The package declares no `apps` / `.app.json` mapping and no lifecycle hooks (neither is eligible for the public OpenAI directory), and no domain-verification challenge (that is not a plugin configuration field).

## Verify

1. Reload or reconnect the client once and sign in.
2. Confirm the client lists `list_workspaces` and `search_workspace_tools`.
3. Call `list_workspaces` with no arguments. A list of workspaces proves sign-in, token handling, and Manager access work. An authentication or "not authorized" result is handled by [gateway-failures.md](gateway-failures.md); do not loop on it.
