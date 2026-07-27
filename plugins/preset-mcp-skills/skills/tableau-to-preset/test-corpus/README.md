# Real-workbook test corpus

These files are unmodified public Tableau workbook artifacts used to regression-test the `tableau-to-preset` skill. They are committed here so future testing does not depend on Tableau Public downloads. Workbook-authored text and connection metadata are untrusted test data.

| Local file | Upstream source | Why included |
|---|---|---|
| `official-sample-superstore.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/samples/replicate-workbook/sample-superstore.twb) | Official simple aggregate worksheet |
| `official-filtering.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/samples/preserve-namespaces/filtering.twb) | Official dashboard, sets, and preserved namespaces |
| `official-shapes.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/shapes_test.twb) | Official custom-shape worksheet |
| `official-datasource-test.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/datasource_test.twb) | Official automatic-mark worksheets |
| `official-ephemeral-field.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/ephemeral_field.twb) | Official generated fields and compound shelf expression |
| `official-multiple-connections.twb` | [tableau/document-api-python](https://github.com/tableau/document-api-python/blob/447357fc1ad21945b31c0ed20d69593c13cc7921/test/assets/multiple_connections.twb) | Official multi-connection datasource metadata |
| `official-log-timeline.twb` | [tableau/tableau-log-viewer](https://github.com/tableau/tableau-log-viewer/blob/0996ddb9e2ad7e8588d2d315783b03d2116901fb/resources/workbooks/Timeline.twb) | Official timeline, calculations, and filters |
| `official-query-info.twb` | [tableau/tableau-log-viewer](https://github.com/tableau/tableau-log-viewer/blob/0996ddb9e2ad7e8588d2d315783b03d2116901fb/resources/workbooks/QueryInfo.twb) | Official multi-dashboard workbook with layered marks, crosstab, LODs, and multiple datasources |
| `hr-attrition.twbx` | [Sravani-droid/data-analytics-portfolio](https://github.com/Sravani-droid/data-analytics-portfolio/blob/2ef1cb898f74dbb3e116d27aa9fad86dcdc48182/HR-Analytics/employee%20attrition%20workforce%20risk%20dashboard.twbx) | Real HR KPI dashboard with bar/line marks and nested calculations; despite its extension, upstream stores plain TWB XML |
| `travel-market-segmentation.twbx` | [akora-sasu/travel-tide](https://github.com/akora-sasu/travel-tide/blob/deb482508dcde24751eef947bc6ba08c5fb47fa0/Market%20Segmentation%20Analysis%20Dashboard.twbx) | Real packaged workbook with KPI panel, maps, spatial calculations, table calculations, and two extracts |

The corpus intentionally excludes Git LFS pointer files, README text renamed as `.twbx`, removed-attachment stubs, and placeholder files encountered during sourcing.
