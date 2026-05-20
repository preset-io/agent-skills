---
name: preset-cli-mutations
description: State-changing operations via Preset's `sup` CLI — single-workspace writes (`sup chart push`, `sup dashboard push`, `sup dataset push`, `--force`/`--overwrite` mutators) and cross-workspace promotion (`sup sync create/run/validate`). Loads confirmation templates and secret-handling guardrails by construction. Use only for CLI workflows when the user explicitly asks to push, sync, or overwrite Preset state via the `sup` CLI. Do not use for MCP-only work. Always preview first (`sup sync run --dry-run` for sync; pull-and-diff for chart/dashboard/dataset push, which have no native dry-run); always present source workspace, target workspace, and asset counts before executing.
---

# preset-cli-mutations

Use this skill for any `sup` invocation that changes Preset state, locally or across workspaces.

## Workflow

1. Confirm workspace context first via [../preset-cli/references/workspace-and-config.md](../preset-cli/references/workspace-and-config.md) so the source and target workspace are named and recorded before any mutation work.
2. Classify the requested operation: single-workspace write → load [references/write-operations.md](references/write-operations.md); cross-workspace promotion → load [references/cross-workspace-sync.md](references/cross-workspace-sync.md).
3. Preview before executing: for `sup sync run`, run `--dry-run` and capture the diff; for `sup chart push` / `sup dashboard push` / `sup dataset push` (which do not expose `--dry-run`), pull the target workspace's current state and diff against the assets folder.
4. Load [references/confirmation-and-dry-run.md](references/confirmation-and-dry-run.md), populate the confirmation template with source workspace, target workspace, asset IDs/types, preview/diff summary, and any `--force` / `--overwrite` flags, then present it to the user.
5. Execute only after the user types an explicit confirmation that names the target workspace and includes the literal flag string for every destructive flag the run will use.
6. Load [../preset-cli/references/safety-policy.md](../preset-cli/references/safety-policy.md) to record the disclosure and confirmation. This skill is for CLI workflows only; if the user wants direct HTTP mutations, route to the separate `preset-api-skills` package instead.

## Core Rules

- Refuse to execute a mutating `sup` command without a prior preview: `--dry-run` for sync, or a pull-and-diff against the target workspace for chart/dashboard/dataset push.
- Refuse to execute without an explicit confirmation that names the target workspace (ID and human-readable name).
- Refuse `--force` without typed confirmation containing the literal string `--force` and the target workspace name. Refuse `--overwrite` without typed confirmation containing the literal string `--overwrite` and the target workspace name. Refuse `--overwrite --force` together without both flag strings present in the confirmation message.
- Never bypass the confirmation step by claiming the call site is "automation" or "CI"; CI must encode the confirmation in code-reviewable configuration, not skip it.
- Redact tokens, refresh tokens, database passwords, and any credential surfaced in `sup` output before sharing transcripts, logs, or screenshots.
