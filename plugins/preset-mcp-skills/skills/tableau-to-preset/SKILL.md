---
name: tableau-to-preset
description: Guided workflow for converting a Tableau workbook (.twb or .twbx) to a Preset dashboard via Superset MCP tools. Parses TWB XML, maps chart types, calls generate_chart per worksheet, and assembles with generate_dashboard. Use only for MCP tool workflows; do not use for direct API work.
user-invocable: true
argument-hint: <path/to/workbook.twb|.twbx>
---

# tableau-to-preset

Use for converting a Tableau workbook file to a Preset dashboard through MCP tools.

## Always

- Parse TWB XML with `python3 -c "..."` and `xml.etree.ElementTree` — no external libraries required.
- Unzip `.twbx` before parsing — it is a ZIP archive containing a `.twb` XML file.
- Resolve the Preset dataset with `list_datasets` / `get_dataset_info` before building any chart; do not fabricate column names or metric expressions.
- Map each Tableau worksheet to one `generate_chart` call; record the returned chart ID before moving on.
- Call `generate_dashboard` only after all charts are saved, using only the IDs returned by `generate_chart`.
- Do not use direct API, curl, Python requests, or SQL execution at any stage.
- Flag unsupported worksheets or calculated fields to the user before skipping; do not silently drop them.

## Decision Rules

- `.twbx` input → unzip to `/tmp/twbx/` first, then treat the extracted `.twb` as the workbook path.
- No matching Preset dataset → surface the Tableau connection details (class, server, dbname, schema) to the user; ask whether to point at an existing dataset or create a virtual one via `create_virtual_dataset`.
- Unsupported mark type (`map`, `filled map`) → tell the user, skip the worksheet, continue with the rest.
- LOD INCLUDE / EXCLUDE or table calculation in a calculated field → flag as unsupported; ask the user how to handle before continuing.
- Multiple Tableau datasources in one workbook → handle one datasource at a time; ask the user which to target when there is ambiguity.
- `generate_chart` returns an error → report the error verbatim, ask before retrying or skipping.

## Workflow Order

1. **Extract** — unzip `.twbx` if needed; confirm the `.twb` file path.
2. **Parse datasources** — run the datasource one-liner; record connection class, server, database, schema, and table.
3. **Resolve dataset** — `list_datasets`, then `get_dataset_info` on the match; confirm column and metric names.
4. **Audit calculated fields** — run the calculated-fields one-liner; translate or flag each one.
5. **Parse worksheets** — run the worksheet one-liner; build the chart-type mapping table for the user to review.
6. **Save charts** — call `generate_chart` per worksheet in order; collect returned chart IDs.
7. **Capture layout notes** — run the zones one-liner; record each worksheet zone's name and relative position as notes for the user (x/y/w/h in Tableau pixels). Do not attempt to map these to a Superset grid — `generate_dashboard` auto-arranges charts.
8. **Assemble dashboard** — call `generate_dashboard` with chart IDs and the dashboard title; report the returned dashboard URL and the captured layout notes so the user can refine positions in Preset.

## Retrieve

- TWB parsing commands, chart-type map, tool call examples, grid-mapping math, formula translations, and limitations: [references/tableau-conversion-workflows.md](references/tableau-conversion-workflows.md)
