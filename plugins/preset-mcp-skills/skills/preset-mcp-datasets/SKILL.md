---
name: preset-mcp-datasets
description: Use Superset MCP tools for dataset inspection, semantic-layer querying, and virtual dataset creation. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-datasets

Use for dataset-centered MCP workflows.

## Always

- Use `list_datasets` and `get_dataset_info` for dataset discovery.
- Respect permission-denied responses; do not work around them with chart, dashboard, SQL, or API calls.
- Use saved metrics and dimensions from `get_dataset_info`; do not invent columns or metric expressions.
- Use `query_dataset` for semantic-layer data results.
- Use `create_virtual_dataset` only when the user wants to save SQL as a chartable dataset.

## Decision Rules

- Metadata only: `list_datasets`, `get_dataset_info`.
- Result table from metrics/dimensions: route through `preset-mcp-data` / `query_dataset`.
- SQL-to-chartable-dataset workflow: `create_virtual_dataset`.
- Visualization from dataset: route to `preset-mcp-visualization`.
- Database discovery: use `list_databases` and `get_database_info` through discovery.

## Workflow Order

1. Find the dataset by ID/UUID or list/search first.
2. Inspect columns and metrics before data or chart workflows.
3. Query semantic-layer results only when the user asks for data.
4. Save virtual datasets only when persistence is requested.

## Retrieve

- Dataset workflows: [references/dataset-workflows.md](references/dataset-workflows.md)
