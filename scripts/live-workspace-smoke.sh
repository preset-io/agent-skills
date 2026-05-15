#!/usr/bin/env bash
set -euo pipefail
umask 077

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
TRUSTED_WORKSPACE_HOSTS="${PRESET_TRUSTED_WORKSPACE_HOSTS:-}"
ALLOW_LOCAL_WORKSPACE_HOSTS="${PRESET_ALLOW_LOCAL_WORKSPACE_HOSTS:-false}"
INCLUDE_SQL_TEXT_ENDPOINTS="${PRESET_INCLUDE_SQL_TEXT_ENDPOINTS:-false}"
RESPONSE_DIR="$(mktemp -d -t preset-agent-skills-live-smoke.XXXXXX)"
trap 'rm -rf "$RESPONSE_DIR"' EXIT

case "$ALLOW_LOCAL_WORKSPACE_HOSTS" in
  true|false)
    ;;
  *)
    fail "PRESET_ALLOW_LOCAL_WORKSPACE_HOSTS must be true or false"
    ;;
esac

case "$INCLUDE_SQL_TEXT_ENDPOINTS" in
  true|false)
    ;;
  *)
    fail "PRESET_INCLUDE_SQL_TEXT_ENDPOINTS must be true or false"
    ;;
esac

case "$WORKSPACE_SCHEME" in
  http|https)
    ;;
  *)
    fail "PRESET_WORKSPACE_SCHEME must be http or https"
    ;;
esac

write_auth_payload() {
  local output_file="$1"
  local secret_file="$RESPONSE_DIR/auth-secret.txt"

  printf "%s" "$PRESET_CLIENT_SECRET" > "$secret_file"

  jq -nc \
    --arg name "$PRESET_CLIENT_ID" \
    --rawfile secret "$secret_file" \
    '{name: $name, secret: $secret}' > "$output_file"
  rm -f "$secret_file"
}

hostname_without_port() {
  local hostname="$1"

  if [[ "$hostname" == \[*\]* ]]; then
    hostname="${hostname#\[}"
    hostname="${hostname%%\]*}"
  elif [[ "$hostname" == *:* ]]; then
    hostname="${hostname%%:*}"
  fi

  printf "%s" "$hostname"
}

