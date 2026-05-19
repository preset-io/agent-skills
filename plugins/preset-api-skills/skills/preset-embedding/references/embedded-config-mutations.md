# Embedded Configuration Mutations

Use this reference when the user wants to create, update, or delete embedded dashboard configuration.

Do not run these without explicit confirmation:

| Surface | Endpoint |
|---|---|
| Set embedded config | `POST /api/v1/dashboard/{id_or_slug}/embedded` |
| Update embedded config | `PUT /api/v1/dashboard/{id_or_slug}/embedded` |
| Delete embedded config | `DELETE /api/v1/dashboard/{id_or_slug}/embedded` |

Before mutating embedded configuration, summarize:

1. Workspace hostname.
2. Dashboard ID or slug.
3. Endpoint and HTTP method.
4. Allowed domains and expected origin behavior.
5. Expected embed UUID/configuration change.
6. Rollback path, such as restoring prior allowed domains or deleting the config.

Changing embedded configuration can expose dashboards to external applications when paired with valid guest tokens. For token issuance, use `preset-guest-tokens`. For RLS clauses, use `preset-embedded-rls`.
