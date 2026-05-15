# Bundle Secrets And Disclosure

Use this reference before inspecting, sharing, storing, or summarizing import/export bundles.

Exported bundles can include:

| Category | Examples |
|---|---|
| SQL and analytics logic | virtual dataset SQL, saved query SQL, chart query context |
| Object metadata | dashboard layout, tags, owners, UUIDs, descriptions |
| Database metadata | connection names, engine names, schemas, table metadata |
| Credential-bearing fields | SQLAlchemy URIs, `extra` JSON, encrypted extras, SSH tunnel settings |
| Secret material | passwords, private keys, private key passwords, OAuth/access tokens when supplied for import |

## Handling Rules

- Never print import secrets.
- Never paste passwords, private keys, SQLAlchemy URIs, access tokens, refresh tokens, or signed values into Markdown examples, logs, PR comments, or handoff notes.
- Redact credential-bearing fields before summarizing bundle contents.
- Confirm the destination path before writing export archives.
- Confirm the source path before reading import archives.

If the user needs a bundle review, report object types, counts, names when safe, and redacted risk notes rather than raw archive contents.
