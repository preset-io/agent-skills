# Tableau Conversion Workflows

## Phase 1: File Extraction

**`.twb`** — plain XML; parse directly.

**`.twbx`** — ZIP archive; unzip first, then use the extracted `.twb`:

```bash
python3 -c "import zipfile; zipfile.ZipFile('workbook.twbx').extractall('/tmp/twbx')"
ls /tmp/twbx/
```

The `.twb` file will be in `/tmp/twbx/`. Any `.hyper` or `.tde` data extract files will also appear there, but are not usable in this workflow (see Limitations).

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

| Tableau `mark class` | Preset `viz_type` | `chart_type` discriminator |
|---|---|---|
| `bar` | `echarts_timeseries_bar` | `xy` |
| `line` | `echarts_timeseries` | `xy` |
| `area` | `echarts_area` | `xy` |
| `circle` / `shape` | `echarts_bubble_v2` | `xy` |
| `pie` | `pie` | `pie` |
| `text` (crosstab) | `table` | `table` |
| `text` (with row/col pivots) | `pivot_table` | `pivot_table` |
| `square` (treemap) | `treemap_v2` | call `get_chart_type_schema` |
| `gantt` | `echarts_gantt` | call `get_chart_type_schema` |
| `map` / `filled map` | **Unsupported — skip** | — |
| KPI / single value | `big_number` | `big_number` |

For `treemap_v2` and `echarts_gantt`, call `get_chart_type_schema` to confirm required config fields before building the chart.

---

## Phase 6: `generate_chart` Examples

Run `get_dataset_info(datasource_name="my_dataset")` first to confirm available column names and any saved metrics. Replace all placeholder names below with real values from that response.

### Bar Chart (Tableau `mark: bar`)

```json
{
  "chart_name": "Sales by Category",
  "datasource_name": "orders",
  "config": {
    "chart_type": "xy",
    "viz_type": "echarts_timeseries_bar",
    "x_axis": "order_date",
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "sales"},
        "aggregate": "SUM",
        "label": "SUM(sales)"
      }
    ],
    "groupby": ["category"]
  }
}
```

### Line Chart (Tableau `mark: line`)

```json
{
  "chart_name": "Revenue Trend",
  "datasource_name": "orders",
  "config": {
    "chart_type": "xy",
    "viz_type": "echarts_timeseries",
    "x_axis": "order_date",
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "revenue"},
        "aggregate": "SUM",
        "label": "SUM(revenue)"
      }
    ]
  }
}
```

### Area Chart (Tableau `mark: area`)

```json
{
  "chart_name": "Cumulative Orders",
  "datasource_name": "orders",
  "config": {
    "chart_type": "xy",
    "viz_type": "echarts_area",
    "x_axis": "order_date",
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "order_count"},
        "aggregate": "SUM",
        "label": "SUM(order_count)"
      }
    ],
    "groupby": ["region"]
  }
}
```

### Scatter / Bubble (Tableau `mark: circle`)

```json
{
  "chart_name": "Profit vs Sales",
  "datasource_name": "orders",
  "config": {
    "chart_type": "xy",
    "viz_type": "echarts_bubble_v2",
    "x_axis": "sales",
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "profit"},
        "aggregate": "SUM",
        "label": "SUM(profit)"
      }
    ],
    "groupby": ["category"]
  }
}
```

### Pie Chart (Tableau `mark: pie`)

```json
{
  "chart_name": "Profit by Region",
  "datasource_name": "orders",
  "config": {
    "chart_type": "pie",
    "groupby": ["region"],
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "profit"},
        "aggregate": "SUM",
        "label": "SUM(profit)"
      }
    ]
  }
}
```

### Table (Tableau `mark: text`, flat list)

```json
{
  "chart_name": "Sales Summary",
  "datasource_name": "orders",
  "config": {
    "chart_type": "table",
    "columns": ["category", "sub_category", "region"],
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "sales"},
        "aggregate": "SUM",
        "label": "SUM(sales)"
      }
    ]
  }
}
```

### Pivot Table (Tableau `mark: text`, with row/column pivots)

