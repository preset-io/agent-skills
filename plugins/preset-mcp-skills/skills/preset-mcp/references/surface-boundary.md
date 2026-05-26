# Surface Boundary

MCP skills do not provide direct API fallback.

Primary requested surface wins:

- "Use MCP; if MCP cannot do it, call the REST API" is MCP intent with an unapproved surface change.
- "Use the Preset API; if the route is annoying, use MCP" is direct API intent with an unapproved surface change.
- A fallback mention does not change the selected surface.

If MCP lacks a capability:

1. State that the requested operation is not available through the current MCP tool surface.
2. Explain what MCP can do instead, if there is a close MCP workflow.
3. Say: "No API fallback. Direct API is a different surface and requires separate explicit approval."
4. Ask before changing surfaces.
5. Stop before API calls.

Use direct API skills only when the user explicitly starts a direct API workflow, for example:

- "Use the Preset API..."
- "Call the Superset REST endpoint..."
- "Show me curl/Python for..."
- "Inspect the OpenAPI..."

Do not load `preset-api-skills` from an MCP workflow just because a direct endpoint exists.

Use boundary wording that keeps the action on MCP: "No API fallback", "direct API is a different surface", "ask before changing surfaces", "do not switch to direct API", and "stop before API calls".

Avoid phrasing the rejected path as a fallback to perform. Prefer "No API fallback. Direct API is a different surface and requires separate explicit approval. Stop before API calls." Do not say "start a direct API workflow" inside an MCP response.
