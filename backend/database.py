"""
ReachCT — database.py
PostgreSQL database layer.
"""

import os
import uuid
import psycopg2
import psycopg2.extras
from datetime import datetime

DATABASE_URL = os.environ.get("DATABASE_URL", "")


def get_conn():
    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_conn()
    c    = conn.cursor()

    # Users
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            google_id   TEXT UNIQUE NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            name        TEXT,
            picture     TEXT,
            created_at  TIMESTAMP DEFAULT NOW(),
            last_login  TIMESTAMP DEFAULT NOW()
        )
    """)

    # Shared companies
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

    # Searches log
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

    # User-created databases
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_databases (
            id         SERIAL PRIMARY KEY,
            user_id    INT REFERENCES users(id) ON DELETE CASCADE,
            name       TEXT NOT NULL,
            kind       TEXT DEFAULT 'maps',
            columns    JSONB DEFAULT '[]',
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    # Migration for databases created before the `columns` column existed
    c.execute("ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS columns JSONB DEFAULT '[]'")

    # Collaborators on user databases
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_database_collaborators (
            id          SERIAL PRIMARY KEY,
            database_id INT REFERENCES user_databases(id) ON DELETE CASCADE,
            user_id     INT REFERENCES users(id) ON DELETE CASCADE,
            role        TEXT CHECK(role IN ('editor', 'viewer')) DEFAULT 'viewer',
            invited_at  TIMESTAMP DEFAULT NOW(),
            UNIQUE(database_id, user_id)
        )
    """)

    # Entries in a user database (flexible columns via JSONB)
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_database_entries (
            id          SERIAL PRIMARY KEY,
            database_id INT REFERENCES user_databases(id) ON DELETE CASCADE,
            company_id  TEXT DEFAULT '',
            data        JSONB DEFAULT '{}',
            created_at  TIMESTAMP DEFAULT NOW()
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Database initialized")


# ── Users ─────────────────────────────────────────────────────────────────────

def upsert_user(google_id: str, email: str, name: str, picture: str) -> dict:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            INSERT INTO users (google_id, email, name, picture)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (google_id) DO UPDATE SET
                name       = EXCLUDED.name,
                picture    = EXCLUDED.picture,
                last_login = NOW()
            RETURNING *
        """, (google_id, email, name, picture))
        user = dict(c.fetchone())
        conn.commit()
        return user
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM users WHERE email = %s", (email,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


# ── Shared companies ──────────────────────────────────────────────────────────

def upsert_company(run_id: str, data: dict) -> str:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO companies (run_id, name, email, phone, website, city, country, company_type, maps_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name, city, country) DO UPDATE SET
                email        = CASE WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email ELSE companies.email END,
                phone        = CASE WHEN EXCLUDED.phone IS NOT NULL THEN EXCLUDED.phone ELSE companies.phone END,
                website      = CASE WHEN EXCLUDED.website IS NOT NULL THEN EXCLUDED.website ELSE companies.website END,
                company_type = EXCLUDED.company_type,
                maps_url     = CASE WHEN EXCLUDED.maps_url IS NOT NULL THEN EXCLUDED.maps_url ELSE companies.maps_url END
            RETURNING (xmax = 0) AS inserted
        """, (
            run_id,
            data.get("name", ""),
            data.get("email"),
            data.get("phone"),
            data.get("website"),
            data.get("city", ""),
            data.get("country", ""),
            data.get("company_type", ""),
            data.get("maps_url"),
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


def get_companies(query: str = None, city: str = None, country: str = None,
                  queries: list = None, cities: list = None, countries: list = None) -> list:
    """Supports both single and multi-value filters."""
    conn   = get_conn()
    c      = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    sql    = "SELECT * FROM companies WHERE 1=1"
    params = []

    # Multi-value support
    if cities and len(cities) > 0:
        sql += f" AND TRIM(city) = ANY(%s)"
        params.append(cities)
    elif city:
        sql += " AND TRIM(city) = %s"
        params.append(city.strip())

    if countries and len(countries) > 0:
        sql += f" AND TRIM(country) = ANY(%s)"
        params.append(countries)
    elif country:
        sql += " AND TRIM(country) = %s"
        params.append(country.strip())

    if queries and len(queries) > 0:
        sql += f" AND TRIM(company_type) = ANY(%s)"
        params.append(queries)
    elif query:
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


# ── User databases ────────────────────────────────────────────────────────────

def create_user_database(user_id: int, name: str, kind: str = "maps", columns: list = None) -> dict:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            INSERT INTO user_databases (user_id, name, kind, columns)
            VALUES (%s, %s, %s, %s) RETURNING *
        """, (user_id, name, kind, psycopg2.extras.Json(columns or [])))
        db = dict(c.fetchone())
        conn.commit()
        return db
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_user_databases(user_id: int) -> list:
    """Get all databases owned by or shared with user."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("""
        SELECT ud.*, 'owner' as role
        FROM user_databases ud
        WHERE ud.user_id = %s
        UNION
        SELECT ud.*, udc.role
        FROM user_databases ud
        JOIN user_database_collaborators udc ON ud.id = udc.database_id
        WHERE udc.user_id = %s
        ORDER BY created_at DESC
    """, (user_id, user_id))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_user_database(db_id: int, user_id: int) -> dict | None:
    """Get a database if user has access."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("""
        SELECT ud.*, 'owner' as role FROM user_databases ud
        WHERE ud.id = %s AND ud.user_id = %s
        UNION
        SELECT ud.*, udc.role FROM user_databases ud
        JOIN user_database_collaborators udc ON ud.id = udc.database_id
        WHERE ud.id = %s AND udc.user_id = %s
        LIMIT 1
    """, (db_id, user_id, db_id, user_id))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_user_database(db_id: int, user_id: int) -> bool:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("DELETE FROM user_databases WHERE id = %s AND user_id = %s", (db_id, user_id))
        deleted = c.rowcount > 0
        conn.commit()
        return deleted
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ── User database entries ─────────────────────────────────────────────────────

def get_db_entries(db_id: int) -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM user_database_entries WHERE database_id = %s ORDER BY created_at ASC", (db_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_db_entries(db_id: int, rows: list) -> list:
    """Add multiple rows. Each row is a dict of column:value pairs."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    inserted = []
    try:
        for row in rows:
            company_id = row.pop("company_id", str(uuid.uuid4())[:8])
            c.execute("""
                INSERT INTO user_database_entries (database_id, company_id, data)
                VALUES (%s, %s, %s) RETURNING *
            """, (db_id, company_id, psycopg2.extras.Json(row)))
            inserted.append(dict(c.fetchone()))
        conn.commit()
        return inserted
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def update_db_entry(entry_id: int, db_id: int, data: dict) -> dict | None:
    """Merge the given fields into a row's JSONB data — never a full overwrite.
    Two collaborators editing different columns of the same row close together
    would otherwise clobber each other's change (last PATCH wins on the whole blob)."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            UPDATE user_database_entries
            SET data = COALESCE(data, '{}'::jsonb) || %s::jsonb
            WHERE id = %s AND database_id = %s RETURNING *
        """, (psycopg2.extras.Json(data), entry_id, db_id))
        row = c.fetchone()
        conn.commit()
        return dict(row) if row else None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_db_entry(entry_id: int, db_id: int) -> bool:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("DELETE FROM user_database_entries WHERE id = %s AND database_id = %s", (entry_id, db_id))
        deleted = c.rowcount > 0
        conn.commit()
        return deleted
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ── Collaborators ─────────────────────────────────────────────────────────────

def add_collaborator(db_id: int, owner_id: int, email: str, role: str) -> dict:
    """Add a collaborator by email. Raises if user not found or not owner."""
    target = get_user_by_email(email)
    if not target:
        raise ValueError(f"No user found with email {email}")
    if target["id"] == owner_id:
        raise ValueError("Cannot add yourself as collaborator")

    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            INSERT INTO user_database_collaborators (database_id, user_id, role)
            VALUES (%s, %s, %s)
            ON CONFLICT (database_id, user_id) DO UPDATE SET role = EXCLUDED.role
            RETURNING *
        """, (db_id, target["id"], role))
        collab = dict(c.fetchone())
        conn.commit()
        return {**collab, "name": target["name"], "email": target["email"], "picture": target.get("picture")}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_collaborators(db_id: int) -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("""
        SELECT udc.*, u.name, u.email, u.picture
        FROM user_database_collaborators udc
        JOIN users u ON u.id = udc.user_id
        WHERE udc.database_id = %s
    """, (db_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def remove_collaborator(db_id: int, owner_id: int, target_user_id: int) -> bool:
    # Verify owner
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("SELECT user_id FROM user_databases WHERE id = %s", (db_id,))
        row = c.fetchone()
        if not row or row[0] != owner_id:
            raise PermissionError("Only the owner can remove collaborators")
        c.execute("DELETE FROM user_database_collaborators WHERE database_id = %s AND user_id = %s", (db_id, target_user_id))
        deleted = c.rowcount > 0
        conn.commit()
        return deleted
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def rename_column_in_db(db_id: int, old_name: str, new_name: str) -> int:
    """Rename a key in all JSONB entries for a database, and in the persisted column list."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        # Use PostgreSQL JSONB rename: remove old key, set new key with old value
        c.execute("""
            UPDATE user_database_entries
            SET data = (data - %s) || jsonb_build_object(%s, data->%s)
            WHERE database_id = %s AND data ? %s
        """, (old_name, new_name, old_name, db_id, old_name))
        count = c.rowcount

        c.execute("SELECT columns FROM user_databases WHERE id = %s", (db_id,))
        row  = c.fetchone()
        cols = row[0] if row and row[0] else []
        if old_name in cols:
            cols = [new_name if col == old_name else col for col in cols]
            c.execute("UPDATE user_databases SET columns = %s WHERE id = %s",
                      (psycopg2.extras.Json(cols), db_id))

        conn.commit()
        return count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def delete_column_from_db(db_id: int, col: str) -> dict:
    """Remove a key from every row's JSONB data and from the persisted column list,
    atomically in one DB round trip — avoids the old N-requests-from-the-client
    pattern where a row deleted mid-loop by another collaborator could corrupt
    local state."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            UPDATE user_database_entries SET data = data - %s
            WHERE database_id = %s AND data ? %s
        """, (col, db_id, col))
        rows_affected = c.rowcount

        c.execute("SELECT columns FROM user_databases WHERE id = %s", (db_id,))
        row  = c.fetchone()
        cols = [x for x in ((row["columns"] if row else []) or []) if x != col]
        c.execute("UPDATE user_databases SET columns = %s WHERE id = %s RETURNING *",
                  (psycopg2.extras.Json(cols), db_id))
        updated_db = c.fetchone()

        conn.commit()
        return {"rows_affected": rows_affected, "database": dict(updated_db) if updated_db else None}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def set_db_columns(db_id: int, columns: list) -> dict | None:
    """Overwrite the persisted, ordered column list for a database."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            UPDATE user_databases SET columns = %s WHERE id = %s RETURNING *
        """, (psycopg2.extras.Json(columns), db_id))
        row = c.fetchone()
        conn.commit()
        return dict(row) if row else None
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


