# Gateway Flow

## Source

Tool names, parameters, and behavior below were read from `preset-io/mcp-gateway` on `main` at commit `3e9ccac11bac2204a52dd42a835aa7baea99f1aa` (2026-10-07) with `gh api`. The live `tools/list` of the connected gateway is authoritative if it differs.

| Fact | Source path in `preset-io/mcp-gateway` |
|---|---|
| Registered gateway tools and signatures (`list_workspaces`, `list_workspace_services`, `search_workspace_tools`, `call_tool`, `get_workspace_catalog`, Knowledge tools) | `src/mcp_gateway/app.py` (`@gateway.tool` definitions) |
| Production remote URL `https://mcp.app.preset.io/mcp` | `server.json` (`remotes[0].url`) |
| Service ids `workspace_tools`, `knowledge` | `src/mcp_gateway/service_manifest.py` |
| Service descriptors returned by `list_workspace_services` | `src/mcp_gateway/app.py` (`_SERVICE_DESCRIPTORS`) |
| Workflow table and argument examples | `README.md` ("Discover a workspace, a tool, and call it") |
| Capability scopes and reviewed-tool policy | `src/mcp_gateway/workspace_capabilities.py`, `docs/mcp-scopes.md` |
| `call_tool` error classes, missing `request` wrapper hint | `src/mcp_gateway/workspace_failures.py`, `docs/sc-121710-call-tool-error-classes.md` |
| Catalog availability and limits | `src/mcp_gateway/catalog.py`, `docs/workspace-catalog.md` |
| Knowledge tool visibility | `src/mcp_gateway/app.py` (`KnowledgeToolVisibilityMiddleware`) |

## Which surface am I on

| Signal | Aggregate gateway | Direct workspace Superset MCP |
|---|---|---|
| Top-level tools | `list_workspaces`, `list_workspace_services`, `search_workspace_tools`, `call_tool`, `get_workspace_catalog`, Knowledge tools when visible | Superset tools such as `health_check`, `get_instance_info`, `list_dashboards`, `execute_sql` (or a `search_tools` / `call_tool` pair) |
| `call_tool` arguments | `workspace_id`, `tool_name`, `args` | `name`, `arguments` (no workspace parameter) |
| Tool discovery | `search_workspace_tools(workspace_id, query)` returns full MCP definitions | `search_tools` or the client's own `tools/list` |
| Workspace selection | You must select one with `list_workspaces` and pass `workspace_id` on every workspace call | The connection is already one workspace; there is no `workspace_id` |
| Who defines top-level tools | The gateway | The workspace's Superset MCP service |

Rules:

- Decide from the listed tools and their schemas. If both sets of signals are absent or conflicting, ask the user which connection they mean.
- Keep direct-connection behavior unchanged: on a direct connection do not call `list_workspaces`, do not invent a `workspace_id`, and use `search_tools` / `call_tool` with `name` and `arguments` as that server's schema says.
- Do not translate between the two shapes. `tool_name` and `args` belong to the gateway only; `name` and `arguments` belong to the direct pair only.
- An experimental workspace-scoped gateway path (`/workspaces/<id>/mcp`) is disabled by default and not a supported setup target. If a client is connected to one, its tools list natively like a direct connection; follow the listed schemas.

## Gateway tools

