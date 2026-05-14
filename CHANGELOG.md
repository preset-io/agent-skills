# Changelog

All notable changes to preset-agent-skills are documented here.

Releases are tagged `vX.Y.Z`. Install a specific version by pinning the tag in your plugin configuration.

---

## [v0.1.0] — 2026-05-14

### Added

- **preset-api** skill — Authentication via Preset Management API (client credentials → JWT bearer token), base URLs, pagination, Rison encoding, error codes, rate limits, and security best practices.
- **preset-workspaces** skill — List and inspect teams and workspaces; resolve workspace hostnames; invite users and update workspace membership with explicit confirmation.
- **preset-dashboards** skill — Read-only dashboard discovery, dashboard detail, dashboard charts, and dashboard datasets.
- **preset-datasets** skill — Read-only database, schema, table, and dataset discovery.
- Safety policy — Mutating operations default to deferred/confirmation-gated workflows.
- `AGENTS.md` — Root-level instructions for OpenAI Codex.
- `CLAUDE.md` — Root-level instructions for Claude Code.
- `.cursor-plugin/plugin.json` — Cursor plugin configuration.
