def get_workspace_version(client, hostname):
    return client.workspace_root("GET", hostname, "/version")


def get_workspace_openapi(client, hostname):
    return client.workspace("GET", hostname, "/_openapi")


def list_openapi_paths(openapi, prefix="/api/v1/dashboard"):
    paths = openapi.get("paths", {})
    return {
        path: sorted(methods)
        for path, methods in sorted(paths.items())
        if path.startswith(prefix)
    }
