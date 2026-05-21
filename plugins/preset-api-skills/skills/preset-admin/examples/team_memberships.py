from urllib.parse import urlencode


def list_team_members(client, team_name, email=None, user_type=None):
    params = {"page_number": 1, "page_size": 100}
    if email:
        params["user_name_or_email"] = email
    if user_type:
        params["user_type"] = user_type
    return client.mgmt(
        "GET",
        f"/teams/{team_name}/memberships/?{urlencode(params)}",
    )["payload"]


def get_team_member(client, team_name, user_id):
    return client.mgmt(
        "GET",
        f"/teams/{team_name}/memberships/{user_id}/",
    )["payload"]


def has_seats_remaining(client, team_name):
    return client.mgmt(
        "GET",
        f"/teams/{team_name}/has-seats-remaining/",
    )["payload"]


def update_team_role_after_confirmation(client, team_name, user_id, team_role_id):
    return client.mgmt(
        "PATCH",
        f"/teams/{team_name}/memberships/{user_id}/",
        json={"team_role_id": team_role_id},
    )["payload"]


def remove_team_member_after_confirmation(client, team_name, user_id):
    client.mgmt("DELETE", f"/teams/{team_name}/memberships/{user_id}/")
