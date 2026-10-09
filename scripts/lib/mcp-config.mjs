// Single source of truth for the Preset MCP gateway connection config shipped in
// plugins/preset-mcp-skills. The endpoint and server names live in
// plugins/preset-mcp-skills/connections/gateway.json; this module derives, for
// every target, the exact file contents in that target's own official format.
// Shapes differ on purpose and must not be unified:
//   portable Agent Plugins  mcp.json            $schema + type "streamable-http"
//   OpenAI Codex            mcp.json            discovered by default from the plugin root (the portable file);
//                                               .codex-plugin/plugin.json declares no mcpServers
//   Claude Code             plugin.json inline  type "http" (Claude skips a url entry without type)
//                                               no root .mcp.json: Claude auto-discovers it and rejects an entry without type
//   Cursor                  cursor/mcp.json     url only
// Sources: https://developers.openai.com/plugins/build/plugins,
//   https://developers.openai.com/plugins/deploy/submission,
//   https://code.claude.com/docs/en/plugins-reference, https://code.claude.com/docs/en/mcp,
//   https://cursor.com/docs/reference/plugins, https://cursor.com/docs/context/mcp
import fs from "node:fs";
import path from "node:path";

export const PACKAGE = "plugins/preset-mcp-skills";
export const SOURCE_FILE = `${PACKAGE}/connections/gateway.json`;
export const AGENT_PLUGINS_MCP_SCHEMA = "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json";

export function readSource(root) {
  const source = JSON.parse(fs.readFileSync(path.join(root, SOURCE_FILE), "utf8"));
  const url = new URL(source.endpoint);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || !url.pathname.endsWith("/mcp")) {
    throw new Error(`${SOURCE_FILE}: endpoint must be a plain https URL ending in /mcp`);
  }
  for (const key of ["bundledServerName", "userServerName"]) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(source[key] ?? "")) throw new Error(`${SOURCE_FILE}: ${key} must be a lowercase kebab-case name`);
  }
  return source;
}

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

// Whole files that contain nothing but connection config.
export function generatedFiles(source) {
  const { endpoint, bundledServerName: bundled, userServerName: user } = source;
  return {
    [`${PACKAGE}/mcp.json`]: json({ $schema: AGENT_PLUGINS_MCP_SCHEMA, mcpServers: { [bundled]: { type: "streamable-http", url: endpoint } } }),
    [`${PACKAGE}/cursor/mcp.json`]: json({ mcpServers: { [bundled]: { url: endpoint } } }),
    [`${PACKAGE}/connections/claude-code.mcp.json`]: json({ mcpServers: { [user]: { type: "http", url: endpoint } } }),
    [`${PACKAGE}/connections/cursor.mcp.json`]: json({ mcpServers: { [user]: { url: endpoint } } }),
    [`${PACKAGE}/connections/vscode.mcp.json`]: json({ servers: { [user]: { type: "http", url: endpoint } } }),
    [`${PACKAGE}/connections/codex.config.toml`]: `[mcp_servers.${user}]\nurl = "${endpoint}"\n`,
  };
}

// Fields written into existing manifests, keyed by file. A value of undefined means
// the field must be absent.
export function manifestFields(source) {
  const { endpoint, bundledServerName: bundled } = source;
  return {
    [`${PACKAGE}/.claude-plugin/plugin.json`]: { mcpServers: { [bundled]: { type: "http", url: endpoint } } },
    [`${PACKAGE}/.codex-plugin/plugin.json`]: { mcpServers: undefined },
    [`${PACKAGE}/.cursor-plugin/plugin.json`]: { mcpServers: "./cursor/mcp.json" },
  };
}

