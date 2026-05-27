# Install and Authenticate `sup`

Use this reference for installing the Preset CLI, choosing an entry point, and wiring up authentication without leaking secrets.

## Install

The modern `sup` entry point ships in the `superset-sup` PyPI distribution.

```bash
pip install superset-sup
```

Verify the install:

```bash
sup --version
sup --help
```

The legacy `preset-cli` distribution (separate PyPI package) ships the older `preset-cli` and `superset-cli` entry points. Do **not** `pip install preset-cli` when you want `sup` — that installs the legacy CLI and does not provide the `sup` binary.

## Entry Points

| Entry point | PyPI package | Status | Use for |
|---|---|---|---|
| `sup` | `superset-sup` | Primary | Modern, agent-friendly UX. All new agent workflows should target `sup`. |
| `preset-cli` | `preset-cli` | Legacy | Long-form Preset workspace flows (`preset-cli --workspaces=… superset …`). |
| `superset-cli` | `preset-cli` | Legacy | Standalone Superset deployments not managed by Preset. |

When writing agent scripts, default to `sup`. Only fall back to `preset-cli` or `superset-cli` if the user references a legacy workflow or a `sup` subcommand is documented as missing.

## Configure Authentication

The CLI authenticates against the Preset Management API using the same API token/secret you get from `https://manage.app.preset.io/app/user`. `sup` reads them from `SUP_*`-prefixed environment variables (not the `PRESET_CLIENT_ID` / `PRESET_CLIENT_SECRET` pair used by direct API skills).

```bash
export SUP_PRESET_API_TOKEN="your-api-token"
export SUP_PRESET_API_SECRET="your-api-token-secret"

sup config auth
sup config show
```

`sup config auth` is interactive. It prompts for the API token and secret, tests them, then offers to either store them in `~/.sup/config.yml`, print export lines for your shell profile, or skip storage so you set `SUP_PRESET_API_TOKEN` / `SUP_PRESET_API_SECRET` yourself.

When credentials are stored in `~/.sup/config.yml`, they are written as plaintext YAML — the file is not hashed or encrypted. Protect that file with filesystem permissions and avoid committing it to source control. For CI/CD, prefer the env-var path so the secret never touches disk.

Use `sup config show` to confirm the active workspace, target workspace, and authentication status before running subsequent commands.

## Secret Hygiene

- Never pass `SUP_PRESET_API_TOKEN` or `SUP_PRESET_API_SECRET` inline on the command line; set them as environment variables before invoking `sup config auth` or let `sup config auth` prompt for them interactively.
- Do not commit `~/.sup/config.yml` or any `.sup/state.yml` containing tokens to source control.
- For CI/CD, inject credentials via the runner's secret store (GitHub Actions secrets, GitLab CI variables, Vault, etc.) and reference them as environment variables only.
- Redact tokens, JWTs, and any `Authorization:` headers in command transcripts and screenshots.

For precedence between environment variables, project-local state, and global config, load [config-precedence.md](config-precedence.md).
