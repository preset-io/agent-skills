# Registered `sup` Command Coverage

Use this reference before composing a command from a `sup` group that is not covered by a focused reference. The goal is to prevent agents from guessing command semantics when the CLI exposes more commands than this package documents in detail.

## Coverage Status

| Command group | Status | Routing |
|---|---|---|
| `sup config auth`, `sup config show` | Covered | Use [install-and-auth.md](install-and-auth.md) and [config-precedence.md](config-precedence.md). Treat config output as sensitive metadata. |
| `sup config set`, `sup config init` | Covered with local-context caution | Use [workspace-and-config.md](workspace-and-config.md). Explain whether the change writes global config or project-local state before running. |
| `sup workspace list/use/info/show` | Covered | Use [workspace-and-config.md](workspace-and-config.md). Bare `workspace use` is project-local unless `--persist` is supplied. |
| `sup workspace set-target` | Covered with mutation-adjacent caution | Use [workspace-and-config.md](workspace-and-config.md), then `preset-cli-mutations` before any command that writes to the target workspace. |
| `sup database list/use/info/pull` | Covered | Use [assets-read.md](assets-read.md) and [workspace-and-config.md](workspace-and-config.md). `database use` changes local context; it does not mutate a workspace asset. |
| `sup dataset list/info/pull` | Covered | Use [assets-read.md](assets-read.md) and [asset-filter-matrix.md](asset-filter-matrix.md). |
| `sup chart list/info/sql/data/pull` | Covered | Use [assets-read.md](assets-read.md). For `chart data`, load [sql-data-safety.md](sql-data-safety.md). |
| `sup dashboard list/info/pull` | Covered | Use [assets-read.md](assets-read.md) and [asset-filter-matrix.md](asset-filter-matrix.md). |
| `sup query list/info` | Covered | Use [saved-query-reads.md](saved-query-reads.md). Saved query SQL text can be sensitive. |
| `sup user list/info/pull` | Covered | Use [assets-read.md](assets-read.md). User metadata can include role and team membership context. |
| `sup sql` | Covered | Use [sql-and-query.md](sql-and-query.md) and [sql-data-safety.md](sql-data-safety.md). Treat as data-returning even for read-only SQL. |
| `sup chart/dashboard/dataset push` | Covered with mutation gates | Stop and load `preset-cli-mutations`; use its write preview, diff, and confirmation references. |
| `sup user push/invite` | Covered with mutation gates | Stop and load `preset-cli-mutations`; these commands expose native `--dry-run` and require confirmation before execution. |
| `sup sync create/validate/run` | Covered with mutation gates | Use `preset-cli-mutations`. `validate` is non-mutating; `run` can mutate every configured target workspace. |
| `sup sync native` | Known but not operationally covered | Treat as high-risk mutation. It can push assets from a directory, use `--overwrite` / `--force`, and accept database password inputs. Stop and ask whether to proceed with an explicit CLI mutation plan or switch to API import guidance. |
| `sup theme list/pull` | Known but not operationally covered | Treat like asset read/export. Confirm workspace and output path, then prefer `--json` / `--porcelain` for automation. |
| `sup theme push` | Known but mutation-gated | Treat like an asset write with overwrite risk. Stop and ask for a preview/confirmation plan before running. |
| `sup role pull` / `sup rls pull` / `sup ownership pull` | Known but not operationally covered | Treat as governance/security export. Confirm workspace and destination; avoid pasting full role, RLS, or ownership payloads into shared transcripts. |
| `sup role push/sync`, `sup rls push`, `sup ownership push` | Known but mutation-gated | Governance/security mutations. Require native `--dry-run` when available, summarize the affected roles/rules/assets, and get explicit confirmation before execution. |
| `sup group list` | Known but not operationally covered | Team/SCIM metadata read. Confirm team and limit output; do not paste full membership payloads unless requested. |
| `sup group sync/create` | Known but mutation-gated | Team/SCIM mutation. Require dry-run or preview where available, summarize group and member counts, and get explicit confirmation before execution. |
| `sup dbt core/cloud/list-models` | Known but not operationally covered | Advanced integration workflow. Run only when the user explicitly asks for dbt metadata sync or model discovery; otherwise stop and ask. |

## Rules for Uncovered Commands

- Do not invent examples for command groups marked "known but not operationally covered".
- For any `push`, `sync`, `create`, import, overwrite, or force-style command not covered by a focused reference, stop before execution and ask for an explicit mutation plan.
- For any command that can return row-level data, SQL text, role/RLS configuration, ownership, user, group, or team membership data, summarize or write to a file rather than pasting full payloads into chat.
- Prefer `sup <group> <command> --help` when the user asks for syntax for a known-but-undocumented group, then quote only the relevant flags needed for the task.
