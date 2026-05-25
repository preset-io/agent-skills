# Safety Policy Reference

Default to metadata reads. HTTP method alone is not enough to decide whether a call is safe: some `GET` endpoints return customer data, SQL text, exports, sample rows, database connection configuration, or database structure.

Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, audit download, SQL execution, SQL result retrieval, chart data retrieval, table sample retrieval, query-history retrieval, saved-query retrieval, database connection configuration retrieval, distinct-value retrieval, role/RLS change, database connection change, dataset mutation, dashboard mutation, workspace lifecycle action, invite action, member removal, guest-token creation, cache invalidation, query stop, or task cancellation:

1. Identify the exact team, workspace, dashboard, dataset, database, user, role, or SQL target.
2. Summarize the endpoint, HTTP method, request body, and expected effect.
3. Explain whether the action reads or changes access, customer data, credentials, metadata, cache, or execution state.
4. Get explicit user confirmation before making the call.

These Markdown skills call public APIs directly. They do not automatically apply MCP runtime guardrails such as workspace binding, tool-level permission checks, MCP request-source tagging, or MCP metrics.

## MCP Boundary

If the user asks for Preset or Superset MCP tools and only direct Preset API skills are available, classify the request as MCP intent. Do not silently switch to direct API calls, exports, or dashboard metadata endpoints. Explain that direct API skills are a different workflow surface, ask whether the user wants to switch surfaces, and stop before any API call.

If the user asks for direct Preset or Superset API work and mentions MCP only as a fallback, classify the request as direct API intent. Say: "No MCP fallback. MCP tools are a different surface and require separate explicit approval. Stop before MCP calls." Continue direct API planning unless the direct API operation itself requires confirmation. Do not use MCP tool names such as `list_dashboards` as a fallback path from a direct API workflow.

Avoid phrasing the rejected path as a fallback to perform. Prefer "No MCP fallback. MCP tools are a different surface and require separate explicit approval. Stop before MCP calls." For direct API intent, do not say "stop before any API call" unless the API call itself is confirmation-gated by the safety policy.

For security-sensitive workflows, load the focused Phase 5 skill instead of relying only on broad domain guidance: `preset-guest-tokens`, `preset-embedded-rls`, `preset-sql-execution`, `preset-database-connections`, `preset-roles-permissions`, or `preset-destructive-imports`.

Never expose credentials, client secrets, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, or signed guest tokens in logs, examples, PR comments, or handoff notes.
