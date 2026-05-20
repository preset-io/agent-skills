# Trusted Domains And Origins

Use this reference for allowed-domain and origin behavior in embedded dashboard configuration.

Allowed domains are part of embedded dashboard configuration and control where embedded dashboards are expected to be loaded from. They are not a replacement for guest-token authorization or row-level security.

## Review Checklist

Before creating or changing trusted domains, confirm:

1. The exact dashboard ID or slug.
2. The application origins that should embed the dashboard.
3. Whether wildcard domains are allowed by policy.
4. Whether staging, production, and other non-production origins should differ.
5. The rollback plan if an origin is too broad or breaks embedding.

## Troubleshooting

If embedding fails:

| Symptom | Check |
|---|---|
| `404` from embedded endpoints | Feature flag, dashboard embedded config, permissions |
| Browser blocks embed | Origin/domain mismatch, iframe policy, app URL mismatch |
| Guest token accepted but data wrong | Use `preset-embedded-rls` to review RLS clauses |
| Token missing or rejected | Use `preset-guest-tokens` to review payload and handling |

Do not broaden trusted domains without explicit approval. Broad domains can allow unintended applications to host embedded content when paired with valid tokens.
