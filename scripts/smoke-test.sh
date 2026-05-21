#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_ROOT="plugins/preset-api-skills"
MCP_ROOT="plugins/preset-mcp-skills"
CLI_ROOT="plugins/preset-cli-skills"

fail() {
  echo "Smoke test failed: $*" >&2
  exit 1
}

command -v jq >/dev/null || fail "jq is required"

require_file() {
  test -f "$1" || fail "missing file $1"
}

require_dir() {
  test -d "$1" || fail "missing directory $1"
}

reject_file() {
  test ! -e "$1" || fail "unexpected file or directory $1"
}

require_grep() {
  local pattern="$1"
  local file="$2"
  grep -q "$pattern" "$file" || fail "missing pattern '$pattern' in $file"
}

reject_grep() {
  local pattern="$1"
  local path="$2"
  if grep -R -q "$pattern" "$path"; then
    fail "unexpected pattern '$pattern' in $path"
  fi
}

check_markdown_links() {
  local file target target_path
  while IFS= read -r file; do
    while IFS= read -r target; do
      case "$target" in
        ""|\#*|http://*|https://*|mailto:*)
          continue
          ;;
      esac
      target_path="${target%%#*}"
      test -e "$(dirname "$file")/$target_path" || fail "broken markdown link in $file: $target"
    done < <(
      grep -oE '\[[^]]+\]\([^)]+\)' "$file" \
        | sed -E 's/^.*\]\(([^)]*)\).*$/\1/'
    )
  done < <(find . -name '*.md' -type f)
}

require_jq() {
  local expression="$1"
  local file="$2"
  jq -e "$expression" "$file" >/dev/null || fail "jq check failed for $file: $expression"
}

required_api_skills=(
  preset-api
  preset-admin
  preset-workspaces
  preset-superset
  preset-dashboards
  preset-datasets
  preset-sqllab
  preset-import-export
  preset-embedding
  preset-guest-tokens
  preset-embedded-rls
  preset-sql-execution
  preset-database-connections
  preset-roles-permissions
  preset-destructive-imports
  preset-snowflake-cortex
  preset-cortex-agents
)

require_file README.md
require_file CLAUDE.md
require_file CHANGELOG.md
require_file LICENSE
require_file .agents/plugins/marketplace.json
require_file .claude-plugin/marketplace.json
require_dir plugins
require_dir "$API_ROOT"
require_dir "$MCP_ROOT"
require_dir "$CLI_ROOT"
reject_file skills
reject_file .codex-plugin
reject_file .claude-plugin/plugin.json
reject_file .cursor-plugin
reject_file .github/copilot-instructions.md

require_grep "plugins/preset-api-skills" README.md
require_grep "plugins/preset-mcp-skills" README.md
require_grep "plugins/preset-cli-skills" README.md
require_grep ".agents/plugins/marketplace.json" README.md
require_grep ".claude-plugin/marketplace.json" README.md
require_grep "not from the repository root" README.md
require_grep "MCP intent wins" README.md
require_grep "Do not use API skills as a fallback for MCP-only work" README.md
require_grep "root is not itself an installable plugin" CLAUDE.md
require_grep "plugins/preset-api-skills/CLAUDE.md" CLAUDE.md
require_grep "plugins/preset-mcp-skills/CLAUDE.md" CLAUDE.md
require_grep "MCP intent wins" CLAUDE.md
check_markdown_links

require_jq '.name == "preset-agent-skills"' .agents/plugins/marketplace.json
require_jq '.interface.displayName == "Preset Agent Skills"' .agents/plugins/marketplace.json
require_jq '
  [.plugins[].name] == ["preset-api-skills", "preset-mcp-skills"]
' .agents/plugins/marketplace.json
require_jq '
  [.plugins[].source.path] == ["./plugins/preset-api-skills", "./plugins/preset-mcp-skills"]
' .agents/plugins/marketplace.json
require_jq 'all(.plugins[]; .policy.installation == "AVAILABLE" and .policy.authentication == "ON_INSTALL")' .agents/plugins/marketplace.json
if jq -e '.plugins[] | select(.name == "preset-cli-skills")' .agents/plugins/marketplace.json >/dev/null; then
  fail "CLI placeholder must not be listed as an installable marketplace plugin"
