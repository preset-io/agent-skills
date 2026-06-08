# Tableau Conversion Workflows

## Phase 1: File Extraction

**`.twb`** — plain XML; parse directly.

**`.twbx`** — ZIP archive; unzip first, then use the extracted `.twb`:

```bash
python3 -c "
import zipfile, pathlib, tempfile
dest = pathlib.Path(tempfile.mkdtemp(prefix='twbx_'))
dest_str = str(dest.resolve()) + '/'
with zipfile.ZipFile('workbook.twbx') as zf:
    twb_members = [m for m in zf.namelist() if m.endswith('.twb')]
    if not twb_members:
        raise ValueError('No .twb file found in archive')
    for member in twb_members:
        target = str((dest / member).resolve())
        if not target.startswith(dest_str):
            raise ValueError(f'Unsafe path in archive: {member}')
        zf.extract(member, dest)
print(str(dest / twb_members[0]))
"
```

The command prints the full path to the extracted `.twb` file. Use that path directly for all subsequent parsing steps — `.hyper` and `.tde` data extracts are intentionally skipped since they are not usable in this workflow (see Limitations).

---

## Phase 2: Datasource Parsing

```bash
python3 -c "
import xml.etree.ElementTree as ET
root = ET.parse('workbook.twb').getroot()
for ds in root.findall('datasources/datasource'):
    if ds.get('name', '').startswith('Parameters'):
        continue
    conn = ds.find('.//connection')
    if conn is not None:
        print('caption:', ds.get('caption', ds.get('name', '')))
        print('  class:', conn.get('class', ''))
        print('  server:', conn.get('server', ''))
        print('  dbname:', conn.get('dbname', ''))
        print('  schema:', conn.get('schema', ''))
        print('  table:', conn.get('table', ''))
        print()
"
```

Record `caption` (display name), `class` (connector type: `snowflake`, `bigquery_v2`, `postgres`, `redshift`, etc.), `server`, `dbname`, `schema`, and `table`. Use these to identify the matching Preset dataset.

---

## Phase 3: Calculated Field Audit

```bash
python3 -c "
import xml.etree.ElementTree as ET
root = ET.parse('workbook.twb').getroot()
for ds in root.findall('.//datasource'):
    if ds.get('name', '').startswith('Parameters'):
        continue
    for col in ds.findall('column'):
        calc = col.find('calculation')
        if calc is not None:
            print('field:', col.get('caption', col.get('name', '')))
            print('formula:', calc.get('formula', ''))
            print()
"
```

**Formula translations:**

| Tableau formula | SQL / Superset equivalent |
|---|---|
| `DATETRUNC('month', [Order Date])` | `DATE_TRUNC('month', order_date)` |
| `DATETRUNC('year', [Order Date])` | `DATE_TRUNC('year', order_date)` |
| `DATEDIFF('day', [Start Date], [End Date])` | `DATEDIFF(day, start_date, end_date)` (dialect-specific) |
| `IIF([Profit] > 0, 'Positive', 'Negative')` | `CASE WHEN profit > 0 THEN 'Positive' ELSE 'Negative' END` |
| `{ FIXED [Region] : SUM([Sales]) }` | Subquery or virtual dataset (see below) |
| `ISNULL([Field])` | `field IS NULL` |
| `STR([Number Field])` | `CAST(number_field AS VARCHAR)` |
| `INT([String Field])` | `CAST(string_field AS INTEGER)` |

**LOD FIXED** expressions can often be recreated as a virtual dataset subquery. Use `create_virtual_dataset` to save the SQL, then build charts against that dataset.

**LOD INCLUDE / EXCLUDE** and table calculations (`RUNNING_SUM`, `RANK`, `WINDOW_SUM`, etc.) are not supported — flag these to the user before continuing.

---

## Phase 4: Worksheet Parsing

```bash
python3 -c "
import xml.etree.ElementTree as ET
root = ET.parse('workbook.twb').getroot()
for ws in root.findall('.//worksheet'):
    name = ws.get('name', '')
    mark = ws.find('.//mark')
    mark_class = mark.get('class', 'unknown') if mark is not None else 'unknown'
    rows_el = ws.find('.//rows')
    cols_el = ws.find('.//cols')
    rows = rows_el.text.strip() if rows_el is not None and rows_el.text else ''
    cols = cols_el.text.strip() if cols_el is not None and cols_el.text else ''
    print(f'worksheet: {name!r}  mark: {mark_class}')
    print(f'  cols: {cols}')
    print(f'  rows: {rows}')
    print()
"
```

`cols` and `rows` are Tableau shelf expressions like `[datasource].[field:type]` or `SUM([datasource].[sales:qk])`. Parse these to identify x-axis, y-axis metrics, and grouping fields. The `nk` / `ok` / `qk` suffixes encode data type and aggregation role — strip them and the datasource prefix to get the raw field name.

---

## Phase 5: Chart Type Mapping

| Tableau `mark class` | `chart_type` | `kind` |
|---|---|---|
| `bar` | `xy` | `bar` |
| `line` | `xy` | `line` |
| `area` | `xy` | `area` |
| `circle` / `shape` | `xy` | `scatter` |
| `pie` | `pie` | — |
| `text` (crosstab) | `table` | — |
| `text` (with row/col pivots) | `pivot_table` | — |
| `square` (treemap) | **Unsupported — skip** | — |
| `gantt` | **Unsupported — skip** | — |
| `map` / `filled map` | **Unsupported — skip** | — |
| KPI / single value | `big_number` | — |

