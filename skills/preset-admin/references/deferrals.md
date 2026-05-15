# Deferred Admin Surfaces

Phase 3 covers teams, workspaces, workspace memberships, invites, role identifiers, and audit logs. The following Manager surfaces are important but intentionally out of scope for this skill.

## Defer To Future Skills

| Surface | Why deferred |
|---|---|
| User groups and SCIM provisioning | Group-derived roles can override direct user roles, and SCIM has separate auth and provisioning semantics. |
| Permission, DAR, and RLS APIs | These are high-impact access-control APIs guarded by `PERMISSION_API_ENABLED`; route role/permission review through `preset-roles-permissions` and keep unsupported APIs deferred until separately reviewed. |
| Database connection creation, update, and tests | These affect credentials, network access, and workspace data plane behavior; use `preset-database-connections` for documented workspace API flows. |
| Embedded guest tokens and access-token keys | These issue or manage embeddable access credentials; use `preset-guest-tokens` for guest-token creation and keep access-token key lifecycle deferred until separately reviewed. |
| Trusted domains | These affect embedding and external origins; use a separate embedded/admin workflow. |
| Homepage settings | User-specific workspace UI state, not core team/workspace administration. |
| API key and SCIM token CRUD | Credential lifecycle management needs separate secret-handling rules. |
| Billing, payment, downgrade, and subscription routes | Business-critical billing workflows need separate review and approvals. |
| Internal admin routes under `/api-internal/*` | Internal-only routes are not public Management API examples and often require internal roles. |
| Workspace clone, hibernation recovery, deployment assignment, secret rotation, and health checks | Operational control-plane workflows require environment-specific runbooks. |

## How To Respond

When a user asks for a deferred workflow:

1. Explain that the current Preset admin skill does not document that operation.
2. Name the likely API area if known.
3. Ask for confirmation to analyze Manager source and create a separate reviewed workflow before making any mutation.

Do not improvise mutation examples for deferred surfaces from Manager source without a separate review.
