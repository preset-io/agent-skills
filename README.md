# Preset Agent Skills

Agent guidance packages for Preset, Superset, and adjacent workflows. The repository currently exposes direct API workflow skills, with placeholder directories reserved for future surfaces.

## Packages

| Package | Status | Purpose |
|---|---|---|
| [`plugins/preset-api-skills`](plugins/preset-api-skills/README.md) | Installable | Direct Preset Management API, Superset workspace API, and Snowflake Cortex API workflows. |
| [`plugins/preset-mcp-skills`](plugins/preset-mcp-skills/README.md) | Placeholder | Reserved for future Preset/Superset Model Context Protocol tool workflow skills. |
| [`plugins/preset-cli-skills`](plugins/preset-cli-skills/README.md) | Placeholder | Reserved for future Preset CLI workflow skills. |

Codex package discovery metadata lives in [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json). Claude marketplace metadata lives in [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json). Both catalogs intentionally list only the installable API package.

## Surface Boundaries

- Install or load a package from its package directory under `plugins/`, not from the repository root.
- Use `preset-api-skills` when the user asks for direct API calls, API credentials, workspace API inspection, or Snowflake Cortex API/operator workflows.
- Do not use API skills as a fallback for MCP-only work. If the user asks for Preset/Superset MCP tooling, stop and ask whether to switch to the API surface before using these skills.
- Do not expose MCP or CLI skills yet. Those packages are intentionally not installable until their workflow boundaries, routing rules, and client manifests are designed in later PRs.

## Validation

Run the repository smoke test after package changes:

```bash
./scripts/smoke-test.sh
```

The smoke test verifies each installable package shape, required skill files, client manifests, and package boundary rules.

## Claude Web/Desktop Skill ZIPs

Claude web/Desktop custom skill uploads require a flatter artifact than the
source skills in this repository. Build upload-ready ZIPs with:

```bash
node scripts/build-claude-web-skills.mjs
```

The script reads `plugins/preset-api-skills/skills`, inlines each skill's
`references/` and `examples/` files into that skill's generated `SKILL.md`, and
writes one ZIP per skill to `dist/claude-web-flat-skills/`. Each ZIP contains a
single top-level folder and exactly one `SKILL.md`. The build also writes
`dist/claude-web-flat-skills/report.json` with description lengths, file sizes,
source files, and ZIP validation results.
