# Cortex Agent SQL DDL

Use this reference when the user wants to manage Cortex Agent objects from a
Snowflake SQL worksheet instead of the REST API.

Official docs:

- <https://docs.snowflake.com/en/sql-reference/sql/create-agent>
- <https://docs.snowflake.com/en/sql-reference/sql/alter-agent>
- <https://docs.snowflake.com/en/sql-reference/sql/describe-agent>
- <https://docs.snowflake.com/en/sql-reference/sql/drop-agent>
- <https://docs.snowflake.com/en/sql-reference/sql/show-agents>

## Commands

| Goal | SQL |
|---|---|
| Create agent | `CREATE AGENT <name> FROM SPECIFICATION $$ ... $$` |
| Replace agent | `CREATE OR REPLACE AGENT <name> FROM SPECIFICATION $$ ... $$` |
| Alter metadata | `ALTER AGENT <name> SET ...` |
| Replace live specification | `ALTER AGENT <name> MODIFY LIVE VERSION SET SPECIFICATION = ...` |
| Describe agent | `DESCRIBE AGENT <name>` |
| Show agents | `SHOW AGENTS` |
| Drop agent | `DROP AGENT <name>` |

Agent specifications use YAML and can include models, orchestration budgets,
instructions, tools, and `tool_resources`. Treat the specification as sensitive
because it can reveal semantic views, Cortex Search services, warehouses,
filters, functions, and instructions.

## Guardrails

Before create, replace, alter, or drop:

1. Confirm database, schema, role, warehouse, and agent name.
2. Confirm the exact SQL command class and whether it replaces or drops an
   existing object.
3. Review the YAML specification with secrets, filters, warehouse details, and
   implementation identifiers redacted as needed.
4. Confirm privileges such as `CREATE AGENT` on the schema and `USAGE` on
   referenced database, schema, table, Cortex Search service, semantic view, and
   agent objects.
5. Wait for explicit confirmation and keep a rollback plan.

Do not use both `OR REPLACE` and `IF NOT EXISTS`; Snowflake documents them as
mutually exclusive for `CREATE AGENT`.

When modifying the live version specification, include the full intended
specification; Snowflake replaces the existing specification, and omitted fields
are removed.
