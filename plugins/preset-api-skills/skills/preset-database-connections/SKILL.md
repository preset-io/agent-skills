---
name: preset-database-connections
description: Inspect or route Preset database connection configuration, validation, OAuth, upload, create, update, and delete workflows through direct Superset API calls. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-database-connections

Use for credential-bearing database connection reads and database connection changes.

## Always

- Auth and conventions come from `preset-api` (JWT exchange, base URLs, Rison); resolve the workspace hostname through the Management API when it is not already known.
- Prefer `preset-datasets` metadata before reading connection configuration.
- Treat connection configuration as credential-bearing even on `GET`.
- Get explicit confirmation before configuration reads, validation, OAuth, upload, create, update, or delete.
- Redact SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, and engine `extra` secrets.

## Decision Rules

- Classify connection configuration as credential-bearing.
- Permit metadata summary only unless the user approves a credential-bearing read.
- Require approval before credential-bearing configuration reads, validation, OAuth, upload, create, update, sync permissions, or delete.
- Forbid printing URI, password, private key, token, certificate, SSH password, or engine extras.

## Workflow Order

1. Resolve database connection metadata.
2. Identify credential-bearing fields and endpoint risk.
3. Prepare approval summary for configuration read, validation, OAuth, upload, create, update, or delete.
4. Stop before credential-bearing configuration read, validation, OAuth, upload, create, update, or delete.

## Retrieve

- Connection configuration routing: [references/connection-configuration.md](references/connection-configuration.md)
- Credential-bearing configuration reads and redaction: [references/connection-credential-reads.md](references/connection-credential-reads.md)
- Validation, OAuth, upload, create/update/delete, sync permissions: [references/connection-mutations-and-validation.md](references/connection-mutations-and-validation.md)
- Approval policy: load `preset-api` and then `references/safety-policy.md`.
