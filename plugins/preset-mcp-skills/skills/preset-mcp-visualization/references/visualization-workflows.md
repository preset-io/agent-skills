# Visualization Workflows

## Explore First

For most visualization requests:

1. `list_datasets` or `get_dataset_info`
2. `get_chart_type_schema` when config details are uncertain
3. `generate_explore_link`

This creates a reviewable interactive URL without permanently saving a chart.

## Save Chart

Use `generate_chart` only when the user wants a saved chart. Check the response for success or error before claiming the chart exists.

## Update Chart

Use `get_chart_info` before `update_chart` so the update is based on the current chart configuration. Do not use SQL execution to modify a chart.
