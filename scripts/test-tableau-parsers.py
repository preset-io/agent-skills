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

    def test_existing_automatic_shapes(self):
        cases = [
            ('[ds].[tmn:Order Date:qk]', '[ds].[sum:Sales:qk]', 'xy / line'),
            ('[ds].[none:Category:nk]', '[ds].[sum:Sales:qk]', 'xy / bar'),
            ('', '[ds].[sum:Sales:qk]', 'big_number'),
            ('[ds].[none:Category:nk]', '', 'table'),
            ('[ds].[Longitude (generated)]', '[ds].[Latitude (generated)]', 'map -- UNSUPPORTED, skip'),
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
