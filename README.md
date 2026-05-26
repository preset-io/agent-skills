# Preset Agent Skills

Agent guidance for working with [Preset](https://preset.io), Apache Superset, Superset MCP tools, and Snowflake Cortex Agents. The skills work across Claude, OpenAI Codex, Cursor, and GitHub Copilot from a single source.

## What's included

The installable packages are:

- [`preset-api-skills`](plugins/preset-api-skills/README.md) — focused skills for direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows.
- [`preset-mcp-skills`](plugins/preset-mcp-skills/README.md) — focused skills for Superset MCP tool workflows.

API package highlights:

- **`preset-api`** — authenticate with the Preset Management API (JWT exchange, base URLs, pagination, safety policy). Required by the other skills.
- **`preset-workspaces`** — list teams and workspaces, resolve workspace hostnames, inspect membership and status.
- **`preset-admin`** — manage team memberships, workspace lifecycle, invites, roles, and audit logs with confirmation-gated mutations.
- **`preset-dashboards`** — inspect dashboards, charts, datasets, and chart data with safety boundaries.
- **`preset-sql-execution`** — run or route SQL Lab execution, result retrieval, exports, and saved-query mutations with explicit approval.

See the [API package README](plugins/preset-api-skills/README.md) for the full catalog (17 skills covering datasets, SQL Lab, embedding, guest tokens, RLS, database connections, role/permission changes, destructive imports, and Snowflake Cortex Agents).

MCP package highlights:

- **`preset-mcp`** — route MCP intent and enforce the no-direct-API boundary.
- **`preset-mcp-discovery`** — use MCP health, list, detail, schema, and chart-type discovery tools.
- **`preset-mcp-visualization`** — create Explore links, chart previews, saved charts, and chart updates through MCP.
- **`preset-mcp-sqllab`** — run SQL, open SQL Lab links, and save SQL queries through MCP.
- **`preset-mcp-troubleshooting`** — handle MCP health, validation, permission, response-size, and bug-report workflows.

See the [MCP package README](plugins/preset-mcp-skills/README.md) for the full 8-skill catalog.

Broader CLI workflow surfaces are reserved but not installable yet: [`plugins/preset-cli-skills`](plugins/preset-cli-skills/README.md). Codex package discovery metadata lives in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json), and Claude marketplace metadata lives in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

Install or load each package from its plugin directory, not from the repository root. Use `preset-api-skills` for direct API workflows. Use `preset-mcp-skills` for MCP workflows. Do not use API skills as a fallback for MCP-only work, and do not use MCP skills for direct API work.

## Supported clients

| Client | Manifest | Distribution channel |
|---|---|---|
| Claude Desktop | `.claude-plugin/marketplace.json` → package `.claude-plugin/plugin.json` | Custom marketplace (Add marketplace → repo URL) |
| Claude Code (CLI) | `.claude-plugin/marketplace.json` → package `.claude-plugin/plugin.json` | `/plugin marketplace add` |
| Claude.ai web | per-skill ZIPs from `scripts/build-claude-web-skills.mjs` | Manual upload in Skills settings |
| OpenAI Codex | `.agents/plugins/marketplace.json` → package `.codex-plugin/plugin.json` + `AGENTS.md` | Codex plugin marketplace |
| Cursor | package `.cursor-plugin/plugin.json` | Remote Rule import |
| GitHub Copilot | package `.github/copilot-instructions.md` | Repo-local instructions |

## Installation

> Replace `<MARKETPLACE_REPO>` below with the public repository URL or `owner/repo` slug for the Preset agent skills marketplace.

### Claude Desktop

Add Preset's marketplace, then install the plugin. One install registers all skills, and Claude Desktop picks up new versions automatically.

1. Open **Claude Desktop → Settings → Connectors**, then click the **Customize** link.
2. In Customize, select **Skills** in the sidebar, click the **+** next to "Skills", and choose **Browse skills**.
3. Switch to the **Plugins** tab, click **Personal**, click the **+**, and choose **Add marketplace**.
4. In the dialog, paste the marketplace URL or `owner/repo` slug:
   ```text
   <MARKETPLACE_REPO>
   ```
   Click **Sync**. Claude Desktop warns that marketplace plugins are not verified by Anthropic — this is expected.
5. Open the newly added marketplace and install **Preset API Skills** or **Preset MCP Skills**.

### Claude Code (CLI)

From any Claude Code session:

```text
/plugin marketplace add <MARKETPLACE_REPO>
/plugin install preset-api-skills@preset-agent-skills
/plugin install preset-mcp-skills@preset-agent-skills
```

Updates ship with each tagged release — re-run `/plugin install` to pull the latest.

### Claude.ai web

Claude.ai web does not run plugins, so each skill must be uploaded individually as a Skill ZIP.

**Easiest path:** install [Claude Desktop](https://claude.ai/download) (free, same account) and follow the Claude Desktop steps above.

**Web-only path:** download the per-skill ZIPs from the [latest GitHub Release](https://github.com/preset-io/preset-agent-skills/releases/latest), then in claude.ai open **Settings → Capabilities → Skills**, click **Upload Skill**, and upload each ZIP. You only need the skills relevant to your work.

To build the same ZIPs locally instead of downloading a release, run:

```bash
node scripts/build-claude-web-skills.mjs
node scripts/build-claude-web-skills.mjs \
  --source plugins/preset-mcp-skills/skills \
  --out dist/claude-web-flat-mcp-skills
```

### OpenAI Codex

Install the plugin from GitHub:

```bash
codex plugin marketplace add <MARKETPLACE_REPO> --ref master
codex plugin add preset-api-skills@preset-agent-skills
codex plugin add preset-mcp-skills@preset-agent-skills
```

Use a release tag (e.g. `--ref v0.1.0`) instead of `master` for a pinned install. Restart Codex after installing so the new skills are loaded into the next session.

### Cursor

Cursor imports this repository as a GitHub-backed project rule. Use the `.git` clone URL; Cursor rejects the plain repository URL in the import dialog.

1. Open **Cursor Settings → Rules**.
2. In **Project Rules**, click **Add Rule**.
3. Select **Remote Rule (Github)**.
4. Enter the HTTPS clone URL:
   ```text
   https://github.com/<OWNER>/<REPO>.git
   ```

### GitHub Copilot

Copilot only auto-loads instructions from a repository-root `.github/copilot-instructions.md`. Copy [`plugins/preset-api-skills/.github/copilot-instructions.md`](plugins/preset-api-skills/.github/copilot-instructions.md) into the `.github/` directory of the consuming repository, or reference the file's content from your own `.github/copilot-instructions.md`. Copilot loads the file whenever it edits code in that repo.

## Verifying the install

Ask your AI tool something the installed skills are designed for, for example:

> "Using the Preset API, list the workspaces I have access to."
> "Using Superset MCP tools, list dashboards."

The tool should reference one of the Preset skills (such as `preset-workspaces`, `preset-api`, or `preset-mcp-discovery`). If it doesn't, the plugin/skills are not loaded — re-check the install steps for your client.
