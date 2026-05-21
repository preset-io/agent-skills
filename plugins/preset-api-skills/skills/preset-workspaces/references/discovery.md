# Team And Workspace Discovery Reference

## Key Concepts

| Term | Description |
|---|---|
| Team | The top-level organizational unit in Preset. Maps to a Preset subscription. |
| Workspace | An isolated Superset instance inside a team. |
| Team name | Stable team identifier used in Management API paths. Returned by `GET /teams/` as `name`. |
| Workspace hostname | Unique host of a workspace's Superset API. |

Production examples use `https://api.app.preset.io/v1`. For sandbox or staging environments, set `PRESET_API_BASE` as described in `preset-api` and use that base URL for Management API calls.

Reusable Python snippets live in `../examples/workspace_discovery.py`; load that file only when implementation detail is needed.

## Endpoints

| Goal | Method and path |
|---|---|
| List teams | `GET /teams/` |
| Get one team | `GET /teams/{team_name}/` |
| List workspaces for a team | `GET /teams/{team_name}/workspaces/` |
| Get one workspace | `GET /teams/{team_name}/workspaces/{workspace_id}/` |

Common response fields:

| Field | Description |
|---|---|
| `name` | Stable team identifier used in subsequent API paths |
| `title` | Human-readable team title |
| `id` | Numeric team ID |
| `created_on` | ISO 8601 creation timestamp |

## Workspace Fields

Common response fields:

| Field | Description |
|---|---|
| `id` | Numeric workspace ID |
| `title` | Human-readable workspace title |
| `hostname` | Hostname for the workspace's Superset API |
| `workspace_status` | Status enum such as `READY`, `HIBERNATED`, `UPGRADING`, or `ERROR` |
| `region` | Cloud region |

## Resolve Workspace Hostname By Title

When a user specifies a particular team or workspace by name, filter listing results to find the matching hostname rather than assuming a specific value.

## Iterate Across All Workspaces

Use this fan-out pattern only for inventory or admin tasks. For single-target user requests, resolve the specific team and workspace by name instead of scanning every workspace.

## Check Workspace Health Before Workspace API Calls

Only make workspace Superset API calls when `workspace_status == "READY"`. If a workspace is hibernated, upgrading, or in error, report that state instead of assuming workspace API availability.
