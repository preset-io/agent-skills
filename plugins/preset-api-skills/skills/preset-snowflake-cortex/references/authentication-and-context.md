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
   normal unquoted Snowflake roles. If the role name needs URL escaping, use
   `session:role-encoded:<URL_ENCODED_ROLE_NAME>`.
5. Do not expect OAuth consent for blocked administrator roles. Snowflake
   blocks `ACCOUNTADMIN`, `SECURITYADMIN`, `GLOBALORGADMIN`, and `ORGADMIN` by
   default for custom OAuth clients.
6. Do not rely on in-session switching to secondary roles with Snowflake OAuth;
   choose a role that already has the needed Cortex Agent and object privileges.
7. For Cortex Agent REST calls and updates, prefer an OAuth token whose active
   role is the user's Snowflake default role. Do not assume an arbitrary
   `session:role` scope will satisfy Cortex Agent's default-role requirement;
   verify the role before live calls.
8. Exchange authorization codes and refresh tokens at
   `<snowflake_account_url>/oauth/token-request` with
   `Content-Type: application/x-www-form-urlencoded` and HTTP Basic auth using
   `Base64(client_id:client_secret)`, unless the integration uses Snowflake's
   documented key-pair OAuth flow.
9. If the authorization request includes `code_challenge`, include the matching
   `code_verifier` in the authorization-code token request.
10. Verify an OAuth token can connect before using it for Cortex REST, for
   example with Snowflake CLI `snow connection test --authenticator=oauth`.

## Access Checks

For Cortex Agent runs, verify the role has the required Snowflake Cortex Agent
access. Snowflake documents `SNOWFLAKE.CORTEX_USER` and
`SNOWFLAKE.CORTEX_AGENT_USER` as roles that can access Cortex Agents. Do not
treat `SNOWFLAKE.CORTEX_REST_API_USER` alone as sufficient for Cortex Agent
work; Snowflake's Cortex Agent access-control docs name `CORTEX_USER` and
`CORTEX_AGENT_USER` for Agent calls. Agent object workflows also need object
privileges: `CREATE AGENT` on the schema for creation, `USAGE` on the agent for
runs, `MODIFY` on the agent for updates, `MONITOR` for threads/logs/traces, and
the relevant database, schema, table, Cortex Search, semantic model, function,
or warehouse privileges required by the agent's tools.

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
