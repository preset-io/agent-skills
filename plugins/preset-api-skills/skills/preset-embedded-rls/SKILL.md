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

## Retrieve

- Embedded RLS rule design and review: [references/embedded-rls-rules.md](references/embedded-rls-rules.md)
