# Connection Mutations And Validation

Use this reference before database create, update, delete, validation, OAuth, upload, sync permissions, or SQL validation workflows.

Database mutations and validation can expose credentials or change live connection behavior. Use the workspace OpenAPI for the deployed version before relying on request fields.

## Endpoints

| Goal | Endpoint |
|---|---|
| Create database connection | `POST /api/v1/database/` |
| Update database connection | `PUT /api/v1/database/{pk}` |
| Delete database connection | `DELETE /api/v1/database/{pk}` |
| Sync database permissions | `POST /api/v1/database/{pk}/sync_permissions/` |
| Test connection | `POST /api/v1/database/test_connection/` |
| Validate connection parameters | `POST /api/v1/database/validate_parameters/` |
| Validate SQL for a database | `POST /api/v1/database/{pk}/validate_sql/` |
| OAuth callback/token storage | `GET /api/v1/database/oauth2/` |
| Upload file metadata | `POST /api/v1/database/upload_metadata/` |
| Upload file to database | `POST /api/v1/database/{pk}/upload/` |
| Upload-capable schemas | `GET /api/v1/database/{pk}/schemas_access_for_file_upload/` |

Before mutating or validating, summarize the target database, request body with secrets redacted, expected effect, rollback plan, and validation plan.

Wait for explicit confirmation.
