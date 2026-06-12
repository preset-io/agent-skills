# Workspace Selection and Configuration

Use this reference when listing workspaces, switching the active workspace, or overriding the workspace for a single command.

## Inspect Configuration

```bash
sup config show          # Active workspace, target workspace, auth status
```

`sup config show` is the safe first call when an agent needs to verify which workspace will receive subsequent commands. Resolve the workspace before data-returning reads; a familiar workspace is one the user named in the current session or the active workspace verified with `sup config show` / `sup workspace show`. Confirm for unfamiliar workspaces, broad outputs, or operations that could be construed as state-changing. There is no `sup config list`; use `show` for current settings.

Do not run a "dump all env vars" command in agent transcripts. `SUP_PRESET_API_TOKEN` and `SUP_PRESET_API_SECRET` are sensitive; if a user needs to debug their environment, ask them to run `env | grep SUP_` themselves, locally, and to redact any token/secret values before sharing the output. The agent should not enumerate `SUP_*` environment variables on the user's behalf.

## List and Choose Workspaces

```bash
sup workspace list --json
sup workspace use <workspace-id>             # Project-local: writes to .sup/state.yml in the current directory
sup workspace use <workspace-id> --persist   # Global: writes to ~/.sup/config.yml (short form: -p)
sup workspace show                # Display source + target workspace context
sup workspace info <workspace-id> # Inspect a single workspace
```

`sup workspace use` accepts a numeric workspace ID, a workspace URL (e.g. `https://myworkspace.us1a.app.preset.io/`), or a bare hostname. **Without `--persist`, the selection is project-local** — `sup` writes to `.sup/state.yml` in the current directory and the CLI reports "Using workspace `{id}` for this project". Pass `--persist` (or `-p`) to save the selection to the global `~/.sup/config.yml`. For ephemeral overrides in CI or scripts, prefer the env var `SUP_WORKSPACE_ID=<id>` instead of either persistence mode.

Pair with `sup workspace list --json` to discover IDs before calling `use`.

## Set Configuration Values

```bash
sup config set workspace-id 123
sup config set target-workspace-id 456    # cross-workspace operations; see preset-cli-mutations
```

`target-workspace-id` is only meaningful for push/sync workflows; it has no effect on read commands. Setting a target workspace does not authorize a mutation — it is still gated by `preset-cli-mutations`.

## Per-Command Override

For one-off operations against a non-default workspace, prefer the per-command flag over editing config:

```bash
sup chart list --workspace-id 456 --json
sup dataset list --workspace-id 789 --search="orders" --json
```

The flag accepts `--workspace-id <id>` (long form) or `-w <id>` (short form). Per-command overrides keep `~/.sup/config.yml` stable for the user's interactive session and make agent intent explicit in scripts and CI logs.

For file locations and context precedence, load [config-precedence.md](config-precedence.md). Do not commit `.sup/state.yml` if it pins workspaces that other contributors should not inherit; add it to `.gitignore` instead.

## Verifying Workspace Before Mutations

Before chaining to `preset-cli-mutations` for any push or sync, the agent must:

1. Run `sup config show` (or `sup workspace show`) and record the source and target workspace.
2. Confirm both with the user by name (not just ID).
3. Hand off to `preset-cli-mutations` only after the user confirms.
