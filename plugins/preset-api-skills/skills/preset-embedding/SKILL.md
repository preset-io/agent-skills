---
name: preset-embedding
description: Inspect embedded dashboard configuration, trusted domains, origins, guest-token routing, and embedded RLS routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-embedding

Use for embedded dashboard configuration reads and security-sensitive routing.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known. Consult `preset-superset` only when permissions drift matters.
- Default to embedded configuration reads.
- Route guest-token creation to `preset-guest-tokens`.
- Route embedded RLS design/review to `preset-embedded-rls`.
- Require explicit confirmation before embedded config mutations, guest tokens, trusted domain changes, or access-token key changes.

## Decision Rules

- Distinguish config reads from trusted-domain mutations, guest-token issuance, and RLS changes.
- Require approval before broadening domains or issuing tokens.
- Route domain, token, and RLS requests to the correct guardrail.
- Avoid mutating embedded configuration.

## Workflow Order

1. Inspect embedded dashboard configuration.
2. Classify domain, token, and RLS request type.
3. Prepare approval summary for mutation or token issuance.
4. Stop before broadening domains, mutating config, or issuing tokens.

## Retrieve

- Embedded dashboard configuration reads: [references/embedded-config-reads.md](references/embedded-config-reads.md)
- Embedded config create/update/delete routing: [references/embedded-config-mutations.md](references/embedded-config-mutations.md)
- Trusted domains and origins: [references/trusted-domains-and-origins.md](references/trusted-domains-and-origins.md)
- Guest-token routing: [references/guest-tokens.md](references/guest-tokens.md)
- Embedded RLS routing: [references/embedded-rls.md](references/embedded-rls.md)
