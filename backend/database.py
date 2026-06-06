"""
ReachCT — database.py
PostgreSQL database layer.
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
        CREATE TABLE IF NOT EXISTS companies (
            id           SERIAL PRIMARY KEY,
            run_id       TEXT,
            name         TEXT,
            email        TEXT,
            phone        TEXT,
            website      TEXT,
            city         TEXT,
            country      TEXT,
            company_type TEXT,
            maps_url     TEXT,
            created_at   TIMESTAMP DEFAULT NOW(),
            UNIQUE(name, city, country)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS searches (
            id          SERIAL PRIMARY KEY,
            run_id      TEXT UNIQUE,
            query       TEXT,
            city        TEXT,
            country     TEXT,
            start_idx   INT,
            end_idx     INT,
            total_found INT,
            created_at  TIMESTAMP DEFAULT NOW()
        )
    """)
    conn.commit()
    conn.close()
    print("✅ Database initialized")


def upsert_company(run_id: str, data: dict) -> str:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO companies (run_id, name, email, phone, website, city, country, company_type, maps_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name, city, country) DO UPDATE SET
                email        = EXCLUDED.email,
                phone        = EXCLUDED.phone,
                website      = EXCLUDED.website,
                company_type = EXCLUDED.company_type,
                maps_url     = EXCLUDED.maps_url
            RETURNING (xmax = 0) AS inserted
        """, (
            run_id,
            data.get("name", ""),
            data.get("email", ""),
            data.get("phone", ""),
            data.get("website", ""),
            data.get("city", ""),
            data.get("country", ""),
            data.get("company_type", ""),
            data.get("maps_url", ""),
        ))
        row      = c.fetchone()
        inserted = row[0] if row else False
        conn.commit()
        return "inserted" if inserted else "updated"
    except Exception as e:
        conn.rollback()
        print(f"⚠️  DB upsert error: {e}")
        return "skipped"
    finally:
        conn.close()


def save_search(run_id, query, city, country, start_idx, end_idx, total_found):
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO searches (run_id, query, city, country, start_idx, end_idx, total_found)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (run_id) DO NOTHING
        """, (run_id, query, city, country, start_idx, end_idx, total_found))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  DB save_search error: {e}")
    finally:
        conn.close()


def get_companies(query: str = None, city: str = None, country: str = None) -> list:
    conn   = get_conn()
    c      = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    sql    = "SELECT * FROM companies WHERE 1=1"
    params = []

    if city:
        sql += " AND TRIM(city) = %s"
        params.append(city.strip())

    if country:
        sql += " AND TRIM(country) = %s"
        params.append(country.strip())

    if query:
        sql += " AND TRIM(company_type) = %s"
        params.append(query.strip())

    sql += " ORDER BY name ASC"
    c.execute(sql, params)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_searches() -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM searches ORDER BY created_at DESC LIMIT 100")
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_filters() -> dict:
    conn = get_conn()
    c    = conn.cursor()

    c.execute("SELECT DISTINCT TRIM(country) FROM companies WHERE country != '' ORDER BY 1 ASC")
    countries = [row[0] for row in c.fetchall()]

    c.execute("SELECT DISTINCT TRIM(city), TRIM(country) FROM companies WHERE city != '' ORDER BY 1 ASC")
    cities = {}
    for city, country in c.fetchall():
        if country not in cities:
            cities[country] = []
        if city not in cities[country]:
            cities[country].append(city)

    c.execute("SELECT DISTINCT TRIM(company_type) FROM companies WHERE company_type != '' ORDER BY 1 ASC")
    company_types = [row[0] for row in c.fetchall()]

    conn.close()
    return {"countries": countries, "cities": cities, "company_types": company_types}
