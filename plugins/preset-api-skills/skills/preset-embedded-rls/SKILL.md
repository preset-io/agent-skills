---
name: preset-embedded-rls
description: Review and prepare row-level security clauses for direct API Preset embedded analytics and guest-token workflows. Use only for direct API workflows when a user asks for embedded RLS, tenant filters, guest-token RLS rules, or external viewer data isolation. Do not use for MCP-only work.
---

# preset-embedded-rls

Use this skill for embedded row-level security review before guest-token creation.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` and `preset-datasets` to inspect relevant dataset metadata when the user asks to validate available columns.
4. Load [references/embedded-rls-rules.md](references/embedded-rls-rules.md) before preparing any embedded RLS clause.
5. Route token issuance to `preset-guest-tokens` after the RLS rules are explicit.

## Guardrails

- Do not invent tenant identifiers, account filters, dataset columns, or access rules.
- Treat RLS clauses as permission controls. Incorrect clauses can leak or hide customer data.
- Confirm every clause and intended viewer population before token creation.
- Do not validate RLS by running broad data-returning queries unless the user explicitly approves the target and limit.
