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
  preset-dashboards
  preset-datasets
)

for skill in "${required_skills[@]}"; do
  file="skills/$skill/SKILL.md"
  require_file "$file"
  require_grep "^name: $skill$" "$file"
  require_grep "^description: " "$file"
  require_dir "skills/$skill/references"
done

require_jq '.skills == "./skills/"' .codex-plugin/plugin.json
require_jq '.name == "preset-agent-skills"' .claude-plugin/plugin.json
require_jq '
  [.skills[].path] | sort == [
    "skills/preset-admin/SKILL.md",
    "skills/preset-api/SKILL.md",
    "skills/preset-dashboards/SKILL.md",
    "skills/preset-datasets/SKILL.md",
    "skills/preset-workspaces/SKILL.md"
  ]
' .cursor-plugin/plugin.json

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
require_grep "user_name_or_email" skills/preset-admin/references/team-memberships.md
require_grep "has-seats-remaining" skills/preset-admin/references/team-memberships.md
require_grep "invites/many" skills/preset-admin/references/invites.md
require_grep "workspace_roles" skills/preset-admin/references/role-identifiers.md
require_grep "name-<workspace_name>" skills/preset-admin/references/workspace-management.md

while IFS= read -r path; do
  require_file "$path"
done < <(jq -r '.skills[].path' .cursor-plugin/plugin.json)

require_file .github/copilot-instructions.md
test ! -d api/skills || fail "legacy api/skills directory still exists"

echo "Preset agent skills package smoke test passed."
