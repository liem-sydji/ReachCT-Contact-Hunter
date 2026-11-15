# ReachCT MCP

HTTP-only Model Context Protocol server for ReachCT. External LLMs (Claude Desktop, ChatGPT, Cursor) can discover companies, scrape websites into outreach tables, and manage personal databases — without any Postgres access.

## Tools

| Tool | Purpose |
|------|---------|
| `scrape_urls` | Google Maps discovery → websites + metadata |
| `reachct` | Scrape URLs → tabular contacts (markdown + JSON) |
| `create_database` | Create a personal DB before saving |
| `list_databases` | List DBs with id / name / entry counts |
| `pull_from_database` | Tabular read of saved rows |
| `save_to_database` | Insert rows into an existing DB |

## Install

```bash
pip install -e packages/reachct-mcp
```

## Environment

| Variable | Description |
|----------|-------------|
| `REACHCT_API_URL` | ReachCT API base (default production Railway URL) |
| `REACHCT_API_KEY` | Per-user key from ReachCT → Settings |

## Claude Desktop

Add to `claude_desktop_config.json`:

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

Copy the same snippet from **ReachCT → Settings**.

## ChatGPT / other MCP hosts

Point a custom MCP / connector at `python -m reachct_mcp` with the same env vars. Auth is the API key (`Authorization: Bearer` or `x-api-key`).

## Smoke test

See [SMOKE.md](./SMOKE.md).
