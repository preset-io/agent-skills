# Preset CLI Skills

Use the skill files in this package when helping with explicit Preset CLI work driven through the `sup` CLI (PyPI package `superset-sup`). If the user is working through Preset/Superset MCP tools, use the separate `preset-mcp-skills` package instead. If the user wants direct HTTP, SDK, or `requests`/`curl` code, use the separate `preset-api-skills` package instead. Do not switch surfaces unless the user explicitly approves the switch.

Surface selection:

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Route to `preset-mcp-skills`.
- If the user asks for in-process HTTP, REST endpoints, Python `requests`, SDKs, or curl examples, do not use this package. Route to `preset-api-skills`.
- Use this package only when the user asks for `sup`, the Preset CLI, shell one-liners, scripting, batch exports, ad-hoc SQL from a terminal, or CI/CD automation that is simpler as a single command than as an HTTP call.
- If both API and MCP plugins are installed, MCP intent wins over resource type. A dashboard, chart, dataset, or SQL Lab request should still use MCP guidance when the user asked for MCP.
- If a CLI workflow lacks the needed capability, stop and ask whether to switch to the API surface. Do not silently escalate.

- `skills/preset-cli/SKILL.md` for non-destructive `sup` CLI workflows: install, authentication, workspace selection, output formats, ad-hoc SQL, and asset read/export.
- `skills/preset-cli-mutations/SKILL.md` for state-changing `sup` CLI operations (push, --force, --overwrite, cross-workspace sync) with mandatory preview and confirmation templates.

Default to non-destructive reads and exports. Before any state-changing `sup` command — `sup chart push`, `sup dashboard push`, `sup dataset push`, `sup user push`, `sup user invite`, any `--force` or `--overwrite` invocation, or `sup sync run` against any target workspace — preview the change first (native `--dry-run` for `sup sync run`, `sup user push`, and `sup user invite`; pull-and-diff against the target for chart/dashboard/dataset push which have no native `--dry-run`), summarize the source workspace, target workspace, asset IDs/types, and any destructive flags, then get explicit user confirmation that names the target workspace and the literal flag strings.

Never paste `SUP_PRESET_API_TOKEN`, `SUP_PRESET_API_SECRET`, or any bearer token into a command line; rely on environment variables and `sup config auth`. Redact tokens, refresh tokens, database passwords, and any credential surfaced in `sup` output before sharing transcripts, logs, or screenshots.
