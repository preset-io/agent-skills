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

## Token Exchange

Exchange credentials with `POST https://api.app.preset.io/v1/auth/` using a JSON
body containing `name` from `PRESET_CLIENT_ID` and `secret` from
`PRESET_CLIENT_SECRET`. Read the JWT from `payload.access_token`.

Avoid printing credentials or tokens in logs. The JWT is valid for 5 hours by
default; cache it with a buffer and refresh on HTTP 401.

## Reusable Python Client

Load `examples/preset_client.py` only when reusable client code is needed. It includes Management API v1/v2 helpers, workspace `/api/v1` helpers, `workspace_root()`, and `workspace_root_response()` for server-root endpoints that need status codes, headers, redirects, or non-JSON bodies.
