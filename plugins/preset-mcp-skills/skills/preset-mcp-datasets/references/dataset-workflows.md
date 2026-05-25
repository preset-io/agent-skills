# Dataset Workflows

| Goal | MCP Tool |
|---|---|
| Find datasets | `list_datasets` |
| Inspect columns and metrics | `get_dataset_info` |
| Query saved metrics and dimensions | `query_dataset` |
| Save SQL as a chartable virtual dataset | `create_virtual_dataset` |
| Find databases | `list_databases`, `get_database_info` |

For chart building, inspect `columns` and `metrics` first. Saved metrics should be referenced as saved metrics in chart configs, not reconstructed as raw column aggregations.
