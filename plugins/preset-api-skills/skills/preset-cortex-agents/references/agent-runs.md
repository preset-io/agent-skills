# Cortex Agent Runs

Use this reference for Cortex Agent execution through REST.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-run>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-threads>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-threads-rest-api>

## Endpoints

| Goal | Endpoint |
|---|---|
| Run an existing agent object | `POST /api/v2/databases/{database}/schemas/{schema}/agents/{name}:run` |
| Run an ad hoc agent | `POST /api/v2/cortex/agent:run` |
| Create a thread for threaded runs | `POST /api/v2/cortex/threads` |
| Describe a thread and message history | `GET /api/v2/cortex/threads/{id}` |
| List threads for the current user | `GET /api/v2/cortex/threads` |
| Rename a thread | `POST /api/v2/cortex/threads/{id}` |
| Delete a thread | `DELETE /api/v2/cortex/threads/{id}` |

Snowflake documents thread rename as an update operation that uses `POST
/api/v2/cortex/threads/{id}` with a `thread_name` request body. Do not change it
to `PATCH` unless Snowflake updates the Threads API docs.

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

## Threaded REST Runs

For a threaded REST conversation, create a thread first with
`POST /api/v2/cortex/threads`, then pass the returned `thread_id` to
`agent:run`.

- Starting a newly created thread: pass the returned `thread_id`,
  `parent_message_id: 0`, and exactly one user message.
- Continuing a thread: use the assistant `message_id` from a prior streamed
  `metadata` event, or from `GET /api/v2/cortex/threads/{id}`, as the next
  `parent_message_id`.
- The `parent_message_id` for follow-up requests must be an assistant message
  ID, not a user message ID. If assistant metadata is missing after a failed
  turn, continue from the last successful assistant message ID.
- Non-threaded first turns should omit `thread_id` and `parent_message_id` and
  send the conversation history/current user message in `messages`.
- Do not copy examples that use `thread_id: 0` as a placeholder. Use only a
  real thread ID returned by Snowflake.

## Streaming Handling

Use `Accept: text/event-stream` for streaming responses or `Accept:
application/json` with `stream: false` for non-streaming responses. The final
streamed `response` event contains the aggregated agent output. Clients should
tolerate unknown event types. Track `metadata` events because assistant
`message_id` values are needed for follow-up threaded requests.

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
