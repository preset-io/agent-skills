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
- Do not invent RLS clauses, trusted domains, or authorization details; ask for missing authorization details.
- Never print signed guest tokens in logs, examples, PR comments, or handoff notes.

## Decision Rules

- Classify guest token creation as token issuance.
- Require approval summary with dashboard, resource, user, RLS, audience, expiration, and handling.
- Never create or print a signed token before approval.
- Separate embedded config reads from token creation.

## Workflow Order

1. Inspect dashboard and embedded config metadata.
2. Summarize token claims, resources, user payload, RLS, audience, and handling.
3. Request explicit approval.
4. Stop before creating or printing token.

## Retrieve

- Guest-token claims, resources, user payload, RLS, token handling: [references/guest-token-claims.md](references/guest-token-claims.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
