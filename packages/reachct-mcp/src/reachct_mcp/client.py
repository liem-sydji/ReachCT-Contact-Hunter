"""HTTP client for the ReachCT API. No database drivers."""

from __future__ import annotations

import os
import time
from typing import Any, Optional

import httpx

DEFAULT_API_URL = "https://reachct-production.up.railway.app"
MAPS_COLUMNS = ["name", "email", "phone", "website", "city", "country", "company_type"]


def _env(name: str, default: str = "") -> str:
    return (os.environ.get(name) or default).strip()


class ReachCTClient:
    def __init__(self, api_url: str | None = None, api_key: str | None = None):
        self.api_url = (api_url or _env("REACHCT_API_URL", DEFAULT_API_URL)).rstrip("/")
        self.api_key = api_key or _env("REACHCT_API_KEY")
        if not self.api_key:
            raise RuntimeError("REACHCT_API_KEY is required")

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = f"{self.api_url}{path}"
        with httpx.Client(timeout=120.0) as client:
            res = client.request(method, url, headers=self._headers(), **kwargs)
            if res.status_code >= 400:
                detail = res.text
                try:
                    detail = res.json().get("detail", detail)
                except Exception:
                    pass
                raise RuntimeError(f"{method} {path} failed ({res.status_code}): {detail}")
            if res.status_code == 204 or not res.content:
                return None
            return res.json()

    @staticmethod
    def to_table(rows: list[dict], columns: list[str] | None = None) -> dict:
        cols = columns or MAPS_COLUMNS
        structured = []
        for row in rows or []:
            src = row.get("data") if isinstance(row.get("data"), dict) else row
            structured.append({c: (src.get(c) if isinstance(src, dict) else None) or "" for c in cols})
        header = "| " + " | ".join(cols) + " |"
        sep = "| " + " | ".join("---" for _ in cols) + " |"
        lines = [header, sep]
        for r in structured:
            cells = [str(r.get(c, "")).replace("|", "\\|").replace("\n", " ") for c in cols]
            lines.append("| " + " | ".join(cells) + " |")
        return {
            "columns": cols,
            "rows": structured,
            "markdown": "\n".join(lines),
            "total": len(structured),
        }

    def scrape_urls(
        self,
        query: str,
        city: str,
        country: str,
        start: int = 0,
        end: int = 25,
        poll_timeout_s: int = 900,
    ) -> dict:
        """Google Maps discovery — returns websites + company metadata."""
        params = {
            "query": query,
            "city": city,
            "country": country,
            "start": start,
            "end": end,
        }
        started = self._request("GET", "/api/scrape", params=params)
        job_id = started["job_id"]
        job = self._poll_job(f"/api/job/{job_id}", poll_timeout_s)
        results = job.get("results") or []
        table = self.to_table(results, MAPS_COLUMNS)
        return {
            "job_id": job_id,
            "status": job.get("status"),
            "query": query,
            "city": city,
            "country": country,
            **table,
            "websites": [r.get("website") for r in table["rows"] if r.get("website")],
        }

    def reachct(
        self,
        urls: list[str],
        company_type: str = "Company",
        city: Optional[str] = None,
        country: Optional[str] = None,
        database_id: Optional[int] = None,
        database_name: Optional[str] = None,
        poll_timeout_s: int = 900,
    ) -> dict:
        """Scrape URLs and return tabular contact rows for outreach."""
        # Prefer server-side convenience endpoint (polls + optional save).
        try:
            return self._request(
                "POST",
                "/api/mcp/reachct",
                json={
                    "urls": urls,
                    "company_type": company_type,
                    "city": city,
                    "country": country,
                    "database_id": database_id,
                    "database_name": database_name,
                    "poll_timeout_s": poll_timeout_s,
                },
            )
        except RuntimeError:
            # Fallback: client-side poll against /api/scrape/urls
            started = self._request(
                "POST",
                "/api/scrape/urls",
                json={
                    "urls": urls,
                    "company_type": company_type,
                    "city": city,
                    "country": country,
                },
            )
            job_id = started["job_id"]
            job = self._poll_job(f"/api/scrape/urls/status/{job_id}", poll_timeout_s)
            results = job.get("results") or []
            table = self.to_table(results, MAPS_COLUMNS)
            saved = None
            if database_name and not database_id:
                db = self.create_database(database_name)
                database_id = db["id"]
                saved = {"created_database": db}
            if database_id:
                inserted = self.save_to_database(database_id, table["rows"])
                saved = {**(saved or {}), "database_id": database_id, **inserted}
            return {
                "job_id": job_id,
                "status": job.get("status"),
                **table,
                "skipped_urls": job.get("skipped_urls") or [],
                "saved": saved,
            }

    def create_database(
        self,
        name: str,
        kind: str = "maps",
        columns: list[str] | None = None,
    ) -> dict:
        payload: dict[str, Any] = {"name": name, "kind": kind}
        if columns:
            payload["columns"] = columns
        return self._request("POST", "/api/databases", json=payload)

    def list_databases(self) -> dict:
        dbs = self._request("GET", "/api/databases")
        rows = []
        for db in dbs or []:
            rows.append({
                "id": db.get("id"),
                "name": db.get("name"),
                "kind": db.get("kind"),
                "role": db.get("role"),
                "entry_count": db.get("entry_count", 0),
                "created_at": str(db.get("created_at") or ""),
            })
        table = self.to_table(
            rows,
            ["id", "name", "kind", "role", "entry_count", "created_at"],
        )
        return {"databases": rows, **table}

    def pull_from_database(self, database_id: int) -> dict:
        try:
            return self._request("GET", f"/api/mcp/databases/{database_id}/table")
        except RuntimeError:
            entries = self._request("GET", f"/api/databases/{database_id}/entries")
            return self.to_table(entries or [])

    def save_to_database(self, database_id: int, rows: list[dict]) -> dict:
        return self._request(
            "POST",
            "/api/databases/add-rows",
            json={"db_id": database_id, "rows": rows},
        )

    def _poll_job(self, status_path: str, timeout_s: int) -> dict:
        deadline = time.time() + max(30, min(timeout_s, 1800))
        while time.time() < deadline:
            job = self._request("GET", status_path)
            status = job.get("status")
            if status in ("done", "error", "cancelled"):
                if status == "error":
                    raise RuntimeError(job.get("error") or "Job failed")
                if status == "cancelled":
                    raise RuntimeError("Job cancelled")
                return job
            time.sleep(2)
        raise RuntimeError(f"Timed out polling {status_path}")
