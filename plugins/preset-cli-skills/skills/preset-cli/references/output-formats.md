# `sup` Output Formats

Use this reference when choosing output flags for an agent, automation script, or CI job.

## Format Flags

| Flag | When to use |
|---|---|
| `--json` | Default for agents. Structured, parsable, stable field names. |
| `--csv` | Tabular data export from data-returning commands only (`sup sql`, `sup chart data`); spreadsheets, downstream pandas/duckdb. Not supported on `list` commands. |
| `--yaml` | Configuration-friendly output that round-trips with `sup` config files. |
| `--porcelain` | Machine-readable, no decorations, stable across versions for scripting (`xargs`, `awk`, `cut`). |
| _(none)_ | Rich human tables. Never produce these in agent-driven contexts. |

## Examples

```bash
sup chart list --mine --json
sup dataset list --search="sales" --json > sales-datasets.json
sup workspace list --porcelain | awk '{print $1}'
sup sql "SELECT COUNT(*) FROM users" --json
sup sql "SELECT * FROM sales" --csv > sales.csv
sup chart data 3628 --csv > chart-3628.csv
```

`--csv` is supported on `sup sql` and `sup chart data` (data-returning commands). `list` commands only support `--json`, `--yaml`, and `--porcelain` — there is no `--csv` on list. Pipe through `jq` to `@csv` if you need CSV-shaped list output.

## Default for Agents

When you cannot tell what downstream system will consume the output, default to `--json`:

- Field names are stable.
- Empty results produce `[]` (or `{}`), not blank lines.
- Errors are reported via exit code and stderr, not embedded in the stdout payload.

Only switch off `--json` when the user explicitly asks for CSV/YAML or when piping into a tool that needs porcelain.

## Exit Codes and Streams

- Exit code `0` indicates success.
- Non-zero exit codes indicate failures (auth, validation, transport, server-side error). Surface the exit code in any agent transcript.
- Structured output goes to **stdout**; warnings, spinner frames, and human-facing logs go to **stderr**.
- For agent capture, redirect cleanly: `sup chart list --json 2>/dev/null` keeps stdout clean for JSON parsing, while `sup chart list --json 2>chart.log` preserves diagnostics for incident review.

## Large Results

When listing many assets or exporting query rows, pair the format flag with an explicit `--limit` to bound output. `list` commands default to unbounded with a `--page-size 100` server fetch — they will return every result the server has if you do not cap. `sup sql` is the exception: `--limit 1000` (rows fetched) and `--max-rows 100` (rows displayed) are the upstream defaults. Always set `--limit` deliberately when the consumer cannot handle large payloads.
