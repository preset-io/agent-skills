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

## Decision Rules

- Use existing authenticated Preset API context; never ask users to paste secrets.
- Select base URL from discovered team, workspace, or Superset workspace facts.
- Use pagination and Rison for list, filter, sort, and search calls.
- Load safety policy before risky follow-up calls.

## Workflow Order

1. Resolve base URL and credentials.
2. Plan paginated Rison requests.
3. Classify follow-up risk before data, credential, SQL, token, export, import, or mutation calls.
4. Redact credentials and tokens in all output.

## Retrieve

- Auth, token exchange, reusable client: [references/authentication.md](references/authentication.md)
- Pagination, Rison, status codes, workspace OpenAPI/version handling: [references/api-conventions.md](references/api-conventions.md)
- Approval gates and sensitive-operation policy: [references/safety-policy.md](references/safety-policy.md)
