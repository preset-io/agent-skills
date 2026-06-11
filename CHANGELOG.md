# Changelog

All notable changes to preset-agent-skills are documented here.

Releases are tagged `vX.Y.Z`. Install a specific version by pinning the tag in your plugin configuration.

---

## Unreleased

### Changed

- **preset-api-skills** - made gates intent-proportional per the canonical gate policy (`docs/gate-policy.md`): metadata reads and explicitly requested customer-data reads (chart data, samples, distinct values, screenshots, own query history) run directly with parameterized row limits and summarized output; SQL requested by the user and confidently classified as a single-statement SELECT executes without a confirmation stop; result retrieval of approved queries and object-scoped non-secret exports run directly. Confirmation gates remain for mutations, imports, RBAC, guest tokens, credential-bearing reads, audit downloads, permalinks, cache invalidation, broad exports, and unclassified SQL. Prerequisite skill chains ("use preset-api, preset-workspaces, preset-superset first") replaced with inline context.
- **preset-cli-skills** - safety policy loads only before mutations, untrusted-source SQL, unfamiliar workspaces, or broad outputs; added headless/CI guidance (bounded row-returning exports, destination-explicit full exports, interactive-operator rule for destructive ops).
- Added `scripts/check-gate-policy.mjs` drift check (wired into the smoke test) so package policy files cannot silently diverge from the canonical gate policy.

### Added

- Added a root `CLAUDE.md` that redirects direct Claude Code repository users to the installable API and MCP packages.
- Added Codex and Claude marketplace metadata for the installable API package.
- Added installable **preset-mcp-skills** package with 8 focused Superset MCP workflow skills, client manifests, package docs, tool inventory, and inventory drift check.
- Added installable **preset-cli-skills** package with `preset-cli` and `preset-cli-mutations` skills for `sup` CLI workflows, package manifests, docs, local safety policy, and marketplace entries.
- Hardened API plugin and skill routing metadata so MCP-intent tasks do not silently fall back to direct API workflows.
- **preset-admin** skill - Team membership management, workspace lifecycle operations, invite lifecycle workflows, role identifier guidance, seat-limit preflights, audit log queries, and confirmation-gated audit downloads.
- Management API v2 conventions and reusable client support for audit log endpoints.
- **preset-superset** skill - Workspace Superset version/OpenAPI discovery, current-user permission checks, menu inspection, and workspace API safety classification.
- Expanded **preset-dashboards** and **preset-datasets** skills for Phase 4 Superset workspace API domains, including charts, table metadata, datasource values, screenshots/thumbnails, and data-returning read guardrails.
- **preset-sqllab** skill - SQL Lab bootstrap, query history, saved query inspection, permalink routing, and SQL execution guardrails.
- **preset-import-export** skill - Import/export endpoint inventory with disclosure and mutation gates.
- **preset-embedding** skill - Embedded dashboard configuration reads and security-sensitive guest-token/trusted-domain deferrals.
- Phase 5 security-sensitive skills for guest tokens, embedded RLS, SQL execution, database connections, role/permission changes, and destructive imports.
- **preset-snowflake-cortex** and **preset-cortex-agents** skills - Snowflake Cortex account/auth context, Cortex Agent management, run workflows, SQL DDL and wrapper guidance, and confirmation-gated execution safety.

### Changed

- **preset-mcp-skills** - made workflow gates intent-proportional after live agentic A/B testing showed the skills slowed MCP sessions and added approval prompts: chart-creation intent now uses `generate_chart` directly (Explore links reserved for preview intent), SQL resolves dataset schema before executing once, tool schemas are consulted only after validation errors, the discovery ladder and re-listing mandates are gone, and the router defaults to MCP in MCP-connected sessions instead of asking.
- **preset-mcp-datasets** - documented `query_dataset`'s saved-metrics-only contract; metric-less aggregates route to `execute_sql` instead of stopping to ask.
- **preset-mcp-visualization** - documented the `generate_chart` request-shape pitfalls (`dataset_id`, nested `config`, MCP `chart_type` taxonomy) that caused the dominant validation-retry loop.
- Moved the existing API skills, client manifests, and API live smoke script into `plugins/preset-api-skills`.
- Converted the seed API guidance into a skill-package layout under `plugins/preset-api-skills/skills/*/SKILL.md`.
- Moved detailed API examples into on-demand `references/` files for each skill.
- Added Codex and Claude plugin manifests alongside the existing Cursor manifest.
- Added GitHub Copilot instructions and a local package smoke test.
- Published `preset-mcp-skills` alongside `preset-api-skills` in marketplace catalogs.

### Removed

- Removed legacy root `skills/*` paths and root client manifests from the installable package surface.

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
