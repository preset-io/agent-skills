# Preset Agent Skills

Agent guidance for working with [Preset](https://preset.io), Apache Superset, Superset MCP tools, and Snowflake Cortex Agents. The skills work across Claude, OpenAI Codex, Cursor, GitHub Copilot, Snowflake Cortex Code CLI, and Gemini CLI from a single source.

## What's included

The installable packages are:

- [`preset-api-skills`](plugins/preset-api-skills/README.md) — focused skills for direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows.
- [`preset-mcp-skills`](plugins/preset-mcp-skills/README.md) — focused skills for Superset MCP tool workflows.
- [`preset-cli-skills`](plugins/preset-cli-skills/README.md) — focused skills for Preset CLI (`sup`) shell, scripting, CI/CD, read/export, SQL, and gated mutation workflows.

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

CLI package highlights:

- **`preset-cli`** — install and authenticate `sup`, select workspaces, choose output formats, run read-only asset workflows, and handle SQL/data-returning reads with safety boundaries.
- **`preset-cli-mutations`** — handle `sup` push, `--force`, `--overwrite`, user push/invite, and cross-workspace sync with mandatory preview and confirmation.

See the [CLI package README](plugins/preset-cli-skills/README.md) for the full 2-skill catalog.

Install or load each package from its plugin directory, not from the repository root. Use `preset-api-skills` for direct API workflows. Use `preset-mcp-skills` for MCP workflows. Use `preset-cli-skills` for explicit `sup` CLI workflows. Do not use API or CLI skills as a fallback for MCP-only work, and do not use MCP or CLI skills for direct API work.

## Supported clients

| Client | How skills load | Install |
|---|---|---|
| Claude Code (CLI) | Plugin marketplace | `/plugin marketplace add` → `/plugin install` |
| OpenAI Codex | Plugin marketplace | `codex plugin marketplace add` → `codex plugin add` |
| Claude Desktop | Individual Skill ZIPs | Upload in Skills settings |
| Claude.ai web | Individual Skill ZIPs | Upload in Skills settings |
| Cursor | Project rule | Remote Rule (GitHub) import |
| GitHub Copilot | Repo-local instructions | Copy `copilot-instructions.md` |
| Snowflake Cortex Code CLI | Custom skills | `cortex skill add` / `/skill add` |
| Gemini CLI | `GEMINI.md` context import | `@`-import package `AGENTS.md` files |

## Installation

Find your client in the table above, then follow its section below. The GitHub repository is `preset-io/agent-skills`; `preset-agent-skills` is the marketplace name used by plugin install commands.

### Claude Desktop

Claude Desktop installs these as individual Skill ZIP uploads.

1. Open **Claude Desktop → Settings → Connectors**, then click the **Customize** link.
2. In Customize, select **Skills** in the sidebar, click the **+** next to "Skills", then choose **Create skill → Upload a skill**.
3. Download the per-skill ZIPs from the [latest GitHub Release](https://github.com/preset-io/agent-skills/releases/latest).
4. Upload each skill ZIP one by one. Start with only the skills relevant to your work, such as `preset-api.zip` for direct API workflows, `preset-mcp.zip` / `preset-mcp-discovery.zip` for MCP workflows, or `preset-cli.zip` / `preset-cli-mutations.zip` for `sup` CLI workflows.
5. Restart Claude Desktop after uploading or replacing skill ZIPs.

### Claude Code (CLI)

From any Claude Code session:

```text
/plugin marketplace add preset-io/agent-skills
/plugin install preset-api-skills@preset-agent-skills
/plugin install preset-mcp-skills@preset-agent-skills
/plugin install preset-cli-skills@preset-agent-skills
```

Updates ship with each tagged release — re-run `/plugin install` to pull the latest.

### Claude.ai web

Claude.ai web does not run plugins, so each skill must be uploaded individually as a Skill ZIP.

**Easiest path:** install [Claude Desktop](https://claude.ai/download) (free, same account) and follow the individual Skill ZIP upload steps above.

**Web-only path:** download the per-skill ZIPs from the [latest GitHub Release](https://github.com/preset-io/agent-skills/releases/latest), then in claude.ai open **Settings → Capabilities → Skills**, click **Upload Skill**, and upload each ZIP. You only need the skills relevant to your work.

To build the same ZIPs locally instead of downloading a release, run:

```bash
node scripts/build-claude-web-skills.mjs
node scripts/build-claude-web-skills.mjs \
  --source plugins/preset-mcp-skills/skills \
  --out dist/claude-web-flat-mcp-skills
node scripts/build-claude-web-skills.mjs \
  --source plugins/preset-cli-skills/skills \
  --out dist/claude-web-flat-cli-skills
```

### OpenAI Codex

Install the plugin from GitHub:

```bash
codex plugin marketplace add preset-io/agent-skills --ref master
codex plugin add preset-api-skills@preset-agent-skills
codex plugin add preset-mcp-skills@preset-agent-skills
codex plugin add preset-cli-skills@preset-agent-skills
```

Use a release tag (e.g. `--ref v0.3.0`) instead of `master` for a pinned install. Restart Codex after installing so the new skills are loaded into the next session.

### Cursor

Cursor imports this repository as a GitHub-backed project rule. Use the `.git` clone URL; Cursor rejects the plain repository URL in the import dialog.

1. Open **Cursor Settings → Rules**.
2. In **Project Rules**, click **Add Rule**.
3. Select **Remote Rule (Github)**.
4. Enter the HTTPS clone URL:
   ```text
   https://github.com/preset-io/agent-skills.git
   ```

### GitHub Copilot

Copilot only auto-loads instructions from a repository-root `.github/copilot-instructions.md`. Copy the package instructions you need into the `.github/` directory of the consuming repository, or reference their content from your own `.github/copilot-instructions.md`: [`plugins/preset-api-skills/.github/copilot-instructions.md`](plugins/preset-api-skills/.github/copilot-instructions.md) for direct API workflows, [`plugins/preset-mcp-skills/.github/copilot-instructions.md`](plugins/preset-mcp-skills/.github/copilot-instructions.md) for Superset MCP workflows, and [`plugins/preset-cli-skills/.github/copilot-instructions.md`](plugins/preset-cli-skills/.github/copilot-instructions.md) for `sup` CLI workflows. Copilot loads the file whenever it edits code in that repo.

### Snowflake Cortex Code CLI

Cortex Code CLI supports custom skills from local folders and Git repositories. Install the public repo, then confirm the skills are visible:

```text
/skill add https://github.com/preset-io/agent-skills.git
/skill list
```

If remote discovery does not pick up the nested package folders, clone the repo and add the package skill directories directly:

```bash
git clone https://github.com/preset-io/agent-skills.git
cortex skill add agent-skills/plugins/preset-api-skills/skills
cortex skill add agent-skills/plugins/preset-mcp-skills/skills
cortex skill add agent-skills/plugins/preset-cli-skills/skills
```

Use the API package for direct Preset/Superset API and Snowflake Cortex Agent workflows, the MCP package for Superset MCP workflows, and the CLI package for `sup` workflows.

### Gemini CLI

Gemini CLI uses `GEMINI.md` context files rather than installable skill packages. Clone the public repo, then import the package instructions from your global or project `GEMINI.md`:

```bash
git clone https://github.com/preset-io/agent-skills.git
```

```md
@/path/to/agent-skills/plugins/preset-api-skills/AGENTS.md
@/path/to/agent-skills/plugins/preset-mcp-skills/AGENTS.md
@/path/to/agent-skills/plugins/preset-cli-skills/AGENTS.md
```

Run `/memory refresh` in Gemini CLI after updating `GEMINI.md`.

## Updating

- Claude Desktop and Claude.ai web: download the latest release ZIPs and upload or replace the skills again.
- Claude Code and OpenAI Codex: re-run the install commands, or pin to a newer release tag when you want deterministic installs.
- Snowflake Cortex Code CLI: re-run `/skill add` for the Git URL, or pull the local clone and re-run `cortex skill add`.
- Gemini CLI: pull the latest repo contents, then run `/memory refresh`.

## Verifying the install

Ask your AI tool something the installed skills are designed for, for example:

> "Using the Preset API, list the workspaces I have access to."
> "Using Superset MCP tools, list dashboards."
> "Using the Preset CLI, show me the `sup` command to export dashboards as JSON."

The tool should reference one of the Preset skills or package instruction files (such as `preset-workspaces`, `preset-api`, `preset-mcp-discovery`, or `preset-cli`). If it doesn't, the plugin, skill, or context instructions are not loaded — re-check the install steps for your client.

## Repository Layout

This repository keeps client metadata next to each package for contributors and debugging:

- Claude marketplace metadata: [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) and each package's `.claude-plugin/plugin.json`.
- Codex marketplace metadata: [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) and each package's `.codex-plugin/plugin.json`.
- Cursor package metadata: each package's `.cursor-plugin/plugin.json`.
- Copilot instructions: each package's `.github/copilot-instructions.md`.
- Claude Desktop/web ZIP generation: [`scripts/build-claude-web-skills.mjs`](scripts/build-claude-web-skills.mjs).

## Validating source skills

Run the repository smoke test before publishing changes:

```bash
./scripts/smoke-test.sh
```

It includes `node scripts/validate-agent-skills.mjs`, which checks the source skill folders against the Agent Skills structural rules: required frontmatter, name and description limits, parent-directory name matching, compact `SKILL.md` files, and local Markdown links that stay inside each skill folder.
