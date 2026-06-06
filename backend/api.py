"""
ReachCT — api.py
FastAPI backend that connects the React frontend to the scraper.

Requirements:
    pip install fastapi uvicorn python-multipart

Run:
    uvicorn api:app --reload --port 8000
"""

import os
import sys
import uuid
import asyncio
from datetime import datetime
from typing import Optional

# ── Windows fix: Playwright needs this event loop policy ─────────────────────
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from database import init_db, save_search, upsert_company, get_companies
from reachct  import scrape_google_maps, export_to_excel

app = FastAPI(title="ReachCT API", version="1.0.0")

# ── CORS — allows React dev server to talk to this API ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory job store + queue ──────────────────────────────────────────────
import threading
import queue as queue_module

jobs: dict       = {}
search_queue     = queue_module.Queue()
queue_lock       = threading.Lock()


def queue_worker():
    """Background worker that processes search jobs one at a time. Runs forever."""
    while True:
        try:
            job_id, query, city, country, start, end = search_queue.get(timeout=300)
            jobs[job_id]["status"]         = "running"
            jobs[job_id]["queue_position"] = 0

            # Update queue positions for waiting jobs
            waiting = [j for j in jobs.values() if j["status"] == "queued"]
            for idx, j in enumerate(waiting):
                j["queue_position"] = idx + 1

            # Run in thread and WAIT for it to finish before processing next job
            t = threading.Thread(target=run_scrape_job_thread, args=(job_id, query, city, country, start, end))
            t.start()
            t.join()  # blocks queue worker until job is fully complete
            search_queue.task_done()
        except queue_module.Empty:
            # Keep running — just nothing in queue right now
            continue
        except Exception as e:
            print(f"❌ Queue worker error: {e}")
            continue


# Start the queue worker thread once at startup — never dies
_worker_thread = threading.Thread(target=queue_worker, daemon=True)
_worker_thread.start()

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    init_db()
    print("✅ ReachCT API ready")


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now().isoformat()}


# ── Start a scrape job ────────────────────────────────────────────────────────
@app.get("/api/scrape")
async def start_scrape(
    query:   str,
    city:    str,
    country: str,
    start:   int = 0,
    end:     int = 25,
):
    """
    Kicks off a scrape job in the background and returns a job_id.
    The frontend polls /api/job/{job_id} to check progress.
    """
    # Clean inputs
    query   = query.strip()
    city    = city.strip().title()
    country = country.strip().title()

    if not query or not city or not country:
        raise HTTPException(status_code=400, detail="query, city and country are required")

    if end <= start:
        raise HTTPException(status_code=400, detail="end must be greater than start")

    if (end - start) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 listings per search.")

    job_id = str(uuid.uuid4())[:8]

    # Use lock to prevent race condition when two users search simultaneously
    with queue_lock:
        queued_or_running = sum(
            1 for j in jobs.values()
            if j["status"] in ("running", "queued")
        )
        queue_position = queued_or_running  # 0 = runs immediately

        jobs[job_id] = {
            "status":         "queued",  # worker sets to running when it starts
            "queue_position": queue_position,
            "progress":       0,
            "total":          end - start,
            "total_on_maps":  None,
            "processing":     None,
            "results":        [],
            "error":          None,
            "query":          query,
            "city":           city,
            "country":        country,
        }

        search_queue.put((job_id, query, city, country, start, end))

    message = "Scrape started" if queue_position == 0 else f"Queued at position {queue_position}"
    return {"job_id": job_id, "message": message, "queue_position": queue_position}


def run_scrape_job_thread(job_id: str, query: str, city: str,
                           country: str, start: int, end: int):
    """
    Runs the scraper in a fresh event loop on a background thread.
    This is required on Windows where Playwright can't share the uvicorn loop.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(
            run_scrape_job(job_id, query, city, country, start, end)
        )
    finally:
        loop.close()


async def run_scrape_job(job_id: str, query: str, city: str,
                          country: str, start: int, end: int):
    """Runs the scraper and updates the job store."""
    try:
        run_id  = job_id
        results = await scrape_google_maps(query, city, country, start, end, run_id, jobs=jobs, job_id=job_id)

        # Save to DB
        for company in results:
            upsert_company(run_id, company)

        save_search(run_id, query, city, country, start, end, len(results))

        if jobs[job_id].get("status") == "cancelling":
            jobs[job_id]["status"]  = "cancelled"
        else:
            jobs[job_id]["status"]  = "done"
        jobs[job_id]["results"] = results

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(e)
        print(f"❌ Job {job_id} failed: {e}")


# ── Cancel a job ─────────────────────────────────────────────────────────────
@app.post("/api/job/{job_id}/cancel")
def cancel_job(job_id: str):
    """Marks a job as cancelled — scraper checks this flag between listings."""
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] == "running" or job["status"] == "queued":
        job["status"] = "cancelling"
        return {"message": "Cancellation requested"}
    return {"message": f"Job already {job['status']}"}


# ── Poll job status ───────────────────────────────────────────────────────────
@app.get("/api/job/{job_id}")
def get_job(job_id: str):
    """
    Returns current status of a scrape job.
    Frontend polls this every 3s until status == 'done' or 'error'.
    """
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ── Export Excel ──────────────────────────────────────────────────────────────
@app.get("/api/export")
def export(
    query:   str = "",
    city:    str = "",
    country: str = "",
):
    query   = query.strip()
    city    = city.strip().title()
    country = country.strip().title()
    """
    Exports companies from the DB to Excel and returns the file for download.
    Filters by city and country if provided.
    """
    data = get_companies(city=city, country=country)

    if not data:
        raise HTTPException(status_code=404, detail="No companies found for this location")

    filename = export_to_excel(data, query or "export", city, country)

    if not filename or not os.path.exists(filename):
        raise HTTPException(status_code=500, detail="Failed to generate Excel file")

    return FileResponse(
        path=filename,
        filename=os.path.basename(filename),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


# ── Get all companies from DB ─────────────────────────────────────────────────
@app.get("/api/companies")
def get_all_companies(city: Optional[str] = None, country: Optional[str] = None, query: Optional[str] = None):
    """Returns all companies stored in the database."""
    if city:    city    = city.strip().title()
    if country: country = country.strip().title()
    if query:   query   = query.strip()
    data = get_companies(query=query, city=city, country=country)
    return {"companies": data, "total": len(data)}


# ── Get unique filter values from DB ─────────────────────────────────────────
@app.get("/api/filters")
def get_filters_endpoint():
    """Returns all unique countries, cities and company types stored in the DB."""
    from database import get_filters
    return get_filters()


# ── Get search history ────────────────────────────────────────────────────────
@app.get("/api/searches")
def get_searches():
    """Returns all past searches."""
    from database import get_searches
    return {"searches": get_searches()}