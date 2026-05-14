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
    "skills/preset-dashboards/SKILL.md",
    "skills/preset-datasets/SKILL.md",
    "skills/preset-embedding/SKILL.md",
    "skills/preset-import-export/SKILL.md",
    "skills/preset-sqllab/SKILL.md",
    "skills/preset-superset/SKILL.md",
    "skills/preset-workspaces/SKILL.md"
  ]
' .cursor-plugin/plugin.json

required_phase4_references=(
  skills/preset-superset/references/version-openapi.md
  skills/preset-superset/references/workspace-api-safety.md
  skills/preset-dashboards/references/charts-and-dashboard-api.md
  skills/preset-datasets/references/database-and-dataset-api.md
  skills/preset-sqllab/references/query-history.md
  skills/preset-sqllab/references/guarded-sql-execution.md
  skills/preset-import-export/references/import-export.md
  skills/preset-embedding/references/embedded-dashboards.md
)

for file in "${required_phase4_references[@]}"; do
  require_file "$file"
done

require_grep "/api/v1/_openapi" skills/preset-superset/references/version-openapi.md
require_grep "/api/v1/me/roles/" skills/preset-superset/references/version-openapi.md
require_grep "HTTP method alone is not enough" skills/preset-superset/references/workspace-api-safety.md
require_grep "chart data retrieval" skills/preset-api/references/safety-policy.md
require_grep "/api/v1/chart/{pk}/data/" skills/preset-dashboards/references/charts-and-dashboard-api.md
require_grep "/api/v1/dashboard/{id_or_slug}/tabs" skills/preset-dashboards/references/charts-and-dashboard-api.md
require_grep "/api/v1/database/{pk}/table_metadata/" skills/preset-datasets/references/database-and-dataset-api.md
require_grep "/api/v1/datasource/{datasource_type}/{datasource_id}/column/{column_name}/values/" skills/preset-datasets/references/database-and-dataset-api.md
require_grep "/api/v1/sqllab/execute/" skills/preset-sqllab/references/guarded-sql-execution.md
require_grep "/api/v1/query/updated_since" skills/preset-sqllab/references/query-history.md
require_grep "/api/v1/assets/export/" skills/preset-import-export/references/import-export.md
require_grep "Never print import secrets" skills/preset-import-export/references/import-export.md
require_grep "/api/v1/embedded_dashboard/{uuid}" skills/preset-embedding/references/embedded-dashboards.md
require_grep "/api/v1/security/guest_token/" skills/preset-embedding/references/embedded-dashboards.md

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
