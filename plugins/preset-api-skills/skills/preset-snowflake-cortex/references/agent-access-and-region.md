# Snowflake Cortex Agent Access And Region

Use this reference when planning Cortex Agent calls, object workflows, or model
availability checks.

## Access Checks

For Cortex Agent runs, verify the role has the required Snowflake Cortex Agent
access. Snowflake documents `SNOWFLAKE.CORTEX_USER` and
`SNOWFLAKE.CORTEX_AGENT_USER` as roles that can access Cortex Agents. Do not
treat `SNOWFLAKE.CORTEX_REST_API_USER` alone as sufficient for Cortex Agent
work; Snowflake's Cortex Agent access-control docs name `CORTEX_USER` and
`CORTEX_AGENT_USER` for Agent calls.

Agent object workflows also need object privileges:

- `CREATE AGENT` on the schema for creation.
- `USAGE` on the agent for runs.
- `MODIFY` on the agent for updates.
- `MONITOR` for threads, logs, and traces.
- Relevant database, schema, table, Cortex Search, semantic model, function, or
  warehouse privileges required by the agent's tools.

Use the user's default role when calling or updating Cortex Agents. Do not
silently switch to a broader role.

If the model is not locally available, check whether the account has an approved
`CORTEX_ENABLED_CROSS_REGION` setting before suggesting cross-region inference.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-rest-api>
- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cross-region-inference>
