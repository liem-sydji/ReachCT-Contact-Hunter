# ReachCT external MCP

Connect Claude Desktop, ChatGPT, Cursor, or any MCP client to ReachCT tools using a per-user API key. Clients never talk to Postgres — only the ReachCT HTTP API.

## Get an API key

1. Sign in to ReachCT with Google.
2. Open **Settings** (`/settings`).
3. Copy the API key (shown once on mint / regenerate).
4. Copy the MCP snippet on the same page.

Keys are stored hashed (`SHA-256`). Regenerating invalidates the previous key.

## Auth

| Mode | Header |
|------|--------|
| Web app | `Authorization: Bearer <JWT>` |
| MCP / external | `Authorization: Bearer <rct_…>` or `x-api-key: <rct_…>` |

Keys are minted automatically on first Google signup/login if missing.

## Install the MCP package

```bash
pip install -e packages/reachct-mcp
```

Env:

- `REACHCT_API_URL` — API base URL
- `REACHCT_API_KEY` — key from Settings

## Tools

1. **scrape_urls** — Maps discovery (query / city / country) → websites + metadata  
2. **reachct** — Scrape URL list → markdown table + JSON rows for outreach  
3. **create_database** — Create personal DB (name + optional columns)  
4. **list_databases** — id, name, kind, role, entry_count  
5. **pull_from_database** — Tabular pull of owned/collaborator DBs  
6. **save_to_database** — Insert rows into an existing DB  

## Claude Desktop example

```json
{
  "mcpServers": {
    "reachct": {
      "command": "python",
      "args": ["-m", "reachct_mcp"],
      "env": {
        "REACHCT_API_URL": "https://reachct-production.up.railway.app",
        "REACHCT_API_KEY": "rct_…"
      }
    }
  }
}
```

## Smoke test

See `packages/reachct-mcp/SMOKE.md`.
