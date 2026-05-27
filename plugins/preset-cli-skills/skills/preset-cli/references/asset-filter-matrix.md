# Asset List Filter Matrix

Use this reference before composing a `sup ... list` command with filters.

Filter availability is per-entity, not universal.

| Entity | `--id` | `--ids` | `--search` | `--name` | `--mine` | `--limit` | Other |
|---|---|---|---|---|---|---|---|
| `chart` | yes | yes | yes (multi-field) | no | yes | yes | `--dashboard-id`, `--dataset-id`, `--viz-type`, `--team` |
| `dashboard` | yes | yes | yes (title/slug) | no | yes | yes | `--published`, `--draft`, `--folder` |
| `dataset` | yes | yes | yes (table name) | no | yes | yes | `--database-id`, `--schema`, `--table-type`, `--team` |
| `query` | yes | no | no | yes (label pattern, wildcards) | yes | yes | `--database-id`, `--schema` |
| `database` | no | no | no | no | no | no | output flags + `--workspace-id` only |
| `user` | no | no | no | no | no | yes | output flags + `--workspace-id` only |

`--workspace-id <id>` (long form) or `-w <id>` (short form) is accepted on every `list` command for per-command workspace override. Output flags (`--json`, `--yaml`, `--porcelain`) are also universal; see [output-formats.md](output-formats.md).

Do not emit invalid combinations such as `sup database list --mine`, `sup user list --search`, or `sup query list --search`. For saved queries, use `--name "<pattern>"` with wildcards rather than `--search`.
