---
name: preset-cli-mutations
description: State-changing Preset `sup` CLI operations — single-workspace writes (`sup chart push`, `sup dashboard push`, `sup dataset push`, `--force`/`--overwrite`) and cross-workspace promotion (`sup sync create/run/validate`). Use only for CLI mutation workflows; Do not use for MCP-only work or for direct HTTP/SDK mutations.
---

# preset-cli-mutations

Use for state-changing CLI operations: single-workspace writes (push, --force, --overwrite) and cross-workspace promotion (sync).

## Always

- Use `preset-cli` first to establish auth, workspace, and output context.
- CLI mutation surface only; route HTTP mutations to `preset-api-skills`.
- Preview before execution: native `--dry-run` for `sup sync run`, `sup user push`, and `sup user invite`; pull-and-diff for `sup chart push` / `sup dashboard push` / `sup dataset push` (no native `--dry-run`).
- Identify source AND target workspace explicitly before any cross-workspace operation.
- Require explicit typed user confirmation that contains the literal `--force` / `--overwrite` flag string when applicable.
- Redact tokens and credential-bearing output in transcripts.

## Decision Rules

- Distinguish single-workspace writes (`sup chart/dashboard/dataset push`) from cross-workspace sync (`sup sync run`).
- Treat `--force` and `--overwrite` as destructive flags; never invoke without explicit per-flag confirmation.
- Do not let CI / automation context bypass the confirmation step; refuse if no interactive operator is available.
- Route HTTP mutations to the API plugin; route MCP-driven workflows to the MCP plugin.

## Workflow Order

1. Resolve source and (if cross-workspace) target workspace.
2. Preview / diff to surface what will change.
3. Summarize asset counts, effects, and any destructive flags.
4. Ask for typed confirmation containing the literal destructive flag string.
5. Stop before execution and wait for the typed confirmation.
6. Execute only after confirmation.

## Retrieve

- Single-workspace writes (push, `--overwrite`, `--force`, dependency handling): [references/write-operations.md](references/write-operations.md)
- Cross-workspace promotion (sync, source/target, Jinja2, `--dry-run`): [references/cross-workspace-sync.md](references/cross-workspace-sync.md)
- Confirmation template and dry-run handling: [references/confirmation-and-dry-run.md](references/confirmation-and-dry-run.md)
- Approval gates, redaction, abort triggers: [../preset-cli/references/safety-policy.md](../preset-cli/references/safety-policy.md)
