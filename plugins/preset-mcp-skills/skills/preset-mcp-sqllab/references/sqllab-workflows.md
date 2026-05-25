# SQL Lab Workflows

| Goal | MCP Tool |
|---|---|
| Execute SQL | `execute_sql` |
| Generate SQL Lab URL | `open_sql_lab_with_context` |
| Persist a saved query | `save_sql_query` |

`execute_sql` is tagged `mutate` and marked destructive by MCP annotations because SQL can have side effects. Do not assume a query is safe only because it starts with `SELECT`; validate the user's intent and target.
