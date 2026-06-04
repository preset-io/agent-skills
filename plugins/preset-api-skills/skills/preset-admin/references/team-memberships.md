# Team Memberships Reference

Team membership endpoints require team-admin permissions. API-key JWTs are accepted on documented membership endpoints, but requests return `403` if the key owner lacks the required team permissions.

Use this file to route to the narrow membership reference:

- Read/list members, identify `user.id`, check seats, or inspect response fields: [team-member-lookup.md](team-member-lookup.md)
- Change a team role or remove a member: [team-member-access-changes.md](team-member-access-changes.md)
- Resolve numeric role IDs before access changes: [role-identifiers.md](role-identifiers.md)
- Check unsupported group/SCIM/session-only adjacent routes: [deferrals.md](deferrals.md)

Changing a team role or removing a user changes access. Load `preset-api` and then `references/safety-policy.md`; get explicit confirmation before making `PATCH` or `DELETE` requests.

Lookup anchors: `user_name_or_email`, `/teams/{team_name}/has-seats-remaining/`.

Reusable Python snippets live in `examples/team_memberships.py`; load that file only when implementation detail is needed.
