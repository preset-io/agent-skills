# Confirmation and Preview Template

Use this template for every mutating `sup` invocation, single-workspace or cross-workspace. Always preview first.

## Required Steps

1. **Preview.** Use the native `--dry-run` flag where it exists: `sup sync run --dry-run`, `sup user push --dry-run`, `sup user invite --dry-run`. For `sup chart push` / `sup dashboard push` / `sup dataset push` (which do not expose `--dry-run`), pull the current target state with the matching `sup … pull` command and diff against the assets folder; capture the diff. Either way, capture the full preview output.
2. **Summarize.** Fill out the confirmation template below with the preview results.
3. **Wait.** Pause for explicit user confirmation that names the target workspace by its human-readable name. If the run uses `--force` or `--overwrite`, the confirmation message must also contain the literal flag strings (`--force`, `--overwrite`).
4. **Execute.** Run the mutating command only after the confirmation is received.
5. **Record.** Log the preview summary, the user's confirmation, and the resulting `sup` exit code in a place that survives the agent session (PR description, ticket comment, run log).

## Confirmation Template

```
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
  Jinja context:   <env=production, region=us-east-1, …>   # sync only
  Rollback plan:   <git revert + re-run | manual UI fix | snapshot restore | …>
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
- A required dataset push references a database connection the user did not authorize (dataset push pushes its referenced database first).

## Always Dry-Run

Always preview before any mutating run. The native `--dry-run` flag is available on `sup sync run`, `sup user push`, and `sup user invite`; use it there. For `sup chart push`, `sup dashboard push`, and `sup dataset push` (which do not expose a native `--dry-run`), the agent must pull the target workspace's current state with the matching `sup … pull` command and diff against the assets folder. The pull-and-diff substitute is required, not optional, for those three. Do this for every mutating run, even operations the agent has run before in the same session — source workspaces evolve, target workspaces drift, and the preview is the only mechanism that surfaces the actual delta about to be applied.

## Audit-Log Expectations

Every mutating `sup` run leaves a trace in the target workspace's audit log. The agent should:

- Record the timestamp and operator before running.
- Capture the `sup` exit code afterward.
- Note where the corresponding audit log can be reviewed (the workspace audit log in Preset Manage, or the Management API audit endpoints).

## Chain to Safety Policy

After the confirmation template is shown and before the mutating run executes, load [../../preset-cli/references/safety-policy.md](../../preset-cli/references/safety-policy.md) so the disclosure, confirmation, and rollback expectations are recorded against the CLI safety policy. This skill is for CLI workflows only; if the user wants direct HTTP mutations, route to the separate `preset-api-skills` package instead.
