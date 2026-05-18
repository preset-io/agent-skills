# DATA_AGENT_RUN SQL Wrapper

Use this reference when the user wants to run a Cortex Agent from Snowflake SQL
instead of using the REST API.

Official docs:

- <https://docs.snowflake.com/en/sql-reference/functions/data_agent_run-snowflake-cortex>

`SNOWFLAKE.CORTEX.DATA_AGENT_RUN` is a utility wrapper around the Cortex Agents
Run API. Snowflake recommends the streaming REST API for most application
integrations. The SQL function returns a non-streaming JSON string.

## Pattern

```sql
SELECT TRY_PARSE_JSON(
  SNOWFLAKE.CORTEX.DATA_AGENT_RUN(
    'MY_DB.MY_SCHEMA.MY_AGENT',
    $${
      "parent_message_id": 0,
      "thread_id": 0,
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
