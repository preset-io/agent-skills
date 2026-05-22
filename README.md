# Preset Agent Skills

Agent guidance for working with [Preset](https://preset.io), Apache Superset, and Snowflake Cortex Agents through their direct APIs. The skills work across Claude, OpenAI Codex, Cursor, and GitHub Copilot from a single source.

## What's included

The installable package is [`preset-api-skills`](plugins/preset-api-skills/README.md), a catalog of focused skills your AI tool loads on demand. Highlights:

- **`preset-api`** — authenticate with the Preset Management API (JWT exchange, base URLs, pagination, safety policy). Required by the other skills.
- **`preset-workspaces`** — list teams and workspaces, resolve workspace hostnames, inspect membership and status.
- **`preset-admin`** — manage team memberships, workspace lifecycle, invites, roles, and audit logs with confirmation-gated mutations.
- **`preset-dashboards`** — inspect dashboards, charts, datasets, and chart data with safety boundaries.
- **`preset-sql-execution`** — run or route SQL Lab execution, result retrieval, exports, and saved-query mutations with explicit approval.

See the [package README](plugins/preset-api-skills/README.md) for the full catalog (17 skills covering datasets, SQL Lab, embedding, guest tokens, RLS, database connections, role/permission changes, destructive imports, and Snowflake Cortex Agents).

Broader workflow surfaces are reserved but not installable yet: [`plugins/preset-mcp-skills`](plugins/preset-mcp-skills/README.md) for future MCP-only work and [`plugins/preset-cli-skills`](plugins/preset-cli-skills/README.md) for future CLI work. Codex package discovery metadata lives in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json), and Claude marketplace metadata lives in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json); both catalogs intentionally list only `preset-api-skills`.

Install or load `preset-api-skills` from `plugins/preset-api-skills`, not from the repository root. Use it for direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. Do not use API skills as a fallback for MCP-only work.

## Supported clients

| Client | Manifest | Distribution channel |
|---|---|---|
| Claude Desktop | `.claude-plugin/marketplace.json` → `plugins/preset-api-skills/.claude-plugin/plugin.json` | Custom marketplace (Add marketplace → repo URL) |
| Claude Code (CLI) | `.claude-plugin/marketplace.json` → `plugins/preset-api-skills/.claude-plugin/plugin.json` | `/plugin marketplace add` |
| Claude.ai web | per-skill ZIPs from `scripts/build-claude-web-skills.mjs` | Manual upload in Skills settings |
| OpenAI Codex | `.agents/plugins/marketplace.json` → `plugins/preset-api-skills/.codex-plugin/plugin.json` + `AGENTS.md` | Codex plugin marketplace |
| Cursor | `plugins/preset-api-skills/.cursor-plugin/plugin.json` | Remote Rule import |
| GitHub Copilot | `plugins/preset-api-skills/.github/copilot-instructions.md` | Repo-local instructions |

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
5. Open the newly added marketplace and install **Preset API Skills**.

### Claude Code (CLI)

From any Claude Code session:

```text
/plugin marketplace add <MARKETPLACE_REPO>
/plugin install preset-api-skills@preset-agent-skills
```

Updates ship with each tagged release — re-run `/plugin install` to pull the latest.

### Claude.ai web

Claude.ai web does not run plugins, so each skill must be uploaded individually as a Skill ZIP.

**Easiest path:** install [Claude Desktop](https://claude.ai/download) (free, same account) and follow the Claude Desktop steps above.

**Web-only path:** download the per-skill ZIPs from the [latest GitHub Release](https://github.com/preset-io/preset-agent-skills/releases/latest), then in claude.ai open **Settings → Capabilities → Skills**, click **Upload Skill**, and upload each ZIP. You only need the skills relevant to your work.

To build the same ZIPs locally instead of downloading a release, run:

```bash
node scripts/build-claude-web-skills.mjs
```

### OpenAI Codex

Install the plugin from GitHub:

```bash
codex plugin marketplace add <MARKETPLACE_REPO> --ref main
codex plugin add preset-api-skills@preset-agent-skills
```

Use a release tag (e.g. `--ref v0.1.0`) instead of `main` for a pinned install. Restart Codex after installing so the new skills are loaded into the next session.

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

Ask your AI tool something the skills are designed for, for example:

> "Using the Preset API, list the workspaces I have access to."

The tool should reference one of the Preset skills (such as `preset-workspaces` or `preset-api`). If it doesn't, the plugin/skills are not loaded — re-check the install steps for your client.
