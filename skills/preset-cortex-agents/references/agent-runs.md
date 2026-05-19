# Cortex Agent Runs

Use this reference for Cortex Agent execution through REST.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-run>

## Endpoints

| Goal | Endpoint |
|---|---|
| Run an existing agent object | `POST /api/v2/databases/{database}/schemas/{schema}/agents/{name}:run` |
| Run an ad hoc agent | `POST /api/v2/cortex/agent:run` |

Requests to the Cortex Agent REST API time out after 15 minutes.

## Request Shape

Common request fields include:

| Field | Notes |
|---|---|
| `thread_id` | Existing conversation thread ID. If used, also pass `parent_message_id`; do not invent `0` as a thread ID. |
| `parent_message_id` | Parent message ID. Use `0` only for the first message in an existing newly created thread. |
| `messages` | Chronological user and assistant messages. For a first-turn non-threaded call, omit thread fields and include the complete history/current user message here. |
| `stream` | Defaults to streaming. Set `false` for a single JSON response. |
| `tool_choice` | Controls automatic, required, or named tool use. |

Ad hoc runs can also include model, instruction, orchestration, tool, and
tool-resource configuration in the request body.

## Streaming Handling

Use `Accept: text/event-stream` for streaming responses or `Accept:
application/json` for non-streaming responses. The final streamed `response`
event contains the aggregated agent output. Clients should tolerate unknown event types.

## SQL Execution Blocks

Cortex Agents that use Cortex Analyst semantic views may return
`system_execute_sql` tool blocks. A successful block includes a generated SQL
statement, query ID, result set, and final SQL. If the block fails with HTTP 400
from Snowflake SQL API while the generated SQL runs manually, check the caller's
session settings first. SQL-backed agent execution requires an autocommit
Snowflake session; application sessions with `AUTOCOMMIT=FALSE` can cause
`AUTOCOMMIT is expected to be true` errors.

Before running, confirm the query, tools, warehouse-backed resources, budget,
streaming mode, and output destination.
