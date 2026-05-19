# Preset Agent Skills

Agent guidance packages for Preset, Superset, and adjacent workflows. The repository is split by operational surface so agents only load the guidance that matches the way the user intends to work.

## Packages

| Package | Status | Purpose |
|---|---|---|
| [`plugins/preset-api-skills`](plugins/preset-api-skills/README.md) | Installable | Direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. |
| [`plugins/preset-mcp-skills`](plugins/preset-mcp-skills/README.md) | Installable | Preset/Superset Model Context Protocol tool workflows. |
| [`plugins/preset-cli-skills`](plugins/preset-cli-skills/README.md) | Placeholder | Reserved for future Preset CLI workflow skills. |

Codex package discovery metadata lives in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json). Claude marketplace metadata lives in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json). Both catalogs intentionally list only the installable API and MCP packages.

## Surface Boundaries

- Install or load a package from its package directory under `plugins/`, not from the repository root.
- Use `preset-api-skills` when the user asks for direct API calls, API credentials, workspace API inspection, or Snowflake Cortex API/operator workflows.
- Use `preset-mcp-skills` when the user asks to use Preset/Superset MCP, MCP tools, MCP clients, Copilot/MCP behavior, or deterministic MCP discovery flows.
- Do not use API skills as a fallback for MCP-only work. If MCP lacks the needed capability, stop and ask whether to switch to the API surface.
- Do not expose CLI skills yet. The CLI package is intentionally not installable until the CLI workflows are designed in a later PR.

## Validation

Run the repository smoke test after package changes:

```bash
./scripts/smoke-test.sh
```

The smoke test verifies each installable package shape, required skill files, client manifests, and package boundary rules.
