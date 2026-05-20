---
name: preset-guest-tokens
description: Prepare and create Preset embedded dashboard guest tokens, external-user claims, resource claims, RLS claims, and token-handling plans through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-guest-tokens

Use for security-sensitive guest-token payload review and creation.

## Always

- Use `preset-api`, `preset-workspaces`, `preset-superset`, and `preset-embedding` first.
- Use `preset-embedded-rls` when row-level security clauses are present.
- Require explicit confirmation before `POST /api/v1/security/guest_token/`.
- Confirm dashboard/resource UUID, user claims, RLS clauses, token handling, and expiration expectations.
- Never print signed guest tokens in logs, examples, PR comments, or handoff notes.

## Retrieve

- Guest-token claims, resources, user payload, RLS, token handling: [references/guest-token-claims.md](references/guest-token-claims.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
