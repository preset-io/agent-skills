# Team Member Access Changes

Use this reference for approval-gated team role updates and member removals.

## Mutating Endpoints

| Goal | Method and path |
|---|---|
| Update team role | `PATCH /teams/{team_name}/memberships/{user_id}/` with `{"team_role_id": <id>}` |
| Remove team member | `DELETE /teams/{team_name}/memberships/{user_id}/` |

Role updates require a numeric `team_role_id`; resolve it with [role-identifiers.md](role-identifiers.md). Use [team-member-lookup.md](team-member-lookup.md) first to identify the target `user.id`, email, current role, and inherited-role status.

## Required Confirmation

Before a team role update, summarize:

- team name
- user ID and email
- `current_role`: current team role ID and role name
- `new_role`: new numeric `team_role_id` and role name
- whether the current role came from a group
- expected access effect

Before member removal, summarize the team name, user ID, email, current team role, and expected access removal.

Wait for explicit confirmation before `PATCH` or `DELETE`.

Manager rejects changes that would remove the last team admin, and rejects removing yourself from a team.

Group role assignment endpoints exist, but group and SCIM provisioning are intentionally deferred from this skill. See [deferrals.md](deferrals.md).
