# Mutation Preview and Dry-Run Handling

Use this reference before any state-changing `sup` command.

## Native Dry-Run

Use native `--dry-run` for commands that expose it:

```bash
sup sync run <dir> --dry-run
sup user push --dry-run
sup user invite --dry-run
```

Capture the full dry-run output, redact credentials, and summarize the target workspace, affected entities, and any destructive flags before asking for confirmation.

## Pull-and-Diff Substitute

`sup chart push`, `sup dashboard push`, and `sup dataset push` do not expose native `--dry-run`. For those commands:

1. Confirm the target workspace name and ID.
2. Pull the current target state with the matching `sup chart pull`, `sup dashboard pull`, or `sup dataset pull` command.
3. Diff the pulled target YAML against the local assets folder.
4. Summarize changed entity counts, IDs/UUIDs, database dependencies, `--force`, and `--overwrite`.
5. Load [confirmation-template.md](confirmation-template.md) and wait for explicit confirmation.

The pull-and-diff substitute is required, not optional. Run it even when the same assets were previewed earlier in the session because source and target workspaces can drift.

## Failure Handling

Stop before execution when the preview fails, returns an unexpected empty diff, shows assets outside the requested scope, or exposes credentials that cannot be redacted cleanly.
