---
name: preset-guest-tokens
description: Create and route Preset embedded dashboard guest-token workflows with explicit approval. Use when a user asks for guest tokens, embedded signed access, external embedded users, guest-token payloads, or embedded resource/RLS claims.
---

# preset-guest-tokens

Use this skill for security-sensitive guest-token creation and payload review.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI and current-user roles when permissions matter.
4. Use `preset-embedding` to inspect embedded dashboard configuration before creating tokens.
5. Load [references/guest-token-claims.md](references/guest-token-claims.md) before preparing any guest-token request.
6. If the token includes row-level security clauses, also use `preset-embedded-rls`.
7. Before `POST /api/v1/security/guest_token/`, load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md), summarize the target dashboard/resource, user claims, RLS clauses, token handling plan, and expiration expectations, then get explicit user confirmation.

## Guardrails

- Never print signed guest tokens in logs, examples, PR comments, or handoff notes.
- Do not create guest tokens until the embedded dashboard UUID/resource, user identity claims, and RLS clauses are explicit.
- Treat guest tokens as external access credentials, not harmless API responses.
- Do not invent RLS clauses or trusted domains. Ask for missing authorization details.
