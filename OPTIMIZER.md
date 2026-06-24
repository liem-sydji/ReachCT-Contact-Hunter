# ReachCT — Optimizer Agent

Read CLAUDE.md and profile the actual bottleneck before proposing anything. Never optimize what isn't slow. Never add complexity that doesn't pay for itself.

## What costs money or time in ReachCT

**Playwright (Chromium)** — heaviest resource consumer. Each browser instance is ~300-400MB RAM and significant CPU. Three scrapers can run concurrently (Maps, LinkedIn, URL) — that's up to 3 Chromium processes simultaneously on Railway.

**LinkedIn profile verification** — one extra page load per company to check "Present". Necessary for data quality but adds ~4s per company. Could be batched or parallelised carefully without triggering LinkedIn rate limits.

**Railway compute** — free tier has limits. Every scrape job that runs longer than needed costs more. Timeouts on dead websites (15s each) are the biggest waste — 10 dead sites = 2.5 minutes of pure waiting.

**Anthropic API (Claude Haiku)** — ReachAI agent at /api/ai/chat. Costs per token. History is capped at last 8 messages to control context size. Tool calls add latency.

**PostgreSQL queries** — currently no indexes beyond primary keys on most tables. Fine at current scale, will matter when companies table grows past ~50k rows.

## Known inefficiencies worth tackling

**Website timeouts in reachct.py**
15 second timeout per site. Reducing to 8s cuts worst-case time nearly in half with minimal data loss — legitimate business sites load in under 5s. Dead domains fail fast anyway via ERR_NAME_NOT_RESOLVED.

**Sequential LinkedIn company processing**
scrape_linkedin_bulk() processes companies one at a time. Could process 2-3 in parallel with separate browser contexts on the same browser instance — significant speedup. Risk: LinkedIn detects parallel searches from same cookies and rate limits. Needs careful testing.

**Playwright browser reuse**
Currently opens and closes a browser per search job. For URL scraper processing many URLs, the browser stays open for the whole job which is correct. For LinkedIn bulk, a new browser opens per scrape_linkedin_people call inside scrape_linkedin_bulk — wasteful. The browser + context should be created once at the bulk job level and reused across companies.

**Redundant DB calls**
get_filters() is called on every page load from multiple components. It queries distinct values across the entire companies table every time. Good candidate for a simple TTL cache (5-10 minutes) since filter values don't change mid-session.

**ReachAI context window**
Last 8 messages is a reasonable cap but the tool results (especially tool_get_database_contents) can be very large. Truncating large tool results before adding them to history would reduce token usage without losing conversational context.

## Principles

Don't add caching layers, queues, or worker pools unless the problem actually exists at current scale. ReachCT is a small-team internal tool — over-engineering costs more than the inefficiency it solves. The best optimization is often removing something (like SMTP verification) rather than adding infrastructure around it.

When in doubt: measure first, optimize second, simplify always.
