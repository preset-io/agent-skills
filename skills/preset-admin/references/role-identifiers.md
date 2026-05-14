# Role Identifiers Reference

Preset has two different role concepts in the Management API.

| Concept | Field | Shape | Used by |
|---|---|---|---|
| Team role | `team_role_id` | Numeric ID | Team invites and team membership role changes |
| Workspace role | `workspace_role_identifier` or `role_identifier` | String identifier | Workspace membership and invite workspace access |

Do not mix these values.

## Resolve Roles Dynamically

Prefer the current team payload before using any static workspace role table:

```python
team = client.mgmt("GET", f"/teams/{team_name}/")["payload"]
workspace_roles = team.get("workspace_roles", [])
for role in workspace_roles:
    print(role["role_identifier"], role.get("name") or role.get("role_name"))
```

The `workspace_roles` field is produced by Manager from default roles, feature flags, and team custom roles. It is the safest source for a specific team because roles such as `PresetLimitedAdmin`, `PresetDelta`, `PresetEpsilon`, or custom role identifiers may or may not be enabled. The `name` and `role_name` fields vary by source serializer, so examples use `role.get("name") or role.get("role_name")` when printing a friendly label.

## Default Workspace Role Identifiers

These defaults come from Manager's `DefaultWorkspaceRolesEnum`.

| Identifier | Friendly role | Notes |
|---|---|---|
| `Admin` | Workspace Admin | Creator-level admin access |
| `PresetLimitedAdmin` | Limited Admin | Feature-gated |
| `PresetAlpha` | Primary Creator | Creator role |
| `PresetBeta` | Secondary Creator | Creator role |
| `PresetGamma` | Limited Creator | Creator role |
| `PresetDelta` | Visualization Creator | Feature-gated creator role |
| `PresetReportsOnly` | Viewer | Viewer role |
| `PresetDashboardsOnly` | Dashboard Viewer | Viewer role |
| `PresetEpsilon` | Dashboard Interactor | Feature-gated viewer role |
| `PresetNoAccess` | No Access | Removes direct workspace access |
| `PresetMachineRole` | Machine | Machine-only; do not assign to normal human users |

Creator roles can consume creator seats on Enterprise teams. Before invite creation or role upgrades to a creator role, preflight seat limits in [team-memberships.md](team-memberships.md).

## Team Role IDs

Invite and team membership APIs require numeric `team_role_id` values. `GET /team-roles/` exists in Manager but is not marked `user_api_key_allowed`, so do not assume an API-key JWT can call it.

Use one of these sources instead:

- the team membership response for an existing member with the intended role
- an approved admin-provided value from a ticket, environment configuration, or runbook
- a browser/session-backed admin context outside these API-key examples

If no existing member has the intended role and no approved numeric ID is available, stop and ask a team admin for the numeric `team_role_id`. Do not guess from role names or attempt to discover team role IDs with the API-key JWT.

Always state the numeric `team_role_id`, intended role name, target team, and target user before making a team role mutation.

## Custom Workspace Roles

Custom workspace roles are valid when they appear in `team["workspace_roles"]`. Do not invent custom role identifiers. If the requested custom role is not present in the team payload, stop and ask the user for the correct role or admin context.