// Fields of connections/clients.json derived from the source.
export function clientsIndexFields(source) {
  const { endpoint, bundledServerName: bundled, userServerName: user } = source;
  const generated = generatedFiles(source);
  const parse = (file) => JSON.parse(generated[`${PACKAGE}/${file}`]);
  return {
    endpoint,
    serverName: user,
    pluginServerName: bundled,
    // Per-client command strings that embed the endpoint and the user-level server name.
    commands: {
      "claude-code": {
        cli: `claude mcp add --transport http ${user} ${endpoint}`,
        signIn: `Run /mcp in Claude Code (or claude mcp login ${user}) and complete the browser sign-in.`,
      },
      codex: { signIn: `Run codex mcp login ${user} and complete the browser sign-in.` },
    },
    shapes: {
      "agent-plugins-portable": parse("mcp.json"),
      cursor: parse("cursor/mcp.json"),
      "claude-code": manifestFields(source)[`${PACKAGE}/.claude-plugin/plugin.json`].mcpServers,
    },
  };
}

// The only keys a server entry may carry. Anything else (headers, oauth, env,
// client ids, timeouts, tool policy) would be an unsolicited setting.
export const ALLOWED_SERVER_KEYS = ["type", "url"];
export const CREDENTIAL_LIKE = /token|secret|password|passwd|api[_-]?key|authorization|bearer|client[_-]?id|credential|"headers"|"oauth"|\$\{/i;

// Verifies, on disk (or in a map of archive entries), that every target's config
// is present with exactly the derived shape. `read(rel)` returns file text or null.
export function checkPackage(read, source) {
  const problems = [];
  const expectedFiles = generatedFiles(source);
  for (const [rel, expected] of Object.entries(expectedFiles)) {
    const text = read(rel);
    if (text === null) problems.push(`${rel} is missing`);
    else if (text !== expected) problems.push(`${rel} does not match the config derived from ${SOURCE_FILE}`);
  }
  for (const [rel, fields] of Object.entries(manifestFields(source))) {
    const text = read(rel);
    if (text === null) {
      problems.push(`${rel} is missing`);
      continue;
    }
    let manifest;
    try {
      manifest = JSON.parse(text);
    } catch {
      problems.push(`${rel} is not valid JSON`);
      continue;
    }
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) {
        if (key in manifest) problems.push(`${rel}: "${key}" must be absent`);
      } else if (JSON.stringify(manifest[key]) !== JSON.stringify(value)) problems.push(`${rel}: "${key}" must be ${JSON.stringify(value)}`);
    }
  }
  const portable = read(`${PACKAGE}/plugin.json`);
  if (portable === null) problems.push(`${PACKAGE}/plugin.json is missing`);
  // No unsolicited settings and no credentials in any server entry.
  const configs = [...Object.keys(expectedFiles).filter((rel) => rel.endsWith(".json")), ...Object.keys(manifestFields(source))];
  for (const rel of configs) {
    const text = read(rel);
    if (text === null) continue;
    const servers = JSON.parse(text).mcpServers ?? JSON.parse(text).servers ?? {};
    if (typeof servers !== "object") continue;
    for (const [name, server] of Object.entries(servers)) {
      for (const key of Object.keys(server)) {
        if (!ALLOWED_SERVER_KEYS.includes(key)) problems.push(`${rel}: server "${name}" has unsolicited setting "${key}"`);
      }
    }
    if (CREDENTIAL_LIKE.test(JSON.stringify(servers))) problems.push(`${rel}: credential-like content in MCP server config`);
  }
  // Claude Code auto-discovers a root .mcp.json and rejects an entry without type; Codex reads the root mcp.json instead.
  if (read(`${PACKAGE}/.mcp.json`) !== null) problems.push(`${PACKAGE}/.mcp.json must not exist: Claude Code auto-discovers it and rejects an entry without "type"`);
  for (const rel of [".app.json", "hooks/hooks.json"]) {
    if (read(`${PACKAGE}/${rel}`) !== null) problems.push(`${PACKAGE}/${rel} is not eligible for the OpenAI directory`);
  }
  return problems;
}
