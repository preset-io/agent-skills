---
name: preset-cortex-agents
description: Use Snowflake Cortex Agent REST and SQL APIs for listing, describing, creating, updating, deleting, running agents, streaming responses, and SQL wrappers. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-cortex-agents

Use for Snowflake Cortex Agent object management and run workflows.

## Always

- Account, auth, role, warehouse, database/schema, privilege, and safety context comes from `preset-snowflake-cortex`; consult it when that context is missing.
- Prefer read-only list/describe before mutations.
- Require confirmation of query, role, tools, budget, and output handling before any run.
- Require rollback planning before create, update, replace, or delete.
- Treat streamed events as sensitive; store redacted summaries unless raw output handling is approved.
- Do not rely on pre-2025 Cortex Agent schemas.

## Decision Rules

- Distinguish list and describe from run, create, update, and drop operations.
- Require approval for data-returning agent runs and mutations.
- Preserve streaming output handling and redaction.
- Require AUTOCOMMIT for SQL DDL workflows.

## Workflow Order

1. Verify Snowflake Cortex account, auth, role, warehouse, database, schema, and privilege context.
2. List or describe agents first.
3. Prepare run or mutation approval summary with tools, query, budget, and output handling.
4. Stop before run, create, update, replace, or drop until approved.

## Retrieve

- Object-based or ad hoc `agent:run`: [references/agent-runs.md](references/agent-runs.md)
- List/describe/create/update/delete agents: [references/agent-management.md](references/agent-management.md)
- SQL create/alter/show/describe/drop: [references/sql-agent-ddl.md](references/sql-agent-ddl.md)
- `SNOWFLAKE.CORTEX.DATA_AGENT_RUN` SQL wrapper: [references/sql-wrapper.md](references/sql-wrapper.md)
- Safety and approval checklist: load `preset-snowflake-cortex` and then `references/cortex-safety.md`.
