# Saved Query Reads

Use this reference for `sup query list` and `sup query info`.

```bash
sup query list --mine --json
sup query list --name="*revenue*" --json
sup query info <query-id> --json
```

Saved-query filtering uses `--name "<pattern>"` (label pattern, supports wildcards), not `--search`. The `--search` flag exists for `sup chart/dashboard/dataset list` but is not implemented for `sup query list`; passing it will error.

Saved queries can contain SQL text owned by other users. Listing returns metadata; fetching a saved query returns the SQL body. Treat the SQL body as sensitive because it may encode business logic, table names, or filtering conditions. Avoid printing it in shared transcripts unless the user has approved that disclosure.
