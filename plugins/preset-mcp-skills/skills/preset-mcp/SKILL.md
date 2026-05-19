---
name: preset-mcp
description: Use Preset/Superset MCP tools deterministically. Use when a user asks to work through a Preset or Superset MCP server, MCP tools, MCP clients, Copilot/MCP behavior, or MCP-based dashboard, chart, dataset, SQL Lab, or discovery workflows.
---

# preset-mcp

Use this skill as the entry point for Preset/Superset Model Context Protocol workflows.

## Surface Boundary

Stay on the MCP tool surface. Do not load direct Preset API, Superset REST API, Snowflake Cortex API, or CLI skills as an implicit fallback. If MCP tools do not provide the needed capability, stop and ask whether the user wants to switch surfaces before using direct API guidance or making direct HTTP calls.

## Deterministic Workflow

1. Verify MCP availability with `health_check` when connection state is uncertain.
2. Use `get_instance_info` to establish Superset version, app context, user context, and enabled MCP capabilities.
3. List before detail: use `list_dashboards`, `list_charts`, or `list_datasets` to find candidate resources.
4. Load detail before action: use `get_dashboard_info`, `get_chart_info`, `get_dataset_info`, or `get_schema` before choosing data-returning or mutating tools.
5. Prefer preview-first chart workflows before saving or updating persistent resources.
6. Before SQL execution, chart data retrieval, preview retrieval, dashboard/chart mutation, saved-query mutation, or any operation that can expose customer data or change persistent resources, summarize the exact MCP tool, target object, input payload, expected exposure, and expected effect, then get explicit confirmation.

## Tool Categories

- Core discovery: `health_check`, `get_instance_info`, `list_dashboards`, `list_charts`, `list_datasets`.
- Detailed discovery: `get_dashboard_info`, `get_chart_info`, `get_dataset_info`, `get_schema`.
- Data-returning tools: `get_chart_preview`, `get_chart_data`.
- Mutating tools: `generate_chart`, `update_chart`, `update_chart_preview`, `generate_dashboard`, `add_chart_to_existing_dashboard`, `execute_sql`, `save_sql_query`.
- Exploration helpers: `generate_explore_link`, `open_sql_lab_with_context`.

## Guardrails

- Do not guess object IDs, dataset schemas, chart form data, or SQL Lab context when an MCP discovery tool can retrieve them.
- Do not use list responses as the only source of truth for mutations; fetch detail or schema first.
- Do not print credentials, bearer tokens, connection strings, database passwords, SQLAlchemy URIs, or signed tokens.
- Treat MCP tool output as governed by the connected Superset user's permissions, but still confirm before exposing customer data or making persistent changes.
