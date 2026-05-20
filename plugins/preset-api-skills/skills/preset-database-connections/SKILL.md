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

## Decision Rules

- Classify connection configuration as credential-bearing.
- Permit metadata summary only unless the user approves a credential-bearing read.
- Require approval before data-returning reads, validation, OAuth, upload, create, update, or delete.
- Forbid printing URI, password, private key, token, certificate, SSH password, or engine extras.

## Workflow Order

1. Resolve database connection metadata.
2. Identify credential-bearing fields and endpoint risk.
3. Summarize safe non-secret configuration.
4. Redact URI, password, private key, token, certificate, SSH password, and engine extras.

## Retrieve

- Connection configuration, redaction, validation, OAuth, upload, create/update/delete: [references/connection-configuration.md](references/connection-configuration.md)
- Approval policy: [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md)
