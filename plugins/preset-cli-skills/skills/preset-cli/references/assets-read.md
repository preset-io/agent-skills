# Non-Destructive Asset Reads and Exports

Use this reference for `list`, `info`, and `pull` workflows that do not mutate workspace state.

## Supported Entities

| Entity | Commands | Notes |
|---|---|---|
| `database` | `sup database list`, `sup database info`, `sup database pull` | Connection metadata; secrets never returned. |
| `dataset` | `sup dataset list`, `sup dataset info`, `sup dataset pull` | Includes columns, metrics, and dataset YAML. |
| `chart` | `sup chart list`, `sup chart info`, `sup chart pull`, `sup chart data`, `sup chart sql` | `chart data` returns query results; `chart sql` returns compiled SQL. |
| `dashboard` | `sup dashboard list`, `sup dashboard info`, `sup dashboard pull` | Layout and chart references. |
| `query` | `sup query list`, `sup query info` | Saved query metadata and SQL. |
| `user` | `sup user list`, `sup user info`, `sup user pull` | User metadata, role memberships, and team assignments. `sup user push` and `sup user invite` exist and are mutating — load `preset-cli-mutations` for those. |

`pull` writes asset definitions to the local filesystem (YAML files in `./assets/` or a path supplied to the command). It does not modify the source workspace.

For entity-specific list filters, load [asset-filter-matrix.md](asset-filter-matrix.md). Do not assume a filter exists on every entity.

## Common Read Patterns

```bash
# Detail
sup chart info 3628 --json
sup dashboard info 254 --json

# Compiled SQL behind a chart (no execution)
sup chart sql 3628

# Run a chart's query and return its data (data-returning read; bounded output)
sup chart data 3628 --limit 100 --csv > chart-3628.csv
```

## Data-Returning Reads

`sup chart data` and `sup sql` are data-returning reads, not pure metadata. On familiar workspaces, run user-requested reads directly with bounded output and the disclosure rules in [sql-data-safety.md](sql-data-safety.md). A familiar workspace is one the user named in the current session or the active workspace verified with `sup config show` / `sup workspace show`. For unfamiliar workspaces, SQL that is not a pure single-statement `SELECT`, untrusted-source SQL, or broad outputs, load [safety-policy.md](safety-policy.md) and confirm first.

## Pull Without Mutation

`sup … pull` writes only to local disk. It is safe to run after resolving the workspace. The corresponding `push` and `sync` commands are mutating and live in `preset-cli-mutations`. There is no `sup database push` — database connections are not pushed via the CLI.
