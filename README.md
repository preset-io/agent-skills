# Preset Agent Skills

Agent guidance for working with [Preset](https://preset.io), Apache Superset, and Superset MCP tools. The skills are authored once and load across every supported agent client — see [Supported clients](#supported-clients).

## What's included

The installable packages are:

- [`preset-api-skills`](plugins/preset-api-skills/README.md) — focused skills for direct Preset Management API and Superset workspace API workflows.
- [`preset-mcp-skills`](plugins/preset-mcp-skills/README.md) — focused skills for Superset MCP tool workflows.
- [`preset-cli-skills`](plugins/preset-cli-skills/README.md) — focused skills for Preset CLI (`sup`) shell, scripting, CI/CD, read/export, SQL, and gated mutation workflows.
- [`preset-snowflake-cortex-skills`](plugins/preset-snowflake-cortex-skills/README.md) — separate package for direct Snowflake Cortex Agent REST and SQL workflows (account/auth context, agent management, and confirmation-gated agent runs). These two skills used to ship inside `preset-api-skills`.

API package highlights:

- **`preset-api`** — authenticate with the Preset Management API (JWT exchange, base URLs, pagination, safety policy). Required by the other skills.
- **`preset-workspaces`** — list teams and workspaces, resolve workspace hostnames, inspect membership and status.
- **`preset-admin`** — manage team memberships, workspace lifecycle, invites, roles, and audit logs with confirmation-gated mutations.
- **`preset-dashboards`** — inspect dashboards, charts, datasets, and chart data with safety boundaries.
- **`preset-sql-execution`** — run or route SQL Lab execution, result retrieval, exports, and saved-query mutations with explicit approval.

See the [API package README](plugins/preset-api-skills/README.md) for the full catalog (15 skills covering datasets, SQL Lab, embedding, guest tokens, RLS, database connections, role/permission changes, and destructive imports).

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

Snowflake Cortex package:

- **`preset-snowflake-cortex`** — prepare Snowflake account, authentication, role, warehouse, privilege, and safety context.
- **`preset-cortex-agents`** — list, describe, create, update, delete, and run Snowflake Cortex Agents with explicit approval.

See the [Snowflake Cortex package README](plugins/preset-snowflake-cortex-skills/README.md) for install steps. It needs a Snowflake account and does not use Preset credentials. Building its OpenAI submission archive does not mean it will pass OpenAI directory review; there is no guarantee it does.

Install or load each package from its plugin directory, not from the repository root. Use `preset-api-skills` for direct API workflows. Use `preset-mcp-skills` for MCP workflows. Use `preset-cli-skills` for explicit `sup` CLI workflows. Use `preset-snowflake-cortex-skills` for Snowflake Cortex Agent workflows. Do not use API or CLI skills as a fallback for MCP-only work, and do not use MCP or CLI skills for direct API work.

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
| Gemini CLI | Native Agent Skills | `gemini skills install` |

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
/plugin install preset-snowflake-cortex-skills@preset-agent-skills
```

Updates ship when we publish a new version — the version is bumped in the plugin manifests and tagged. Run `/plugin update` (or re-run `/plugin install`) to pull it.

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
node scripts/build-claude-web-skills.mjs \
  --source plugins/preset-snowflake-cortex-skills/skills \
  --out dist/claude-web-flat-cortex-skills
```

### OpenAI Codex

Install the plugin from GitHub:

```bash
codex plugin marketplace add preset-io/agent-skills --ref master
codex plugin add preset-api-skills@preset-agent-skills
codex plugin add preset-mcp-skills@preset-agent-skills
codex plugin add preset-cli-skills@preset-agent-skills
codex plugin add preset-snowflake-cortex-skills@preset-agent-skills
```

Use a release tag (e.g. `--ref v0.4.0`) instead of `master` for a pinned install. Restart Codex after installing so the new skills are loaded into the next session.

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

Copilot only auto-loads instructions from a repository-root `.github/copilot-instructions.md`. Copy the package instructions you need into the `.github/` directory of the consuming repository, or reference their content from your own `.github/copilot-instructions.md`: [`plugins/preset-api-skills/.github/copilot-instructions.md`](plugins/preset-api-skills/.github/copilot-instructions.md) for direct API workflows, [`plugins/preset-mcp-skills/.github/copilot-instructions.md`](plugins/preset-mcp-skills/.github/copilot-instructions.md) for Superset MCP workflows, [`plugins/preset-cli-skills/.github/copilot-instructions.md`](plugins/preset-cli-skills/.github/copilot-instructions.md) for `sup` CLI workflows, and [`plugins/preset-snowflake-cortex-skills/.github/copilot-instructions.md`](plugins/preset-snowflake-cortex-skills/.github/copilot-instructions.md) for Snowflake Cortex Agent workflows. Copilot loads the file whenever it edits code in that repo.

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
cortex skill add agent-skills/plugins/preset-snowflake-cortex-skills/skills
```

Use the API package for direct Preset/Superset API workflows, the Snowflake Cortex package for Cortex Agent workflows, the MCP package for Superset MCP workflows, and the CLI package for `sup` workflows.

### Gemini CLI

Gemini CLI v0.27.0 and later natively discovers Agent Skills. Install each
package's `skills/` directory from the public repository:

```bash
gemini skills install https://github.com/preset-io/agent-skills.git \
  --path plugins/preset-api-skills/skills
gemini skills install https://github.com/preset-io/agent-skills.git \
  --path plugins/preset-mcp-skills/skills
gemini skills install https://github.com/preset-io/agent-skills.git \
  --path plugins/preset-cli-skills/skills
gemini skills install https://github.com/preset-io/agent-skills.git \
  --path plugins/preset-snowflake-cortex-skills/skills
```

These commands install user-scoped skills under `~/.gemini/skills/`, making
them available in every project. Add `--scope workspace` to install them under
the current project's `.gemini/skills/` instead. Workspace skills load only
when the project is trusted.

Run `gemini skills list` to verify the install. If Gemini CLI is already
running, use `/skills reload` to discover the new or updated skills.

#### Legacy Gemini CLI fallback

Gemini CLI versions before v0.27.0 do not have stable native Agent Skills
support. For those versions, clone the repository and import the package routing
guides from your global or project `GEMINI.md`:

```bash
git clone https://github.com/preset-io/agent-skills.git
```

```md
@/path/to/agent-skills/plugins/preset-api-skills/AGENTS.md
@/path/to/agent-skills/plugins/preset-mcp-skills/AGENTS.md
@/path/to/agent-skills/plugins/preset-cli-skills/AGENTS.md
@/path/to/agent-skills/plugins/preset-snowflake-cortex-skills/AGENTS.md
```

Run `/memory refresh` in Gemini CLI after updating `GEMINI.md`.

## Updating

- Claude Desktop and Claude.ai web: download the latest release ZIPs and upload or replace the skills again.
- Claude Code and OpenAI Codex: re-run the install commands, or pin to a newer release tag when you want deterministic installs.
- Snowflake Cortex Code CLI: re-run `/skill add` for the Git URL, or pull the local clone and re-run `cortex skill add`.
- Gemini CLI v0.27.0 and later: re-run the `gemini skills install` commands, then use `/skills reload` in a running session. Legacy installs: pull the latest repo contents, then run `/memory refresh`.

## Verifying the install

Ask your AI tool something the installed skills are designed for, for example:

> "Using the Preset API, list the workspaces I have access to."
> "Using Superset MCP tools, list dashboards."
> "Using the Preset CLI, show me the `sup` command to export dashboards as JSON."

The tool should reference one of the Preset skills or package instruction files (such as `preset-workspaces`, `preset-api`, `preset-mcp-discovery`, or `preset-cli`). Gemini CLI users can also confirm discovery with `gemini skills list`. If the expected skills do not appear, re-check the install steps for your client.

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

It builds the OpenAI submission archives (`dist/<package>-<version>-openai.zip`) for `preset-api-skills`, `preset-cli-skills`, and `preset-snowflake-cortex-skills` with `node scripts/build-openai-plugin-zip.mjs --plugin <package>`, then runs `node --test tests/package-split.test.mjs`, which asserts that the API archive ships no Cortex skills, files, or Cortex listing copy, that the Cortex archive ships both Cortex skills and every file they link to, that every relative link in every package resolves inside that package, and that each skill belongs to exactly one package. Passing the preflight does not guarantee a package passes OpenAI directory review.

The smoke test also runs `node scripts/validate-agent-skills.mjs`, which checks the source skill folders against the Agent Skills structural rules: required frontmatter, name and description limits, parent-directory name matching, compact `SKILL.md` files, and local Markdown links that stay inside each skill folder.

## Releasing

The package version is single-sourced in the top-level [`VERSION`](VERSION) file and stamped into every provider manifest (the `.claude-plugin`, `.codex-plugin`, and `.cursor-plugin` `plugin.json` for each package). Claude Code and OpenAI Codex cache plugins by this version and only surface an update when it changes, so the manifests must stay in lockstep with the published git tag — other clients track the repo or release tag directly.

To cut a release:

1. Bump [`VERSION`](VERSION) (semver `MAJOR.MINOR.PATCH`).
2. Run `node scripts/sync-version.mjs` to stamp it into every manifest.
3. Commit and merge the PR to `master`.

After the merge, the `Auto version tag` workflow creates `vX.Y.Z` when that tag is missing, then dispatches the private release build and the public mirror/release workflow. The tag must equal `VERSION`.

`node scripts/sync-version.mjs --check` runs in the smoke test and CI and fails if any manifest drifts from `VERSION`; the release workflow additionally fails if the tag does not match `VERSION`.