fi

require_jq '."$schema" == "https://anthropic.com/claude-code/marketplace.schema.json"' .claude-plugin/marketplace.json
require_jq '.name == "preset-agent-skills"' .claude-plugin/marketplace.json
require_jq '.owner.name == "Preset"' .claude-plugin/marketplace.json
require_jq '.description | contains("split by surface")' .claude-plugin/marketplace.json
require_jq '
  [.plugins[].name] == ["preset-api-skills", "preset-mcp-skills"]
' .claude-plugin/marketplace.json
require_jq '
  [.plugins[].source] == ["./plugins/preset-api-skills", "./plugins/preset-mcp-skills"]
' .claude-plugin/marketplace.json
require_jq 'all(.plugins[]; .category == "development" and .author.name == "Preset")' .claude-plugin/marketplace.json
require_jq '.plugins[] | select(.name == "preset-api-skills") | .description | contains("Do not use for MCP-only work")' .claude-plugin/marketplace.json
require_jq '.plugins[] | select(.name == "preset-mcp-skills") | .description | contains("Ask before switching to direct API")' .claude-plugin/marketplace.json
if jq -e '.plugins[] | select(.name == "preset-cli-skills")' .claude-plugin/marketplace.json >/dev/null; then
  fail "CLI placeholder must not be listed as an installable Claude marketplace plugin"
fi

require_jq '.name == "preset-api-skills"' "$API_ROOT/.codex-plugin/plugin.json"
require_jq '.description | contains("Do not use for MCP-only work")' "$API_ROOT/.codex-plugin/plugin.json"
require_jq '.interface.shortDescription | contains("Direct API-only")' "$API_ROOT/.codex-plugin/plugin.json"
require_jq '.interface.longDescription | contains("MCP tool workflows are intentionally handled by the separate preset-mcp-skills package")' "$API_ROOT/.codex-plugin/plugin.json"
require_jq '.skills == "./skills/"' "$API_ROOT/.codex-plugin/plugin.json"
require_jq '.name == "preset-api-skills"' "$API_ROOT/.claude-plugin/plugin.json"
require_jq '.description | contains("Do not use for MCP-only work")' "$API_ROOT/.claude-plugin/plugin.json"
require_jq 'has("skills") | not' "$API_ROOT/.claude-plugin/plugin.json"
require_jq '.name == "Preset API Skills"' "$API_ROOT/.cursor-plugin/plugin.json"
require_jq '.description | contains("Do not use for MCP-only work")' "$API_ROOT/.cursor-plugin/plugin.json"
require_jq 'all(.skills[]; .description | contains("Do not use for MCP-only work"))' "$API_ROOT/.cursor-plugin/plugin.json"
require_file "$API_ROOT/AGENTS.md"
require_file "$API_ROOT/CLAUDE.md"
require_file "$API_ROOT/.github/copilot-instructions.md"
require_file "$API_ROOT/README.md"
require_file "$API_ROOT/scripts/live-workspace-smoke.sh"
require_grep "MCP intent wins over resource type" "$API_ROOT/AGENTS.md"
require_grep "MCP intent wins over resource type" "$API_ROOT/CLAUDE.md"
require_grep "MCP intent wins over resource type" "$API_ROOT/.github/copilot-instructions.md"
require_grep "MCP intent wins over resource type" "$API_ROOT/README.md"
require_grep "use the separate \`preset-mcp-skills\` package" "$API_ROOT/AGENTS.md"
require_grep "use the separate \`preset-mcp-skills\` package" "$API_ROOT/CLAUDE.md"
require_grep "use the separate \`preset-mcp-skills\` package" "$API_ROOT/.github/copilot-instructions.md"
require_grep "MCP tool workflows are intentionally handled by the separate preset-mcp-skills package" "$API_ROOT/.codex-plugin/plugin.json"
require_grep "not plugin-loaded context" "$API_ROOT/AGENTS.md"
require_grep "not plugin-loaded context" "$API_ROOT/CLAUDE.md"
require_grep "not plugin-loaded context" "$API_ROOT/README.md"
require_grep "./plugins/preset-api-skills/scripts/live-workspace-smoke.sh" "$API_ROOT/README.md"
require_grep "Required by the other direct API skills in this package" "$API_ROOT/README.md"
if grep -q '^\./scripts/live-workspace-smoke.sh$' "$API_ROOT/README.md"; then
  fail "API package README still references the old root live smoke path"
