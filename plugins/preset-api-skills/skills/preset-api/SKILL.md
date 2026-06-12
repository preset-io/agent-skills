---
name: preset-api
description: "Prepare direct Preset API access: auth, JWT exchange, base URLs, pagination, Rison parameters, response handling, and shared API setup. Use only for direct API workflows; Do not use for MCP-only work."
---

# preset-api

Use as the prerequisite for direct Preset API skills. If the user is working through Preset/Superset MCP tools, stay on MCP unless they approve direct API calls.

## Always

- Keep `PRESET_CLIENT_ID`, `PRESET_CLIENT_SECRET`, and tokens out of source, logs, reports, and examples.
- Use the workspace hostname or API base URL directly when it is already known from trusted context (for example, an earlier Management API response or user-supplied configuration); derive it through the Management API when provenance is missing.
- Run reads directly: metadata reads always; customer-data reads (chart data, samples, distinct values, existing screenshots/thumbnails, own query history) when the user asked in their own message, with row limits as request parameters and summarized output.
- Require explicit confirmation before mutations, imports, role/RLS changes, guest-token creation, permalink creation, screenshot/thumbnail cache generation, cache invalidation, all asset exports, credential-bearing reads, audit downloads, and SQL that is not a confidently classified single-statement SELECT.
- When a target, owner, workspace, output destination, SQL classification, or credential boundary cannot be proven from trusted context, fall back to confirmation.

## Decision Rules

- Use existing authenticated Preset API context; never ask users to paste secrets.
- Select base URL from discovered team, workspace, or Superset workspace facts.
- Use pagination and Rison for list, filter, sort, and search calls.
- Load safety policy before risky follow-up calls.
- If the user starts with direct API intent and mentions MCP only as a fallback, keep direct API intent. Say: "No MCP fallback. MCP tools are a different surface and require separate explicit approval. Stop before MCP calls."
- Do not stop direct API planning just because MCP was mentioned. Stop only before MCP calls or before direct API operations that require confirmation.

## Workflow Order

1. Resolve base URL and credentials.
2. Plan paginated Rison requests.
3. Classify each follow-up call by gate tier: reads run directly (with limits for customer data); mutations, credential reads, and unclassified SQL require confirmation.
4. Reject unapproved MCP fallback if the requested workflow is direct API.
5. Ask before changing surfaces and stop before MCP calls.
6. Continue the direct API plan unless the operation is confirmation-gated by the safety policy.
7. Redact credentials and tokens in all output.

## Retrieve

- Auth, token exchange, reusable client: [references/authentication.md](references/authentication.md)
- Pagination, Rison, status codes, workspace OpenAPI/version handling: [references/api-conventions.md](references/api-conventions.md)
- Approval gates and sensitive-operation policy: [references/safety-policy.md](references/safety-policy.md)
