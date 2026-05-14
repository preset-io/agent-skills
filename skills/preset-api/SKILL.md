---
name: preset-api
description: Authenticate with the Preset Management API and prepare safe direct API access for Preset tasks. Use when a user needs Preset API credentials, JWT bearer token exchange, base URLs, pagination, Rison query parameters, rate limits, response handling, or the required API setup for any other preset-* skill.
---

# preset-api

Use this skill as the prerequisite for all other Preset API skills.

## Workflow

1. Load [references/authentication.md](references/authentication.md) when credentials, token exchange, token refresh, or reusable client setup is needed.
2. Load [references/api-conventions.md](references/api-conventions.md) when building requests, handling pagination, encoding Superset `q` parameters, or interpreting status codes.
3. Load [references/safety-policy.md](references/safety-policy.md) before any operation that is not clearly read-only.

## Core Rules

- Store `PRESET_CLIENT_ID` and `PRESET_CLIENT_SECRET` outside source code.
- Never log or print access tokens.
- Use `PRESET_API_BASE` only when targeting a non-production Management API.
- Derive workspace hostnames from the Management API before calling workspace Superset APIs.
- Default to read-only operations. Require explicit user confirmation before mutations, SQL execution, imports, exports, role/RLS changes, database connection changes, or guest-token creation.
