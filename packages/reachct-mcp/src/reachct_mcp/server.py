"""ReachCT MCP server — tools talk to the ReachCT HTTP API only."""

from __future__ import annotations

import json
from typing import Any, Optional

from mcp.server.fastmcp import FastMCP

from reachct_mcp.client import ReachCTClient

mcp = FastMCP("reachct")


def _client() -> ReachCTClient:
    return ReachCTClient()


def _dump(data: Any) -> str:
    return json.dumps(data, indent=2, default=str)


@mcp.tool()
def scrape_urls(
    query: str,
    city: str,
    country: str,
    start: int = 0,
    end: int = 25,
    poll_timeout_s: int = 900,
) -> str:
    """Discover company websites via Google Maps search (type/query + city + country).

    Returns websites and company metadata so you can choose URLs for reachct().
    """
    result = _client().scrape_urls(
        query=query,
        city=city,
        country=country,
        start=start,
        end=end,
        poll_timeout_s=poll_timeout_s,
    )
    return _dump(result)


@mcp.tool()
def reachct(
    urls: list[str],
    company_type: str = "Company",
    city: Optional[str] = None,
    country: Optional[str] = None,
    database_id: Optional[int] = None,
    database_name: Optional[str] = None,
    poll_timeout_s: int = 900,
) -> str:
    """Scrape company websites and return tabular contact fields for outreach.

    Stable columns: name, email, phone, website, city, country, company_type.
    Optionally create/save into a personal ReachCT database.
    """
    if not urls:
        return _dump({"error": "urls is required"})
    result = _client().reachct(
        urls=urls,
        company_type=company_type or "Company",
        city=city,
        country=country,
        database_id=database_id,
        database_name=database_name,
        poll_timeout_s=poll_timeout_s,
    )
    return _dump(result)


@mcp.tool()
def create_database(
    name: str,
    kind: str = "maps",
    columns: Optional[list[str]] = None,
) -> str:
    """Create a personal ReachCT database before adding companies."""
    if not name or not name.strip():
        return _dump({"error": "name is required"})
    result = _client().create_database(name=name.strip(), kind=kind or "maps", columns=columns)
    return _dump(result)


@mcp.tool()
def list_databases() -> str:
    """List the user's databases (id, name, kind, role, entry_count)."""
    result = _client().list_databases()
    return _dump(result)


@mcp.tool()
def pull_from_database(database_id: int) -> str:
    """Pull rows from a user database as a markdown table + JSON rows.

    Only databases the API key owns or collaborates on are readable.
    This is the only read path into saved data — no SQL or DB credentials.
    """
    result = _client().pull_from_database(database_id)
    return _dump(result)


@mcp.tool()
def save_to_database(database_id: int, rows: list[dict]) -> str:
    """Add rows to an existing ReachCT database (after create_database or list_databases)."""
    if not rows:
        return _dump({"error": "rows is required"})
    result = _client().save_to_database(database_id, rows)
    return _dump(result)


def main() -> None:
    mcp.run()


if __name__ == "__main__":
    main()
