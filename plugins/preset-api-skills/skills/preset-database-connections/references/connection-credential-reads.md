# Connection Credential Reads

Use this reference before reading database connection configuration or responding to secret-disclosure requests.

## Credential-Bearing Read

| Goal | Endpoint |
|---|---|
| Connection configuration | `GET /api/v1/database/{pk}/connection` |

Before calling this endpoint, summarize:

1. Workspace hostname.
2. Database ID and database name.
3. Why connection configuration is needed instead of metadata.
4. Fields expected to be read.
5. Redaction plan for any returned secrets.

Wait for explicit confirmation before reading configuration.

Do not paste raw responses into logs, Markdown, PR comments, or handoff notes. Never print SQLAlchemy URIs, passwords, private keys, SSH tunnel passwords, server certificates, access tokens, encrypted extra, or engine `extra` secrets.

If the user asks to reveal credential values, decline the disclosure and offer a redacted metadata summary or a safe validation plan.
