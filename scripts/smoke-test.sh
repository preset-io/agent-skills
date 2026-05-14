#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "Smoke test failed: $*" >&2
  exit 1
}

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
    "skills/preset-api/SKILL.md",
    "skills/preset-dashboards/SKILL.md",
    "skills/preset-datasets/SKILL.md",
    "skills/preset-workspaces/SKILL.md"
  ]
' .cursor-plugin/plugin.json

require_file .github/copilot-instructions.md
test ! -d api/skills || fail "legacy api/skills directory still exists"

echo "Preset agent skills package smoke test passed."
