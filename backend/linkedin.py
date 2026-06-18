"""
ReachCT — linkedin.py
LinkedIn People finder using saved session cookies + Playwright.

Flow:
1. Load cookies from file (saved by login_linkedin.py)
2. Visit LinkedIn people search with cookies
3. Extract profiles — name, job title, company, LinkedIn URL only
4. No email guessing or SMTP verification — emails added manually via Mailmeteor
"""

import os
import re
import json
import unicodedata
from urllib.parse import quote_plus

from playwright.async_api import async_playwright

COOKIES_FILE = os.path.join(os.path.dirname(__file__), "linkedin_cookies.json")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]


# ── Profile text parser ───────────────────────────────────────────────────────

def parse_profile_text(raw_text: str) -> tuple:
    """
    Extract name and job title from a LinkedIn profile card.
    LinkedIn always renders the person's name as the first line of the card,
    and the job title as the second line.
    """
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]

    # Strip noise tokens that appear in card text
    noise = {"connect", "follow", "message", "1st", "2nd", "3rd+", "•", "connections",
             "followers", "mutual", "premium", "current:", "★", "view"}
    clean = []
    for line in lines:
        if any(n in line.lower() for n in noise):
            continue
        if re.match(r"^\d+$", line):
            continue
        if len(line) < 2:
            continue
        clean.append(line)

    if not clean:
        return "", ""

    # First line = name, second line = job title
    name  = re.sub(r"\s*[•·]\s*\d?(st|nd|rd)\+?\s*$", "", clean[0]).strip()
    name  = re.sub(r"\s{2,}", " ", name).strip()
    title = clean[1] if len(clean) > 1 else ""

    return name, title


# ── Cookie loader ─────────────────────────────────────────────────────────────

def load_cookies() -> list:
    """Load LinkedIn session cookies from env var or file."""
    cookies_env = os.environ.get("LINKEDIN_COOKIES", "")
    if cookies_env:
        return json.loads(cookies_env)
    if os.path.exists(COOKIES_FILE):
        with open(COOKIES_FILE) as f:
            return json.load(f)
    raise Exception("No LinkedIn cookies found. Set LINKEDIN_COOKIES env var or run login_linkedin.py.")


