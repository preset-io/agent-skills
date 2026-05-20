---
name: preset-embedding
description: Inspect embedded dashboard configuration, trusted domains, origins, guest-token routing, and embedded RLS routing through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-embedding

Use for embedded dashboard configuration reads and security-sensitive routing.

## Always

- Use `preset-api`, `preset-workspaces`, and when permissions matter `preset-superset` first.
- Default to embedded configuration reads.
- Route guest-token creation to `preset-guest-tokens`.
- Route embedded RLS design/review to `preset-embedded-rls`.
- Require explicit confirmation before embedded config mutations, guest tokens, trusted domain changes, or access-token key changes.

## Retrieve

- Embedded dashboard configuration reads: [references/embedded-config-reads.md](references/embedded-config-reads.md)
- Embedded config create/update/delete routing: [references/embedded-config-mutations.md](references/embedded-config-mutations.md)
- Trusted domains and origins: [references/trusted-domains-and-origins.md](references/trusted-domains-and-origins.md)
- Guest-token routing: [references/guest-tokens.md](references/guest-tokens.md)
- Embedded RLS routing: [references/embedded-rls.md](references/embedded-rls.md)
