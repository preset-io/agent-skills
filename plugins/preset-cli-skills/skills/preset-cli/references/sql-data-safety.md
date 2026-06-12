# SQL and Data-Returning Read Safety

Use this reference before `sup sql`, `sup chart data`, or any CLI command that returns row-level data.

## Scope Checks

For familiar workspaces and user-requested reads, run directly with explicit output bounds. A familiar workspace is one the user named in the current session or the active workspace verified with `sup config show` / `sup workspace show`; if the workspace cannot be proven from that context, treat it as unfamiliar. Before running a data-returning read on an unfamiliar workspace, confirm:

- The workspace and chart/query target.
- The expected row volume.
- The destination of the output: local file, transcript, or downstream pipeline.
- Whether the output may include customer data, PII, business logic, or SQL text.

Use `--limit` to cap fetched rows and avoid pasting large CSV/JSON bodies into chat transcripts.

## `sup sql`

`sup sql` runs through Superset's data access layer in the active workspace, so it inherits the same database connections, row limits, and RLS policies as SQL Lab. It is not a direct database connection.

Treat `sup sql` as read-only by default. Refuse `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `MERGE`, `REPLACE`, `GRANT`, `REVOKE`, `CALL`, and `COPY` unless the user explicitly confirms that the upstream database is the intended target and DML/DDL is in scope.

`sup sql` exposes two row-limit knobs: `--limit <n>` / `-l <n>` controls how many rows are fetched from Superset (default `1000`), and `--max-rows <n>` controls how many of those are displayed in the terminal (default `100`). The workspace SQL Lab row cap still applies as a hard upper bound.

## `sup chart data`

`sup chart data` returns a chart's query results. Treat it like `sup sql`: use a small limit, prefer file output for larger exports, and summarize rather than pasting raw payloads.

Load [safety-policy.md](safety-policy.md) before SQL that is not a pure single-statement `SELECT`, untrusted-source SQL, unfamiliar workspaces, broad outputs, or any mutation.