The live MCP schema accepts `chart_type` values: `xy`, `table`, `pie`, `pivot_table`, `mixed_timeseries`, `handlebars`, `big_number`. For bar/line/area/scatter, `chart_type` is always `xy`; the visual style is set via `kind` in the config. Always call `get_chart_type_schema(chart_type=<value>)` to retrieve the exact required and optional config fields before calling `generate_chart`.

---

## Phase 6: `generate_chart` Workflow

### Step 1: Resolve dataset ID

```
list_datasets()
```

Find the dataset matching the Tableau datasource (by name, schema, or connection info from Phase 2). Record its `id`.

### Step 2: Inspect columns and saved metrics

```
get_dataset_info(request={"identifier": <id>})
```

Use the returned column names and saved metric names. Do not invent columns.

### Step 3: Get the chart config schema

```
get_chart_type_schema(chart_type="xy")   # use "xy" for bar/line/area/scatter; "pie", "table", "pivot_table", "big_number" for others
```

This returns the exact required and optional config fields for the MCP `generate_chart` call. Follow the live schema — do not guess field names.

### Step 4: Call `generate_chart`

The outer wrapper fields below are stable across chart types. The inner `config` must match what `get_chart_type_schema` returns for the specific chart type.

```
generate_chart(request={
  "chart_name": "Sales by Category",
  "dataset_id": 42,
  "save_chart": true,
  "config": {
    "... fields from get_chart_type_schema ..."
  }
})
```

**Illustrative config shapes** (verify each with `get_chart_type_schema` before use):

| `chart_type` | `kind` | Likely config fields |
|---|---|---|
| `xy` | `bar` / `line` / `area` | `kind`, `x` (x-axis column), `y` (metric column or saved metric name), `group_by` (series dimension) |
| `xy` | `scatter` | `kind`, `x`, `y`, `group_by` |
| `pie` | — | `dimension`, `metric` |
| `table` | — | `columns` (dimension list), `metrics` |
| `pivot_table` | — | `rows` (required, dimension list), `columns` (optional cross-tab), `metrics` |
| `big_number` | — | `metric` |

**Saved metric** — if `get_dataset_info` shows a saved metric matching the Tableau measure, pass it by name per the live schema rather than reconstructing the aggregation expression.

Record the chart ID returned by each `generate_chart` call before moving to the next worksheet.

---

## Phase 7: Dashboard Layout Notes

`generate_dashboard` auto-arranges charts and does not accept explicit position coordinates. Run the zone one-liner to capture relative layout information as notes for the user to reference when refining positions in the Preset UI.

### Extract zone coordinates

```bash
python3 -c "
import xml.etree.ElementTree as ET
root = ET.parse('workbook.twb').getroot()
for dash in root.findall('.//dashboard'):
    size = dash.find('size')
    cw = size.get('maxwidth', '?') if size is not None else '?'
    ch = size.get('maxheight', '?') if size is not None else '?'
    print(f'Dashboard: {dash.get(\"name\")}  canvas: {cw}x{ch}')
    for zone in dash.findall('.//zone'):
        name = zone.get('name', '')
        x, y, w, h = zone.get('x'), zone.get('y'), zone.get('w'), zone.get('h')
        if name and x and w:
            print(f'  {name!r}: x={x} y={y} w={w} h={h}')
"
```

Present the zone output to the user as a layout reference. After `generate_dashboard` creates the dashboard, direct the user to Preset's drag-and-drop editor to arrange charts to match the original Tableau layout.

### Call `generate_dashboard`

```
generate_dashboard(request={
  "dashboard_title": "Sales Overview",
  "chart_ids": [101, 102, 103]
})
```

Report the returned dashboard URL alongside the zone layout notes.

---

## Limitations

| Limitation | Detail |
|---|---|
| `.hyper` / `.tde` data extracts | No MCP tool to import Tableau extract data; the Preset dataset must be a live database connection |
| LOD INCLUDE / EXCLUDE | Not expressible as a single column; must be restructured as a virtual dataset or separate SQL |
| Table calculations (`RUNNING_SUM`, `RANK`, `WINDOW_SUM`, etc.) | Computed server-side in Tableau; must be rewritten as window functions in a virtual dataset SQL |
| Map / filled map charts | No direct `generate_chart` equivalent; skip or ask the user to create `deck_scatter` / `deck_choropleth` manually |
| Dashboard chart positioning | `generate_dashboard` auto-arranges; exact zone positions from the TWB must be applied manually in the Preset UI |
| Multi-datasource worksheet blends | Each `generate_chart` targets one Preset dataset; Tableau blends must be pre-joined in a virtual dataset |
| Dashboard parameter actions | Superset native filters are not set automatically; configure manually after dashboard creation |
| Dashboard URL / filter actions | Not supported via MCP; configure manually in Preset |
| Tableau Server-side formatting (number formats, color palettes) | Not carried over; apply in Preset chart settings after creation |