async def is_currently_at_company(page, profile_url: str, company: str) -> bool:
    """
    Visit the profile page and check the first experience entry to confirm
    the person is currently working at the target company.
    """
    try:
        await page.goto(profile_url, timeout=20000, wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        # Get the full page text
        body = await page.inner_text("body")
        body_lower = body.lower()

        # LinkedIn shows "Present" for current roles
        if "present" not in body_lower:
            return False

        # Check the company name appears near "Present"
        company_words = [w.lower() for w in company.split() if len(w) > 2]
        if not company_words:
            return True  # no company to check against

        # Find "Present" positions and check if company name is nearby
        lines = body_lower.split("\n")
        for idx, line in enumerate(lines):
            if "present" in line:
                # Check surrounding lines (±5) for the company name
                context = " ".join(lines[max(0, idx-5):idx+5])
                if any(w in context for w in company_words):
                    return True

        return False
    except Exception as e:
        print(f"⚠️ Profile check failed for {profile_url}: {e}")
        # If we can't verify, don't include the person
        return False

async def scrape_linkedin_people(role: str, company: str, location: str,
                                  keyword: str, domain: str,
                                  max_results: int, jobs: dict, run_id: str):
    """
    Search LinkedIn for people. Returns name, job title, company, and
    full LinkedIn URL. No email guessing — emails are added manually.
    """
    cookies = load_cookies()

    parts = [p for p in [company, role, location, keyword] if p and p.strip()]
    query = " ".join(parts)
    search_url = f"https://www.linkedin.com/search/results/people/?keywords={quote_plus(query)}&origin=GLOBAL_SEARCH_HEADER&sid=people"
    print(f"🔍 LinkedIn search: {query}")

    results = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=USER_AGENTS[0],
            viewport={"width": 1280, "height": 800},
        )
        await context.add_cookies(cookies)

        # Two pages: one for search results, one for profile verification
        search_page  = await context.new_page()
        profile_page = await context.new_page()

        try:
            await search_page.goto(search_url, timeout=30000)
            await search_page.wait_for_timeout(3000)

            print(f"🔍 URL: {search_page.url}")

            if "login" in search_page.url or "authwall" in search_page.url:
                raise Exception("LinkedIn session expired — run login_linkedin.py again")

            profile_links = await search_page.query_selector_all("a[href*='/in/']")
            print(f"🔍 Found {len(profile_links)} profile links")

            seen_urls  = set()
            seen_names = set()

            for link in profile_links[:max_results * 8]:
                if len(results) >= max_results:
                    break
                try:
                    href = await link.get_attribute("href")
                    text = (await link.inner_text()).strip()

                    if not href or not text:
                        continue

                    # Clean URL — strip query params
                    clean_url = ("https://www.linkedin.com" + href.split("?")[0]
                                 if href.startswith("/") else href.split("?")[0])

                    if "/in/" not in clean_url:
                        continue
                    if clean_url in seen_urls:
                        continue
                    seen_urls.add(clean_url)

                    name, title = parse_profile_text(text)

                    if not name or len(name) < 3:
                        continue
                    if name.lower() in seen_names:
                        continue
                    seen_names.add(name.lower())

                    # Skip UI/nav links
                    if any(x in name.lower() for x in ["linkedin", "sign in", "join", "notification", "search"]):
                        continue

                    # Visit the profile page and confirm they currently work at the company
                    if company:
                        print(f"🔎 Verifying {name} is currently at {company}…")
                        currently_there = await is_currently_at_company(profile_page, clean_url, company)
                        if not currently_there:
                            print(f"⏭️ Skipping {name} — not currently at {company}")
                            continue

                    person = {
                        "full_name":    name,
                        "job_title":    role,     # use search role for consistent DB querying
                        "profile_title": title,   # actual title from profile, kept for reference
                        "company":      company,
                        "email":        "",       # filled manually via Mailmeteor
                        "linkedin_url": clean_url,
                        "location":     location,
                    }
                    results.append(person)
                    print(f"✅ Confirmed: {name} — {role} ({title}) — {clean_url}")

                    if run_id in jobs:
                        jobs[run_id]["found"] = len(results)

                    # One person per company
                    break

                except Exception as e:
                    print(f"⚠️ Parse error: {e}")
                    continue

        finally:
            await browser.close()

    return results


# ── Bulk input parsing ────────────────────────────────────────────────────────

def parse_bulk_input(raw_lines: list) -> list:
    targets = []
    seen    = set()
    for line in raw_lines:
        item = str(line).strip()
        if not item:
            continue
        if "@" in item:
            domain  = item.split("@")[-1].strip().lower()
            company = domain.split(".")[0]
        elif "." in item and " " not in item:
            domain  = item.lower().replace("https://","").replace("http://","").replace("www.","").strip("/")
            company = domain.split(".")[0]
        else:
            company = item
            domain  = ""
        key = (company, domain)
        if key not in seen:
            seen.add(key)
            targets.append({"company": company, "domain": domain})
    return targets


async def scrape_linkedin_bulk(targets: list, role: str, location: str,
                               max_per_company: int, jobs: dict, run_id: str):
    all_results = []
    for idx, target in enumerate(targets):
        company = target.get("company", "")
        domain  = target.get("domain", "")
        if run_id in jobs:
            jobs[run_id]["processing"]      = company or domain
            jobs[run_id]["company_index"]   = idx + 1
            jobs[run_id]["total_companies"] = len(targets)
        try:
            results = await scrape_linkedin_people(
                role=role, company=company, location=location, keyword="",
                domain=domain, max_results=max_per_company,
                jobs=jobs, run_id=run_id,
            )
            all_results.extend(results)
            if run_id in jobs:
                jobs[run_id]["found"] = len(all_results)
        except Exception as e:
            print(f"⚠️ Bulk search failed for {company}: {e}")
            continue
    return all_results