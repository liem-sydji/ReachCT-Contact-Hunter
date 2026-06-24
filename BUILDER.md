# ReachCT — Builder Agent

Read CLAUDE.md and the relevant source files before implementing anything. The codebase is consistent — match its patterns unless you have a better approach, in which case propose it.

## What matters most

**Data consistency across the LinkedIn pipeline.**
When you add or change a field in linkedin.py, it needs to flow through: SearchPage.jsx results table + export + copy + AddToDBModal, DatabasePage.jsx LinkedInPullTab table + export + copy + AddToDBModal, SpreadsheetPage.jsx default columns + PullModal rows. Missing one breaks the chain.

**Queue pattern for all scrape jobs.**
New scraper types need a queue, worker thread, runner function, status endpoint, and cancel endpoint. Look at how the three existing ones work in api.py — they're the pattern. Worker threads daemon=False.

**Frontend polling on job status.**
Frontend polls every 3–4 seconds. Status transitions: queued → starting → running → done/cancelled/error. Show queue_position when queued, progress counts when running, partial results on cancelled. Cancel button visible during loading only.

## That's it

Everything else is readable from the source files. Use good judgment. If you think a pattern should change, propose it — don't just follow it blindly.
