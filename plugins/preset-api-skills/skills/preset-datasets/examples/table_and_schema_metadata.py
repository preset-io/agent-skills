import rison


def list_schemas(client, hostname, database_id, force=False):
    q = rison.dumps({"force": force})
    return client.workspace(
        "GET",
        hostname,
        f"/database/{database_id}/schemas/?q={q}",
    )["result"]


def list_tables(client, hostname, database_id, schema_name, force=False):
    q = rison.dumps({"schema_name": schema_name, "force": force})
    return client.workspace(
        "GET",
        hostname,
        f"/database/{database_id}/tables/?q={q}",
    )["result"]
