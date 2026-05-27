# CLI Mutation Confirmation Template

Use this template after previewing a mutating command and before execution.

```text
About to run a state-changing `sup` command.

  Operation:       <sup chart push | sup dashboard push | sup dataset push | sup user push | sup user invite | sup sync run>
  Source ws:       <name> (id: <id>)             # for sync; omit otherwise
  Target ws:       <name> (id: <id>)             # required
  Assets to push:  <count> charts, <count> dashboards, <count> datasets, <count> databases, <count> users, <count> invites
                   # include only the entity counts the operation actually touches.
                   # note: dataset push pushes referenced database connections first.
                   # note: sup user invite creates invite records; sup user push updates user records.
  Asset IDs/UUIDs: <comma-separated list or "see preview output above">
  Overwrite:       <yes / no>
  --force:         <yes / no>                    # skips interactive prompts inside sup (chart/dashboard/dataset push)
  Jinja context:   <env=production, region=us-east-1, ...>   # sync only
  Rollback plan:   <git revert + re-run | manual UI fix | snapshot restore | ...>
  Audit trail:     <PR/ticket/run-log location>

Preview output (native --dry-run for sync / user push / user invite, or pull-and-diff for chart/dashboard/dataset push):
<paste the preview output, redacted of any tokens or credentials>

To proceed, reply with the literal target workspace name: "<name>".
If this run uses --force or --overwrite, your reply MUST also contain the
literal flag string(s): "<--force>", "<--overwrite>", or both.
Reply anything else, or omit the workspace name or any required flag string,
to abort.
```

## Abort Triggers

Abort and do not execute when any of the following holds:

- The user did not type the exact target workspace name.
- The user's confirmation message does not contain the literal `--force` string when `--force` is part of the planned command, or does not contain the literal `--overwrite` string when `--overwrite` is part of the planned command.
- The preview failed, errored, or produced an empty diff that the user did not expect.
- The preview shows changes outside the asset set the user described.
- The target workspace is production and the user has not confirmed production scope explicitly.
- Tokens, passwords, or database credentials appeared anywhere in the preview output and have not been redacted from the transcript.
- A required dataset push references a database connection the user did not authorize.
