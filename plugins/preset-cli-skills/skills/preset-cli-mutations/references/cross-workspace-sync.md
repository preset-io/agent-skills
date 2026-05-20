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

## Jinja2 Templating

Sync configurations support Jinja2 templating so a single source can produce environment-specific targets:

```yaml
target_defaults:
  jinja_context:
    company: Default Company
    region: us-east-1

targets:
  - workspace_id: 456
    name: production
    jinja_context:
      environment: production
  - workspace_id: 789
    name: staging
    jinja_context:
      environment: staging
```

Templating runs after the source pull and before each target push. Template errors surface during `sup sync validate` and `sup sync run --dry-run`; never run a real sync that has not first cleanly validated.

## Dry-Run and Diff Inspection

1. `sup sync validate <dir>` to confirm configuration parses cleanly.
2. `sup sync run <dir> --dry-run` to preview the asset list per target.
3. Capture the dry-run output and present it to the user with the confirmation template from [confirmation-and-dry-run.md](confirmation-and-dry-run.md).

Run the dry-run for every sync, even repeated syncs of the same configuration. Source assets evolve; the dry-run is the only way to see what will actually change in this run.

## Rollback Story

Sync does not provide an automatic rollback. The accepted recovery model is:

- The sync configuration directory lives in git; the previous commit represents the previous source state.
- To roll back, revert the sync directory to the prior commit and run `sup sync run` again with the same targets.
- For assets edited directly in the target UI between syncs, those edits are lost on the next overwrite-style sync. Document this in the confirmation step.

Never describe sync as "safe to retry without thinking" — it is safe to retry only if the user has accepted the overwrite semantics.

## Multi-Target Blast Radius

A single `sup sync run` can mutate every target workspace listed in the configuration. Before executing:

1. Confirm every target workspace by name (not just ID).
2. Confirm the asset counts per target from the dry-run output.
3. Confirm whether any target hosts production-facing dashboards; if so, escalate the confirmation step in [confirmation-and-dry-run.md](confirmation-and-dry-run.md).
