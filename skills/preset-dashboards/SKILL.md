---
name: preset-dashboards
description: Inspect dashboards in a Preset workspace through read-only Superset API calls. Use when a user needs to list dashboards, get dashboard details by ID or slug, inspect dashboard charts, or inspect dashboard datasets after resolving a workspace hostname.
---

# preset-dashboards

Use this skill for read-only dashboard inspection in a Preset workspace.

## Workflow

1. Use `preset-api` first: load its authentication reference and create the reusable Python client as `client`.
2. Use `preset-workspaces` to resolve the workspace hostname as `hostname`.
3. Load [references/read-only-examples.md](references/read-only-examples.md) for dashboard list/detail/chart/dataset examples.

## Scope

This skill is read-only. Do not create, update, import, export, embed, or issue guest tokens from this skill. For any future dashboard mutation workflow, first summarize the target workspace, dashboard IDs or UUIDs, request body, and expected effect, then get explicit user confirmation.
