# Authentication Reference

## Credentials

Generate API credentials from the Preset management console:

1. Log in to [manage.app.preset.io](https://manage.app.preset.io).
2. Click your avatar, then **API keys**.
3. Click **Generate a new API key**.
4. Copy the **API Token Name** as the client ID and the **API Token Secret** as the client secret.

Store them as environment variables:

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

Store long-lived API credentials in a secrets manager such as AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets, or the approved secret store for your environment. Rotate API keys periodically from the Preset management console and scope each key to the minimum permissions required.

To check whether the relevant environment variables are available without
printing secret values, use a shell-portable `printenv` loop:

```bash
for var_name in PRESET_CLIENT_ID PRESET_CLIENT_SECRET PRESET_API_BASE PRESET_TOKEN; do
  if [ -n "$(printenv "$var_name")" ]; then
    printf '%s: set (value hidden)\n' "$var_name"
  else
    printf '%s: unset\n' "$var_name"
  fi
done
```

Avoid bash-only indirect expansion such as `${!var_name}` because agent shells
may run the command under zsh.

## Token Exchange

Exchange credentials with `POST https://api.app.preset.io/v1/auth/` using a JSON
body containing `name` from `PRESET_CLIENT_ID` and `secret` from
`PRESET_CLIENT_SECRET`. Read the JWT from `payload.access_token` with `jq -r`
when assigning it to a shell variable so the token is not JSON-quoted.

Avoid printing credentials or tokens in logs. The JWT is valid for 5 hours by
default; cache it with a buffer and refresh on HTTP 401.

## Reusable Python Client

Load [`../examples/preset_client.py`](../examples/preset_client.py) only when reusable client code is needed. In the repository, that file is `plugins/preset-api-skills/skills/preset-api/examples/preset_client.py`. It includes Management API v1/v2 helpers, workspace `/api/v1` helpers, `workspace_root()`, and `workspace_root_response()` for server-root endpoints that need status codes, headers, redirects, or non-JSON bodies.
