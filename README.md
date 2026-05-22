# Preset Agent Skills

Agent guidance packages for Preset, Superset, and adjacent workflows. The repository currently exposes direct API workflow skills, with placeholder directories reserved for future surfaces.

## Packages

| Package | Status | Purpose |
|---|---|---|
| [`plugins/preset-api-skills`](plugins/preset-api-skills/README.md) | Installable | Direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. |
| [`plugins/preset-mcp-skills`](plugins/preset-mcp-skills/README.md) | Placeholder | Reserved for future Preset/Superset Model Context Protocol tool workflow skills. |
| [`plugins/preset-cli-skills`](plugins/preset-cli-skills/README.md) | Placeholder | Reserved for future Preset CLI workflow skills. |

Codex package discovery metadata lives in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json). Claude marketplace metadata lives in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json). Both catalogs intentionally list only the installable API package.

## Surface Boundaries

- Install or load a package from its package directory under `plugins/`, not from the repository root.
- Use `preset-api-skills` when the user asks for direct API calls, API credentials, workspace API inspection, or Snowflake Cortex API/operator workflows.
- Do not use API skills as a fallback for MCP-only work. If the user asks for Preset/Superset MCP tooling, stop and ask whether to switch to the API surface before using these skills.
- Do not expose MCP or CLI skills yet. Those packages are intentionally not installable until their workflow boundaries, routing rules, and client manifests are designed in later PRs.

## Validation

Run the repository smoke test after package changes:

```bash
./scripts/smoke-test.sh
```

The smoke test verifies each installable package shape, required skill files, client manifests, and package boundary rules.

## Installation

`preset-agent-skills` is a multi-provider skill catalog. Each supported AI tool reads the manifest it understands from the same source plugin under [`plugins/preset-api-skills/`](plugins/preset-api-skills).

### Supported clients

| Client | Manifest | Distribution channel |
|---|---|---|
| Claude Desktop | `.claude-plugin/plugin.json` | Custom marketplace (Add marketplace → repo URL) |
| Claude Code (CLI) | `.claude-plugin/plugin.json` | `/plugin marketplace add` |
| Claude.ai web | per-skill ZIPs from `scripts/build-claude-web-skills.mjs` | Manual upload in Skills settings |
| OpenAI Codex | `.codex-plugin/plugin.json` + root `.agents/plugins/marketplace.json` + `AGENTS.md` | Codex plugin marketplace |
| Cursor | GitHub Remote Rule + `.cursor-plugin/plugin.json` for local plugin testing | Remote Rule import; local plugin directory for package testing |
| GitHub Copilot | `.github/copilot-instructions.md` | Repo-local instructions |

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

**Web-only path:** upload per-skill ZIPs.

1. Download the per-skill ZIPs from the [latest GitHub Release](https://github.com/preset-io/preset-agent-skills/releases/latest), or build them locally:
   ```bash
   node scripts/build-claude-web-skills.mjs
   ```
   ZIPs are written to `dist/claude-web-flat-skills/`.
2. In claude.ai, open **Settings → Capabilities → Skills**, click **Upload Skill**, and upload each ZIP.
3. You only need the skills relevant to your work — see [`plugins/preset-api-skills/README.md`](plugins/preset-api-skills/README.md) for which skills cover which workflows.

### OpenAI Codex

Codex installs this package as a plugin from the repository-level [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json) catalog. The catalog points at `plugins/preset-api-skills/`, where Codex reads [`.codex-plugin/plugin.json`](plugins/preset-api-skills/.codex-plugin/plugin.json), `AGENTS.md`, and the `skills/` directory.

For local development from a checkout:

```bash
codex plugin marketplace add /path/to/preset-agent-skills
codex plugin add preset-api-skills@preset-agent-skills
```

For installation from GitHub:

```bash
codex plugin marketplace add preset-io/preset-agent-skills --ref main
codex plugin add preset-api-skills@preset-agent-skills
```

Use a release tag instead of `main` for pinned installs:

```bash
codex plugin marketplace add preset-io/preset-agent-skills --ref v0.1.0
codex plugin add preset-api-skills@preset-agent-skills
```

Verify the plugin is visible and enabled:

```bash
codex plugin marketplace list
codex plugin list --marketplace preset-agent-skills
```

Restart Codex after installing so the new skills are loaded into the next session.

### Cursor

Cursor can import this repository as a GitHub-backed project rule. Use the `.git` clone URL; Cursor rejects the plain repository URL in the import dialog.

1. Open **Cursor Settings → Rules**.
2. In **Project Rules**, click **Add Rule**.
3. Select **Remote Rule (Github)**.
4. Enter:
   ```text
   https://github.com/preset-io/preset-agent-skills.git
   ```

For local Cursor plugin package testing, copy the plugin package into Cursor's local plugin directory so [`.cursor-plugin/plugin.json`](plugins/preset-api-skills/.cursor-plugin/plugin.json) is at the installed plugin root:

```bash
mkdir -p ~/.cursor/plugins/local
rm -rf ~/.cursor/plugins/local/preset-api-skills
cp -R plugins/preset-api-skills ~/.cursor/plugins/local/preset-api-skills
```

Then restart Cursor or run **Developer: Reload Window**.

### GitHub Copilot

Copilot picks up repo-local instructions from [`.github/copilot-instructions.md`](plugins/preset-api-skills/.github/copilot-instructions.md) automatically when working inside a repo that contains this file. To use the Preset API skills with Copilot in a downstream project:

1. Copy `plugins/preset-api-skills/.github/copilot-instructions.md` into the `.github/` directory of the consuming repository, or
2. Reference the file's content from your own `.github/copilot-instructions.md`.

There is no separate install command — Copilot loads the file whenever it edits code in the consuming repo.

### Verifying the install

Ask your AI tool something the skills are designed for, for example:

> "Using the Preset API, list the workspaces I have access to."

The tool should reference one of the Preset skills (such as `preset-workspaces` or `preset-api`). If it doesn't, the plugin/skills are not loaded — re-check the install steps for your client.
