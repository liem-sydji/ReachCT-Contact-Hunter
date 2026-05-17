"""
ReachCT — database.py
SQLite database layer for storing and managing scraped companies.
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = "reachct.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS searches (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id      TEXT NOT NULL,
            query       TEXT NOT NULL,
            city        TEXT NOT NULL,
            country     TEXT NOT NULL,
            start_idx   INTEGER,
            end_idx     INTEGER,
            total_found INTEGER DEFAULT 0,
            created_at  TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id      TEXT NOT NULL,
            name        TEXT NOT NULL,
            email       TEXT DEFAULT '',
            phone       TEXT DEFAULT '',
            website     TEXT DEFAULT '',
            city        TEXT DEFAULT '',
            country     TEXT DEFAULT '',
            category    TEXT DEFAULT '',
            maps_url    TEXT DEFAULT '',
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL,
            UNIQUE(name, city, country)
        )
    """)

    conn.commit()
    conn.close()


def save_search(run_id: str, query: str, city: str, country: str,
                start_idx: int, end_idx: int, total_found: int):
    conn = get_conn()
    conn.execute("""
        INSERT INTO searches (run_id, query, city, country, start_idx, end_idx, total_found, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (run_id, query, city, country, start_idx, end_idx, total_found,
          datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()


def upsert_company(run_id: str, company: dict) -> str:
    """
    Insert or update a company.
    Returns 'inserted', 'updated', or 'skipped'.
    """
    conn   = get_conn()
    c      = conn.cursor()
    now    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    name    = company.get("name", "").strip()
    city    = company.get("city", "").strip()
    country = company.get("country", "").strip()

    existing = c.execute(
        "SELECT * FROM companies WHERE name=? AND city=? AND country=?",
        (name, city, country)
    ).fetchone()

    if not existing:
        c.execute("""
            INSERT INTO companies
                (run_id, name, email, phone, website, city, country, category, maps_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_id,
            name,
            company.get("email",   ""),
            company.get("phone",   ""),
            company.get("website", ""),
            city, country,
            company.get("category", ""),
            company.get("maps_url", ""),
            now, now
        ))
        conn.commit()
        conn.close()
        return "inserted"

    # Check if any new information is available
    updates = {}
    for field in ["email", "phone", "website", "category", "maps_url"]:
        new_val = company.get(field, "").strip()
        old_val = (existing[field] or "").strip()
        if new_val and not old_val:
            updates[field] = new_val

    if updates:
        updates["updated_at"] = now
        set_clause = ", ".join(f"{k}=?" for k in updates)
        values     = list(updates.values()) + [name, city, country]
        c.execute(
            f"UPDATE companies SET {set_clause} WHERE name=? AND city=? AND country=?",
            values
        )
        conn.commit()
        conn.close()
        return "updated"

    conn.close()
    return "skipped"


def get_companies(query: str = None, city: str = None, country: str = None) -> list:
    """Fetch companies from DB with optional filters."""
    conn   = get_conn()
    c      = conn.cursor()
    sql    = "SELECT * FROM companies WHERE 1=1"
    params = []
    if city:
        sql += " AND city=?"
        params.append(city)
    if country:
        sql += " AND country=?"
        params.append(country)
    rows = c.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_searches() -> list:
    conn  = get_conn()
    rows  = conn.execute("SELECT * FROM searches ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]
