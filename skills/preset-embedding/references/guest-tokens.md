# Guest Token Routing

Use this reference when an embedding task reaches guest-token creation or payload review.

Guest tokens are signed credentials for external embedded access. They must be handled by the focused security-sensitive skill.

Before guest-token creation, use `preset-guest-tokens`.

The guest-token endpoint is:

| Goal | Endpoint |
|---|---|
| Guest token | `POST /api/v1/security/guest_token/` |

Do not print signed guest tokens in logs, examples, PR comments, or handoff notes.

Do not create a token until the embedded dashboard UUID/resource, user identity claims, RLS clauses, token handling plan, and expiration expectations are explicit.
