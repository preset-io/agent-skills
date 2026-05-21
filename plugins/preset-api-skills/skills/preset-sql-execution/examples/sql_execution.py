def build_execute_payload(database_id, sql, schema=None, run_async=False, limit=None):
    payload = {
        "database_id": database_id,
        "json": True,
        "runAsync": run_async,
        "sql": sql,
    }
    if schema:
        payload["schema"] = schema
    if limit is not None:
        payload["queryLimit"] = limit
    return payload


def estimate_sql_after_confirmation(client, workspace_hostname, database_id, sql, schema=None):
    return client.workspace(
        "POST",
        workspace_hostname,
        "/sqllab/estimate/",
        json=build_execute_payload(database_id, sql, schema=schema),
    )


def execute_sql_after_confirmation(
    client,
    workspace_hostname,
    database_id,
    sql,
    schema=None,
    run_async=False,
    limit=None,
):
    return client.workspace(
        "POST",
        workspace_hostname,
        "/sqllab/execute/",
        json=build_execute_payload(
            database_id,
            sql,
            schema=schema,
            run_async=run_async,
            limit=limit,
        ),
    )


def fetch_results_after_confirmation(client, workspace_hostname, query_id, limit=None):
    params = {"query_id": query_id}
    if limit is not None:
        params["rows"] = limit
    return client.workspace(
        "GET",
        workspace_hostname,
        "/sqllab/results/",
        params=params,
    )


def stop_query_after_confirmation(client, workspace_hostname, query_id):
    return client.workspace(
        "POST",
        workspace_hostname,
        "/query/stop",
        json={"query_id": query_id},
    )
