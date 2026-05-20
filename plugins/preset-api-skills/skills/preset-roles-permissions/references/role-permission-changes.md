# Role And Permission Changes

Role and permission changes can grant or revoke access to customer data, workspace assets, and administration workflows. Treat them as `permission_write`.

## Planning Essentials

For role or permission change review, first inspect membership roles and permissions. Resolve the target principal, dynamic workspace role identifier, and numeric `team_role_id` source before summarizing impact. Summarize current access, requested access, customer-data/admin effect, creator-seat risk, endpoint/body, and rollback path. Require explicit approval and stop before any role or permission mutation. Do not guess role IDs.

## Sources Of Truth

Use these references before mutating:

- `preset-admin/references/role-identifiers.md` for team role IDs and workspace role identifiers.
- `preset-admin/references/team-memberships.md` for team membership changes and seat preflights.
- `preset-admin/references/workspace-management.md` for workspace membership role changes.
- `preset-superset/references/current-user-and-permissions.md` for workspace current-user and role diagnostics.

## Confirmation Required

Before any role or permission mutation, summarize:

1. Team and workspace, if applicable.
2. Target user, group, service account, or invite.
3. Current role/access, including group-derived role status when visible.
4. New role/access.
5. Whether a creator seat may be consumed.
6. API endpoint and request body.
7. Rollback path.

Wait for explicit confirmation.

## Deferrals

Do not improvise examples for SCIM provisioning, internal permission APIs, billing/payment access, DAR changes, or broad Superset security manager routes unless they are explicitly approved and validated against the source code/OpenAPI for the target version.
