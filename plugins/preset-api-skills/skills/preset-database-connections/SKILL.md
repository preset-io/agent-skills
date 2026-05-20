---
name: preset-database-connections
description: Inspect or route Preset database connection configuration, validation, OAuth, upload, create, update, and delete workflows through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-database-connections

Use for credential-bearing database connection reads and database connection changes.

## Always

- Use `preset-api`, `preset-workspaces`, and `preset-superset` first.
- Prefer `preset-datasets` metadata before reading connection configuration.
- Treat connection configuration as credential-bearing even on `GET`.
- Get explicit confirmation before configuration reads, validation, OAuth, upload, create, update, or delete.
- Redact SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, and engine `extra` secrets.

## Retrieve

- Connection configuration, redaction, validation, OAuth, upload, create/update/delete: [references/connection-configuration.md](references/connection-configuration.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
