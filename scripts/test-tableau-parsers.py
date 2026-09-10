#!/usr/bin/env python3
"""Execute the documented parsers against small, authored XML fixtures."""
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys
import tempfile
import unittest

REFERENCE = Path(__file__).resolve().parents[1] / (
    'plugins/preset-mcp-skills/skills/tableau-to-preset/references/'
    'tableau-conversion-workflows.md'
)


def parse(phase, xml):
    # Read the production snippets, rather than duplicating their logic here.
    # The override lets reviewers run these cases against an earlier revision.
    doc = Path(os.environ.get('TABLEAU_PARSER_REFERENCE', REFERENCE)).read_text()
    section = doc.split(f'## Phase {phase}:', 1)[1].split('\n## ', 1)[0]
    block = re.search(r'```bash\n(.*?)\n```', section, re.S).group(1)
    args = shlex.split(block)
    if args[:2] != ['python3', '-c'] or len(args) != 3:
        raise AssertionError('Expected a single documented Python command')
    with tempfile.TemporaryDirectory() as work:
        Path(work, 'workbook.twb').write_text(xml)
        return subprocess.run(
            [sys.executable, '-c', args[2]], cwd=work, check=True,
            capture_output=True, text=True,
        ).stdout


def worksheet(cols='', rows='', filters=''):
    return f'''<workbook xmlns:user="http://www.tableausoftware.com/xml/user">
      <worksheets><worksheet name="Sales by Category"><table>
        <view>{filters}</view><panes><pane><mark class="Automatic"/></pane></panes>
        <cols>{cols}</cols><rows>{rows}</rows>
      </table></worksheet></worksheets></workbook>'''


def datasource(connection):
    return f'<workbook><datasources><datasource name="data">{connection}</datasource></datasources></workbook>'


