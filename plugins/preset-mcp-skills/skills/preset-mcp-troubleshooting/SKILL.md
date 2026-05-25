---
name: preset-mcp-troubleshooting
description: Troubleshoot Superset MCP health, validation, permission, response-size, and bug-report workflows. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-troubleshooting

Use when Superset MCP tools fail, return validation errors, return permission errors, or produce oversized responses.

## Always

- Stay on MCP troubleshooting; do not switch to direct APIs.
- Use `health_check` first for service availability.
- Use `generate_bug_report` when the user says MCP is broken or asks how to report an issue.
- Treat permission denied as authoritative.
- No permission workaround: do not search alternate tools, REST APIs, or direct APIs to expose restricted data.
- Use live tool schemas to fix validation errors.

## Decision Rules

- Connection or availability issue: `health_check`.
- Tool parameter/schema issue: inspect the live tool schema and retry only with corrected MCP arguments.
- Permission issue: explain the denied operation and stop; do not search for alternate tools to expose restricted data.
- Response too large: rerun with narrower filters, identifiers, page sizes, or row limits.
- Repro/report request: `generate_bug_report`.

## Workflow Order

1. Classify the failure: availability, validation, permission, unsupported capability, oversized response, or unknown error.
2. Use the smallest diagnostic MCP tool.
3. Explain the failure in user terms.
4. For permission denied, stop or generate bug report when requested.
5. Stop before direct API or REST API calls.
6. Retry only when the correction is clear and remains on MCP.

## Retrieve

- Troubleshooting guide: [references/troubleshooting.md](references/troubleshooting.md)
