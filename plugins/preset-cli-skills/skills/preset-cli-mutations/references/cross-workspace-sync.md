# Cross-Workspace Sync

Use this reference for cross-workspace promotion via `sup sync create`, `sup sync run`, and `sup sync validate`.

## Sync Commands

| Command | Effect |
|---|---|
| `sup sync create <dir> --source <id> --targets <ids>` | Scaffold a sync configuration that exports assets from the source workspace and pushes them to one or more target workspaces. |
| `sup sync run <dir> --dry-run` | Preview the sync without writing to any target. Required before any real `sup sync run`. |
| `sup sync run <dir>` | Execute the sync: pulls from source, applies Jinja2 templating, pushes to targets. |
| `sup sync run <dir> --pull-only` | Pull from source into the local directory only; safe inspection step. |
| `sup sync validate <dir>` | Validate the sync configuration without executing any pull or push. |

## Source vs. Target

Every sync has exactly one source workspace and one or more target workspaces:

- **Source**: the workspace whose assets are exported. Reading is non-destructive; the source is unaffected by `sup sync run`.
- **Target**: each workspace that receives the pushed assets. Targets are mutated: charts, dashboards, datasets, and database connections may be created, updated, or overwritten.

Sync operations are always overwrite-style at the target — sync's design assumption is that the target should match the source. There is no `overwrite=false` mode for sync once it runs.

For Jinja2 target context, rollback expectations, and multi-target escalation, load [sync-templating-and-rollback.md](sync-templating-and-rollback.md).

## Sync Workflow

1. `sup sync validate <dir>` to validate the sync configuration before any run.
2. `sup sync run <dir> --dry-run` to preview the asset list per target.
3. Summarize the target effects (assets created/updated/overwritten per target) and the rollback expectations — sync is overwrite-style with no `overwrite=false`, so state how each target would be restored if the result is wrong.
4. Stop before execution and present the dry-run with the confirmation template from [confirmation-template.md](confirmation-template.md); wait for typed confirmation.
5. After typed confirmation, run `sup sync run <dir>` without `--dry-run` to execute the sync.

Run the dry-run for every sync, even repeated syncs of the same configuration. Source assets evolve; the dry-run is the only way to see what will actually change in this run.

For rollback and multi-target blast-radius details, load [sync-templating-and-rollback.md](sync-templating-and-rollback.md).