# ── Mailrelay / Campaigns ─────────────────────────────────────────────────────

def init_campaigns_tables():
    """Create mailrelay_key column and campaigns table if not exists."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS mailrelay_api_key TEXT DEFAULT ''")
        c.execute("""
            CREATE TABLE IF NOT EXISTS campaigns (
                id              SERIAL PRIMARY KEY,
                user_id         INT REFERENCES users(id) ON DELETE CASCADE,
                name            TEXT NOT NULL,
                subject         TEXT DEFAULT '',
                body            TEXT DEFAULT '',
                mailrelay_group_id    INT,
                mailrelay_campaign_id INT,
                contact_count   INT DEFAULT 0,
                status          TEXT DEFAULT 'draft',
                created_at      TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  init_campaigns_tables: {e}")
    finally:
        conn.close()


def save_mailrelay_key(user_id: int, api_key: str):
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("UPDATE users SET mailrelay_api_key = %s WHERE id = %s", (api_key, user_id))
        conn.commit()
    finally:
        conn.close()


def get_mailrelay_key(user_id: int) -> str:
    conn = get_conn()
    c    = conn.cursor()
    c.execute("SELECT mailrelay_api_key FROM users WHERE id = %s", (user_id,))
    row = c.fetchone()
    conn.close()
    return (row[0] or "") if row else ""


def create_campaign_record(user_id: int, name: str, subject: str, body: str,
                            group_id: int, campaign_id: int, contact_count: int) -> dict:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            INSERT INTO campaigns (user_id, name, subject, body, mailrelay_group_id,
                                   mailrelay_campaign_id, contact_count, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,'draft') RETURNING *
        """, (user_id, name, subject, body, group_id, campaign_id, contact_count))
        row = dict(c.fetchone())
        conn.commit()
        return row
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def get_user_campaigns(user_id: int) -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM campaigns WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_campaign_record(campaign_id: int, user_id: int) -> bool:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("DELETE FROM campaigns WHERE id = %s AND user_id = %s", (campaign_id, user_id))
        deleted = c.rowcount > 0
        conn.commit()
        return deleted
    finally:
        conn.close()


# ── Email Templates ───────────────────────────────────────────────────────────

def init_templates_table():
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            CREATE TABLE IF NOT EXISTS email_templates (
                id         SERIAL PRIMARY KEY,
                user_id    INT REFERENCES users(id) ON DELETE CASCADE,
                name       TEXT NOT NULL,
                subject    TEXT DEFAULT '',
                body       TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  init_templates_table: {e}")
    finally:
        conn.close()


def create_template(user_id: int, name: str, subject: str, body: str) -> dict:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            INSERT INTO email_templates (user_id, name, subject, body)
            VALUES (%s, %s, %s, %s) RETURNING *
        """, (user_id, name, subject, body))
        row = dict(c.fetchone())
        conn.commit()
        return row
    except Exception as e:
        conn.rollback(); raise e
    finally:
        conn.close()


