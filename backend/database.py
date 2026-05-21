"""
ReachCT — database.py
PostgreSQL database layer for storing and managing scraped companies.
"""

import os
import psycopg2
import psycopg2.extras
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_conn()
    c    = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS searches (
            id          SERIAL PRIMARY KEY,
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
            id           SERIAL PRIMARY KEY,
            run_id       TEXT NOT NULL,
            name         TEXT NOT NULL,
            email        TEXT DEFAULT '',
            phone        TEXT DEFAULT '',
            website      TEXT DEFAULT '',
            city         TEXT DEFAULT '',
            country      TEXT DEFAULT '',
            company_type TEXT DEFAULT '',
            category     TEXT DEFAULT '',
            maps_url     TEXT DEFAULT '',
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL,
            UNIQUE(name, city, country)
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized")


def save_search(run_id, query, city, country, start_idx, end_idx, total_found):
    conn = get_conn()
    c    = conn.cursor()
    c.execute("""
        INSERT INTO searches (run_id, query, city, country, start_idx, end_idx, total_found, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (run_id, query, city, country, start_idx, end_idx, total_found,
          datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()


def upsert_company(run_id: str, company: dict) -> str:
    conn    = get_conn()
    c       = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    now     = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    name    = company.get("name",    "").strip()
    city    = company.get("city",    "").strip()
    country = company.get("country", "").strip()

    c.execute(
        "SELECT * FROM companies WHERE name=%s AND city=%s AND country=%s",
        (name, city, country)
    )
    existing = c.fetchone()

    if not existing:
        c.execute("""
            INSERT INTO companies
                (run_id, name, email, phone, website, city, country, company_type, category, maps_url, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            run_id,
            name,
            company.get("email",        ""),
            company.get("phone",        ""),
            company.get("website",      ""),
            city, country,
            company.get("company_type", ""),
            company.get("category",     ""),
            company.get("maps_url",     ""),
            now, now
        ))
        conn.commit()
        conn.close()
        return "inserted"

    # Check for new information
    updates = {}
    for field in ["email", "phone", "website", "category", "company_type", "maps_url"]:
        new_val = company.get(field, "").strip()
        old_val = (existing[field] or "").strip()
        if new_val and not old_val:
            updates[field] = new_val

    if updates:
        updates["updated_at"] = now
        set_clause = ", ".join(f"{k}=%s" for k in updates)
        values     = list(updates.values()) + [name, city, country]
        c.execute(
            f"UPDATE companies SET {set_clause} WHERE name=%s AND city=%s AND country=%s",
            values
        )
        conn.commit()
        conn.close()
        return "updated"

    conn.close()
    return "skipped"


def _get_country_variants(country: str) -> list:
    """
    Returns all known variants of a country name using fuzzy matching.
    Handles any language — españa, espagne, spanien all resolve to Spain.
    Falls back to the original string if no match found.
    """
    try:
        import pycountry
        from rapidfuzz import process, fuzz

        key = country.strip().lower()

        # Build a lookup of all country names + common aliases
        all_names = {}
        for c in pycountry.countries:
            names = [c.name.lower()]
            if hasattr(c, "common_name"):
                names.append(c.common_name.lower())
            if hasattr(c, "official_name"):
                names.append(c.official_name.lower())
            names.append(c.alpha_2.lower())
            names.append(c.alpha_3.lower())
            for n in names:
                all_names[n] = [n2 for n2 in names]

        # Direct match first
        if key in all_names:
            return all_names[key]

        # Fuzzy match — find closest country name
        match = process.extractOne(
            key,
            list(all_names.keys()),
            scorer=fuzz.WRatio,
            score_cutoff=80
        )
        if match:
            return all_names[match[0]]

    except ImportError:
        pass

    # Fallback — just return the original
    return [country.strip().lower()]


def get_companies(query: str = None, city: str = None, country: str = None) -> list:
    conn   = get_conn()
    c      = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    sql    = "SELECT * FROM companies WHERE 1=1"
    params = []

    if city:
        # Partial, case and space insensitive city match
        sql += " AND TRIM(LOWER(city)) ILIKE %s"
        params.append(f"%{city.strip().lower()}%")

    if country:
        # Match country using both exact and partial ILIKE
        # Also try known variants (españa → spain → es)
        variants = _get_country_variants(country)
        # Build OR clause: matches any variant OR partial ILIKE match
        or_clauses = []
        for v in variants:
            or_clauses.append("TRIM(LOWER(country)) ILIKE %s")
            params.append(f"%{v}%")
        # Also add direct partial match on what user typed
        or_clauses.append("TRIM(LOWER(country)) ILIKE %s")
        params.append(f"%{country.strip().lower()}%")
        sql += f" AND ({' OR '.join(or_clauses)})"

    if query:
        # Split query into words and match any word in company_type
        # e.g. "marketing company" matches "agencia de marketing"
        words = [w for w in query.strip().lower().split() if len(w) > 2]
        if words:
            word_clauses = []
            for word in words:
                word_clauses.append("TRIM(LOWER(company_type)) ILIKE %s")
                params.append(f"%{word}%")
            sql += f" AND ({' OR '.join(word_clauses)})"

    sql += " ORDER BY name ASC"
    c.execute(sql, params)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_searches() -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM searches ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]