| Tool | Arguments | Notes |
|---|---|---|
| `list_workspaces` | optional `limit` (1-100), `offset` (0-10000) | Returns `[{"id", "name", "title"}]` for workspaces the signed-in user can see. With `limit`, follow `_meta["io.preset/pagination"]` `has_more` / `next_offset`. |
| `list_workspace_services` | `workspace_id` | Returns service families (`service_id` `workspace_tools` or `knowledge`) with the gateway tools of each. Omission means unavailable, unauthorized, or unconfirmed. |
| `search_workspace_tools` | `query` (required, max 500 chars), `workspace_id`, optional `limit`, `offset` | Returns complete MCP definitions (`name`, `inputSchema`, `annotations`, ...). Needs a reviewed Superset capability scope. |
| `call_tool` | `workspace_id`, `tool_name`, `args` (object) | Calls one workspace tool. Needs a reviewed Superset capability scope; unreviewed names are refused. |
| `get_workspace_catalog` | `workspace_id`, `asset_type` (`databases`, `datasets`, `charts`, `dashboards`), optional `cursor`, `page_size`, `search`, `format` | Optional. Listed in `list_workspace_services` only when available. |
| `list_knowledge_docs`, `read_knowledge_doc` | `workspace_id` (+ `limit`/`offset`, or `slug`) | Optional; see [gateway-failures.md](gateway-failures.md). |

`workspace_id` must be the exact `id` that `list_workspaces` returned (numeric, passed as a string such as `"123"`). A workspace name or hostname is rejected.

## Step by step

1. List.

   ```json
   list_workspaces {}
   -> [{"id": 123, "name": "a1b2c3d4", "title": "Sales analytics"}, {"id": 456, "name": "e5f6a7b8", "title": "Finance"}]
   ```

2. Select. Two candidates and no explicit choice from the user: ask "Which workspace: Sales analytics (123) or Finance (456)?" and wait. Do not proceed on a guess, and do not pick the one that looks like production.

3. Services (when you need to know what is enabled).

   ```json
   list_workspace_services {"workspace_id": "123"}
   -> [{"service_id": "workspace_tools", "tools": ["search_workspace_tools", "call_tool", "get_workspace_catalog"]}]
   ```

   No `workspace_tools` entry: workspace tools are not available to this user here. Stop and say so. No `knowledge` entry: do not call Knowledge tools for this workspace.

4. Search for the tool and read its live schema.

   ```json
   search_workspace_tools {"workspace_id": "123", "query": "list databases", "limit": 5}
   -> [{"name": "list_databases",
        "inputSchema": {"type": "object", "properties": {"request": {"$ref": "#/$defs/ListDatabasesRequest"}}, "required": ["request"]},
        "annotations": {"readOnlyHint": true, "destructiveHint": false}}]
   ```

   Build `args` from this `inputSchema`. Check `annotations` before calling: `readOnlyHint` / `destructiveHint` describe the selected tool; the dispatcher's own hints do not.

5. Call.

   ```json
   call_tool {"workspace_id": "123", "tool_name": "list_databases", "args": {"request": {"page": 1, "page_size": 5}}}
   ```

   The argument shapes above are illustrative. Workspace tools do not share one shape: many take a single `request` object, some are flat (for example `get_chart_type_schema` with `{"chart_type": ...}`). Always use the schema returned for this workspace and this session; producer versions differ per workspace.

## Rules that do not bend

- One `workspace_id` per call; re-check that it is still the user's chosen workspace before a write.
- A workspace ID is meaningful only for the gateway URL and environment it came from. After switching gateway URLs, re-run `list_workspaces`. Never carry an ID across production, staging, or sandbox.
- Do not call `call_tool` with a tool name you did not get from `search_workspace_tools` in this session, and do not fix a validation error by guessing: re-read the `inputSchema` and change only what it requires.
- Cache nothing across sessions. Tool lists, services, and scopes change.
- Use the narrowest read: a specific `query`, a small `limit`, small `page_size` and row limits inside `args`.

## Search results that are large or incomplete

`search_workspace_tools` never truncates a definition. If a page is too large it returns every complete definition that fits and lists the rest under `omitted` (name, `offset`, whether it is an exact match, whether it is retrievable alone) with a `note`. Fetch an omitted tool you need by repeating the search with `limit: 1` and that `offset`, or narrow the `query`. A definition reported as not retrievable alone cannot be read through the gateway; tell the user and do not guess its schema. With an explicit `limit`, follow `has_more` / `next_offset` instead of repeating the same page.
