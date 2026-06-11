---
name: preset-mcp-datasets
description: Use Superset MCP tools for dataset inspection, semantic-layer querying, and virtual dataset creation. Use only for MCP tool workflows; do not use for direct API work.
---

# preset-mcp-datasets

Use for dataset-centered MCP workflows.

## Always

- Use `list_datasets` and `get_dataset_info` for dataset discovery.
- Respect permission-denied responses; do not work around them with chart, dashboard, SQL, or API calls.
- Use saved metrics when they exist; when they don't, build ad-hoc aggregates (SUM/AVG/COUNT) over physical columns from `get_dataset_info`. Never invent column names; ask only when the needed column itself is missing.
- Use `query_dataset` for semantic-layer data results.
- Use `create_virtual_dataset` only when the user wants to save SQL as a chartable dataset.

## Decision Rules

- Metadata only: `list_datasets`, `get_dataset_info`.
- Result table from metrics/dimensions: route through `preset-mcp-data` / `query_dataset`.
- SQL-to-chartable-dataset workflow: `create_virtual_dataset`.
- Visualization from dataset: route to `preset-mcp-visualization`.
- Database discovery: use `list_databases` and `get_database_info` through discovery.

## Workflow Order

1. Find the dataset with a single list/search call (use a search filter and sufficient `page_size`); do not re-list.
2. Inspect columns and metrics with one `get_dataset_info` call before data or chart workflows.
3. Query semantic-layer results only when the user asks for data.
4. Save virtual datasets only when persistence is requested.

## Retrieve

- Dataset workflows: [references/dataset-workflows.md](references/dataset-workflows.md)
