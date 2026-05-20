# Snowflake Cortex Authentication And Context

Use this router before choosing the focused Cortex reference to retrieve.

- For account URL, auth method, role, warehouse, database/schema, request
  headers, and secret handling, use
  [account-auth-context.md](account-auth-context.md).
- For OAuth endpoint, scope, redirect URI, role, and token exchange checks, use
  [oauth-context.md](oauth-context.md).
- For Cortex Agent privileges, `SNOWFLAKE.CORTEX_USER`,
  `SNOWFLAKE.CORTEX_AGENT_USER`, object grants, default-role behavior, and
  `CORTEX_ENABLED_CROSS_REGION`, use
  [agent-access-and-region.md](agent-access-and-region.md).

Do not use Preset workspace hostnames for Snowflake Cortex APIs. Do not print
PATs, private keys, OAuth tokens, signed JWTs, or session tokens.
