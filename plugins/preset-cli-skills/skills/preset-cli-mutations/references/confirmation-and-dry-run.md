# Confirmation and Preview Overview

Use this reference to choose the preview and confirmation path for every mutating `sup` invocation. Load [preview-and-dry-run.md](preview-and-dry-run.md) for preview mechanics and [confirmation-template.md](confirmation-template.md) for the operator-facing template.

## Required Steps

1. **Preview.** Use the native `--dry-run` flag where it exists: `sup sync run --dry-run`, `sup user push --dry-run`, `sup user invite --dry-run`. For `sup chart push` / `sup dashboard push` / `sup dataset push`, pull the current target state with the matching `sup ... pull` command and diff against the assets folder.
2. **Summarize.** Fill out the confirmation template from [confirmation-template.md](confirmation-template.md) with the preview results.
3. **Wait.** Pause for explicit user confirmation that names the target workspace by its human-readable name. If the run uses `--force` or `--overwrite`, the confirmation message must also contain the literal flag strings (`--force`, `--overwrite`).
4. **Execute.** Run the mutating command only after the confirmation is received.
5. **Record.** Log the preview summary, the user's confirmation, and the resulting `sup` exit code in a place that survives the agent session (PR description, ticket comment, run log).

## Always Dry-Run

Always preview before any mutating run. The native `--dry-run` flag is available on `sup sync run`, `sup user push`, and `sup user invite`; use it there. For `sup chart push`, `sup dashboard push`, and `sup dataset push`, use pull-and-diff. See [preview-and-dry-run.md](preview-and-dry-run.md).

## Audit-Log Expectations

Every mutating `sup` run leaves a trace in the target workspace's audit log. The agent should:

- Record the timestamp and operator before running.
- Capture the `sup` exit code afterward.
- Note where the corresponding audit log can be reviewed (the workspace audit log in Preset Manage, or the Management API audit endpoints).

## Chain to Safety Policy

After the confirmation template is shown and before the mutating run executes, load `preset-cli` and then `references/safety-policy.md` so the disclosure, confirmation, and rollback expectations are recorded against the CLI safety policy. This skill is for CLI workflows only; if the user wants direct HTTP mutations, route to the separate `preset-api-skills` package instead.
