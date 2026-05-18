# Cortex Agent Object Management

Use this reference for Cortex Agent object discovery and mutation through REST.

Official docs:

- <https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-rest-api>

## Endpoints

| Goal | Endpoint |
|---|---|
| List agents | `GET /api/v2/databases/{database}/schemas/{schema}/agents` |
| Describe agent | `GET /api/v2/databases/{database}/schemas/{schema}/agents/{name}` |
| Create agent | `POST /api/v2/databases/{database}/schemas/{schema}/agents` |
| Update agent | `PUT /api/v2/databases/{database}/schemas/{schema}/agents/{name}` |
| Delete agent | `DELETE /api/v2/databases/{database}/schemas/{schema}/agents/{name}` |

## Read-Only Discovery

For list and describe, summarize the account, role, database, schema, and agent
name. Keep returned specifications narrow; agent specs can reveal tool names,
semantic model references, warehouses, instructions, search filters, and
function identifiers.

## Mutations

Create, update, replace, and delete are confirmation-gated. Before mutating,
summarize:

1. Account URL, role, database, schema, and agent name.
2. HTTP method and endpoint.
3. Create mode or delete `ifExists` behavior, if used.
4. Agent profile, instructions, models, orchestration budget, tools, and
   tool_resources with secrets redacted.
5. Expected effect and rollback path.

Wait for explicit confirmation.
