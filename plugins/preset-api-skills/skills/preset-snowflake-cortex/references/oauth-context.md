# Snowflake Cortex OAuth Context

Use this reference only for OAuth-backed Snowflake Cortex REST calls.

## OAuth Checks

1. Use Snowflake OAuth endpoints from the Snowflake account URL, not a Preset
   workspace hostname: `<snowflake_account_url>/oauth/authorize` and
   `<snowflake_account_url>/oauth/token-request`.
2. Confirm the security integration redirect URI matches the client redirect URI
   exactly, except that authorization-request query parameters are not included
   in the integration's `OAUTH_REDIRECT_URI`.
3. Use `scope=refresh_token` only when offline refresh is needed.
4. Use at most one `session:role:<ROLE_NAME>` scope. If omitted, the user's
   default role is used. Role names are case-sensitive; use uppercase for normal
   unquoted Snowflake roles. For escaped role names, use
   `session:role-encoded:<URL_ENCODED_ROLE_NAME>`.
5. Do not expect OAuth consent for blocked administrator roles. Snowflake blocks
   `ACCOUNTADMIN`, `SECURITYADMIN`, `GLOBALORGADMIN`, and `ORGADMIN` by default
   for custom OAuth clients.
6. Do not rely on secondary-role switching with Snowflake OAuth; choose a role
   that already has the needed Cortex Agent and object privileges.
7. For Cortex Agent REST calls and updates, prefer an OAuth token whose active
   role is the user's Snowflake default role. Verify role context before live
   calls.
8. Exchange authorization codes and refresh tokens at
   `<snowflake_account_url>/oauth/token-request` with
   `Content-Type: application/x-www-form-urlencoded` and HTTP Basic auth using
   `Base64(client_id:client_secret)`, unless using Snowflake's documented
   key-pair OAuth flow.
9. If the authorization request includes `code_challenge`, include the matching
   `code_verifier` in the authorization-code token request.
10. Verify the OAuth token can connect before using it for Cortex REST, for
    example with Snowflake CLI `snow connection test --authenticator=oauth`.