```json
{
  "chart_name": "Regional Category Pivot",
  "datasource_name": "orders",
  "config": {
    "chart_type": "pivot_table",
    "groupbyRows": ["region"],
    "groupbyColumns": ["category"],
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "sales"},
        "aggregate": "SUM",
        "label": "SUM(sales)"
      }
    ]
  }
}
```

### Big Number / KPI

```json
{
  "chart_name": "Total Revenue",
  "datasource_name": "orders",
  "config": {
    "chart_type": "big_number",
    "metrics": [
      {
        "expressionType": "SIMPLE",
        "column": {"column_name": "revenue"},
        "aggregate": "SUM",
        "label": "SUM(revenue)"
      }
    ]
  }
}
```

### Using a Preset Saved Metric

When `get_dataset_info` shows a saved metric matching the Tableau measure, reference it with `saved_metric: true` instead of rebuilding the aggregation:

```json
{
  "chart_name": "Total Orders",
  "datasource_name": "orders",
  "config": {
    "chart_type": "big_number",
    "metrics": [
      {
        "saved_metric": true,
        "name": "total_orders",
        "label": "Total Orders"
      }
    ]
  }
}
```

---

## Phase 7: Dashboard Layout

### Extract zone coordinates

```bash
python3 -c "
import xml.etree.ElementTree as ET
root = ET.parse('workbook.twb').getroot()
for dash in root.findall('.//dashboard'):
    size = dash.find('size')
    cw = int(size.get('maxwidth', 1000)) if size is not None else 1000
    ch = int(size.get('maxheight', 800)) if size is not None else 800
    print(f'Dashboard: {dash.get(\"name\")}  canvas: {cw}x{ch}')
    for zone in dash.findall('.//zone'):
        name = zone.get('name', '')
        x, y, w, h = zone.get('x'), zone.get('y'), zone.get('w'), zone.get('h')
        if name and x and w:
            print(f'  {name!r}: x={x} y={y} w={w} h={h}')
"
```

### Map to Superset 12-column grid

Superset uses a 12-column grid. Tableau canvases default to 1000×800 px. Use these formulas — adjust if your canvas size differs:

```
col    = round(x / canvas_width * 12)
width  = max(2, round(w / canvas_width * 12))
row    = round(y / 100)          # 100 px ≈ 1 Superset row unit (approximate)
height = max(2, round(h / 100))
```

Widths must sum to ≤ 12 per visual row. Clamp `col + width` to 12 if it exceeds the grid.

### Call `generate_dashboard`

Use only chart IDs returned by `generate_chart`. The exact schema for `positions` depends on the live MCP tool — check with `get_chart_type_schema` or the Superset MCP source of truth if needed.

```json
{
  "dashboard_title": "Sales Overview",
  "chart_ids": [101, 102, 103],
  "positions": [
    {"id": 101, "row": 0, "col": 0,  "width": 6, "height": 4},
    {"id": 102, "row": 0, "col": 6,  "width": 6, "height": 4},
    {"id": 103, "row": 4, "col": 0,  "width": 12, "height": 6}
  ]
}
```

If `generate_dashboard` does not accept a `positions` field, call it with only `dashboard_title` and `chart_ids`. The user can arrange chart positions in the Preset UI afterwards.

---

## Limitations

| Limitation | Detail |
|---|---|
| `.hyper` / `.tde` data extracts | No MCP tool to import Tableau extract data; the Preset dataset must be a live database connection |
| LOD INCLUDE / EXCLUDE | Not expressible as a single column; must be restructured as a virtual dataset or separate SQL |
| Table calculations (`RUNNING_SUM`, `RANK`, `WINDOW_SUM`, etc.) | Computed server-side in Tableau; must be rewritten as window functions in a virtual dataset SQL |
| Map / filled map charts | No direct `generate_chart` equivalent; skip or ask the user to create `deck_scatter` / `deck_choropleth` manually |
| Multi-datasource worksheet blends | Each `generate_chart` targets one Preset dataset; Tableau blends must be pre-joined in a virtual dataset |
| Dashboard parameter actions | Superset native filters are not set automatically; configure manually after dashboard creation |
| Dashboard URL / filter actions | Not supported via MCP; configure manually in Preset |
| Tableau Server-side formatting (number formats, color palettes) | Not carried over; apply in Preset chart settings after creation |
