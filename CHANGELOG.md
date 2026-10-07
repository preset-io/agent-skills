# Changelog

All notable changes to preset-agent-skills are documented here.

Releases are tagged `vX.Y.Z`. Install a specific version by pinning the tag in your plugin configuration.

---

## Unreleased

### Changed

- **preset-api-skills** - split the Snowflake Cortex skills out into their own package. `preset-snowflake-cortex` and `preset-cortex-agents`, with all of their references, moved unchanged to the new **preset-snowflake-cortex-skills** package, and the API package's manifests, keywords, listing copy, README, `AGENTS.md`, Copilot instructions, and safety policy now describe only the Preset Management API and Superset workspace APIs (15 skills). Users who relied on the Cortex skills from `preset-api-skills` should also install `preset-snowflake-cortex-skills`. The skill names and the per-skill Claude web ZIP names are unchanged.
- **preset-api-skills** - made the Codex listing metadata meet OpenAI plugin directory limits, matching the CLI package: `Developer Tools` category, a 30-character `shortDescription`, three starter prompts, `capabilities`, and the Preset website, support, privacy, and terms URLs. Routing guidance moved from the listing copy to `description`.
- **preset-cli-skills** - corrected the Codex listing metadata to meet OpenAI plugin directory limits (a listing icon is still required before submission): `interface.category` is now the supported `Developer Tools` value (`Coding` is not a recognised category), `shortDescription` fits the 30-character subtitle limit, starter prompts are trimmed to the maximum of three, `capabilities` describes what the skills do, and the verified Preset website, support, privacy, and terms URLs are declared. Listing copy no longer points at sibling packages, which keeps it clear of the directory's fair-play rule for model-readable fields.
- **preset-api-skills** - made gates intent-proportional per the canonical gate policy (`docs/gate-policy.md`): metadata reads and explicitly requested customer-data reads (chart data, samples, distinct values, screenshots, own query history) run directly with parameterized row limits and summarized output; SQL requested by the user and confidently classified as a single-statement SELECT executes without a confirmation stop; result retrieval of approved queries runs directly. Confirmation gates remain for mutations, imports, exports, RBAC, guest tokens, credential-bearing reads, audit downloads, permalinks, cache invalidation, and unclassified SQL. Prerequisite skill chains ("use preset-api, preset-workspaces, preset-superset first") replaced with inline context.
- **preset-cli-skills** - safety policy loads only before mutations, untrusted-source SQL, unfamiliar workspaces, or broad outputs; added headless/CI guidance (bounded row-returning exports, destination-explicit full exports, interactive-operator rule for destructive ops).
- Added `scripts/check-gate-policy.mjs` drift check (wired into the smoke test) so package policy files cannot silently diverge from the canonical gate policy.

### Added

- **preset-mcp-skills** - added the **preset-mcp-gateway** skill and a gateway connection guide for the hosted Preset MCP gateway at `https://mcp.app.preset.io/mcp` (interactive OAuth only). It teaches choosing between the aggregate gateway and a direct workspace Superset MCP connection, the `list_workspaces` -> `list_workspace_services` -> `search_workspace_tools` -> live `inputSchema` -> `call_tool` flow (tool names and arguments verified against `preset-io/mcp-gateway` `main`), asking the user when the workspace is ambiguous, never reusing a workspace ID across environments, and handling disabled services, the Knowledge launch flag, an unsupported catalog, omitted search results, and authentication or scope failures without bypasses or reconnect loops. Direct-connection `search_tools` / `call_tool` guidance is unchanged.
- **preset-mcp-skills** - added opt-in client connection templates under `connections/` for Claude Code, Cursor, VS Code, and OpenAI Codex (formats verified against each vendor's documentation; the templates carry the endpoint only and the plugin never auto-connects), with manual steps for Claude (claude.ai, Claude Desktop) and ChatGPT. Staging and sandbox are opt-in with a user-supplied URL.
- Added `scripts/check-mcp-gateway-claims.mjs` (wired into the smoke test) to flag stale claims that Superset alone defines the gateway's top-level tools, and `tests/mcp-gateway.test.mjs` with mocked fixture walkthroughs (multi-workspace gateway, direct workspace, disabled service, missing request wrapper, and more) plus client manifest validation. These are mocked tests, not authenticated canaries. `VERSION` is not bumped in this change; a release bump is needed before Claude Code and Codex surface the update.

- Added installable **preset-snowflake-cortex-skills** package (Claude, Codex, and Cursor manifests, Copilot instructions, `AGENTS.md`, README, and marketplace entries) holding the two Snowflake Cortex Agent skills. There is no guarantee this package passes OpenAI directory review.
- Added `tests/package-split.test.mjs` (run by the smoke test) covering package selection, cross-package link integrity, and the contents and listing copy of the API and Cortex OpenAI archives; the smoke test now builds the API, CLI, and Cortex OpenAI archives.
- Added `scripts/build-openai-plugin-zip.mjs` (wired into the smoke test) to preflight a skills-only plugin against OpenAI's documented directory limits and build the submission ZIP, plus `plugins/preset-cli-skills/assets/README.md` recording the listing icon requirements.
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
