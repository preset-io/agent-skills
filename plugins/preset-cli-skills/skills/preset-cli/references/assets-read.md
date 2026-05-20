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

## List Filters by Entity

Filter availability is per-entity, not universal. Verify against this matrix before composing a `list` command:

| Entity | `--id` | `--ids` | `--search` | `--name` | `--mine` | `--limit` | Other |
|---|---|---|---|---|---|---|---|
| `chart` | ✓ | ✓ | ✓ (multi-field) | — | ✓ | ✓ | `--dashboard-id`, `--dataset-id`, `--viz-type`, `--team` |
| `dashboard` | ✓ | ✓ | ✓ (title/slug) | — | ✓ | ✓ | `--published`, `--draft`, `--folder` |
| `dataset` | ✓ | ✓ | ✓ (table name) | — | ✓ | ✓ | `--database-id`, `--schema`, `--table-type`, `--team` |
| `query` | ✓ | — | — | ✓ (label pattern, wildcards) | ✓ | ✓ | `--database-id`, `--schema` |
| `database` | — | — | — | — | — | — | output flags + `--workspace-id` only |
| `user` | — | — | — | — | — | ✓ | output flags + `--workspace-id` only |

`--workspace-id <id>` (long form) or `-w <id>` (short form) is accepted on every `list` command for per-command workspace override. Output flags (`--json`, `--yaml`, `--porcelain`) are also universal; see [output-formats.md](output-formats.md).

Do not assume a filter exists on an entity it is not listed for; `sup database list --mine`, `sup user list --search`, and `sup query list --search` will all error. For saved queries specifically, use `--name "<pattern>"` (supports wildcards) rather than `--search`.

## Common Read Patterns

```bash
# Discover and inventory
sup workspace list --json
sup dashboard list --mine --json --limit 100
sup chart list --search="revenue" --json
sup dataset list --search="users" --json

# Detail
sup chart info 3628 --json
sup dashboard info 254 --json

# Compiled SQL behind a chart (no execution)
sup chart sql 3628

# Run a chart's query and return its data (data-returning read; confirm scope)
sup chart data 3628 --csv > chart-3628.csv
```

## Data-Returning Reads

`sup chart data` and `sup sql` are **data-returning reads**, not pure metadata. Even though they do not change workspace state, they can expose customer data. Before running these on an unfamiliar workspace, confirm with the user:

- The workspace and chart/query target.
- The row volume expected (use `--limit` to cap).
- The destination of the output (local file, agent transcript, downstream pipeline).

Then chain to [safety-policy.md](safety-policy.md) to record the disclosure.

## Pull Without Mutation

`sup … pull` writes only to local disk. It is safe to run after confirming the workspace. The corresponding `push` and `sync` commands are mutating and live in `preset-cli-mutations`. There is no `sup database push` — database connections are not pushed via the CLI.
