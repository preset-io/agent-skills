# Preset CLI Skills

Installable Preset CLI skill package. Drives the `sup` CLI (PyPI package `superset-sup`) for shell one-liners, batch exports, ad-hoc SQL, and CI/CD automation.

This package is one of three surface-scoped Preset agent packages:

- `preset-cli-skills` (this package) - CLI/`sup` workflows.
- `preset-api-skills` - direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows.
- `preset-mcp-skills` - Preset/Superset Model Context Protocol tool workflows.

## Surface Selection

- Use this package only when the user explicitly asks for `sup`, the Preset CLI, shell one-liners, scripting, batch exports, ad-hoc SQL from a terminal, or CI/CD automation that is simpler as a single command than as an HTTP call.
- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Use the separate `preset-mcp-skills` package.
- If the user wants in-process HTTP, REST endpoints, Python `requests`, SDKs, or curl examples, do not use this package. Use the separate `preset-api-skills` package.
- If both API and MCP plugins are installed, MCP intent wins over resource type. A dashboard, chart, dataset, or SQL Lab request should still use MCP guidance when the user asked for MCP.
- If a CLI workflow lacks the needed capability, stop and ask whether to switch to the API surface. Do not silently escalate.

## Skills

| Skill | Description |
|---|---|
| [preset-cli](skills/preset-cli/SKILL.md) | Drive the `sup` CLI for non-destructive shell, scripting, and CI/CD workflows: install, authentication via `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET`, workspace selection, JSON/CSV/YAML/porcelain output, ad-hoc SQL, and read/export of dashboards, charts, datasets, databases, and queries. Foundation skill for the rest of the CLI package. |
| [preset-cli-mutations](skills/preset-cli-mutations/SKILL.md) | State-changing `sup` CLI operations - single-workspace writes (`sup chart push`, `sup dashboard push`, `sup dataset push`, `--force`, `--overwrite`) and cross-workspace promotion (`sup sync create/run/validate`) - with mandatory preview, confirmation templates, and secret-handling guardrails loaded by construction. |

Each `SKILL.md` is small and always-loaded once routed; detailed examples live in `references/` files the agent loads on demand.

The references are intentionally split by task so routine routing does not require loading the full command catalog: install/auth, config precedence, workspace selection, output formats, asset filter matrices, SQL/data safety, saved-query reads, mutation preview, confirmation templates, and cross-workspace sync each live in focused files.

## Quick Start

```bash
pip install superset-sup

export SUP_PRESET_API_TOKEN="your-api-token"
export SUP_PRESET_API_SECRET="your-api-token-secret"

sup config auth
sup config show
sup workspace list --json
```

The `sup` entry point ships in the `superset-sup` PyPI package and authenticates with `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET` (these are distinct from `PRESET_CLIENT_ID` / `PRESET_CLIENT_SECRET` used by `preset-api-skills`). Never paste the token/secret directly on the command line; use environment variables or `sup config auth`.

## Client Entry Points

- Claude Code: `.claude-plugin/plugin.json` plus `skills/*/SKILL.md`; Claude plugin installs do not load package-level `AGENTS.md` or `CLAUDE.md` context.
- Claude web/Desktop custom skills: build per-skill ZIPs with `node scripts/build-claude-web-skills.mjs --source plugins/preset-cli-skills/skills --out dist/claude-web-flat-cli-skills`.
- OpenAI Codex: `.codex-plugin/plugin.json` plus `AGENTS.md`.
- Gemini CLI and direct repository readers: `AGENTS.md`.
- Cursor: `.cursor-plugin/plugin.json`.
- GitHub Copilot: `.github/copilot-instructions.md`.

## Safety Policy

Default to non-destructive reads and exports. Before any state-changing `sup` command - `sup chart push`, `sup dashboard push`, `sup dataset push`, `sup user push`, `sup user invite`, any `--force` or `--overwrite` invocation, or `sup sync run` against any target workspace - preview the change first (native `--dry-run` for `sup sync run`, `sup user push`, and `sup user invite`; pull-and-diff against the target for chart/dashboard/dataset push which have no native `--dry-run`), summarize source workspace, target workspace, asset IDs/types, and any destructive flags, then get explicit user confirmation that names the target workspace and the literal flag strings.

Never paste `SUP_PRESET_API_TOKEN`, `SUP_PRESET_API_SECRET`, or any bearer token into a command line; rely on environment variables and `sup config auth`. Redact tokens, refresh tokens, database passwords, and any credential surfaced in `sup` output before sharing transcripts, logs, or screenshots.

The CLI safety policy is captured in [`skills/preset-cli/references/safety-policy.md`](skills/preset-cli/references/safety-policy.md) and loaded by every CLI skill in this package on demand. It is intentionally CLI-flavored and does not link out to `preset-api-skills` so this package remains independently installable.
