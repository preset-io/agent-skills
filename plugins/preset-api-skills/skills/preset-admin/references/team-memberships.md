# Team Memberships Reference

Team membership endpoints require team-admin permissions for list, role-change, and removal workflows. API-key JWTs are accepted on the documented API-key endpoints, but requests return `403` if the key owner lacks the required team permissions. Some adjacent team-admin routes are session-only and are called out separately below.

Changing a team role or removing a user changes access. Load the safety policy and get explicit confirmation before making `PATCH` or `DELETE` requests.

Reusable Python snippets live in `../examples/team_memberships.py`; load that file only when implementation detail is needed.

## API-Key-Safe Endpoints

| Goal | Method and path |
|---|---|
| List or filter team members | `GET /teams/{team_name}/memberships/?page_number=1&page_size=100` |
| Get one member | `GET /teams/{team_name}/memberships/{user_id}/` |
| Check seats remaining | `GET /teams/{team_name}/has-seats-remaining/` |
| Update team role | `PATCH /teams/{team_name}/memberships/{user_id}/` with `{"team_role_id": <id>}` |
| Remove team member | `DELETE /teams/{team_name}/memberships/{user_id}/` |

## List Team Members

Use pagination and filter by `user_name_or_email` or `user_type` when the request targets a specific user or creator/viewer class. The response includes `meta.count` when paginated.

Common response fields:

| Field | Description |
|---|---|
| `user.id` | Numeric user ID for role updates or removal |
| `user.email` | Member email address |
| `team_role.id` | Numeric team role ID |
| `team_role.name` | Team role display name |
| `is_role_from_group` | Whether the team role comes from a group |
| `user_type` | Enterprise creator/viewer classification when present |
| `creator_on_workspaces` | Workspaces where the user has creator access |
| `viewer_on_workspaces` | Workspaces where the user has viewer access |

## Get One Team Member

Use the numeric `user.id` from list results as `{user_id}`.

## Seat Limit Preflight

Use this before creating invites or upgrading a viewer to a creator role.

Manager also exposes a more detailed `GET /teams/{team_name}/user-limit/` route, but live validation shows it is not API-key allowed. Treat detailed seat limits as a browser/session-backed admin check outside this API-key workflow.

Enterprise teams split viewer and creator capacity. If the API-key-safe seat check reports no seats remaining, treat that as a blocker before inviting or upgrading a user to a creator workspace role.

## Update A Team Role

Requires numeric `team_role_id`. See [role-identifiers.md](role-identifiers.md).

Confirmation summary should include:

- team name
- user ID and email
- `current_role`: current team role ID and role name
- `new_role`: new numeric `team_role_id` and role name
- whether the role came from a group

Manager rejects changes that would remove the last team admin.

## Remove A Team Member

Confirmation summary should include the team name, user ID, email, current team role, and expected access removal.

Manager rejects removing yourself from a team.

## Groups For A Member

`GET /teams/{team_name}/memberships/{user_id}/groups/` is a read-only Manager route for inherited group details, but live validation shows it is not API-key allowed. Do not call it with the API-key JWT client from `preset-api`; use a browser/session-backed admin context or defer group analysis to a separate workflow.

Group role assignment endpoints exist, but group and SCIM provisioning are intentionally deferred from this skill. See [deferrals.md](deferrals.md).
