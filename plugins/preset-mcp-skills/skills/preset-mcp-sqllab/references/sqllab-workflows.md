# SQL Lab Workflows

| Goal | MCP Tool |
|---|---|
| Execute SQL | `execute_sql` |
| Generate SQL Lab URL | `open_sql_lab_with_context` |
| Persist a saved query | `save_sql_query` |

`execute_sql` is tagged `mutate` by MCP annotations because SQL can have side effects. Run a read-only `SELECT` directly once the target database and table are resolved; confirm first only for statements that write or alter data (INSERT/UPDATE/DELETE/DDL) or when multiple targets plausibly match.

Resolve exact table and column names with `get_dataset_info` before writing SQL — guessed names and casing are the main cause of failed executions.
