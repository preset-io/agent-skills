# Preset Agent Skills

This repository contains installable Preset API skills for OpenAI Codex and other agent clients.

## Skill Routing

Use the `skills/*/SKILL.md` files as the canonical instructions:

- `skills/preset-api/SKILL.md` - authenticate with the Preset Management API and prepare safe API access. Required before all other Preset API skills.
- `skills/preset-workspaces/SKILL.md` - list teams and workspaces, resolve workspace hostnames, inspect workspace status, and handle guarded membership workflows.
- `skills/preset-dashboards/SKILL.md` - inspect dashboards, dashboard charts, and dashboard datasets. Read-only.
- `skills/preset-datasets/SKILL.md` - inspect database connections, schemas, tables, datasets, columns, and metrics. Read-only.

Detailed examples live in each skill's `references/` directory. Load only the reference files needed for the user's task.

## Client Entry Points

- OpenAI Codex: `.codex-plugin/plugin.json` plus this `AGENTS.md`.
- Claude Code: `.claude-plugin/plugin.json` plus `CLAUDE.md`.
- Cursor: `.cursor-plugin/plugin.json`.
- GitHub Copilot: `.github/copilot-instructions.md`.

## Safety Policy

Default to read-only calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, SQL execution, role/RLS change, database connection change, dataset mutation, dashboard mutation, or guest-token creation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.

Do not expose credentials, client secrets, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, or signed guest tokens.
