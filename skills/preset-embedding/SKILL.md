---
name: preset-embedding
description: Inspect embedded dashboard configuration in a Preset workspace through Superset API calls. Use when a user needs embedded dashboard read paths, feature-flag behavior, allowed domain inspection, or guest-token routing after resolving a workspace hostname.
---

# preset-embedding

Use this skill for embedded dashboard inspection and routing.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI and current-user roles when permissions matter.
4. Load [references/embedded-dashboards.md](references/embedded-dashboards.md) for embedded dashboard read examples and mutation deferrals.
5. Use `preset-guest-tokens` for guest-token creation and `preset-embedded-rls` for embedded RLS review.

## Scope

Default to embedded configuration reads. Do not create, update, or delete embedded dashboard configuration, issue guest tokens, manage trusted domains, or manage embedded access-token keys without explicit confirmation and a separate security-sensitive review.

Guest-token creation and RLS for embedded users are Phase 5 security-sensitive workflows handled by `preset-guest-tokens` and `preset-embedded-rls`.
