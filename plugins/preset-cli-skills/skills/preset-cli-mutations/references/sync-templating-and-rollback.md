# Sync Templating, Rollback, and Multi-Target Risk

Use this reference after [cross-workspace-sync.md](cross-workspace-sync.md) when a sync configuration has Jinja2 context, multiple targets, or rollback requirements.

## Jinja2 Templating

Sync configurations support Jinja2 templating so a single source can produce environment-specific targets:

```yaml
target_defaults:
  jinja_context:
    company: Default Company
    region: us-east-1

targets:
  - workspace_id: 456
    name: production
    jinja_context:
      environment: production
  - workspace_id: 789
    name: staging
    jinja_context:
      environment: staging
```

Templating runs after the source pull and before each target push. Template errors surface during `sup sync validate` and `sup sync run --dry-run`; never run a real sync that has not first cleanly validated.

## Rollback Story

Sync does not provide an automatic rollback. The accepted recovery model is:

- The sync configuration directory lives in git; the previous commit represents the previous source state.
- To roll back, revert the sync directory to the prior commit and run `sup sync run` again with the same targets.
- For assets edited directly in the target UI between syncs, those edits are lost on the next overwrite-style sync. Document this in the confirmation step.

Never describe sync as safe to retry without thinking. It is safe to retry only if the user has accepted the overwrite semantics.

## Multi-Target Blast Radius

A single `sup sync run` can mutate every target workspace listed in the configuration. Before executing:

1. Confirm every target workspace by name, not just ID.
2. Confirm the asset counts per target from the dry-run output.
3. Confirm whether any target hosts production-facing dashboards; if so, escalate the confirmation step in [confirmation-template.md](confirmation-template.md).
