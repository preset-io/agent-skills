# Safety Policy Reference

Default to read-only API calls.

Before any `POST`, `PUT`, `PATCH`, `DELETE`, import, export, SQL execution, role/RLS change, database connection change, dataset mutation, dashboard mutation, or guest-token creation:

1. Identify the exact team, workspace, dashboard, dataset, database, user, role, or SQL target.
2. Summarize the endpoint, HTTP method, request body, and expected effect.
3. Explain whether the action changes access, data, credentials, metadata, or execution state.
4. Get explicit user confirmation before making the call.

These Markdown skills call public APIs directly. They do not automatically apply MCP runtime guardrails such as workspace binding, tool-level permission checks, MCP request-source tagging, or MCP metrics.

Never expose credentials, client secrets, bearer tokens, database passwords, SQLAlchemy URIs, access tokens, refresh tokens, or signed guest tokens in logs, examples, PR comments, or handoff notes.
