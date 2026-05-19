---
name: preset-api
description: Authenticate with the Preset Management API and prepare safe direct API access for Preset tasks. Use when a user needs Preset API credentials, JWT bearer token exchange, base URLs, pagination, Rison query parameters, rate limits, response handling, Superset OpenAPI routing, or the required API setup for another direct API skill in this package.
---

# preset-api

Use this skill as the prerequisite for all other Preset API skills. These skills are for direct API workflows only. If the user is working through Preset/Superset MCP tools, stay on the MCP surface and use `preset-mcp-skills`; do not switch to direct API calls unless the user explicitly approves changing surfaces.

## Workflow

1. Load [references/authentication.md](references/authentication.md) when credentials, token exchange, token refresh, or reusable client setup is needed.
2. Load [references/api-conventions.md](references/api-conventions.md) when building requests, handling pagination, encoding Superset `q` parameters, checking workspace OpenAPI/version metadata, or interpreting status codes.
3. Load [references/safety-policy.md](references/safety-policy.md) before any operation that is not clearly a metadata read.

## Core Rules

- Store `PRESET_CLIENT_ID` and `PRESET_CLIENT_SECRET` outside source code.
- Never log or print access tokens.
- Use `PRESET_API_BASE` and `PRESET_API_BASE_V2` only when targeting a non-production Management API.
- Derive workspace hostnames from the Management API before calling workspace Superset APIs.
- Default to metadata reads. Require explicit user confirmation before mutations, data-returning reads, SQL text reads, database connection configuration reads, SQL execution, imports, exports, role/RLS changes, database connection changes, cache changes, or guest-token creation.
