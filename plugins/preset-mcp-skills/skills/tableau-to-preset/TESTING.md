# Tableau-to-Preset hardening report

Test date: 2026-07-27

Branch: `tableau-skill-hardening`

Corpus: 10 real public workbooks, 46 worksheets, 9 dashboards, 7 of the 8
requested complexity families

## Method

I followed the pre-hardening skill against every workbook: validated/extracted the
artifact, parsed dashboard zones, datasources, calculations, worksheet marks/shelves,
encodings, and filters, then attempted the documented mapping. Workbook text was
treated as untrusted data. I did not import embedded extracts or invent replacement
data.

Scores below describe the **hardened instructions**, after replaying earlier
workbooks against the added rules:

- **P**: the instructions identify/map the feature correctly, including an explicit,
  safe unsupported result.
- **Partial**: supported sheets are deterministic, but at least one sheet still needs
  a virtual-dataset rewrite, handlebars compromise, manual work, or source data.
- **F**: instructions would still cause a silent wrong conversion.
- **N/A**: the workbook does not exercise that rubric item.

`Marks/shelves`, `Viz`, `Calc`, `Layout`, and `Unsupported` correspond directly to the
five requested rubric questions.

## Corpus and scores

Sources and retained artifacts are also listed in
[`test-corpus/README.md`](test-corpus/README.md).