fi
if grep -q "Required by all other skills" "$API_ROOT/README.md"; then
  fail "API package README must scope preset-api dependency to direct API skills"
fi
if grep -q "Required by all other skills" "$API_ROOT/.cursor-plugin/plugin.json"; then
  fail "API Cursor manifest must scope preset-api dependency to direct API skills"
fi

for skill in "${required_api_skills[@]}"; do
  file="$API_ROOT/skills/$skill/SKILL.md"
  require_file "$file"
  require_grep "^name: $skill$" "$file"
  require_grep "^description: " "$file"
  require_grep "Use only for direct API workflows" "$file"
  require_grep "Do not use for MCP-only work" "$file"
  require_dir "$API_ROOT/skills/$skill/references"
  require_grep "skills/$skill/SKILL.md" "$API_ROOT/AGENTS.md"
  require_grep "skills/$skill/SKILL.md" "$API_ROOT/CLAUDE.md"
  require_grep "skills/$skill/SKILL.md" "$API_ROOT/.github/copilot-instructions.md"
  require_grep "skills/$skill/SKILL.md" "$API_ROOT/README.md"
done

require_jq '
  [.skills[].path] | sort == [
    "skills/preset-admin/SKILL.md",
    "skills/preset-api/SKILL.md",
    "skills/preset-cortex-agents/SKILL.md",
    "skills/preset-dashboards/SKILL.md",
    "skills/preset-database-connections/SKILL.md",
    "skills/preset-datasets/SKILL.md",
    "skills/preset-destructive-imports/SKILL.md",
    "skills/preset-embedded-rls/SKILL.md",
    "skills/preset-embedding/SKILL.md",
    "skills/preset-guest-tokens/SKILL.md",
    "skills/preset-import-export/SKILL.md",
    "skills/preset-roles-permissions/SKILL.md",
    "skills/preset-snowflake-cortex/SKILL.md",
    "skills/preset-sql-execution/SKILL.md",
    "skills/preset-sqllab/SKILL.md",
    "skills/preset-superset/SKILL.md",
    "skills/preset-workspaces/SKILL.md"
  ]
' "$API_ROOT/.cursor-plugin/plugin.json"

