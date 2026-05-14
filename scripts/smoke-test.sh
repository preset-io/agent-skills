#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

required_skills=(
  preset-api
  preset-workspaces
  preset-dashboards
  preset-datasets
)

for skill in "${required_skills[@]}"; do
  file="skills/$skill/SKILL.md"
  test -f "$file"
  grep -q "^name: $skill$" "$file"
  grep -q "^description: " "$file"
  test -d "skills/$skill/references"
done

jq -e '.skills == "./skills/"' .codex-plugin/plugin.json >/dev/null
jq -e '.name == "preset-agent-skills"' .claude-plugin/plugin.json >/dev/null
jq -e '
  [.skills[].path] | sort == [
    "skills/preset-api/SKILL.md",
    "skills/preset-dashboards/SKILL.md",
    "skills/preset-datasets/SKILL.md",
    "skills/preset-workspaces/SKILL.md"
  ]
' .cursor-plugin/plugin.json >/dev/null

test -f .github/copilot-instructions.md
test ! -d api/skills

echo "Preset agent skills package smoke test passed."
