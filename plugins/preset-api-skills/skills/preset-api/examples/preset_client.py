import os
import time

import requests


class PresetClient:
    MGMT_BASE = os.environ.get("PRESET_API_BASE", "https://api.app.preset.io/v1")
    MGMT_BASE_V2 = os.environ.get("PRESET_API_BASE_V2", "https://api.app.preset.io/v2")
    TOKEN_TTL_SECONDS = 5 * 3600
    TOKEN_EXPIRY_BUFFER_SECONDS = 5 * 60

    def __init__(self):
        self._token = None
        self._token_expiry = 0
        self._session = requests.Session()

    def _ensure_token(self):
        if time.time() < self._token_expiry:
            return
        resp = self._session.post(
            f"{self.MGMT_BASE}/auth/",
            json={
                "name": os.environ["PRESET_CLIENT_ID"],
                "secret": os.environ["PRESET_CLIENT_SECRET"],
            },
        )
        resp.raise_for_status()
        self._token = resp.json()["payload"]["access_token"]
        self._token_expiry = (
            time.time() + self.TOKEN_TTL_SECONDS - self.TOKEN_EXPIRY_BUFFER_SECONDS
        )

    def _request_with_auth(self, method, url, **kwargs):
        self._ensure_token()
        headers = {
            **kwargs.pop("headers", {}),
            "Authorization": f"Bearer {self._token}",
        }
        if "json" in kwargs:
            headers.setdefault("Content-Type", "application/json")
        kwargs["headers"] = headers
        resp = self._session.request(method, url, **kwargs)
        if resp.status_code == 401:
            self._token_expiry = 0
            self._ensure_token()
            kwargs["headers"] = {**headers, "Authorization": f"Bearer {self._token}"}
            resp = self._session.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp

    def mgmt(self, method, path, **kwargs):
        resp = self._request_with_auth(method, f"{self.MGMT_BASE}{path}", **kwargs)
        return resp.json()

    def mgmt_v2_response(self, method, path, **kwargs):
        return self._request_with_auth(method, f"{self.MGMT_BASE_V2}{path}", **kwargs)

    def mgmt_v2(self, method, path, **kwargs):
        resp = self.mgmt_v2_response(method, path, **kwargs)
        return resp.json()

    def workspace(self, method, workspace_hostname, path, **kwargs):
        url = f"https://{workspace_hostname}/api/v1{path}"
        resp = self._request_with_auth(method, url, **kwargs)
        return resp.json()

    def workspace_root_response(self, method, workspace_hostname, path, **kwargs):
        url = f"https://{workspace_hostname}{path}"
        return self._request_with_auth(method, url, **kwargs)

    def workspace_root(self, method, workspace_hostname, path, **kwargs):
        resp = self.workspace_root_response(method, workspace_hostname, path, **kwargs)
        return resp.json()


client = PresetClient()
