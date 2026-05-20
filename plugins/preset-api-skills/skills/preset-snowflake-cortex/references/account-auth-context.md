# Snowflake Cortex Account And Request Context

Use this reference before constructing Snowflake Cortex REST API requests.

## Required Context

Confirm these values before live calls:

1. Snowflake account URL, for example `https://<account_identifier>.snowflakecomputing.com`.
2. Authentication method: programmatic access token, key-pair JWT, or OAuth.
3. Role intended for the request.
4. Warehouse, when an agent or tool can execute warehouse-backed work.
5. Database and schema containing the Cortex Agent object, when using object APIs.
6. Account region, when model availability or cross-region inference matters.

Use Snowflake account hostnames for Cortex APIs. Do not use Preset workspace
hostnames.

## REST Headers

Snowflake Cortex Agent REST requests use:

| Header | Value |
|---|---|
| `Authorization` | Required bearer token from the selected Snowflake auth method |
| `Content-Type` | Required `application/json` for JSON request bodies |
| `Accept` | Optional for `agent:run`; use `text/event-stream` for streaming, or `application/json` for non-streaming |
| `X-Snowflake-Authorization-Token-Type` | Optional. Use `OAUTH`, `KEYPAIR_JWT`, or `PROGRAMMATIC_ACCESS_TOKEN` when declaring the token type explicitly |

Never paste tokens, private keys, or signed JWTs into Markdown, logs, PR
comments, or handoff notes.