| Workbook | Source | Family / observed facts | Marks / shelves | Viz | Calc | Layout | Unsupported | Overall |
|---|---|---|---:|---:|---:|---:|---:|---|
| `official-sample-superstore.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/samples/replicate-workbook/sample-superstore.twb) | One worksheet; `Automatic`; Market + SUM(Sales) | P | P: infer bar | P | N/A | P | **P** |
| `official-filtering.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/samples/preserve-namespaces/filtering.twb) | Two-sheet dashboard; sets; IF calculation | P | P: infer table | P | P: two equal halves | P: set called out | **P** |
| `official-shapes.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/shapes_test.twb) | Custom Shape mark, categorical shelf, parameters/bin fields | P | P: handlebars, not false scatter | P | N/A | P: glyph loss stated | **P** |
| `official-datasource-test.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/datasource_test.twb) | Two `Automatic` worksheets; simple row and aggregate shelves | P | P: table/bar inference | P | N/A | P | **P** |
| `official-ephemeral-field.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/ephemeral_field.twb) | Generated field, four mark cards, compound arithmetic shelf | P | Partial: ambiguity is flagged | P | N/A | P | **Partial** |
| `official-multiple-connections.twb` | [Tableau official](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/multiple_connections.twb) | Metadata-only workbook; two logical datasources, one federated source with MySQL + SQL Server; no worksheets | N/A | N/A | N/A | N/A | P: connection-vs-blend distinction | **N/A** |
| `official-log-timeline.twb` | [Tableau official](https://github.com/tableau/tableau-log-viewer/blob/0996ddb9e2ad7e8588d2d315783b03d2116901fb/resources/workbooks/Timeline.twb) | Timeline, three filters, bare LOD `{ MIN(...) }`, text replacement | P | P: infer line after field resolution | Partial: virtual rewrite/dialect check | N/A | P | **Partial** |
| `official-query-info.twb` | [Tableau official](https://github.com/tableau/tableau-log-viewer/blob/0996ddb9e2ad7e8588d2d315783b03d2116901fb/resources/workbooks/QueryInfo.twb) | 14 sheets, four dashboards, bar/text/circle/automatic and layered cards; crosstab; multiple datasources; FIXED LOD and string calculations | P | Partial: structured charts plus handlebars | Partial: LOD rewrite | P: normalized 100000-space zones | P | **Partial** |
| `hr-attrition.twbx` | [public portfolio](https://github.com/Sravani-droid/data-analytics-portfolio/blob/2ef1cb898f74dbb3e116d27aa9fad86dcdc48182/HR-Analytics/employee%20attrition%20workforce%20risk%20dashboard.twbx) | 11-sheet KPI dashboard; Bar, Line, Automatic; nested IF/ELSEIF and calculated-field references; plain XML despite `.twbx` suffix | P | P: bars/line/big numbers | P | P after zone dedupe/normalization | P | **P** |
| `travel-market-segmentation.twbx` | [public project](https://github.com/akora-sasu/travel-tide/blob/deb482508dcde24751eef947bc6ba08c5fb47fa0/Market%20Segmentation%20Analysis%20Dashboard.twbx) | 12 sheets; packaged extracts; KPI panel; symbol/line maps; two datasources; FIXED, TOTAL, WINDOW_SUM, MAKEPOINT, MAKELINE | P | Partial: KPI/bar work; maps do not | Partial: virtual rewrites needed | P | P: maps/spatial clearly blocked | **Partial** |

Among the 9 workbooks containing worksheets, 5 fully pass the rubric and 4 are
partial: **56% full-pass, 44% partial, 0 silent-fail after hardening**. Before
hardening, none fully passed: real files use title-cased marks (`Bar`, `Line`,
`Shape`) and extensive `Automatic` marks, while the original table was
case-sensitive and had no Automatic inference. The original parser also selected
only the first mark card.

## Diversity achieved

| Requested family | Coverage |
|---|---|
| Simple bar/line dashboards | Covered: Superstore, HR |
| Dual-axis / combo | Covered: QueryInfo compound shelves/layered mark cards |
| Crosstabs / pivots | Covered: QueryInfo text/Measure Names sheet |
| Filled/symbol maps | Covered: Travel symbol and route maps; still unsupported by MCP generation |
| KPI / big number | Covered: HR and Travel |
| Calculated fields / LOD | Covered heavily: QueryInfo, Timeline, HR, Travel |
| Gantt | **Not found in a validated real artifact during this round** |
| Multi-datasource / blended | Covered: multiple-connections, QueryInfo, Travel |

The GitHub search also found files that were deliberately rejected: Git LFS pointer
text, GitHub “attachment removed” stubs, a four-byte placeholder, dependency-list
text named `.twbx`, README/link text named `.twbx`, and an HTML response named
`.twb`. Tableau Public was not queried because its programmatic download path is
known to be WAF-blocked.

## Gaps found and skill changes

| Failure observed | Hardening change |
|---|---|
| A real `.twbx` was plain XML, not ZIP | Signature-first extraction; explicit rejection of fake artifacts |
| Real mark values were `Bar`, `Line`, `Text`, `Circle`, `Shape`, and `Automatic` | Case normalization and an ordered Automatic inference tree |
| First-`<mark>` parsing hid layered/dual-axis cards | Parse all mark cards and encodings; compound-axis decision rules |
| Shelf parsing by colon splitting fails on nested `/`, `+`, arithmetic, generated fields, and internal calculation IDs | Parse all bracketed references, resolve datasource name/caption maps, and flag Tableau-generated fields |
| Shape-with-category was incorrectly forced to scatter | Scatter now requires two continuous axes; custom shapes use handlebars with glyph-loss disclosure |
| Formatted KPI panels and custom crosstabs had no safe representation | Added an explicit handlebars fallback workflow and boundaries |
| `Automatic` geography could be mistaken for scatter | Generated latitude/longitude and spatial functions are explicitly geographic and unsupported |
| Formula table omitted nested IF, COUNTD, aggregate references, NOT, ABS, REPLACE/CHAR, arithmetic, global/bare LOD | Added translations plus recursive resolution and dialect/grain warnings |
| INCLUDE/EXCLUDE/table calcs were merely “unsupported” with little direction | Require an explicit-grain/window virtual dataset rewrite and validation; no textual substitution |
| “Multiple datasources” rule asked for one target globally | Resolve per worksheet; distinguish cross-sheet sources, federated joins, and worksheet blends |
| Dashboard zones were assumed to be pixels and were duplicated in device layouts | Deduplicate zones and sanity-check with normalized 12-column math |
| Mapping inventory omitted live MCP chart types and dual-series constraints | Added mixed-timeseries decision rules and noted histogram/box/waterfall availability |
| Unsupported features encouraged ad hoc guessing | Expanded limitations and “do not use handlebars to hide semantics” rules |

## End-to-end staging evidence

No corpus datasource exists exactly in staging. Per the brief, I used only rough
domain matches and did **not** claim data-equivalent conversion:

- Superstore-style categorical sales mapped to staging `Video Game Sales`:
  [saved bar chart 422](https://bcff9fe0.us1a.app-stg.preset.io/explore/?slice_id=422).
- Travel departures mapped to staging `Flights`:
  [saved bar chart 423](https://bcff9fe0.us1a.app-stg.preset.io/explore/?slice_id=423).
- Travel KPI mapped to staging `Flights`, using a saved metric and explicit
  trendline aggregation:
  [saved big-number chart 424](https://bcff9fe0.us1a.app-stg.preset.io/explore/?slice_id=424).
- The three saved charts were assembled with `generate_dashboard`:
  [evidence dashboard 306](https://bcff9fe0.us1a.app-stg.preset.io/dashboard/306/).

This proves the hardened column-ref shapes, saved-metric handling, `xy/bar`,
`big_number`, and dashboard assembly against the live staging MCP. It does not prove
semantic equivalence to the original extracts. HR, Tableau log, set-test, and travel
segmentation sources remain data-access gaps; the embedded `.hyper` files were not
imported.

## Regression check

After the final rules were added, all ten artifacts were replayed mentally against
the same audit output:

- Existing clean bar/line/table/big-number mappings remain valid.
- Lowercasing only broadens mark recognition.
- Automatic inference runs before fallback and therefore does not replace explicit
  marks.
- Handlebars is presentation-only and cannot bypass dataset, filter, calculation, or
  blend checks.
- Normalized layout notes do not change `generate_dashboard` inputs.
- Formula additions preserve the original rule that unsupported calculations must be
  surfaced, not silently dropped.

No earlier passing mapping was invalidated.

## Maturity and remaining scope

**Current maturity:** evidence-backed alpha, not ready for an unqualified “automatic
Tableau migration” claim.

- Tested: **7 of 8** requested families across **10** real workbooks.
- Cleanly handled at workbook-rubric level: **5 of 9** workbooks with worksheets.
- Requires a handlebars compromise in **3** workbooks (Shapes, QueryInfo, Travel);
  other structured sheets in those workbooks remain usable.
- Still fundamentally unsupported by MCP generation: maps/spatial routes, exact
  Tableau extracts, interactive sets/parameters/actions, device-specific layout,
  cross-source blends without a reviewed pre-join, and table calculations/LOD whose
  grain has not been rebuilt and validated.
- Untested this round: a validated real Gantt workbook, filled maps specifically,
  high-cardinality production-scale workbooks, Tableau Server connections, and
  pixel/format parity.

A defensible public claim is: **“The skill now audits real TWB/TWBX files, maps common
structured sheets, produces explicit fallbacks or blockers for observed complex
features, and has live MCP evidence for bar/KPI/dashboard creation.”** It should not
yet claim complete or push-button parity.
