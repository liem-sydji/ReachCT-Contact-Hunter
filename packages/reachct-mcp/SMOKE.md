# ReachCT MCP — local smoke notes

Prereqs: ReachCT API running (local or Railway), a user account, API key from **Settings**.

## 1. Install

```bash
cd packages/reachct-mcp
pip install -e .
```

## 2. Env

```bash
# PowerShell
$env:REACHCT_API_URL = "http://127.0.0.1:8000"   # or Railway URL
$env:REACHCT_API_KEY = "rct_…"                    # from Settings
```

## 3. Auth check (HTTP)

```bash
curl -s -H "Authorization: Bearer $env:REACHCT_API_KEY" "$env:REACHCT_API_URL/api/auth/me"
# expect: id, email, has_api_key / api_key_prefix

curl -s -H "x-api-key: $env:REACHCT_API_KEY" "$env:REACHCT_API_URL/api/databases"
# expect: JSON list (possibly empty)
```

## 4. Tool path (Python)

```bash
python - <<'PY'
from reachct_mcp.client import ReachCTClient
c = ReachCTClient()
print(c.list_databases())
db = c.create_database("MCP Smoke")
print(db)
print(c.save_to_database(db["id"], [{"name":"Acme","email":"a@acme.test","website":"https://example.com"}]))
print(c.pull_from_database(db["id"])["markdown"])
PY
```

Optional scrape (slow — needs Playwright workers on the API):

```bash
python - <<'PY'
from reachct_mcp.client import ReachCTClient
c = ReachCTClient()
# Discovery
print(c.scrape_urls("IT Company", "Berlin", "Germany", end=5)["websites"][:5])
# Enrichment table — pass real URLs from discovery
# print(c.reachct(["https://example.com"], company_type="IT Company", city="Berlin", country="Germany"))
PY
```

## 5. MCP process

```bash
python -m reachct_mcp
# stdio MCP server should start with no traceback
```

## Pass criteria

- `/api/auth/me` accepts the API key
- `list_databases` / `create_database` / `save_to_database` / `pull_from_database` round-trip
- `python -m reachct_mcp` stays up on stdio
- No DB connection strings in the MCP package (HTTP only)
