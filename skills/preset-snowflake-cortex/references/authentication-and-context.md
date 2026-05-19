# Snowflake Cortex Authentication And Context

Use this reference before constructing Cortex REST API requests.

## Required Context

Confirm these values before live calls:

1. Snowflake account URL, for example `https://<account_identifier>.snowflakecomputing.com`.
2. Authentication method: programmatic access token, key-pair JWT, or OAuth.
3. Role intended for the request.
4. Warehouse, when an agent or tool can execute warehouse-backed work.
5. Database and schema containing the Cortex Agent object, when using object APIs.
6. Account region and cross-region inference setting when the selected Cortex
   Agent model is not available in the account's local region.

## REST Headers

Snowflake Cortex Agent REST requests use:

| Header | Value |
|---|---|
| `Authorization` | Required bearer token from the selected Snowflake auth method |
| `Content-Type` | Required `application/json` for JSON request bodies |
| `Accept` | Optional for `agent:run`; use `text/event-stream` for streaming, or `application/json` for non-streaming |
| `X-Snowflake-Authorization-Token-Type` | Optional. Use `OAUTH`, `KEYPAIR_JWT`, or `PROGRAMMATIC_ACCESS_TOKEN` when you want to declare the token type explicitly |

Never paste tokens, private keys, or signed JWTs into Markdown, logs, PR
comments, or handoff notes.

## OAuth Checks

For OAuth-backed REST calls:

1. Use Snowflake OAuth endpoints from the Snowflake account URL, not a Preset
   workspace hostname: `<snowflake_account_url>/oauth/authorize` and
   `<snowflake_account_url>/oauth/token-request`.
2. Confirm the OAuth security integration redirect URI matches the client
   redirect URI exactly, except that query parameters in the authorization
   request are not included in the integration's `OAUTH_REDIRECT_URI`.
3. Use `scope=refresh_token` only when offline refresh is needed.
4. Use at most one `session:role:<ROLE_NAME>` scope. If it is omitted, the
   user's default role is used. Role names are case-sensitive; use uppercase for
   normal unquoted Snowflake roles.
5. Do not expect OAuth consent for blocked administrator roles. Snowflake
   blocks `ACCOUNTADMIN`, `SECURITYADMIN`, `GLOBALORGADMIN`, and `ORGADMIN` by
   default for custom OAuth clients.
6. Do not rely on in-session switching to secondary roles with Snowflake OAuth;
   choose a role that already has the needed Cortex Agent and object privileges.
7. Verify an OAuth token can connect before using it for Cortex REST, for
   example with Snowflake CLI `snow connection test --authenticator=oauth`.

## Access Checks

For Cortex Agent runs, verify the role has the required Snowflake Cortex Agent
access. Snowflake documents `SNOWFLAKE.CORTEX_USER` and
`SNOWFLAKE.CORTEX_AGENT_USER` as roles that can access Cortex Agents. Do not
treat `SNOWFLAKE.CORTEX_REST_API_USER` alone as sufficient for Cortex Agent
work; that role is for Cortex REST API access without broader Cortex Agent,
Analyst, Search, fine-tuning, or AI function access. Agent object workflows also
need privileges on the database, schema, and agent object.

Use the user's default role when calling or updating Cortex Agents. Do not
silently switch to a broader role.

If the model is not locally available, check whether the account has an approved
`CORTEX_ENABLED_CROSS_REGION` setting before suggesting cross-region inference.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api>
- <https://docs.snowflake.com/en/developer-guide/snowflake-rest-api/authentication>
- <https://docs.snowflake.com/en/user-guide/oauth-custom>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cross-region-inference>
