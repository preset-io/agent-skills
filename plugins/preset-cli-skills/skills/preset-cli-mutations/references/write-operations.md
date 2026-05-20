# Single-Workspace Write Operations

Use this reference for `sup` commands that create, update, or overwrite assets within a single workspace.

## Mutating Commands

| Command | Effect |
|---|---|
| `sup chart push` | Push chart YAML from filesystem into the workspace; creates or updates charts. Supports `--overwrite` and `--force`. |
| `sup dashboard push` | Push dashboard YAML; creates or updates dashboards. Supports `--overwrite`. |
| `sup dataset push` | Push dataset YAML; pushes database dependencies first, then datasets. Supports `--overwrite`. |
| `sup chart push --overwrite` | Overwrite existing charts matching the local IDs/UUIDs. |
| `sup chart push --force` | Skip the CLI's interactive confirmation prompt. Treat this as elevated permission. |

There is no `sup database push` — database connections are not mutated through the CLI's push surface. Dataset push will push the database connection referenced by the dataset YAML, so creating a dataset that references a new database can result in a new database connection being created in the workspace; flag that explicitly in the confirmation step.

There is no general `sup … delete` surface. If a user asks to delete an asset via the CLI, stop and route to the separate `preset-api-skills` package (where the Phase 5 mutation skills live) rather than fabricating a CLI command.

## `--force` and `--overwrite` Semantics

- `--overwrite` matches assets by ID/UUID and replaces their bodies wholesale. Custom edits made in the target workspace UI are lost.
- `--force` is currently surfaced on `sup chart push`. It skips the interactive confirmation prompt inside `sup`. It does **not** skip the confirmation required by this skill; an agent must still present the confirmation template from [confirmation-and-dry-run.md](confirmation-and-dry-run.md) before invoking `--force`.
- Combining `--overwrite --force` on a chart push is the most destructive single-workspace combination available via the CLI. Refuse to run it without the literal target workspace name and the literal flag string(s) in the user's confirmation message.

## Pushed-Dependency Behavior

- `sup chart push` pushes the chart definitions in the assets folder. Dataset and database YAML files that the chart references must already exist (in the workspace or in the assets folder for the same push). Chart push does not silently create database connections.
- `sup dataset push` pushes datasets and, per upstream behavior, pushes referenced database connections first. This means pushing a dataset can create or update a database connection in the target workspace.
- `sup dashboard push` pushes dashboards and the chart/dataset YAML they reference; the same dataset-then-database dependency applies if those YAML files are present in the assets folder.

Always run the assets-folder discovery step first (`ls assets/`, `sup chart pull` against the target if needed) so the agent can summarize exactly which entity types will be touched.

## Ownership Caveats

- Asset ownership in the target workspace may be reassigned to the pushing user. Confirm whether the user wants ownership preserved before running.
- Dashboards inherit chart ownership; pushing a dashboard can transfer ownership of every embedded chart.

## Pre-Push Checklist

`sup chart push` and `sup dashboard push`/`sup dataset push` do not currently expose a `--dry-run` flag (only `sup sync run` does). Before invoking a single-workspace push the agent must instead:

1. Confirm the target workspace name and ID with the user.
2. Inventory the assets folder (`ls`, `head`) and pull the current target state with `sup chart pull` / `sup dataset pull` / `sup dashboard pull` for diff. Present the diff between local YAML and pulled-target YAML.
3. Confirm whether `--overwrite` is required and why.
4. Confirm whether `--force` is required and why interactive confirmation must be skipped.
5. Load [confirmation-and-dry-run.md](confirmation-and-dry-run.md) and present the template.

Only after explicit user confirmation that names the target workspace (and names every `--force` / `--overwrite` flag the run will use) should the agent execute the mutating run.