validate_workspace_hostname_shape() {
  local hostname="$1"

  [[ "$hostname" != *"://"* ]] || fail "PRESET_WORKSPACE_HOSTNAME must be a hostname, not a URL"
  [[ "$hostname" != */* ]] || fail "PRESET_WORKSPACE_HOSTNAME must not include a path"
  [[ "$hostname" != *@* ]] || fail "PRESET_WORKSPACE_HOSTNAME must not include user info"
}

is_local_workspace_hostname() {
  local host_without_port="$1"

  case "$host_without_port" in
    localhost|127.0.0.1|::1|*.local.preset.zone)
      return 0
      ;;
  esac

  return 1
}

workspace_hostname_in_management_api() {
  local hostname="$1"
  local teams_json
  local team_name
  local workspaces_json
  local match

  teams_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/")"

  while IFS= read -r team_name; do
    [[ -n "$team_name" ]] || continue
    workspaces_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/$team_name/workspaces/")"
    match="$(jq -r --arg host "$hostname" '.payload[] | select(.hostname == $host) | .hostname' <<<"$workspaces_json" | head -n 1)"
    if [[ "$match" == "$hostname" ]]; then
      return 0
    fi
  done < <(jq -r '.payload[].name // empty' <<<"$teams_json")

  return 1
}

validate_workspace_hostname() {
  local hostname="$1"
  local host_without_port

  validate_workspace_hostname_shape "$hostname"
  host_without_port="$(hostname_without_port "$hostname")"

  if workspace_hostname_in_management_api "$host_without_port"; then
    return 0
  fi

  if [[ -n "$TRUSTED_WORKSPACE_HOSTS" ]]; then
    local trusted
    local old_ifs="$IFS"
    IFS=","
    for trusted in $TRUSTED_WORKSPACE_HOSTS; do
      if [[ "$hostname" == "$trusted" || "$host_without_port" == "$trusted" ]]; then
        IFS="$old_ifs"
        return 0
      fi
    done
    IFS="$old_ifs"
  fi

  if [[ "$ALLOW_LOCAL_WORKSPACE_HOSTS" == "true" ]] && is_local_workspace_hostname "$host_without_port"; then
    return 0
  fi

  fail "refusing to send a bearer token to workspace host not returned by the Management API: $hostname"
}

auth_payload_file="$RESPONSE_DIR/auth-payload.json"
write_auth_payload "$auth_payload_file"

token="$(
  curl -fsS -X POST "$MGMT_BASE/auth/" \
    -H "Content-Type: application/json" \
    --data "@$auth_payload_file" \
    | jq -r '.payload.access_token'
)"

test -n "$token" && test "$token" != "null" || fail "auth response did not include payload.access_token"

print_failure_summary() {
  local response_file="$1"
  local summary

  summary="$(
    jq -r '
      if type == "object" then
        .message
        // .error
        // .error_type
        // .errors[0].message
        // .errors[0].error
        // .result.message
        // empty
      else
        empty
      end
    ' "$response_file" 2>/dev/null | head -n 1
  )"

  if [[ -n "$summary" ]]; then
    echo "Response summary: $summary" >&2
  else
    echo "Response body omitted." >&2
  fi
}

api_get() {
  local url="$1"
  local expected="$2"
  local response_file="$RESPONSE_DIR/response.json"
  local status
  status="$(
    curl -sS -o "$response_file" \
      -w "%{http_code}" \
      -H "Authorization: Bearer $token" \
      "$url"
  )"

  if [[ ",$expected," != *",$status,"* ]]; then
    echo "Unexpected status for $url: $status" >&2
    print_failure_summary "$response_file"
    rm -f "$response_file"
    exit 1
  fi

  rm -f "$response_file"
  echo "$status $url"
}

if [[ -z "$WORKSPACE_HOSTNAME" ]]; then
  teams_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/")"
  WORKSPACE_HOSTNAME=""
  while IFS= read -r team_name; do
    [[ -n "$team_name" ]] || continue
    workspaces_json="$(curl -fsS -H "Authorization: Bearer $token" "$MGMT_BASE/teams/$team_name/workspaces/")"
    WORKSPACE_HOSTNAME="$(jq -r '.payload[] | select(.hostname != null and .workspace_status == "READY") | .hostname' <<<"$workspaces_json" | head -n 1)"
    [[ -n "$WORKSPACE_HOSTNAME" ]] && break
  done < <(jq -r '.payload[].name // empty' <<<"$teams_json")

  test -n "$WORKSPACE_HOSTNAME" || fail "could not find a READY workspace hostname; set PRESET_WORKSPACE_HOSTNAME"
fi

validate_workspace_hostname "$WORKSPACE_HOSTNAME"
host_without_port="$(hostname_without_port "$WORKSPACE_HOSTNAME")"
if [[ "$WORKSPACE_SCHEME" == "http" ]] && ! is_local_workspace_hostname "$host_without_port"; then
  fail "PRESET_WORKSPACE_SCHEME=http is only allowed for local workspace hosts"
fi

base="$WORKSPACE_SCHEME://$WORKSPACE_HOSTNAME"
api_base="$base/api/v1"
q_one="%28page%3A0%2Cpage_size%3A1%29"

echo "Validating workspace: $WORKSPACE_HOSTNAME"

api_get "$base/version" "200,404"
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

if [[ "$INCLUDE_SQL_TEXT_ENDPOINTS" == "true" ]]; then
  api_get "$api_base/query/?q=$q_one" "200,403"
  api_get "$api_base/saved_query/?q=$q_one" "200,403"
else
  echo "skipped SQL text-bearing query and saved-query endpoints"
fi

echo "Live workspace metadata smoke completed."
