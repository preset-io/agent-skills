---
name: preset-snowflake-cortex
description: Prepare safe Snowflake Cortex API access for Cortex Agent workflows. Use when a user asks to authenticate to Snowflake Cortex, choose account/role/warehouse context, check Cortex Agent privileges, or route Snowflake Cortex Agent tasks before calling Cortex REST or SQL APIs.
---

# preset-snowflake-cortex

Use this skill as the Snowflake Cortex routing and safety boundary. This skill
is for API/operator workflows and is not Preset chatbot runtime instructions.

## Workflow

1. Resolve the Snowflake account URL, authentication method, role, warehouse,
   database, and schema the user intends to use.
2. Load [references/authentication-and-context.md](references/authentication-and-context.md) before building REST requests.
3. Load [references/cortex-safety.md](references/cortex-safety.md) before any Cortex Agent run, object mutation, warehouse-backed tool use, or response disclosure.
4. Use `preset-cortex-agents` for Cortex Agent object discovery, object management, runs, and SQL wrapper examples.

## Guardrails

- Do not use Preset workspace hostnames for Snowflake Cortex APIs.
- Do not print PATs, private keys, OAuth tokens, signed JWTs, or session tokens.
- Use the user's intended Snowflake role, and verify Cortex Agent privileges before live calls.
- Treat Cortex Agent execution as high impact: it can call tools, use warehouses, and expose governed Snowflake data.
- Re-check Snowflake documentation before implementation work because Cortex Agent request and response schemas are evolving.