required_api_references=(
  skills/preset-api/references/authentication.md
  skills/preset-api/references/api-conventions.md
  skills/preset-api/references/safety-policy.md
  skills/preset-admin/references/audit-logs.md
  skills/preset-admin/references/deferrals.md
  skills/preset-admin/references/invites.md
  skills/preset-admin/references/role-identifiers.md
  skills/preset-admin/references/team-memberships.md
  skills/preset-admin/references/workspace-management.md
  skills/preset-superset/references/version-and-openapi.md
  skills/preset-superset/references/current-user-and-permissions.md
  skills/preset-superset/references/menu-and-feature-discovery.md
  skills/preset-superset/references/workspace-api-safety.md
  skills/preset-dashboards/references/dashboard-metadata.md
  skills/preset-dashboards/references/chart-metadata.md
  skills/preset-dashboards/references/dashboard-composition.md
  skills/preset-dashboards/references/chart-data.md
  skills/preset-dashboards/references/screenshots-and-thumbnails.md
  skills/preset-dashboards/references/dashboard-chart-mutations.md
  skills/preset-datasets/references/database-metadata.md
  skills/preset-datasets/references/dataset-metadata.md
  skills/preset-datasets/references/table-and-schema-metadata.md
  skills/preset-datasets/references/data-returning-reads.md
  skills/preset-datasets/references/connection-configuration.md
  skills/preset-datasets/references/dataset-database-mutations.md
  skills/preset-sqllab/references/sqllab-bootstrap.md
  skills/preset-sqllab/references/query-history.md
  skills/preset-sqllab/references/saved-queries.md
  skills/preset-sqllab/references/sql-execution.md
  skills/preset-sqllab/references/query-results-and-exports.md
  skills/preset-sqllab/references/query-control.md
  skills/preset-import-export/references/export-workflows.md
  skills/preset-import-export/references/import-workflows.md
  skills/preset-import-export/references/bundle-secrets-and-disclosure.md
  skills/preset-import-export/references/validation-and-smoke.md
  skills/preset-embedding/references/embedded-config-reads.md
  skills/preset-embedding/references/embedded-config-mutations.md
  skills/preset-embedding/references/trusted-domains-and-origins.md
  skills/preset-embedding/references/guest-tokens.md
  skills/preset-embedding/references/embedded-rls.md
  skills/preset-guest-tokens/references/guest-token-claims.md
  skills/preset-embedded-rls/references/embedded-rls-rules.md
  skills/preset-sql-execution/references/sql-execution-approval.md
  skills/preset-database-connections/references/connection-configuration.md
  skills/preset-roles-permissions/references/role-permission-changes.md
  skills/preset-destructive-imports/references/destructive-import-approval.md
  skills/preset-snowflake-cortex/references/authentication-and-context.md
  skills/preset-snowflake-cortex/references/cortex-safety.md
  skills/preset-cortex-agents/references/agent-runs.md
  skills/preset-cortex-agents/references/agent-management.md
  skills/preset-cortex-agents/references/sql-agent-ddl.md
  skills/preset-cortex-agents/references/sql-wrapper.md
)

for file in "${required_api_references[@]}"; do
  require_file "$API_ROOT/$file"
done

removed_broad_references=(
  skills/preset-superset/references/version-openapi.md
  skills/preset-dashboards/references/charts-and-dashboard-api.md
  skills/preset-dashboards/references/read-only-examples.md
  skills/preset-datasets/references/database-and-dataset-api.md
  skills/preset-datasets/references/read-only-examples.md
  skills/preset-sqllab/references/guarded-sql-execution.md
  skills/preset-import-export/references/import-export.md
  skills/preset-embedding/references/embedded-dashboards.md
)

for file in "${removed_broad_references[@]}"; do
  reject_file "$API_ROOT/$file"
done

