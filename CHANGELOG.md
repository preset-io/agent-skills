# Changelog

All notable changes to preset-agent-skills are documented here.

Releases are tagged `vX.Y.Z`. Install a specific version by pinning the tag in your plugin configuration.

---

## Unreleased

### Added

- **preset-admin** skill - Team membership management, workspace lifecycle operations, invite lifecycle workflows, role identifier guidance, seat-limit preflights, audit log queries, and confirmation-gated audit downloads.
- Management API v2 conventions and reusable client support for audit log endpoints.
- **preset-superset** skill - Workspace Superset version/OpenAPI discovery, current-user permission checks, menu inspection, and workspace API safety classification.
- Expanded **preset-dashboards** and **preset-datasets** skills for Phase 4 Superset workspace API domains, including charts, table metadata, datasource values, screenshots/thumbnails, and data-returning read guardrails.
- **preset-sqllab** skill - SQL Lab bootstrap, query history, saved query inspection, permalink routing, and SQL execution guardrails.
- **preset-import-export** skill - Import/export endpoint inventory with disclosure and mutation gates.
- **preset-embedding** skill - Embedded dashboard configuration reads and security-sensitive guest-token/trusted-domain deferrals.
- Phase 5 security-sensitive skills for guest tokens, embedded RLS, SQL execution, database connections, role/permission changes, and destructive imports.

### Changed

- Converted the seed API guidance into a skill-package layout under `skills/*/SKILL.md`.
- Moved detailed API examples into on-demand `references/` files for each skill.
- Added Codex and Claude plugin manifests alongside the existing Cursor manifest.
- Added GitHub Copilot instructions and a local package smoke test.

### Removed

- Removed legacy `api/skills/*.md` paths.

## [v0.1.0] - 2026-05-14

### Added

- **preset-api** skill - Authentication via Preset Management API (client credentials to JWT bearer token), base URLs, pagination, Rison encoding, error codes, rate limits, and security best practices.
- **preset-workspaces** skill - List and inspect teams and workspaces, resolve workspace hostnames, and list workspace membership.
- **preset-dashboards** skill - Read-only dashboard discovery, dashboard detail, dashboard charts, and dashboard datasets.
- **preset-datasets** skill - Read-only database, schema, table, and dataset discovery.
- Safety policy - Mutating operations default to deferred/confirmation-gated workflows.
- `AGENTS.md` - Root-level instructions for OpenAI Codex.
- `CLAUDE.md` - Root-level instructions for Claude Code.
- `.cursor-plugin/plugin.json` - Cursor plugin configuration.
