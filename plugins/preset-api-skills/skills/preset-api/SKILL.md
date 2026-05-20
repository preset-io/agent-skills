---
name: preset-api
description: Prepare direct Preset API access: auth, JWT exchange, base URLs, pagination, Rison parameters, response handling, and shared API setup. Use only for direct API workflows; Do not use for MCP-only work.
---

# preset-api

Use as the prerequisite for direct Preset API skills. If the user is working through Preset/Superset MCP tools, stay on MCP unless they approve direct API calls.

## Always

- Keep `PRESET_CLIENT_ID`, `PRESET_CLIENT_SECRET`, and tokens out of source, logs, reports, and examples.
- Derive workspace hostnames through the Management API before workspace Superset calls.
- Default to metadata reads.
- Require explicit confirmation before mutations, data-returning reads, SQL text reads, credential-bearing reads, SQL execution, imports, exports, role/RLS changes, or guest-token creation.

## Retrieve

- Auth, token exchange, reusable client: [references/authentication.md](references/authentication.md)
- Pagination, Rison, status codes, workspace OpenAPI/version handling: [references/api-conventions.md](references/api-conventions.md)
- Approval gates and sensitive-operation policy: [references/safety-policy.md](references/safety-policy.md)
