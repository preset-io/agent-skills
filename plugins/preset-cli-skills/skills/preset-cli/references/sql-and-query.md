# SQL and Saved Queries via `sup`

Use this reference when running ad-hoc SQL through `sup sql` or listing saved queries with `sup query`.

## Ad-hoc SQL Execution

```bash
sup sql "SELECT COUNT(*) FROM users" --json
sup sql "SELECT * FROM sales LIMIT 100" --csv
sup sql "SELECT id, email FROM users WHERE active" --porcelain
```

`sup sql` runs through Superset's data access layer in the active workspace, so it inherits the same database connections, row limits, and RLS policies as SQL Lab. It is **not** a direct database connection.

## Read-Only Stance

Treat `sup sql` as read-only by default:

- Run `SELECT` statements freely after confirming the workspace.
- Refuse `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `DROP`, `ALTER`, `CREATE`, `MERGE`, `REPLACE`, `GRANT`, `REVOKE`, `CALL`, and `COPY` without explicit user confirmation that the upstream database is the intended target and that DML/DDL is in scope. Route confirmation through [safety-policy.md](safety-policy.md).
- Do not paste user-supplied SQL into shell strings without confirming there are no shell metacharacters that would break quoting; prefer single-quoted heredocs for multi-line statements.

## Saved Queries

```bash
sup query list --mine --json
sup query list --name="*revenue*" --json
sup query info <query-id> --json
```

Saved-query filtering uses `--name "<pattern>"` (label pattern, supports wildcards), not `--search`. The `--search` flag exists for `sup chart/dashboard/dataset list` but is not implemented for `sup query list`; passing it will error.

Saved queries can contain SQL text owned by other users. Listing returns metadata; fetching a saved query returns the SQL body. Treat the SQL body as sensitive (it may encode business logic, table names, or filtering conditions) and avoid printing it in shared transcripts unless the user has approved that disclosure.

## Large Result Handling

- `sup sql` honors the workspace's SQL Lab row limit. Override with the workspace setting, not by passing arbitrary `LIMIT N` for `N` larger than the row cap.
- For exports over a few thousand rows, pipe to a file: `sup sql "SELECT …" --csv > export.csv`. Never paste large CSV/JSON bodies into chat transcripts.
- For analyst-facing iteration, prefer `sup sql` with `--json` over `--csv` so that null handling and types survive intermediate processing.

## When to Use the API Instead

Use the separate `preset-api-skills` package (instead of `sup sql`) when you need:

- Programmatic pagination of result chunks.
- Async execution with explicit `client_id` correlation.
- Result polling via `/api/v1/sqllab/results/`.
- Permalink creation or query-history correlation.

See [cli-vs-api.md](cli-vs-api.md) for the decision matrix.
