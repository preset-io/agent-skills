# Connection Configuration

Database connection configuration can expose credentials, network topology, server certificates, SSH tunnel settings, private keys, SQLAlchemy URIs, and engine-specific secrets.

Use this file to route to the narrow connection reference:

- Credential-bearing configuration reads and redaction: [connection-credential-reads.md](connection-credential-reads.md)
- Validation, OAuth, upload, create/update/delete, and sync permissions: [connection-mutations-and-validation.md](connection-mutations-and-validation.md)
- General sensitive-operation policy: [../../preset-api/references/safety-policy.md](../../preset-api/references/safety-policy.md)

Route `GET /api/v1/database/{pk}/connection`, `POST /api/v1/database/test_connection/`, and `POST /api/v1/database/validate_parameters/` through this skill.

Treat configuration reads as credential-bearing even when the HTTP method is `GET`. Redact SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, and engine `extra` secrets.
