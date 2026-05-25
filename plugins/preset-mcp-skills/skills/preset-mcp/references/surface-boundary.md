# Surface Boundary

MCP skills do not provide direct API fallback.

If MCP lacks a capability:

1. State that the requested operation is not available through the current MCP tool surface.
2. Explain what MCP can do instead, if there is a close MCP workflow.
3. Stop. Do not call direct APIs.

Use direct API skills only when the user explicitly starts a direct API workflow, for example:

- "Use the Preset API..."
- "Call the Superset REST endpoint..."
- "Show me curl/Python for..."
- "Inspect the OpenAPI..."

Do not load `preset-api-skills` from an MCP workflow just because a direct endpoint exists.
