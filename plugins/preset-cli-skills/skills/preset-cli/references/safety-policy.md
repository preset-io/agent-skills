# CLI Safety Policy

<!-- gate-policy v2 -->

Use this reference before mutations, SQL that is not a pure single-statement `SELECT`, untrusted-source SQL, unfamiliar workspaces, or broad outputs. It is the local, CLI-flavored safety policy for this package; it does not link out to other plugins so this package remains independently installable. Gates scale with blast radius, reversibility, and disclosure sensitivity — data-returning reads on familiar workspaces that the user asked for run directly with bounded output.

## Default Posture

- Default to non-destructive reads: `sup … list`, `sup … info`, `sup … pull`, `sup workspace show`, `sup config show`.
- Treat `sup chart data` and `sup sql` as data-returning reads: they can expose customer data even though they do not change workspace state.
- Treat every push, sync, `--force`, and `--overwrite` invocation as state-changing. Refuse to execute these directly from `preset-cli`; route to `preset-cli-mutations`, which loads its confirmation template by construction.
- A familiar workspace is one the user named in the current session or the active workspace verified with `sup config show` / `sup workspace show`; if the workspace cannot be proven from that context, treat it as unfamiliar.

## Confirmation Required

Before any of the following, summarize the exact target, payload, and expected effect, then get explicit user confirmation:

- `sup chart push`, `sup dashboard push`, `sup dataset push` (single-workspace writes).
- Any `--force` or `--overwrite` invocation.
- `sup sync run` against any target workspace.
- `sup chart data <id>` or `sup chart data <id> --csv|--json` on an unfamiliar workspace (data-returning read).
- `sup sql "<query>"` that runs against an unfamiliar workspace, or any SQL statement that is not a pure single-statement `SELECT`.
- Exporting query rows or chart data to a destination other than a local file the user already named.

For mutations, the confirmation must name the target workspace by its human-readable name. If `--force` or `--overwrite` is part of the planned command, the confirmation must also contain the literal flag strings.

## Secret Hygiene

- Never paste `SUP_PRESET_API_TOKEN`, `SUP_PRESET_API_SECRET`, or any bearer token onto a command line. Use environment variables or `sup config auth`.
- Do not enumerate `SUP_*` environment variables on the user's behalf. If a user needs to debug their environment, ask them to run `env | grep SUP_` themselves, locally, and redact any token/secret values before sharing the output. The agent must not run any "dump all env vars" command in a shared transcript.
- Do not commit `~/.sup/config.yml` or any `.sup/state.yml` that contains stored credentials.
- Redact access tokens, refresh tokens, JWTs, database passwords, SQLAlchemy URIs, and signed guest tokens in transcripts, screenshots, PR comments, and CI logs.
- When dataset push pushes a referenced database connection, treat the database connection as a credential-bearing surface even if `sup` does not print the secret.

## Cross-Workspace Sync

`sup sync run` can mutate every target workspace listed in the configuration in a single command. Before executing:

- Confirm each target workspace by name (not just ID).
- Confirm the asset counts per target from the dry-run output.
- Confirm whether any target hosts production-facing dashboards; if so, escalate the confirmation.
- Recognize the rollback model: there is no automatic rollback. The sync configuration in git is the source of truth; recovery means reverting the sync directory in git and rerunning.

## Pull-and-Diff for Entity Push

`sup chart push`, `sup dashboard push`, and `sup dataset push` do **not** expose a native `--dry-run` flag. The CLI commands that do expose native `--dry-run` are `sup sync run`, `sup user push`, and `sup user invite` — use the native flag there. For chart/dashboard/dataset push, the agent must pull the current target state with the matching `sup … pull` command and diff against the assets folder, then present the diff as the preview. Skipping this step is equivalent to skipping `--dry-run` on a sync, and is refused by `preset-cli-mutations`.

## Headless / CI Contexts

- Row-returning data exports (`sup sql`, `sup chart data`) need explicit row/output bounds in the command or script.
- Full workspace/asset exports need an explicit destination and disclosure handling (where the archive lands, who can read it) — row limits are not required for full exports.
- Destructive operations (push, sync, `--force`, `--overwrite`) always require an interactive operator; CI or automation context never bypasses the confirmation step.

## Transcripts and Audit Trail

- Record the resolved workspace ID and name before running anything mutating.
- Capture the `sup` exit code after every mutating run.
- Note the audit log location in the target workspace so the operator can review the change there.

## When to Stop

If a CLI workflow cannot satisfy the request safely - because the required preview is missing, because a credential would have to be inlined, or because the user has not named the target workspace - stop and ask. Do not silently fall back to direct HTTP or to MCP tools; surface the limitation and let the user choose the next surface explicitly.