def get_user_templates(user_id: int) -> list:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    c.execute("SELECT * FROM email_templates WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_template(template_id: int, user_id: int, name: str, subject: str, body: str) -> dict | None:
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        c.execute("""
            UPDATE email_templates SET name=%s, subject=%s, body=%s
            WHERE id=%s AND user_id=%s RETURNING *
        """, (name, subject, body, template_id, user_id))
        row = c.fetchone()
        conn.commit()
        return dict(row) if row else None
    except Exception as e:
        conn.rollback(); raise e
    finally:
        conn.close()


def delete_template(template_id: int, user_id: int) -> bool:
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("DELETE FROM email_templates WHERE id=%s AND user_id=%s", (template_id, user_id))
        deleted = c.rowcount > 0
        conn.commit()
        return deleted
    finally:
        conn.close()


# ── LinkedIn / People shared database ─────────────────────────────────────────

def init_linkedin_table():
    """Create the shared linkedin_contacts table and migrate kind column."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        # Ensure kind column exists on user_databases (migration for existing dbs)
        c.execute("ALTER TABLE user_databases ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'maps'")
        c.execute("""
            CREATE TABLE IF NOT EXISTS linkedin_contacts (
                id            SERIAL PRIMARY KEY,
                full_name     TEXT NOT NULL,
                company_type  TEXT DEFAULT '',
                profile_title TEXT DEFAULT '',
                company       TEXT DEFAULT '',
                email         TEXT DEFAULT '',
                confidence    TEXT DEFAULT '',
                linkedin_url  TEXT DEFAULT '',
                location      TEXT DEFAULT '',
                created_at    TIMESTAMP DEFAULT NOW(),
                UNIQUE(linkedin_url)
            )
        """)
        # Migrate: rename job_title → company_type if old column still exists
        c.execute("""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns
                           WHERE table_name='linkedin_contacts' AND column_name='job_title') THEN
                    ALTER TABLE linkedin_contacts RENAME COLUMN job_title TO company_type;
                END IF;
            END $$;
        """)
        c.execute("ALTER TABLE linkedin_contacts ADD COLUMN IF NOT EXISTS profile_title TEXT DEFAULT ''")
        c.execute("ALTER TABLE linkedin_contacts ADD COLUMN IF NOT EXISTS company_type TEXT DEFAULT ''")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  init_linkedin_table: {e}")
    finally:
        conn.close()


def upsert_linkedin_contact(person: dict):
    """Insert or update a LinkedIn contact in the shared DB."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO linkedin_contacts
                (full_name, company_type, profile_title, company, email, confidence, linkedin_url, location)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (linkedin_url) DO UPDATE SET
                full_name     = EXCLUDED.full_name,
                company_type  = CASE WHEN EXCLUDED.company_type IS NOT NULL THEN EXCLUDED.company_type ELSE linkedin_contacts.company_type END,
                profile_title = CASE WHEN EXCLUDED.profile_title IS NOT NULL THEN EXCLUDED.profile_title ELSE linkedin_contacts.profile_title END,
                company       = CASE WHEN EXCLUDED.company IS NOT NULL THEN EXCLUDED.company ELSE linkedin_contacts.company END,
                email         = CASE WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email ELSE linkedin_contacts.email END,
                confidence    = EXCLUDED.confidence,
                location      = CASE WHEN EXCLUDED.location IS NOT NULL THEN EXCLUDED.location ELSE linkedin_contacts.location END
        """, (
            person.get("full_name", ""),
            person.get("company_type"),
            person.get("profile_title"),
            person.get("company"),
            person.get("email"),
            person.get("confidence"),
            person.get("linkedin_url", ""),
            person.get("location"),
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  upsert_linkedin_contact: {e}")
    finally:
        conn.close()


def get_linkedin_contacts(company_type: str = "", company: str = "", location: str = "") -> list:
    """Pull LinkedIn contacts with optional filters."""
    conn = get_conn()
    c    = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query  = "SELECT * FROM linkedin_contacts WHERE 1=1"
    params = []
    if company_type:
        query += " AND company_type ILIKE %s"; params.append(f"%{company_type}%")
    if company:
        query += " AND company ILIKE %s"; params.append(f"%{company}%")
    if location:
        query += " AND location ILIKE %s"; params.append(f"%{location}%")
    query += " ORDER BY created_at DESC LIMIT 500"
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_linkedin_filters() -> dict:
    """Get distinct job titles, companies, locations for filter dropdowns."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("SELECT DISTINCT company_type FROM linkedin_contacts WHERE company_type != '' ORDER BY company_type")
        company_types = [r[0] for r in c.fetchall()]
        c.execute("SELECT DISTINCT company FROM linkedin_contacts WHERE company != '' ORDER BY company")
        companies = [r[0] for r in c.fetchall()]
        c.execute("SELECT DISTINCT location FROM linkedin_contacts WHERE location != '' ORDER BY location")
        locations = [r[0] for r in c.fetchall()]
        return {"company_types": company_types, "companies": companies, "locations": locations}
    except Exception:
        return {"company_types": [], "companies": [], "locations": []}
    finally:
        conn.close()


