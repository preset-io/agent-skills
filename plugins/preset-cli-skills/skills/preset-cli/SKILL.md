---
name: preset-cli
description: Drive Preset's `sup` CLI (PyPI package `superset-sup`) for shell-level, scripting, and CI/CD workflows. Use only for CLI workflows when a user wants shell one-liners, batch exports, ad-hoc SQL from a terminal, CI automation, or any task that is simpler as a single `sup …` command than as an HTTP call. Do not use for MCP-only work; do not use for state-changing operations (push, sync, --overwrite, --force) — load preset-cli-mutations instead.
---

# preset-cli

Use this skill for non-destructive `sup` CLI workflows: install, auth, configuration, output selection, SQL reads, and read/export of assets. These skills are for CLI workflows only. If the user is working through Preset/Superset MCP tools, stay on the MCP surface and use `preset-mcp-skills`; if the user wants direct HTTP, SDK, or `requests`/`curl` code, use `preset-api-skills`. Do not switch surfaces unless the user explicitly approves the switch.

## Workflow

1. Load [references/install-and-auth.md](references/install-and-auth.md) when installing the package, choosing an entry point, configuring credentials, or setting `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET`.
2. Load [references/output-formats.md](references/output-formats.md) when selecting between `--json`, `--csv`, `--yaml`, or `--porcelain`, or interpreting exit codes and stderr.
3. Load [references/workspace-and-config.md](references/workspace-and-config.md) when listing or switching workspaces, inspecting current config, or using per-command workspace overrides.
4. Load [references/sql-and-query.md](references/sql-and-query.md) when running ad-hoc SQL via `sup sql`, listing saved queries, or shaping query output for agent consumption.
5. Load [references/assets-read.md](references/assets-read.md) when listing, getting, or exporting databases, datasets, charts, dashboards, or users.
6. Load [references/cli-vs-api.md](references/cli-vs-api.md) when deciding whether to use the CLI or route to `preset-api-skills` for HTTP/SDK code paths.
7. Load [references/safety-policy.md](references/safety-policy.md) before any operation that is not clearly a metadata read, and route any mutating operation to `preset-cli-mutations`.

## Core Rules

- Default to `--json` when producing output for an agent or downstream automation.
- Never paste `SUP_PRESET_API_TOKEN`, `SUP_PRESET_API_SECRET`, or any bearer token into a command line; rely on environment variables and `sup config auth`.
- Do not invoke push, sync, `--overwrite`, or `--force` operations from this skill; route to `preset-cli-mutations` instead.
- Redact access tokens, refresh tokens, and database credentials in transcripts, screenshots, and PR comments.
- Load [references/safety-policy.md](references/safety-policy.md) before any data-returning read (e.g. `sup chart data`, `sup sql`) and before routing to `preset-cli-mutations`.
