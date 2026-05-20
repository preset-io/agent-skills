# CLI vs. API Decision Matrix

Use this reference when deciding whether a task is better served by `sup` (this package, `preset-cli-skills`) or by direct HTTP through the separate `preset-api-skills` package.

## Choose `sup` (this package) when

- The task is a one-shot shell command or pipeline (`sup chart list --json | jq …`).
- You need batch export to local YAML files (`sup chart pull`, `sup dashboard pull`).
- You want ad-hoc SQL with a single argument and immediate output (`sup sql "…" --json`).
- The workflow is CI/CD-driven (GitHub Actions, GitLab CI, Jenkins, etc.) and benefits from a CLI binary plus environment variables.
- The user is operating from a terminal and would otherwise have to write a bespoke HTTP script.
- The user explicitly mentions `sup`, `preset-cli`, `superset-cli`, or "the CLI".

## Choose `preset-api-skills` (HTTP) when

- You need in-process HTTP from a long-running Python program (web app, notebook, agent runtime).
- The flow requires fine-grained pagination, retries with backoff, or custom error handling.
- You need to call an endpoint that `sup` does not yet expose.
- You need request/response correlation IDs, custom headers, or non-default content types.
- You need async SQL Lab execution with explicit polling against `/api/v1/sqllab/results/`.
- You are composing multiple API calls in a single transaction-style flow where a CLI invocation per call would be wasteful.

## MCP Is a Different Surface

If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package at all. Route to the separate `preset-mcp-skills` package. CLI is not a fallback for MCP-only work.

## Decision Table

| Task | CLI command | API chain |
|---|---|---|
| List my charts | `sup chart list --mine --json` | `preset-api-skills` (preset-dashboards) |
| Export 50 dashboards to YAML | `sup dashboard pull --ids=…` | `preset-api-skills` (preset-import-export) |
| Run a single ad-hoc query | `sup sql "…" --json` | `preset-api-skills` (preset-sql-execution) |
| Stop a long-running query | _(use API)_ | `preset-api-skills` (preset-sql-execution) |
| Rotate trusted domains | _(use API)_ | `preset-api-skills` (preset-embedding) |
| Promote dashboard between workspaces | `preset-cli-mutations` (sync) | `preset-api-skills` (preset-import-export + preset-destructive-imports) |
| Read query history | `sup query list --json` | `preset-api-skills` (preset-sqllab) |

## Hybrid Workflows

It is fine to mix CLI and API in a single workflow when each step plays to its strengths. Examples:

- `sup workspace list --json` to discover the workspace, then `preset-api-skills` to call a non-CLI endpoint against the resolved hostname.
- `sup dashboard pull` to fetch YAML locally, then `preset-api-skills` to introspect dashboard metadata via the Superset OpenAPI before pushing changes.

In hybrid flows, always document which step is CLI and which is HTTP in handoff notes so a reader can reproduce the result. Each package's safety policy applies to the calls it owns; this package's policy lives at [safety-policy.md](safety-policy.md).

## When in Doubt

Default to `sup` for terminal- and CI-style tasks; default to `preset-api-skills` for application code. If the user asks for a "one-liner", they almost always want `sup`.
