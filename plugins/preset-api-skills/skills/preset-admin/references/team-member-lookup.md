# Team Member Lookup

Use this reference for read-only team membership listing, filtering, member lookup, and seat checks.

## API-Key-Safe Reads

| Goal | Method and path |
|---|---|
| List or filter team members | `GET /teams/{team_name}/memberships/?page_number=1&page_size=100` |
| Get one member | `GET /teams/{team_name}/memberships/{user_id}/` |
| Check seats remaining | `GET /teams/{team_name}/has-seats-remaining/` |

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

Use the numeric `user.id` from list results for single-member lookup, role update, or removal.

Before creating invites or upgrading a viewer to a creator role, call the API-key-safe seat check. Enterprise teams split viewer and creator capacity; if no seats remain, treat that as a blocker.

`GET /teams/{team_name}/user-limit/` and `GET /teams/{team_name}/memberships/{user_id}/groups/` are not API-key allowed in live validation. Use browser/session-backed admin context or defer group analysis outside this API-key workflow.
