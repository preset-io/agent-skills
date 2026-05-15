# Connection Configuration

Database connection configuration can expose credentials, network topology, server certificates, SSH tunnel settings, private keys, SQLAlchemy URIs, and engine-specific secrets.

## Credential-Bearing Reads

| Goal | Endpoint |
|---|---|
| Connection configuration | `GET /api/v1/database/{pk}/connection` |

Before calling this endpoint, summarize:

1. Workspace hostname.
2. Database ID and database name.
3. Why connection configuration is needed instead of metadata.
4. Fields expected to be read.
5. Redaction plan for any returned secrets.

Do not paste raw responses into logs, Markdown, PR comments, or handoff notes.

## Mutations And Validation

Database create, update, delete, validation, OAuth, upload, sync permissions, and SQL validation are confirmation-gated. Use the workspace OpenAPI for the deployed version before relying on request fields.

| Surface | Examples |
|---|---|
| Database mutations | create, update, delete, sync permissions, OAuth, uploads |
| Database validation | test connection, validate parameters, validate SQL |
| Secret-bearing fields | password, SQLAlchemy URI, encrypted extra, SSH tunnel fields, private keys |

Before mutating, summarize the target database, request body with secrets redacted, expected effect, rollback plan, and validation plan.
