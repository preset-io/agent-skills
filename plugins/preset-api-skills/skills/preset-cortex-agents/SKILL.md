---
name: preset-cortex-agents
description: Use Snowflake Cortex Agent REST and SQL APIs through direct API/operator workflows. Use only for direct API workflows when a user asks to list, describe, create, update, delete, or run Cortex Agent objects; call ad hoc agent:run; handle streaming Cortex Agent responses; or use the SNOWFLAKE.CORTEX.DATA_AGENT_RUN SQL wrapper. Do not use for MCP-only work.
---

# preset-cortex-agents

Use this skill for Snowflake Cortex Agent object and run workflows.

## Workflow

1. Use `preset-snowflake-cortex` first to establish account URL, auth, role,
   warehouse, database, schema, and safety context.
2. Load [references/agent-runs.md](references/agent-runs.md) before object-based or ad hoc `agent:run` calls.
3. Load [references/agent-management.md](references/agent-management.md) before listing, describing, creating, updating, or deleting Cortex Agent objects.
4. Load [references/sql-agent-ddl.md](references/sql-agent-ddl.md) when the user wants to create, alter, show, describe, or drop Cortex Agent objects from SQL.
5. Load [references/sql-wrapper.md](references/sql-wrapper.md) when the user wants to run an agent from SQL instead of REST.
6. Load [../preset-snowflake-cortex/references/cortex-safety.md](../preset-snowflake-cortex/references/cortex-safety.md), summarize the target, payload, tools, budgets, expected data exposure, and rollback path when applicable, then get explicit confirmation before any run or mutation.

## Guardrails

- Prefer read-only list/describe calls before mutations.
- Do not run agents without explicit confirmation of the query, role, tools, budget, and output handling.
- Do not create, update, replace, or delete agent objects without a rollback plan.
- Do not assume old `agent:run` schemas are current; Snowflake updated the request and response schemas in 2025, so do not rely on pre-2025 documentation or examples.
- Treat streamed events as potentially sensitive. Store only redacted summaries unless the user approves raw output handling.
