# ReachCT

B2B contact intelligence platform built as an internal tool at Piktalent. Started as a Google Maps scraper on day one of the internship, grew into a production system used company-wide within one month.

## The core idea

Everyone contributes to a shared growing database. Every search adds companies. Every LinkedIn contact saved adds to the contacts pool. Every manually verified email enriches the data for the whole team. The value compounds with usage.

## Stack

- **Backend:** FastAPI + PostgreSQL (Railway) + Playwright (scraping) + Claude Haiku (ReachAI agent)
- **Frontend:** React 18 + Vite, all inline styles, no CSS framework
- **Hosting:** Railway (backend + DB), Cloudfare (frontend)

## Non-obvious decisions worth knowing

**LinkedIn job_title stores the search role, not the profile text.**
e.g. searching "HR" saves `job_title = "HR"`, not "HR Business Partner at Diligens". The actual profile text goes in `profile_title`. This makes the shared contacts DB queryable by clean role names at scale.

**No email guessing or SMTP verification in linkedin.py.**
Was removed intentionally — SMTP verification was slow (up to 60s per company), unreliable, and produced unverified guesses anyway. Emails are now added manually via mailmeteor.com/tools/linkedin-email-finder. A verified email from Mailmeteor is worth more than 10 unverified guesses for Mailrelay campaign deliverability.

**Queue worker child threads must be daemon=False.**
Railway's proxy closes upstream connections on client disconnect (HTTP 499). Daemon threads die with the parent — setting daemon=False lets scrape jobs run to completion even when the user closes their tab.

**AI upload/generation endpoints are disabled (raise 503).**
`_generate()` and `_generate_json()` are stubbed out. ReachAI (`/api/ai/chat`) has its own Anthropic client and is active.

**LinkedIn uses one shared session cookie for all users.**
One LinkedIn account, cookies stored in LINKEDIN_COOKIES env var on Railway. Rate limiting risk — don't run many searches back to back. Use a dedicated throwaway account, not a personal one. Cookies expire periodically and require re-running login_linkedin.py locally.

**User DB entries use JSONB `data` column.**
All user database content lives in a single JSONB column per entry. Column structure is derived dynamically from the keys present in entries. This means new fields (like profile_title) appear automatically without schema migrations.

## Visual identity

`#E8005A` pink, `'Syne'` for headings, `'DM Sans'` for body. All inline styles. Consistent across every page — don't introduce new patterns without good reason.

## Known constraints

- In-memory job state (`jobs`, `linkedin_jobs`, `url_scrape_jobs` dicts) — lost on Railway restart, but scraped data already in DB is safe
- LinkedIn profile verification visits each profile page to check "Present" — may need locale variants ("actualidad", "heute") for non-English profiles
- Search history page not built yet — users can't recover results after closing tab
