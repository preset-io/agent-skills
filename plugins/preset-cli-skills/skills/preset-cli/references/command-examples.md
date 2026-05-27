# Common CLI Command Examples

Use this reference when the user needs concrete `sup` command examples after routing and safety checks are complete.

## Discovery

```bash
sup workspace list --json
sup dashboard list --mine --json --limit 100
sup chart list --search="revenue" --json
sup dataset list --search="users" --json
sup query list --name="*revenue*" --json
```

## Detail and Export

```bash
sup chart info 3628 --json
sup dashboard info 254 --json
sup chart pull 3628
sup dashboard pull 254
sup dataset pull 914
```

## Data-Returning Reads

Load [sql-data-safety.md](sql-data-safety.md) before running these:

```bash
sup chart sql 3628
sup chart data 3628 --csv > chart-3628.csv
sup sql "SELECT COUNT(*) FROM users" --json
sup sql "SELECT * FROM sales" --csv > sales.csv
```
