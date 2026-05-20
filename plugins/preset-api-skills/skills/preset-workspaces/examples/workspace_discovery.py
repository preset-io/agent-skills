def list_teams(client):
    return client.mgmt("GET", "/teams/")["payload"]


def get_team(client, team_name):
    return client.mgmt("GET", f"/teams/{team_name}/")["payload"]


def list_workspaces(client, team_name):
    return client.mgmt("GET", f"/teams/{team_name}/workspaces/")["payload"]


def get_workspace(client, team_name, workspace_id):
    return client.mgmt(
        "GET",
        f"/teams/{team_name}/workspaces/{workspace_id}/",
    )["payload"]


def get_workspace_hostname(client, team_name, workspace_title):
    for ws in list_workspaces(client, team_name):
        if ws["title"].lower() == workspace_title.lower():
            return ws["hostname"]
    raise ValueError(f"Workspace '{workspace_title}' not found in team '{team_name}'")


def iter_workspaces(client):
    for team in list_teams(client):
        for ws in list_workspaces(client, team["name"]):
            yield team, ws


def workspace_is_ready(workspace):
    return workspace["workspace_status"] == "READY"