require_grep "/api/v1/_openapi" "$API_ROOT/skills/preset-superset/references/version-and-openapi.md"
require_grep "/api/v1/me/roles/" "$API_ROOT/skills/preset-superset/references/current-user-and-permissions.md"
require_grep "/api/v1/menu/" "$API_ROOT/skills/preset-superset/references/menu-and-feature-discovery.md"
require_grep "HTTP method alone is not enough" "$API_ROOT/skills/preset-superset/references/workspace-api-safety.md"
require_grep "chart data retrieval" "$API_ROOT/skills/preset-api/references/safety-policy.md"
require_grep "/api/v1/chart/{pk}/data/" "$API_ROOT/skills/preset-dashboards/references/chart-data.md"
require_grep "/api/v1/dashboard/{id_or_slug}/tabs" "$API_ROOT/skills/preset-dashboards/references/dashboard-composition.md"
require_grep "/api/v1/dashboard/{pk}/cache_dashboard_screenshot/" "$API_ROOT/skills/preset-dashboards/references/screenshots-and-thumbnails.md"
require_grep "Use this reference for dashboard metadata reads" "$API_ROOT/skills/preset-dashboards/references/dashboard-metadata.md"
require_grep "Use this reference for chart metadata reads" "$API_ROOT/skills/preset-dashboards/references/chart-metadata.md"
require_grep "Use this reference for dashboard/chart operations" "$API_ROOT/skills/preset-dashboards/references/dashboard-chart-mutations.md"
require_grep "/api/v1/database/{pk}/table_metadata/" "$API_ROOT/skills/preset-datasets/references/table-and-schema-metadata.md"
require_grep "/api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/" "$API_ROOT/skills/preset-datasets/references/data-returning-reads.md"
require_grep "/api/v1/database/{pk}/connection" "$API_ROOT/skills/preset-datasets/references/connection-configuration.md"
require_grep "Route credential-bearing connection workflows" "$API_ROOT/skills/preset-datasets/references/dataset-database-mutations.md"
require_grep "Do not create, update, delete" "$API_ROOT/skills/preset-datasets/SKILL.md"
require_grep "/api/v1/sqllab/execute/" "$API_ROOT/skills/preset-sqllab/references/sql-execution.md"
require_grep "/api/v1/query/updated_since" "$API_ROOT/skills/preset-sqllab/references/query-history.md"
require_grep "/api/v1/saved_query/{pk}" "$API_ROOT/skills/preset-sqllab/references/saved-queries.md"
require_grep "/api/v1/sqllab/results/" "$API_ROOT/skills/preset-sqllab/references/query-results-and-exports.md"
require_grep "/api/v1/query/stop" "$API_ROOT/skills/preset-sqllab/references/query-control.md"
require_grep "/api/v1/assets/export/" "$API_ROOT/skills/preset-import-export/references/export-workflows.md"
require_grep "Never print import secrets" "$API_ROOT/skills/preset-import-export/references/import-workflows.md"
require_grep "SQLAlchemy URIs" "$API_ROOT/skills/preset-import-export/references/bundle-secrets-and-disclosure.md"
require_grep "Do not live-test imports" "$API_ROOT/skills/preset-import-export/references/validation-and-smoke.md"
require_grep "/api/v1/embedded_dashboard/{uuid}" "$API_ROOT/skills/preset-embedding/references/embedded-config-reads.md"
require_grep "POST /api/v1/dashboard/{id_or_slug}/embedded" "$API_ROOT/skills/preset-embedding/references/embedded-config-mutations.md"
require_grep "allowed-domain" "$API_ROOT/skills/preset-embedding/references/trusted-domains-and-origins.md"
require_grep "/api/v1/security/guest_token/" "$API_ROOT/skills/preset-embedding/references/guest-tokens.md"
require_grep "rls_rules" "$API_ROOT/skills/preset-embedding/references/embedded-rls.md"
require_grep "Never print signed guest tokens" "$API_ROOT/skills/preset-guest-tokens/references/guest-token-claims.md"
require_grep "rls_rules" "$API_ROOT/skills/preset-embedded-rls/references/embedded-rls-rules.md"
require_grep "approved-tenant-id" "$API_ROOT/skills/preset-embedded-rls/references/embedded-rls-rules.md"
require_grep "/api/v1/sqllab/execute/" "$API_ROOT/skills/preset-sql-execution/references/sql-execution-approval.md"
require_grep "/api/v1/saved_query/" "$API_ROOT/skills/preset-sql-execution/references/sql-execution-approval.md"
require_grep "/api/v1/sqllab/permalink" "$API_ROOT/skills/preset-sql-execution/references/sql-execution-approval.md"
require_grep "Do not paste SQL text" "$API_ROOT/skills/preset-sql-execution/references/sql-execution-approval.md"
require_grep "/api/v1/database/{pk}/connection" "$API_ROOT/skills/preset-database-connections/references/connection-configuration.md"
require_grep "/api/v1/database/test_connection/" "$API_ROOT/skills/preset-database-connections/references/connection-configuration.md"
require_grep "/api/v1/database/validate_parameters/" "$API_ROOT/skills/preset-database-connections/references/connection-configuration.md"
require_grep "permission_write" "$API_ROOT/skills/preset-roles-permissions/references/role-permission-changes.md"
require_grep "alongside \`preset-admin\`" "$API_ROOT/skills/preset-roles-permissions/SKILL.md"
require_grep "overwrite" "$API_ROOT/skills/preset-destructive-imports/references/destructive-import-approval.md"
require_grep "Never print import secrets" "$API_ROOT/skills/preset-destructive-imports/references/destructive-import-approval.md"
require_grep "Use \`preset-sql-execution\`" "$API_ROOT/skills/preset-sqllab/references/sql-execution.md"
require_grep "use \`preset-guest-tokens\`" "$API_ROOT/skills/preset-embedding/references/guest-tokens.md"
require_grep "Use \`preset-destructive-imports\`" "$API_ROOT/skills/preset-import-export/references/import-workflows.md"
require_grep "Use \`preset-database-connections\`" "$API_ROOT/skills/preset-datasets/references/connection-configuration.md"
require_grep "route to the focused Phase 5 skill" "$API_ROOT/skills/preset-superset/references/workspace-api-safety.md"
require_grep "SNOWFLAKE.CORTEX_USER" "$API_ROOT/skills/preset-snowflake-cortex/references/authentication-and-context.md"
require_grep "SNOWFLAKE.CORTEX_AGENT_USER" "$API_ROOT/skills/preset-snowflake-cortex/references/authentication-and-context.md"
require_grep "Wait for explicit confirmation" "$API_ROOT/skills/preset-snowflake-cortex/references/cortex-safety.md"
require_grep "/api/v2/databases/{database}/schemas/{schema}/agents/{name}:run" "$API_ROOT/skills/preset-cortex-agents/references/agent-runs.md"
require_grep "/api/v2/cortex/agent:run" "$API_ROOT/skills/preset-cortex-agents/references/agent-runs.md"
require_grep "unknown event types" "$API_ROOT/skills/preset-cortex-agents/references/agent-runs.md"
require_grep "DELETE /api/v2/databases/{database}/schemas/{schema}/agents/{name}" "$API_ROOT/skills/preset-cortex-agents/references/agent-management.md"
require_grep "CREATE AGENT" "$API_ROOT/skills/preset-cortex-agents/references/sql-agent-ddl.md"
require_grep "DROP AGENT" "$API_ROOT/skills/preset-cortex-agents/references/sql-agent-ddl.md"
require_grep "CORTEX_ENABLED_CROSS_REGION" "$API_ROOT/skills/preset-snowflake-cortex/references/authentication-and-context.md"
require_grep "SNOWFLAKE.CORTEX.DATA_AGENT_RUN" "$API_ROOT/skills/preset-cortex-agents/references/sql-wrapper.md"
require_grep "not Preset chatbot runtime instructions" "$API_ROOT/skills/preset-snowflake-cortex/SKILL.md"
require_grep "/api/v2/audit/teams" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/actions/" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "/audit/teams/{team_name}/logs/downloads/" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "mgmt_v2_response" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_file "$API_ROOT/skills/preset-api/examples/preset_client.py"
require_grep "workspace_root" "$API_ROOT/skills/preset-api/examples/preset_client.py"
require_grep "examples/preset_client.py" "$API_ROOT/skills/preset-api/references/authentication.md"
require_grep "token = download" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "allow_redirects=False" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "proxy/access logs" "$API_ROOT/skills/preset-admin/references/audit-logs.md"
require_grep "user_name_or_email" "$API_ROOT/skills/preset-admin/references/team-memberships.md"
require_grep "has-seats-remaining" "$API_ROOT/skills/preset-admin/references/team-memberships.md"
require_grep "invites/many" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "TEAM_ROLE_ID" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "created_invites" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "currently accepts up to 50" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "workspace_roles" "$API_ROOT/skills/preset-admin/references/role-identifiers.md"
require_grep "PresetMachineRole" "$API_ROOT/skills/preset-admin/references/role-identifiers.md"
require_grep "Do not guess from role names" "$API_ROOT/skills/preset-admin/references/role-identifiers.md"
require_grep "name-<workspace_name>" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "user-access/" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "Always read the current workspace first" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "full desired state" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "Update Workspace Member Role" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "/membership" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "default workspace role identifiers only" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "browser/session-backed context" "$API_ROOT/skills/preset-admin/references/workspace-management.md"
require_grep "Accept Invite Codes" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "Do not improvise an API-key accept example" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "session-user" "$API_ROOT/skills/preset-admin/references/invites.md"
require_grep "If the user is working through Preset/Superset MCP tools" "$API_ROOT/skills/preset-api/SKILL.md"
if grep -q "any other preset-\\* skill" "$API_ROOT/skills/preset-api/SKILL.md"; then
  fail "preset-api must not claim to be required for all preset-* skills"