class TableauParsers(unittest.TestCase):
    def test_automatic_scatter(self):
        for cols in ('[ds].[sum:Sales:qk]', '[ds].[none:Category:nk] / [ds].[sum:Sales:qk]'):
            with self.subTest(cols=cols):
                result = parse(5, worksheet(cols, '[ds].[sum:Profit:qk]'))
                self.assertIn('inferred: xy / scatter', result)
                self.assertNotIn('big_number', result)
                self.assertIn('INFERRED, confirm with user', result)

    def test_map_worksheet_resolves_geo_dimension_and_measure(self):
        # A map must convert, not vanish: the geographic dimension carries a
        # semantic-role attribute and the measure is the summed column-instance.
        xml = """<workbook><worksheets><worksheet name="Profit BY STATE"><table><view>
          <mapsources><mapsource name="Tableau"/></mapsources>
          <datasource-dependencies datasource="ds">
            <column datatype="string" name="[State]" role="dimension" semantic-role="[State].[Name]" type="nominal"/>
            <column caption="YTD Profit" datatype="real" name="[Calc_1]" role="measure" type="quantitative"/>
            <column-instance column="[Calc_1]" derivation="Sum" name="[sum:Calc_1:qk]" pivot="key" type="quantitative"/>
          </datasource-dependencies>
        </view></table></worksheet></worksheets></workbook>"""
        result = parse(7, xml)
        self.assertIn('is map: True', result)
        self.assertIn("geo dimensions: ['State']", result)
        self.assertIn('YTD Profit', result)

    def test_top_n_filter_exposes_count_and_direction(self):
        # Top-N is convertible: series_limit/row_limit express the same intent,
        # so the parser must surface N rather than just flagging the filter.
        filters = ("""<filter class='categorical' column='[ds].[State]'>"""
                   """<groupfilter function='order' column='[ds].[State]'>"""
                   """<groupfilter function='top' count='10' direction='DESC'/>"""
                   """</groupfilter></filter>""")
        result = parse(6, worksheet('[ds].[none:State:nk]', '[ds].[sum:Sales:qk]', filters))
        self.assertIn('TOP-N count=10', result)
        self.assertIn('direction=DESC', result)
        self.assertIn('series_limit/row_limit', result)

    def test_required_fields_extraction_for_dataset_matching(self):
        # Dataset matching needs the real source columns, not the opaque
        # Calculation_* ids, so calc formulas must be walked for references.
        xml = """<workbook><worksheets><worksheet name="Sales by Category"><table><view>
          <datasource-dependencies datasource="ds">
            <column datatype="string" name="[Sub-Category]" role="dimension"/>
            <column caption="YTD Sales" name="[Calculation_99]" role="measure">
              <calculation class="tableau" formula="IF [CYTD] THEN [Sales] END"/>
            </column>
          </datasource-dependencies>
          <filter class="categorical" column="[ds].[State]"/>
          </view>
          <cols>[ds].[none:Sub-Category:nk]</cols>
          <rows>[ds].[sum:Calculation_99:qk]</rows>
        </table></worksheet></worksheets></workbook>"""
        result = parse(8, xml)
        for field in ('Sub-Category', 'State', 'Sales', 'CYTD'):
            self.assertIn(field, result)
        self.assertNotIn('Calculation_99', result)

    def test_existing_automatic_shapes(self):
        cases = [
            ('[ds].[tmn:Order Date:qk]', '[ds].[sum:Sales:qk]', 'xy / line'),
            ('[ds].[none:Category:nk]', '[ds].[sum:Sales:qk]', 'xy / bar'),
            ('', '[ds].[sum:Sales:qk]', 'big_number'),
            ('[ds].[none:Category:nk]', '', 'table'),
            ('[ds].[Longitude (generated)]', '[ds].[Latitude (generated)]', 'map -> convert to xy/bar on the geo dimension'),
        ]
        for cols, rows, expected in cases:
            with self.subTest(expected=expected):
                self.assertIn(f'inferred: {expected}', parse(5, worksheet(cols, rows)))

    def test_federated_relations_stay_with_their_connection(self):
        xml = datasource('''<connection class="federated"><named-connections>
          <named-connection name="a"><connection class="postgres" server="server-a" dbname="sales"/></named-connection>
          <named-connection name="b"><connection class="postgres" server="server-b" dbname="crm"/></named-connection>
          </named-connections><relation type="join">
          <relation type="table" connection="a" table="[public].[orders]"/>
          <relation type="table" connection="b" table="[public].[customers]"/>
          </relation></connection>''')
        first, second = parse(3, xml).strip().split('\n\n')
        self.assertIn('server-a', first)
        self.assertIn('[public].[orders]', first)
        self.assertNotIn('[public].[customers]', first)
        self.assertIn('server-b', second)
        self.assertIn('[public].[customers]', second)
        self.assertNotIn('[public].[orders]', second)

    def test_unresolved_relation_is_not_assigned_to_a_server(self):
        for binding in ('', 'connection="missing"'):
            with self.subTest(binding=binding):
                result = parse(3, datasource(f'''<connection class="federated">
                  <named-connections><named-connection name="a"><connection class="postgres" server="server-a"/></named-connection></named-connections>
                  <relation type="table" {binding} table="[public].[orders]"/>
                  </connection>'''))
                self.assertIn('UNRESOLVED relation: [public].[orders]', result)
                self.assertNotIn('relation table:', result)
                self.assertIn('confirm with user', result)

    def test_direct_connection_and_single_file_connection(self):
        result = parse(3, datasource('''<connection class="postgres" server="direct">
          <relation type="table" table="[public].[orders]"/></connection>'''))
        self.assertIn('server: direct', result)
        self.assertIn('relation table: [public].[orders]', result)
        result = parse(3, datasource('''<connection class="federated"><named-connections>
          <named-connection name="excel"><connection class="excel-direct" filename="sample.xlsx"/></named-connection>
          </named-connections><relation type="table" connection="excel" table="[Orders$]"/></connection>'''))
        self.assertIn('class: excel-direct', result)
        self.assertIn('filename: sample.xlsx', result)
        self.assertIn('relation table: [Orders$]', result)

    def test_device_layout_does_not_duplicate_worksheet(self):
        result = parse(2, '''<workbook><dashboards><dashboard name="Main">
          <zones><zone type-v2="layout"><zone name="Sales by Category" x="1"/></zone></zones>
          <devicelayouts><devicelayout><zones><zone name="Sales by Category" x="99"/></zones></devicelayout></devicelayouts>
          </dashboard></dashboards></workbook>''')
        self.assertEqual(result.count("worksheet: 'Sales by Category'"), 1)
        self.assertNotIn('x=99', result)

    def test_action_and_all_members_filters(self):
        result = parse(6, worksheet(filters='''
          <filter class="categorical" column="[Action (State)]"><groupfilter function="level-members" user:ui-action-filter="true"/></filter>
          <filter class="categorical" column="[Region]"><groupfilter function="level-members"/></filter>
          <filter class="categorical" column="[Category]"><groupfilter function="member" member="&quot;Furniture&quot;"/></filter>'''))
        self.assertIn('DASHBOARD ACTION', result)
        self.assertIn('all members (no-op filter)', result)
        self.assertIn('Furniture', result)
        self.assertNotIn('IN []', result)


if __name__ == '__main__':
    unittest.main()
