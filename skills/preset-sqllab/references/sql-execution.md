# SQL Execution Routing

Use this reference when a SQL Lab workflow reaches SQL execution or cost estimation.

SQL execution is high impact even when the SQL is read-only. It can expose customer data, run expensive warehouse work, or create side effects in engines that allow non-read statements.

Use `preset-sql-execution` for SQL execution, result retrieval, result export, query stop, saved-query mutation, and SQL Lab permalink creation workflows. This reference maps only SQL execution and formatting endpoints; adjacent result, export, query-control, saved-query, and permalink surfaces live in the focused SQL Lab references. The focused Phase 5 skill owns the approval template.

## SQL Execution Endpoints

| Goal | Endpoint |
|---|---|
| Estimate query cost | `POST /api/v1/sqllab/estimate/` |
| Execute SQL | `POST /api/v1/sqllab/execute/` |
| Format SQL | `POST /api/v1/sqllab/format_sql/` |

Before calling SQL execution endpoints, summarize:

1. Workspace hostname.
2. Database ID and database name, if known.
3. SQL text or an exact summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Whether the SQL is expected to be read-only.
6. Endpoint and request body.

Wait for explicit confirmation.
