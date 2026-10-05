# Preset Snowflake Cortex Skills

Agent guidance for operating [Snowflake Cortex Agents](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents) through Snowflake's REST and SQL interfaces. Preset publishes this package separately from [`preset-api-skills`](https://github.com/preset-io/agent-skills/tree/master/plugins/preset-api-skills): these skills work against a Snowflake account with Snowflake credentials, not against Preset or Apache Superset, and they do not use Preset API tokens.

These skills are for explicit direct Snowflake Cortex Agent REST and SQL workflows. Do not use this package for Preset/Superset MCP tool workflows, and do not switch from MCP tools to these skills unless the user explicitly approves changing surfaces.

The two skills used to ship inside `preset-api-skills`. They moved here unchanged (same skill names, same references) so the API package describes only the Preset and Superset APIs. If you installed `preset-api-skills` for Cortex Agent work, install this package as well.

## Surface Selection

- If the user mentions MCP, MCP tools, MCP clients, Superset MCP, Preset MCP, or Copilot/MCP behavior, do not use this package. Stay on the available MCP tooling or ask whether to switch surfaces.
- Use this package only when the user asks for Snowflake Cortex Agent account, authentication, privilege, agent management, agent run, or SQL wrapper workflows.
- Use `preset-api-skills` for the Preset Management API and Superset workspace APIs.
- If an MCP workflow lacks the needed capability, stop and ask whether to switch to direct API. Do not silently escalate.

## Package Structure

```text
skills/
  preset-snowflake-cortex/SKILL.md
  preset-cortex-agents/SKILL.md
```

## Skills

| Skill | Description |
|---|---|
| [preset-snowflake-cortex](skills/preset-snowflake-cortex/SKILL.md) | Prepare Snowflake Cortex account, authentication, role, warehouse, and safety context before Cortex Agent workflows. |
| [preset-cortex-agents](skills/preset-cortex-agents/SKILL.md) | List, describe, create, update, delete, and run Snowflake Cortex Agents through REST, SQL DDL, or SQL wrapper APIs with explicit approval. |

Use `preset-snowflake-cortex` first to establish Snowflake account, authentication, role, warehouse, region/cross-region inference, and safety context. Then use `preset-cortex-agents` for Cortex Agent object discovery, object management through REST or SQL DDL, REST runs, streaming response handling, or the `SNOWFLAKE.CORTEX.DATA_AGENT_RUN` SQL wrapper. Cortex Agent execution is confirmation-gated because it can invoke tools, use warehouses, consume model budget, and expose governed Snowflake data.

The skills are Snowflake API/operator guidance and are not Preset embedded-chatbot runtime instructions. Both skills are self-contained: every file they link to ships inside this package.

## API Reference

| Layer | Base URL |
|---|---|
| Snowflake Cortex REST API | `https://<account_identifier>.snowflakecomputing.com/api/v2/` |

Cortex Agent request and response schemas change often. Re-check the current Snowflake documentation before implementation work.

## Installation

The GitHub repository is `preset-io/agent-skills`; `preset-agent-skills` is the marketplace name used by plugin install commands. Install this package from its plugin directory, not from the repository root.

Claude Code:

```text
/plugin marketplace add preset-io/agent-skills
/plugin install preset-snowflake-cortex-skills@preset-agent-skills
```

OpenAI Codex:

```bash
codex plugin marketplace add preset-io/agent-skills --ref master
codex plugin add preset-snowflake-cortex-skills@preset-agent-skills
```

Claude Desktop and Claude.ai web: download `preset-snowflake-cortex.zip` and `preset-cortex-agents.zip` from the [latest GitHub Release](https://github.com/preset-io/agent-skills/releases/latest) and upload each one, or build them locally:

```bash
node scripts/build-claude-web-skills.mjs \
  --source plugins/preset-snowflake-cortex-skills/skills \
  --out dist/claude-web-flat-cortex-skills
```

Gemini CLI v0.27.0 and later:

```bash
gemini skills install https://github.com/preset-io/agent-skills.git \
  --path plugins/preset-snowflake-cortex-skills/skills
```

Snowflake Cortex Code CLI, from a local clone:

```bash
cortex skill add agent-skills/plugins/preset-snowflake-cortex-skills/skills
```

Cursor reads `.cursor-plugin/plugin.json`, and GitHub Copilot reads `.github/copilot-instructions.md` once copied into the consuming repository's `.github/` directory.

## OpenAI Plugin Directory

The OpenAI submission archive for this package can be built with:

```bash
node scripts/build-openai-plugin-zip.mjs --plugin preset-snowflake-cortex-skills
```

The preflight only checks OpenAI's documented field limits. There is no guarantee this package passes OpenAI directory review: its name, description, and skills are about Snowflake Cortex, a third-party platform that includes hosted models, and the directory's review policy can reject listings that reference another AI platform. Nothing in this repository submits the package anywhere.

## Supported Clients

| Client | Entry point |
|---|---|
| OpenAI Codex | `.codex-plugin/plugin.json` and `AGENTS.md` |
| Claude Code | `.claude-plugin/plugin.json` and `skills/*/SKILL.md` |
| Claude web/Desktop custom skills | Generated one-skill ZIPs from `scripts/build-claude-web-skills.mjs` |
| Cursor | `.cursor-plugin/plugin.json` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `skills/*/SKILL.md` |

Claude Code uses the plugin manifest for package metadata and the `skills/` directory for skill discovery. It does not load package-level `AGENTS.md` or `CLAUDE.md` context from an installed plugin. `AGENTS.md` remains the package-level routing guide for Codex, legacy Gemini CLI context imports, and direct repository readers.

## Safety Policy

Gates scale with blast radius, reversibility, and disclosure sensitivity. Readiness checks and agent list/describe calls run directly. Require explicit confirmation before any Cortex Agent run and before creating, updating, replacing, or dropping an agent object: summarize the account, role, agent, query, tools, warehouse, budget, output handling, and rollback path first. When an account, role, agent, output destination, or credential boundary cannot be proven from trusted context, fall back to confirmation. See [`cortex-safety.md`](skills/preset-snowflake-cortex/references/cortex-safety.md) for the full checklist.

## License

Apache 2.0 - see [`LICENSE`](https://github.com/preset-io/agent-skills/blob/master/LICENSE)
