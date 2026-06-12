---
name: preset-cli
description: Drive Preset's `sup` CLI (PyPI package `superset-sup`) for shell, scripting, CI/CD, and agent-driven Preset workflows. Use only for CLI workflows; Do not use for MCP-only work or for direct HTTP/SDK code paths.
---

# preset-cli

Use as the foundation for shell, scripting, CI/CD, and agent-driven Preset workflows through the `sup` CLI.

## Always

- CLI surface only; stay on MCP or direct API if that's what the user requested.
- Default to `--json` for automation and agent consumption.
- Keep `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET` out of command lines and shared output; use env vars or `sup config auth`, never paste secrets on the command line.
- Route push, sync, overwrite, and `--force` to `preset-cli-mutations`.
- Redact tokens and credential-bearing output in transcripts.

## Decision Rules

- Classify CLI vs MCP vs direct API intent before acting; if MCP or direct API was requested, defer to that plugin.
- Run metadata reads and explicitly requested data-returning reads (e.g. `sup sql`, `sup chart data`) on familiar workspaces directly with bounded output; for `sup sql`, this direct path requires a pure single-statement `SELECT`. Load safety policy before mutations, SQL that is not a pure single-statement `SELECT`, untrusted-source SQL, unfamiliar workspaces, or broad outputs.
- Choose output format based on the downstream consumer: `--json` for automation, `--csv` for files, default Rich for humans, `--porcelain` for shell pipelines.
- If a command group is not named on this card, load command coverage before composing commands.
- For mutating intent, stop and load `preset-cli-mutations` rather than continuing on this card. Non-`SELECT` SQL is confirmation-gated by the safety policy even when it is pasted by the user for a familiar workspace.

## Workflow Order

1. Establish install, auth, and workspace context.
2. Choose output format.
3. Classify risk (metadata read vs data-returning read vs mutation).
4. Load the focused reference for the operation.
5. Run only the safe / read command.
6. Redact output before sharing.

## Retrieve

- Install, entry points, OAuth, env vars: [references/install-and-auth.md](references/install-and-auth.md)
- Config precedence and source resolution: [references/config-precedence.md](references/config-precedence.md)
- Workspace selection and `--workspace-id` override: [references/workspace-and-config.md](references/workspace-and-config.md)
- Registered command coverage and routing: [references/command-coverage.md](references/command-coverage.md)
- Output formats and exit behavior: [references/output-formats.md](references/output-formats.md)
- Asset read/export entity scope: [references/assets-read.md](references/assets-read.md)
- Asset list filter matrix: [references/asset-filter-matrix.md](references/asset-filter-matrix.md)
- Ad-hoc SQL routing: [references/sql-and-query.md](references/sql-and-query.md)
- SQL/data-returning read safety: [references/sql-data-safety.md](references/sql-data-safety.md)
- Saved query reads: [references/saved-query-reads.md](references/saved-query-reads.md)
- Detailed command examples: [references/command-examples.md](references/command-examples.md)
- CLI vs API routing decision: [references/cli-vs-api.md](references/cli-vs-api.md)
- Approval gates and credential redaction: [references/safety-policy.md](references/safety-policy.md)
