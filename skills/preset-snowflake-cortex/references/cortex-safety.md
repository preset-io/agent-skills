# Cortex Safety

Cortex Agent workflows can expose governed data, execute warehouse-backed tools,
and consume model or warehouse budget. Treat runs and mutations as
confirmation-gated.

## Confirmation Required

Before running a Cortex Agent or mutating an agent object, summarize:

1. Snowflake account URL and role.
2. Database, schema, and agent object name, or that this is an ad hoc run.
3. User query and any supplied instructions.
4. Tool names and tool resources, including Analyst, Search, SQL, generic
   function, MCP, or web-search resources.
5. Warehouse, timeout, and token budget where applicable.
6. Whether streaming or non-streaming output will be used.
7. Region or cross-region inference path when the selected model is not local.
8. Expected governed-data exposure and output destination.
9. Rollback path for create, update, replace, or delete operations.

Wait for explicit confirmation.

## Disclosure Rules

- Do not paste raw agent responses that contain governed data unless the user
  confirms the disclosure channel.
- Do not paste tool inputs, semantic model paths, warehouse details, or search
  filters if they reveal sensitive implementation details.
- Do not store streamed output in committed benchmark or PR artifacts.
- Handle unknown streaming event types without failing; Snowflake documents that
  clients should tolerate new event types.

## Live-Test Limits

Use a safe Snowflake test environment, a low-cost warehouse, and narrow budgets.
Do not run Cortex Agent APIs against production customer data without explicit
approval of the exact account, role, agent, query, and budget.
