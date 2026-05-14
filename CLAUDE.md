# Preset agent skills

Agent API skills for [Preset](https://preset.io), a managed, cloud-hosted Apache Superset platform.

Use the Markdown skill files in `api/skills/` as reference material:

- `api/skills/preset-api.md`
- `api/skills/preset-workspaces.md`
- `api/skills/preset-dashboards.md`
- `api/skills/preset-datasets.md`

## Safety policy

Default to read-only API calls. Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, SQL execution, role/RLS change, database connection change, or guest-token creation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.

These Markdown skills call public APIs directly. They do not automatically apply MCP runtime guardrails such as workspace binding, tool-level permission checks, request-source tagging, or metrics.
