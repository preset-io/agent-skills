# Preset Agent Skills

Use the skill files in this repository when helping with Preset API work:

- `skills/preset-api/SKILL.md` for authentication, API conventions, pagination, Rison, and safety policy.
- `skills/preset-workspaces/SKILL.md` for team and workspace discovery, hostname resolution, and guarded membership workflows.
- `skills/preset-admin/SKILL.md` for team memberships, workspace lifecycle, invite lifecycle, role identifiers, and audit logs.
- `skills/preset-dashboards/SKILL.md` for read-only dashboard inspection.
- `skills/preset-datasets/SKILL.md` for read-only dataset and database metadata inspection.

Default to read-only calls. Before any mutation, audit download, SQL execution, import, export, role/RLS change, database connection change, workspace lifecycle action, invite action, member removal, or guest-token creation, summarize the exact target, payload, and expected effect, then get explicit user confirmation.
