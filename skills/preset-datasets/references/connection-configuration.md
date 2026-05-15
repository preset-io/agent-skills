# Connection Configuration Routing

Use this reference when a dataset/database task touches credential-bearing database connection details.

Connection responses can include SQLAlchemy URIs, `extra` JSON, server certificates, SSH tunnel configuration, private keys, OAuth tokens, or engine-specific connection fields. Treat them as credential-bearing even on `GET`.

Route the workflow to `preset-database-connections` before calling:

| Goal | Endpoint |
|---|---|
| Connection configuration | `GET /api/v1/database/{pk}/connection` |
| Test connection | database test connection endpoints from the target workspace OpenAPI |
| Validate parameters | database validation endpoints from the target workspace OpenAPI |
| OAuth | database OAuth endpoints from the target workspace OpenAPI |
| Create/update/delete connection | database mutation endpoints from the target workspace OpenAPI |
| Upload-capable connection workflows | upload-related database endpoints from the target workspace OpenAPI |

Use `preset-database-connections` before calling connection configuration, validation, OAuth, upload, create, update, or delete endpoints.

Never print SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, or engine `extra` secrets.