fi

if grep -Eq "Invite A User|guarded membership workflows|manage membership|role-update examples" \
  "$API_ROOT/skills/preset-workspaces/SKILL.md" \
  "$API_ROOT/skills/preset-workspaces/references/membership.md" \
  "$API_ROOT/AGENTS.md" \
  "$API_ROOT/CLAUDE.md" \
  "$API_ROOT/.github/copilot-instructions.md" \
  "$API_ROOT/.cursor-plugin/plugin.json"; then
  fail "preset-workspaces membership reference should not duplicate invite workflows"
fi

while IFS= read -r path; do
  require_file "$API_ROOT/$path"
done < <(jq -r '.skills[].path' "$API_ROOT/.cursor-plugin/plugin.json")

require_jq '.name == "preset-mcp-skills"' "$MCP_ROOT/.codex-plugin/plugin.json"
require_jq '.description | contains("Ask before switching to direct API")' "$MCP_ROOT/.codex-plugin/plugin.json"
require_jq '.interface.shortDescription | contains("MCP-only")' "$MCP_ROOT/.codex-plugin/plugin.json"
require_jq '.skills == "./skills/"' "$MCP_ROOT/.codex-plugin/plugin.json"
require_jq '.name == "preset-mcp-skills"' "$MCP_ROOT/.claude-plugin/plugin.json"
require_jq '.description | contains("Ask before switching to direct API")' "$MCP_ROOT/.claude-plugin/plugin.json"
require_jq 'has("skills") | not' "$MCP_ROOT/.claude-plugin/plugin.json"
require_jq '.name == "Preset MCP Skills"' "$MCP_ROOT/.cursor-plugin/plugin.json"
require_jq '.description | contains("Ask before switching to direct API")' "$MCP_ROOT/.cursor-plugin/plugin.json"
require_jq '[.skills[].path] == ["skills/preset-mcp/SKILL.md"]' "$MCP_ROOT/.cursor-plugin/plugin.json"
require_file "$MCP_ROOT/AGENTS.md"
require_file "$MCP_ROOT/CLAUDE.md"
require_file "$MCP_ROOT/.github/copilot-instructions.md"
require_file "$MCP_ROOT/README.md"
require_file "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "^name: preset-mcp$" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "MCP intent wins" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "Stay on the MCP tool surface" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "health_check" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "get_instance_info" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "list_dashboards" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "get_schema" "$MCP_ROOT/skills/preset-mcp/SKILL.md"
require_grep "MCP intent wins over resource type" "$MCP_ROOT/AGENTS.md"
require_grep "MCP intent wins over resource type" "$MCP_ROOT/CLAUDE.md"
require_grep "MCP intent wins over resource type" "$MCP_ROOT/.github/copilot-instructions.md"
require_grep "MCP intent wins over resource type" "$MCP_ROOT/README.md"
require_grep "not plugin-loaded context" "$MCP_ROOT/AGENTS.md"
require_grep "not plugin-loaded context" "$MCP_ROOT/CLAUDE.md"
require_grep "not plugin-loaded context" "$MCP_ROOT/README.md"
require_grep "If MCP tools do not provide the needed capability" "$MCP_ROOT/AGENTS.md"
require_grep "If MCP lacks the needed capability" "$MCP_ROOT/README.md"

reject_grep "skills/preset-api" "$MCP_ROOT"
reject_grep "skills/preset-superset" "$MCP_ROOT"
reject_grep "skills/preset-dashboards" "$MCP_ROOT"
reject_grep "skills/preset-datasets" "$MCP_ROOT"
reject_grep "skills/preset-sqllab" "$MCP_ROOT"
reject_grep "preset-api-skills" "$MCP_ROOT"

require_file "$CLI_ROOT/README.md"
require_grep "intentionally not an installable plugin yet" "$CLI_ROOT/README.md"
require_grep "only be promoted to an installable plugin after the CLI workflow boundaries" "$CLI_ROOT/README.md"
reject_file "$CLI_ROOT/.codex-plugin"
reject_file "$CLI_ROOT/.claude-plugin"
reject_file "$CLI_ROOT/.cursor-plugin"
reject_file "$CLI_ROOT/skills"

echo "Smoke test passed."
