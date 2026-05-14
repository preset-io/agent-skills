#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "Live smoke failed: $*" >&2
  exit 1
}

command -v curl >/dev/null || fail "curl is required"
command -v jq >/dev/null || fail "jq is required"

: "${PRESET_CLIENT_ID:?PRESET_CLIENT_ID is required}"
: "${PRESET_CLIENT_SECRET:?PRESET_CLIENT_SECRET is required}"

MGMT_BASE="${PRESET_API_BASE:-https://api.app.preset.io/v1}"
WORKSPACE_HOSTNAME="${PRESET_WORKSPACE_HOSTNAME:-}"
WORKSPACE_SCHEME="${PRESET_WORKSPACE_SCHEME:-https}"
OPENAPI_EXPECTED_STATUSES="${PRESET_OPENAPI_EXPECTED_STATUSES:-200}"

auth_payload="$(jq -nc \
  --arg name "$PRESET_CLIENT_ID" \
  --arg secret "$PRESET_CLIENT_SECRET" \
  '{name: $name, secret: $secret}')"

token="$(
  curl -fsS -X POST "$MGMT_BASE/auth/" \
    -H "Content-Type: application/json" \
    -d "$auth_payload" \
    | jq -r '.payload.access_token'
)"

test -n "$token" && test "$token" != "null" || fail "auth response did not include payload.access_token"

api_get() {
  local url="$1"
  local expected="$2"
  local status
  status="$(
    curl -sS -o /tmp/preset-agent-skills-live-smoke-response.json \
      -w "%{http_code}" \
      -H "Authorization: Bearer $token" \
      "$url"
  )"

  if [[ ",$expected," != *",$status,"* ]]; then
    echo "Unexpected status for $url: $status" >&2
    sed -n '1,20p' /tmp/preset-agent-skills-live-smoke-response.json >&2
    exit 1
  fi

  echo "$status $url"
}

if [[ -z "$WORKSPACE_HOSTNAME" ]]; then
  teams_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/")"
  team_name="$(jq -r '.payload[0].name // empty' <<<"$teams_json")"
  test -n "$team_name" || fail "could not find a team; set PRESET_WORKSPACE_HOSTNAME to validate a known workspace"

  workspaces_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/$team_name/workspaces/")"
  WORKSPACE_HOSTNAME="$(jq -r '.payload[] | select(.hostname != null) | .hostname' <<<"$workspaces_json" | head -n 1)"
  test -n "$WORKSPACE_HOSTNAME" || fail "could not find a workspace hostname; set PRESET_WORKSPACE_HOSTNAME"
fi

base="$WORKSPACE_SCHEME://$WORKSPACE_HOSTNAME"
api_base="$base/api/v1"
q_one="%28page%3A0%2Cpage_size%3A1%29"

echo "Validating workspace: $WORKSPACE_HOSTNAME"

api_get "$base/version" "200,401,403,404"
api_get "$api_base/_openapi" "$OPENAPI_EXPECTED_STATUSES"
api_get "$api_base/me/" "200"
api_get "$api_base/me/roles/" "200"
api_get "$api_base/menu/" "200"

api_get "$api_base/dashboard/?q=$q_one" "200,403"
api_get "$api_base/chart/?q=$q_one" "200,403"
api_get "$api_base/database/available/" "200,403"
api_get "$api_base/database/?q=$q_one" "200,403"
api_get "$api_base/dataset/?q=$q_one" "200,403"
api_get "$api_base/sqllab/" "200,403,404"
api_get "$api_base/query/?q=$q_one" "200,403"
api_get "$api_base/saved_query/?q=$q_one" "200,403"

echo "Live workspace metadata smoke completed."
