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

Direct path: a confidently classified single-statement SELECT (no DML/DDL/CALL/COPY/MERGE, no multi-statement) requested in the user's own message, against a resolved workspace/database target, with a bounded row limit, runs through `preset-sql-execution` without a confirmation stop. Summarize results without raw row dumps.

Confirm first (writes, DDL, low parser confidence, or unresolved target), summarize and wait for explicit confirmation before calling the execution endpoint:

1. Workspace hostname.
2. Database ID and database name, if known.
3. SQL text or an exact summary if the SQL contains sensitive values.
4. Expected result size or row limit.
5. Why the statement is gated (write/DDL, low parser confidence, or unresolved target).
6. Endpoint and request body.

A statement is not read-only merely because it starts with SELECT; when parser confidence is low, treat it as gated.
