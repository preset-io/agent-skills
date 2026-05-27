# `sup` Configuration Precedence

Use this reference when a command depends on credentials, workspace IDs, database IDs, assets folders, or target workspace context.

`sup` resolves configuration with two different precedence chains depending on the field. The CLI's own `sup config` help text shows env > global > project for everything, but upstream `src/sup/config/settings.py` only follows that order for credentials. For workspace, database, assets-folder, and target-workspace context, project state shadows global config.

## Credentials

`SUP_PRESET_API_TOKEN` and `SUP_PRESET_API_SECRET` resolve as env -> global:

1. `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET` environment variables.
2. Global `~/.sup/config.yml`.

There is no project-local credential store; tokens live in env or `~/.sup/config.yml`.

## Context Fields

Workspace ID, database ID, assets folder, and target workspace resolve as override -> env -> project -> global:

1. Per-command CLI override (`--workspace-id`, `--database-id`, etc.).
2. `SUP_*` environment variables such as `SUP_WORKSPACE_ID`.
3. Project-local `.sup/state.yml`.
4. Global `~/.sup/config.yml`.

So an agent that runs `sup config set workspace-id 123` (writes to `~/.sup/config.yml`) and then `sup workspace use 456` (writes to `.sup/state.yml` by default) will see workspace 456 win in the current directory. Project-local state shadows the global default.

## Verification

Always verify active values with `sup config show` before relying on a precedence claim; it prints resolved values, not the precedence chain. In handoffs, record whether credentials and context came from environment, project state, or global config when running in CI.
