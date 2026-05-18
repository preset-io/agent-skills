#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

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

require_grep() {
  local pattern="$1"
  local file="$2"
  grep -q "$pattern" "$file" || fail "missing pattern '$pattern' in $file"
}

require_jq() {
  local expression="$1"
  local file="$2"
  jq -e "$expression" "$file" >/dev/null || fail "jq check failed for $file: $expression"
}

required_skills=(
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

for skill in "${required_skills[@]}"; do
  file="skills/$skill/SKILL.md"
  require_file "$file"
  require_grep "^name: $skill$" "$file"
  require_grep "^description: " "$file"
  require_dir "skills/$skill/references"
  require_grep "skills/$skill/SKILL.md" AGENTS.md
  require_grep "skills/$skill/SKILL.md" CLAUDE.md
  require_grep "skills/$skill/SKILL.md" .github/copilot-instructions.md
  require_grep "skills/$skill/SKILL.md" README.md
done

require_jq '.skills == "./skills/"' .codex-plugin/plugin.json
require_jq '.name == "preset-agent-skills"' .claude-plugin/plugin.json
require_jq 'has("skills") | not' .claude-plugin/plugin.json
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
' .cursor-plugin/plugin.json

required_workspace_references=(
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
)

for file in "${required_workspace_references[@]}"; do
  require_file "$file"
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
  test ! -f "$file" || fail "legacy broad reference should be removed: $file"
done

required_phase5_references=(
  skills/preset-guest-tokens/references/guest-token-claims.md
  skills/preset-embedded-rls/references/embedded-rls-rules.md
  skills/preset-sql-execution/references/sql-execution-approval.md
  skills/preset-database-connections/references/connection-configuration.md
  skills/preset-roles-permissions/references/role-permission-changes.md
  skills/preset-destructive-imports/references/destructive-import-approval.md
)

for file in "${required_phase5_references[@]}"; do
  require_file "$file"
done

require_grep "/api/v1/_openapi" skills/preset-superset/references/version-and-openapi.md
require_grep "/api/v1/me/roles/" skills/preset-superset/references/current-user-and-permissions.md
require_grep "/api/v1/menu/" skills/preset-superset/references/menu-and-feature-discovery.md
require_grep "HTTP method alone is not enough" skills/preset-superset/references/workspace-api-safety.md
require_grep "chart data retrieval" skills/preset-api/references/safety-policy.md
require_grep "/api/v1/chart/{pk}/data/" skills/preset-dashboards/references/chart-data.md
require_grep "/api/v1/dashboard/{id_or_slug}/tabs" skills/preset-dashboards/references/dashboard-composition.md
require_grep "/api/v1/dashboard/{pk}/cache_dashboard_screenshot/" skills/preset-dashboards/references/screenshots-and-thumbnails.md
require_grep "Use this reference for dashboard metadata reads" skills/preset-dashboards/references/dashboard-metadata.md
require_grep "Use this reference for chart metadata reads" skills/preset-dashboards/references/chart-metadata.md
require_grep "Use this reference for dashboard/chart operations" skills/preset-dashboards/references/dashboard-chart-mutations.md
require_grep "/api/v1/database/{pk}/table_metadata/" skills/preset-datasets/references/table-and-schema-metadata.md
require_grep "/api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/" skills/preset-datasets/references/data-returning-reads.md
require_grep "/api/v1/database/{pk}/connection" skills/preset-datasets/references/connection-configuration.md
require_grep "Route credential-bearing connection workflows" skills/preset-datasets/references/dataset-database-mutations.md
require_grep "Do not create, update, delete" skills/preset-datasets/SKILL.md
require_grep "/api/v1/sqllab/execute/" skills/preset-sqllab/references/sql-execution.md
require_grep "/api/v1/query/updated_since" skills/preset-sqllab/references/query-history.md
require_grep "/api/v1/saved_query/{pk}" skills/preset-sqllab/references/saved-queries.md
require_grep "/api/v1/sqllab/results/" skills/preset-sqllab/references/query-results-and-exports.md
require_grep "/api/v1/query/stop" skills/preset-sqllab/references/query-control.md
require_grep "/api/v1/assets/export/" skills/preset-import-export/references/export-workflows.md
require_grep "Never print import secrets" skills/preset-import-export/references/import-workflows.md
require_grep "SQLAlchemy URIs" skills/preset-import-export/references/bundle-secrets-and-disclosure.md
require_grep "Do not live-test imports" skills/preset-import-export/references/validation-and-smoke.md
require_grep "/api/v1/embedded_dashboard/{uuid}" skills/preset-embedding/references/embedded-config-reads.md
require_grep "POST /api/v1/dashboard/{id_or_slug}/embedded" skills/preset-embedding/references/embedded-config-mutations.md
require_grep "allowed-domain" skills/preset-embedding/references/trusted-domains-and-origins.md
require_grep "/api/v1/security/guest_token/" skills/preset-embedding/references/guest-tokens.md
require_grep "rls_rules" skills/preset-embedding/references/embedded-rls.md
require_grep "Never print signed guest tokens" skills/preset-guest-tokens/references/guest-token-claims.md
require_grep "rls_rules" skills/preset-embedded-rls/references/embedded-rls-rules.md
require_grep "approved-tenant-id" skills/preset-embedded-rls/references/embedded-rls-rules.md
require_grep "/api/v1/sqllab/execute/" skills/preset-sql-execution/references/sql-execution-approval.md
require_grep "/api/v1/saved_query/" skills/preset-sql-execution/references/sql-execution-approval.md
require_grep "/api/v1/sqllab/permalink" skills/preset-sql-execution/references/sql-execution-approval.md
require_grep "Do not paste SQL text" skills/preset-sql-execution/references/sql-execution-approval.md
require_grep "/api/v1/database/{pk}/connection" skills/preset-database-connections/references/connection-configuration.md
require_grep "/api/v1/database/test_connection/" skills/preset-database-connections/references/connection-configuration.md
require_grep "/api/v1/database/validate_parameters/" skills/preset-database-connections/references/connection-configuration.md
require_grep "permission_write" skills/preset-roles-permissions/references/role-permission-changes.md
require_grep "alongside \`preset-admin\`" skills/preset-roles-permissions/SKILL.md
require_grep "overwrite" skills/preset-destructive-imports/references/destructive-import-approval.md
require_grep "Never print import secrets" skills/preset-destructive-imports/references/destructive-import-approval.md
require_grep "Use \`preset-sql-execution\`" skills/preset-sqllab/references/sql-execution.md
require_grep "use \`preset-guest-tokens\`" skills/preset-embedding/references/guest-tokens.md
require_grep "Use \`preset-destructive-imports\`" skills/preset-import-export/references/import-workflows.md
require_grep "Use \`preset-database-connections\`" skills/preset-datasets/references/connection-configuration.md
require_grep "route to the focused Phase 5 skill" skills/preset-superset/references/workspace-api-safety.md

required_cortex_references=(
  skills/preset-snowflake-cortex/references/authentication-and-context.md
  skills/preset-snowflake-cortex/references/cortex-safety.md
  skills/preset-cortex-agents/references/agent-runs.md
  skills/preset-cortex-agents/references/agent-management.md
  skills/preset-cortex-agents/references/sql-agent-ddl.md
  skills/preset-cortex-agents/references/sql-wrapper.md
)

for file in "${required_cortex_references[@]}"; do
  require_file "$file"
done

require_grep "SNOWFLAKE.CORTEX_USER" skills/preset-snowflake-cortex/references/authentication-and-context.md
require_grep "SNOWFLAKE.CORTEX_AGENT_USER" skills/preset-snowflake-cortex/references/authentication-and-context.md
require_grep "Wait for explicit confirmation" skills/preset-snowflake-cortex/references/cortex-safety.md
require_grep "/api/v2/databases/{database}/schemas/{schema}/agents/{name}:run" skills/preset-cortex-agents/references/agent-runs.md
require_grep "/api/v2/cortex/agent:run" skills/preset-cortex-agents/references/agent-runs.md
require_grep "unknown event types" skills/preset-cortex-agents/references/agent-runs.md
require_grep "DELETE /api/v2/databases/{database}/schemas/{schema}/agents/{name}" skills/preset-cortex-agents/references/agent-management.md
require_grep "CREATE AGENT" skills/preset-cortex-agents/references/sql-agent-ddl.md
require_grep "DROP AGENT" skills/preset-cortex-agents/references/sql-agent-ddl.md
require_grep "CORTEX_ENABLED_CROSS_REGION" skills/preset-snowflake-cortex/references/authentication-and-context.md
require_grep "SNOWFLAKE.CORTEX.DATA_AGENT_RUN" skills/preset-cortex-agents/references/sql-wrapper.md
require_grep "not Preset chatbot runtime instructions" skills/preset-snowflake-cortex/SKILL.md

required_admin_references=(
  skills/preset-admin/references/audit-logs.md
  skills/preset-admin/references/deferrals.md
  skills/preset-admin/references/invites.md
  skills/preset-admin/references/role-identifiers.md
  skills/preset-admin/references/team-memberships.md
  skills/preset-admin/references/workspace-management.md
)

for file in "${required_admin_references[@]}"; do
  require_file "$file"
done

require_grep "/api/v2/audit/teams" skills/preset-admin/references/audit-logs.md
require_grep "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/" skills/preset-admin/references/audit-logs.md
require_grep "https://api.app.preset.io/v2/audit/teams/{team_name}/logs/actions/" skills/preset-admin/references/audit-logs.md
require_grep "/audit/teams/{team_name}/logs/downloads/" skills/preset-admin/references/audit-logs.md
require_grep "mgmt_v2_response" skills/preset-admin/references/audit-logs.md
require_grep "workspace_root" skills/preset-api/references/authentication.md
require_grep "token = download" skills/preset-admin/references/audit-logs.md
require_grep "allow_redirects=False" skills/preset-admin/references/audit-logs.md
require_grep "proxy/access logs" skills/preset-admin/references/audit-logs.md
require_grep "user_name_or_email" skills/preset-admin/references/team-memberships.md
require_grep "has-seats-remaining" skills/preset-admin/references/team-memberships.md
require_grep "invites/many" skills/preset-admin/references/invites.md
require_grep "TEAM_ROLE_ID" skills/preset-admin/references/invites.md
require_grep "created_invites" skills/preset-admin/references/invites.md
require_grep "currently accepts up to 50" skills/preset-admin/references/invites.md
require_grep "workspace_roles" skills/preset-admin/references/role-identifiers.md
require_grep "PresetMachineRole" skills/preset-admin/references/role-identifiers.md
require_grep "Do not guess from role names" skills/preset-admin/references/role-identifiers.md
require_grep "name-<workspace_name>" skills/preset-admin/references/workspace-management.md
require_grep "user-access/" skills/preset-admin/references/workspace-management.md
require_grep "Always read the current workspace first" skills/preset-admin/references/workspace-management.md
require_grep "full desired state" skills/preset-admin/references/workspace-management.md
require_grep "Update Workspace Member Role" skills/preset-admin/references/workspace-management.md
require_grep "/membership" skills/preset-admin/references/workspace-management.md
require_grep "default workspace role identifiers only" skills/preset-admin/references/workspace-management.md
require_grep "browser/session-backed context" skills/preset-admin/references/workspace-management.md
require_grep "Accept Invite Codes" skills/preset-admin/references/invites.md
require_grep "Do not improvise an API-key accept example" skills/preset-admin/references/invites.md
require_grep "session-user" skills/preset-admin/references/invites.md

if grep -Eq "Invite A User|guarded membership workflows|manage membership|role-update examples" \
  skills/preset-workspaces/SKILL.md \
  skills/preset-workspaces/references/membership.md \
  AGENTS.md \
  CLAUDE.md \
  .github/copilot-instructions.md \
  .cursor-plugin/plugin.json; then
  fail "preset-workspaces membership reference should not duplicate invite workflows"
fi

while IFS= read -r path; do
  require_file "$path"
done < <(jq -r '.skills[].path' .cursor-plugin/plugin.json)

require_file .github/copilot-instructions.md
test ! -d api/skills || fail "legacy api/skills directory still exists"

echo "Preset agent skills package smoke test passed."