# ── Internship Listings ───────────────────────────────────────────────────────

def init_internship_table():
    """Create the internship_listings table for Companies search results."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            CREATE TABLE IF NOT EXISTS internship_listings (
                id               SERIAL PRIMARY KEY,
                internship       TEXT NOT NULL DEFAULT '',
                internship_type  TEXT DEFAULT '',
                company          TEXT DEFAULT '',
                linkedin_url     TEXT DEFAULT '',
                email            TEXT DEFAULT '',
                company_website  TEXT DEFAULT '',
                city             TEXT DEFAULT '',
                country          TEXT DEFAULT '',
                created_at       TIMESTAMP DEFAULT NOW(),
                UNIQUE(linkedin_url)
            )
        """)
        c.execute("ALTER TABLE internship_listings ADD COLUMN IF NOT EXISTS internship_type TEXT DEFAULT ''")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  init_internship_table: {e}")
    finally:
        conn.close()


def upsert_internship_listing(listing: dict):
    """Insert or update an internship listing. linkedin_url is the unique key."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute("""
            INSERT INTO internship_listings
                (internship, internship_type, company, linkedin_url, email, company_website, city, country)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (linkedin_url) DO UPDATE SET
                internship      = EXCLUDED.internship,
                internship_type = EXCLUDED.internship_type,
                company         = CASE WHEN EXCLUDED.company IS NOT NULL THEN EXCLUDED.company ELSE internship_listings.company END,
                email           = CASE WHEN EXCLUDED.email IS NOT NULL THEN EXCLUDED.email ELSE internship_listings.email END,
                company_website = CASE WHEN EXCLUDED.company_website IS NOT NULL THEN EXCLUDED.company_website ELSE internship_listings.company_website END,
                city            = CASE WHEN EXCLUDED.city IS NOT NULL THEN EXCLUDED.city ELSE internship_listings.city END,
                country         = CASE WHEN EXCLUDED.country IS NOT NULL THEN EXCLUDED.country ELSE internship_listings.country END
        """, (
            listing.get("internship", ""),
            listing.get("internship_type", ""),
            listing.get("company"),
            listing.get("linkedin_url", ""),
            listing.get("email"),
            listing.get("company_website"),
            listing.get("city"),
            listing.get("country"),
        ))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"⚠️  upsert_internship_listing: {e}")
    finally:
        conn.close()


def get_internship_listings(internship_type: str = "", company: str = "", city: str = "", country: str = "") -> list:
    """Pull internship listings with optional filters."""
    conn   = get_conn()
    c      = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query  = "SELECT * FROM internship_listings WHERE 1=1"
    params = []
    if internship_type:
        query += " AND internship_type ILIKE %s"; params.append(f"%{internship_type}%")
    if company:
        query += " AND company ILIKE %s"; params.append(f"%{company}%")
    if city:
        query += " AND city ILIKE %s"; params.append(f"%{city}%")
    if country:
        query += " AND country ILIKE %s"; params.append(f"%{country}%")
    query += " ORDER BY created_at DESC LIMIT 500"
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_old_internship_listings(days: int = 30) -> int:
    """Delete internship listings older than `days` days. Returns deleted row count."""
    conn = get_conn()
    c    = conn.cursor()
    try:
        c.execute(
            "DELETE FROM internship_listings WHERE created_at < NOW() - INTERVAL '%s days'",
            (days,)
        )
        deleted = c.rowcount
        conn.commit()
        if deleted:
            print(f"🧹 Deleted {deleted} expired internship listing(s) (>{days} days old)")
        return deleted
    except Exception as e:
        conn.rollback()
        print(f"⚠️  delete_old_internship_listings: {e}")
        return 0
    finally:
        conn.close()