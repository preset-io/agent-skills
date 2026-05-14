---
name: preset-database-connections
description: Inspect or route Preset workspace database connection configuration, validation, OAuth, upload, and mutation workflows with credential-aware approval. Use when a user asks for database connection details, SQLAlchemy URIs, engine parameters, SSH tunnel settings, connection tests, OAuth, or database create/update/delete.
---

# preset-database-connections

Use this skill for credential-bearing database connection reads and database connection changes.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Use `preset-superset` to capture workspace version/OpenAPI and current-user roles when permissions matter.
4. Use `preset-datasets` for database metadata before reading or changing connection configuration.
5. Load [references/connection-configuration.md](references/connection-configuration.md) before any connection configuration read, validation, OAuth, upload, create, update, or delete.
6. Load [../preset-api/references/safety-policy.md](../preset-api/references/safety-policy.md), summarize the credential exposure or mutation, and get explicit user confirmation.

## Guardrails

- Treat connection configuration as credential-bearing even on `GET`.
- Never print SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, or engine `extra` secrets.
- Prefer metadata reads from `preset-datasets` before accessing connection configuration.
- Do not test, validate, create, update, or delete database connections without explicit confirmation.

