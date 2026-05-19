# DATA_AGENT_RUN SQL Wrapper

Use this reference when the user wants to run a Cortex Agent from Snowflake SQL
instead of using the REST API.

Official docs:

- <https://docs.snowflake.com/en/sql-reference/functions/data_agent_run-snowflake-cortex>

`SNOWFLAKE.CORTEX.DATA_AGENT_RUN` is a utility wrapper around the Cortex Agents
Run API. Snowflake recommends the streaming REST API for most application
integrations. The SQL function returns a non-streaming JSON string.

## First-Turn Pattern

For a one-off or first-turn SQL wrapper call, do not invent a `thread_id`.
Provide the complete message history in `messages`. Only pass `thread_id` and
`parent_message_id` when continuing an existing thread whose IDs were created or
returned by Snowflake.

```sql
SELECT TRY_PARSE_JSON(
  SNOWFLAKE.CORTEX.DATA_AGENT_RUN(
    'MY_DB.MY_SCHEMA.MY_AGENT',
    $${
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "What are the top product types?" }
          ]
        }
      ]
    }$$
  )
) AS resp;
```

## Threaded Pattern

When using a persisted thread, create the thread first, pass the returned
`thread_id`, and use `parent_message_id: 0` only for the first message in that
existing thread.

```sql
SELECT TRY_PARSE_JSON(
  SNOWFLAKE.CORTEX.DATA_AGENT_RUN(
    'MY_DB.MY_SCHEMA.MY_AGENT',
    $${
      "thread_id": 1234,
      "parent_message_id": 0,
      "messages": [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "What are the top product types?" }
          ]
        }
      ]
    }$$
  )
) AS resp;
```

Before running, confirm the fully qualified agent name, request body, warehouse
and role context, expected data exposure, and result handling plan.
