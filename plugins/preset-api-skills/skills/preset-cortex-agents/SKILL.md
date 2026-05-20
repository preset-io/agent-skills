---
name: preset-cortex-agents
description: Use Snowflake Cortex Agent REST and SQL APIs for listing, describing, creating, updating, deleting, running agents, streaming responses, and SQL wrappers. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-cortex-agents

Use for Snowflake Cortex Agent object management and run workflows.

## Always

- Use `preset-snowflake-cortex` first for account, auth, role, warehouse, database/schema, privileges, and safety context.
- Prefer read-only list/describe before mutations.
- Require confirmation of query, role, tools, budget, and output handling before any run.
- Require rollback planning before create, update, replace, or delete.
- Treat streamed events as sensitive; store redacted summaries unless raw output handling is approved.
- Do not rely on pre-2025 Cortex Agent schemas.

## Retrieve

- Object-based or ad hoc `agent:run`: [references/agent-runs.md](references/agent-runs.md)
- List/describe/create/update/delete agents: [references/agent-management.md](references/agent-management.md)
- SQL create/alter/show/describe/drop: [references/sql-agent-ddl.md](references/sql-agent-ddl.md)
- `SNOWFLAKE.CORTEX.DATA_AGENT_RUN` SQL wrapper: [references/sql-wrapper.md](references/sql-wrapper.md)
- Safety and approval checklist: [../preset-snowflake-cortex/references/cortex-safety.md](../preset-snowflake-cortex/references/cortex-safety.md)
