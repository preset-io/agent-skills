# Embedded RLS Rules

Embedded row-level security limits data visible to external viewers through guest-token claims. Bad RLS can expose customer data or incorrectly block access.

## Inputs To Resolve

Before preparing `rls_rules`, resolve:

1. Embedded dashboard UUID or dashboard ID.
2. Dataset IDs or tables behind the dashboard, when relevant.
3. Tenant, account, customer, region, or user identity field.
4. Exact allowed value or predicate.
5. Whether the clause should apply to every dataset in the dashboard.

Do not guess these values.

## Guest Token Payload Mapping

Prepare `rls_rules` as reviewed clauses, then map them to the guest-token payload's `rls` field:

```python
rls_rules = [
    {"clause": "customer_id = 123"},
]

payload = {
    "user": {"username": "external-user-id"},
    "resources": [{"type": "dashboard", "id": embedded_dashboard_uuid}],
    "rls": rls_rules,
}
```

## Confirmation Required

Before using these clauses in a guest token, summarize:

1. Workspace hostname.
2. Dashboard or embedded dashboard UUID.
3. Dataset/table assumptions.
4. Each RLS clause.
5. External viewer population.
6. Expected data visibility.

Wait for explicit confirmation before token creation.

If the user cannot confirm the clauses, stop and ask for the approved tenant or access-control rule.
