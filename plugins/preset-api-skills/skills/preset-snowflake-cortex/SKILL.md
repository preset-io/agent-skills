---
name: preset-snowflake-cortex
description: "Prepare Snowflake Cortex direct API access: account URL, auth method, role, warehouse, database/schema context, privileges, and Cortex Agent routing. Use only for direct API workflows; Do not use for MCP-only work."
---

# preset-snowflake-cortex

Use as the Snowflake Cortex routing and safety boundary before Cortex Agent REST or SQL workflows. This is for API/operator workflows, not Preset chatbot runtime instructions.

## Always

- Resolve Snowflake account URL, auth method, role, warehouse, database, and schema.
- Do not use Preset workspace hostnames for Snowflake Cortex APIs.
- Do not print PATs, private keys, OAuth tokens, signed JWTs, or session tokens.
- Verify Cortex Agent privileges before live calls.
- Treat Cortex Agent execution as high impact because it can call tools, use warehouses, and expose governed Snowflake data.
- Re-check Snowflake docs for implementation work because Cortex schemas are evolving.

## Decision Rules

- Classify Cortex readiness checks as read-only.
- Use configured Snowflake account and auth context.
- Verify role, warehouse, database, schema, Cortex privileges, and cross-region setting.
- Redact Snowflake secrets.

## Workflow Order

1. Resolve account and auth context.
2. Inspect role, warehouse, database, and schema.
3. Check Cortex privileges and cross-region setting.
4. Report readiness without mutation.

## Retrieve

- Authentication/context routing: [references/authentication-and-context.md](references/authentication-and-context.md)
- Account, role, warehouse, database/schema, REST headers: [references/account-auth-context.md](references/account-auth-context.md)
- OAuth-only setup checks: [references/oauth-context.md](references/oauth-context.md)
- Cortex privileges and cross-region readiness: [references/agent-access-and-region.md](references/agent-access-and-region.md)
- Cortex Agent safety, disclosure, approvals: [references/cortex-safety.md](references/cortex-safety.md)
- Agent object/runs/SQL workflows: use `preset-cortex-agents`
