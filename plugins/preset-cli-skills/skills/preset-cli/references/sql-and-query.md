# SQL and Saved Queries via `sup`

Use this reference for basic ad-hoc SQL routing through `sup sql`. For row disclosure rules, load [sql-data-safety.md](sql-data-safety.md). For saved query metadata and SQL text reads, load [saved-query-reads.md](saved-query-reads.md).

## Ad-hoc SQL Execution

```bash
sup sql "SELECT COUNT(*) FROM users" --json
sup sql "SELECT * FROM sales LIMIT 100" --csv
sup sql "SELECT id, email FROM users WHERE active" --porcelain
```

`sup sql` runs through Superset's data access layer in the active workspace, so it inherits the same database connections, row limits, and RLS policies as SQL Lab. It is not a direct database connection.

## Read-Only Stance

Treat `sup sql` as read-only by default:

- Run `SELECT` statements freely after confirming the workspace.
- Refuse `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `MERGE`, `REPLACE`, `GRANT`, `REVOKE`, `CALL`, and `COPY` without explicit user confirmation that the upstream database is the intended target and that DML/DDL is in scope. Route confirmation through [sql-data-safety.md](sql-data-safety.md) and [safety-policy.md](safety-policy.md).
- Do not paste user-supplied SQL into shell strings without confirming there are no shell metacharacters that would break quoting; prefer single-quoted heredocs for multi-line statements.

## Large Result Handling

- `sup sql` exposes two row-limit knobs: `--limit <n>` / `-l <n>` controls how many rows are fetched from Superset (default `1000`), and `--max-rows <n>` controls how many of those are displayed in the terminal (default `100`). Both are CLI flags. The workspace SQL Lab row cap still applies as a hard upper bound.
- For exports over a few thousand rows, pipe to a file: `sup sql "SELECT …" --csv > export.csv`. Pair with `--limit` to cap fetched rows; `--max-rows` is irrelevant when piping (it only gates terminal display). Never paste large CSV/JSON bodies into chat transcripts.
- For analyst-facing iteration, prefer `sup sql` with `--json` over `--csv` so that null handling and types survive intermediate processing.

## When to Use the API Instead

Use the separate `preset-api-skills` package (instead of `sup sql`) when you need:

- Programmatic pagination of result chunks.
- Async execution with explicit `client_id` correlation.
- Result polling via `/api/v1/sqllab/results/`.
- Permalink creation or query-history correlation.

See [cli-vs-api.md](cli-vs-api.md) for the decision matrix.
