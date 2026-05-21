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

For security-sensitive workflows, load the focused Phase 5 skill instead of relying only on broad domain guidance: `preset-guest-tokens`, `preset-embedded-rls`, `preset-sql-execution`, `preset-database-connections`, `preset-roles-permissions`, or `preset-destructive-imports`.

Never expose credentials, client secrets, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, or signed guest tokens in logs, examples, PR comments, or handoff notes.
