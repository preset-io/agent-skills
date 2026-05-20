---
name: preset-embedded-rls
description: Review embedded analytics row-level security clauses, tenant filters, guest-token RLS rules, and external-viewer isolation for direct API workflows. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-embedded-rls

Use before guest-token creation when embedded viewers need row-level security.

## Always

- Use `preset-api`, `preset-workspaces`, and metadata skills only when column validation is required.
- Do not invent tenant identifiers, filters, dataset columns, or access rules.
- Treat RLS clauses as permission controls that can leak or hide customer data.
- Confirm every clause and intended viewer population before token creation.
- Do not validate with broad data-returning queries unless the user approves target and limit.

## Decision Rules

- Classify embedded RLS review as plan-only safety work.
- Identify tenant and user filter safety issues.
- Require approval before clauses are used in token claims.
- Avoid mutating embedded RLS configuration.

## Workflow Order

1. Inspect embedded RLS clauses.
2. Flag unsafe tenant and user filters.
3. Summarize approval requirements.
4. Stop before using clauses in tokens.

## Retrieve

- Embedded RLS rule design and review: [references/embedded-rls-rules.md](references/embedded-rls-rules.md)
