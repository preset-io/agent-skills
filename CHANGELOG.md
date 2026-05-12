# Changelog

All notable changes to preset-agent-skills are documented here.

Releases are tagged `vX.Y.Z`. Install a specific version by pinning the tag in your plugin configuration.

---

## [v1.0.0] — 2024-01-01

### Added

- **preset-api** skill — Authentication via Preset Management API (client credentials → JWT bearer token), base URLs, pagination, Rison encoding, error codes, rate limits, and security best practices.
- **preset-workspaces** skill — List and inspect teams and workspaces; add and update workspace and team members; audit access.
- **preset-dashboards** skill — Create, retrieve, and update dashboards; export/import dashboard bundles; embedded dashboard configuration; guest token generation.
- **preset-datasets** skill — Manage database connections and datasets (physical and virtual); add columns and metrics; refresh schema; execute SQL Lab queries.
- **preset-users** skill — Manage Superset users and roles; create custom roles; grant permissions; apply row-level security (RLS) for multi-tenant access control.
- `AGENTS.md` — Root-level instructions for OpenAI Codex and multi-provider agent routing.
- `.claude/settings.json` — Claude Code team deployment configuration.
- `.cursor-plugin/plugin.json` — Cursor plugin configuration.
