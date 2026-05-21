def build_guest_token_payload(embedded_dashboard_uuid, rls_clauses=None):
    return {
        "user": {
            "username": "external-user-id",
            "first_name": "External",
            "last_name": "Viewer",
        },
        "resources": [
            {"type": "dashboard", "id": embedded_dashboard_uuid},
        ],
        "rls": [{"clause": clause} for clause in (rls_clauses or [])],
    }


def create_guest_token_after_confirmation(client, hostname, payload):
    return client.workspace(
        "POST",
        hostname,
        "/security/guest_token/",
        json=payload,
    )["token"]
