# Embedded RLS Routing

Use this reference when an embedding task involves row-level security for external viewers.

Embedded RLS clauses are permission controls. Incorrect clauses can leak or hide customer data.

Before preparing or approving RLS clauses, use `preset-embedded-rls`.

Confirm:

1. Viewer population and tenant/account identity.
2. Dataset IDs and column names the clauses target.
3. The exact `rls_rules` values intended for guest-token claims.
4. Whether the clauses are additive to workspace-level RLS.
5. How the result will be validated without exposing unnecessary data.

Do not invent tenant identifiers, filters, dataset columns, or access rules.
