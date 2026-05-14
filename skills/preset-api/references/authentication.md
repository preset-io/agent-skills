# Authentication Reference

## Credentials

Generate API credentials from the Preset management console:

1. Log in to [manage.app.preset.io](https://manage.app.preset.io).
2. Click your avatar, then **API keys**.
3. Click **Generate a new API key**.
4. Copy the **API Token Name** as the client ID and the **API Token Secret** as the client secret.

Store them as environment variables:

```bash
export PRESET_CLIENT_ID="your-api-token-name"
export PRESET_CLIENT_SECRET="your-api-token-secret"
```

## Token Exchange

```bash
curl -s -X POST "https://api.app.preset.io/v1/auth/" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$PRESET_CLIENT_ID\", \"secret\": \"$PRESET_CLIENT_SECRET\"}" \
  | jq -r '.payload.access_token'
```

```python
import os
import requests

resp = requests.post(
    "https://api.app.preset.io/v1/auth/",
    json={
        "name": os.environ["PRESET_CLIENT_ID"],
        "secret": os.environ["PRESET_CLIENT_SECRET"],
    },
)
resp.raise_for_status()
token = resp.json()["payload"]["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
```

```javascript
const resp = await fetch("https://api.app.preset.io/v1/auth/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: process.env.PRESET_CLIENT_ID,
    secret: process.env.PRESET_CLIENT_SECRET,
  }),
});
if (!resp.ok) {
  throw new Error(`Preset auth failed: ${resp.status}`);
}
const { payload } = await resp.json();
const token = payload.access_token;
```

The JWT is valid for 5 hours by default. Cache it with a buffer and refresh on HTTP 401.

## Reusable Python Client

```python
import os
import time
import requests


class PresetClient:
    MGMT_BASE = os.environ.get("PRESET_API_BASE", "https://api.app.preset.io/v1")
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
        self._session.headers.update({"Authorization": f"Bearer {self._token}"})
        resp = self._session.request(method, url, **kwargs)
        if resp.status_code == 401:
            self._token_expiry = 0
            self._ensure_token()
            self._session.headers.update({"Authorization": f"Bearer {self._token}"})
            resp = self._session.request(method, url, **kwargs)
        resp.raise_for_status()
        return resp

    def mgmt(self, method, path, **kwargs):
        resp = self._request_with_auth(method, f"{self.MGMT_BASE}{path}", **kwargs)
        return resp.json()

    def workspace(self, method, workspace_hostname, path, **kwargs):
        self._session.headers.update({"Content-Type": "application/json"})
        url = f"https://{workspace_hostname}/api/v1{path}"
        resp = self._request_with_auth(method, url, **kwargs)
        return resp.json()


client = PresetClient()
```
