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

Never paste tokens, private keys, or signed JWTs into Markdown, logs, PR
comments, or handoff notes.

## Access Checks

For Cortex Agent runs, verify the role has the required Snowflake Cortex Agent
access. Snowflake documents `SNOWFLAKE.CORTEX_USER` and
`SNOWFLAKE.CORTEX_AGENT_USER` as roles that can access Cortex Agents. Agent
object workflows also need privileges on the database, schema, and agent object.

Use the user's default role when Snowflake requires it for Cortex Agent calls.
Do not silently switch to a broader role.

If the model is not locally available, check whether the account has an approved
`CORTEX_ENABLED_CROSS_REGION` setting before suggesting cross-region inference.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cross-region-inference>
