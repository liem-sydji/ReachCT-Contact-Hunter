"""
ReachCT — linkedin.py
LinkedIn People finder using saved session cookies + Playwright.

Flow:
1. Load cookies from file (saved by login_linkedin.py)
2. Visit LinkedIn people search with cookies
3. Extract profiles from search results
4. Generate email patterns from name + domain
5. SMTP verify to find real email
"""

import os
import re
import json
import asyncio
import smtplib
import unicodedata
from urllib.parse import quote_plus

from playwright.async_api import async_playwright

COOKIES_FILE = os.path.join(os.path.dirname(__file__), "linkedin_cookies.json")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]


# ── Name / email helpers ──────────────────────────────────────────────────────

def strip_accents(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn")


def parse_name(full_name: str):
    cleaned = strip_accents(full_name.strip().lower())
    cleaned = re.sub(r"[^a-z\s\-]", "", cleaned)
    parts   = [p for p in cleaned.split() if p]
    if len(parts) < 2:
        return (parts[0] if parts else "", "")
    return (parts[0], parts[-1])


def generate_email_patterns(first: str, last: str, domain: str) -> list:
    if not first or not domain:
        return []
    if last:
        patterns = [
            f"{first}@{domain}",
            f"{first}.{last}@{domain}",
            f"{first[0]}{last}@{domain}",
            f"{first}{last}@{domain}",
            f"{first[0]}.{last}@{domain}",
            f"{last}@{domain}",
        ]
    else:
        patterns = [f"{first}@{domain}"]
    seen = set()
    return [p for p in patterns if not (p in seen or seen.add(p))]


# ── SMTP verification ─────────────────────────────────────────────────────────

def get_mx_record(domain: str):
    try:
        import dns.resolver
        records = dns.resolver.resolve(domain, "MX")
        return str(sorted(records, key=lambda r: r.preference)[0].exchange).rstrip(".")
    except Exception:
        return None


def verify_email_smtp(email: str, mx_host: str, timeout: int = 10) -> str:
    try:
        with smtplib.SMTP(mx_host, 25, timeout=timeout) as smtp:
            smtp.ehlo("verify.local")
            smtp.mail("check@verify.local")
            code, _ = smtp.rcpt(email)
            if code == 250:   return "valid"
            elif code in (550, 551, 553): return "invalid"
            return "unknown"
    except Exception:
        return "unknown"


def find_email(first: str, last: str, domain: str) -> dict:
    patterns = generate_email_patterns(first, last, domain)
    if not patterns:
        return {"email": "", "confidence": "none", "verified": False}
    mx = get_mx_record(domain)
    if not mx:
        return {"email": patterns[0], "confidence": "guess", "verified": False}
    if verify_email_smtp(f"zzznonexistent12345@{domain}", mx) == "valid":
        return {"email": patterns[0], "confidence": "catch-all", "verified": False}
    for email in patterns:
        if verify_email_smtp(email, mx) == "valid":
            return {"email": email, "confidence": "verified", "verified": True}
    return {"email": patterns[0], "confidence": "unverified", "verified": False}


# ── Profile parser ────────────────────────────────────────────────────────────

def is_likely_name(text: str) -> bool:
    """
    Check if a string looks like a person's name rather than a job title.
    Names: 2-4 words, mostly letters, no special chars like | @ # /
    """
    if not text or len(text) > 50:
        return False
    # Job title signals
    job_signals = ["|", "@", "/", "manager", "director", "head of", "officer",
                   "specialist", "engineer", "developer", "consultant", "coach",
                   "analyst", "coordinator", "executive", "partner", "lead",
                   "senior", "junior", "intern", "founder", "ceo", "cto", "coo",
                   "vp ", "president", "recruiter", "talent", "people", "hr "]
    text_lower = text.lower()
    if any(sig in text_lower for sig in job_signals):
        return False
    # Names are typically 2-4 words of letters/hyphens
    words = text.split()
    if not (1 <= len(words) <= 5):
        return False
    if not all(re.match(r"^[A-Za-zÀ-ÿ\-\']+$", w) for w in words):
        return False
    return True


def parse_profile_text(raw_text: str) -> tuple:
    """
    Extract name and job title from a LinkedIn profile link's text.
    Raw text looks like:
    "Federico Benevenuta \n • 2nd\nHR Manager @El Palace Barcelona\nBarcelona..."
    """
    lines = [l.strip() for l in raw_text.split("\n") if l.strip()]
    # Remove noise lines
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

    # Find the name — first line that looks like a real name
    name  = ""
    title = ""
    for i, line in enumerate(clean):
        candidate = re.sub(r"\s*[•·]\s*\d?(st|nd|rd)\+?\s*$", "", line).strip()
        candidate = re.sub(r"\s{2,}", " ", candidate).strip()
        if is_likely_name(candidate):
            name = candidate
            # Title is the next non-location line
            for j in range(i+1, len(clean)):
                next_line = clean[j]
                # Skip location-like lines (contain comma + country/city)
                if re.search(r",[A-Za-z\s]+$", next_line) and len(next_line.split()) <= 5:
                    continue
                title = next_line
                break
            break

    # Fallback — just take first line as name if nothing matched
    if not name and clean:
        name = re.sub(r"\s*[•·]\s*\d?(st|nd|rd)\+?\s*$", "", clean[0]).strip()
        name = re.sub(r"\s{2,}", " ", name).strip()
        title = clean[1] if len(clean) > 1 else ""

    return name, title


# ── LinkedIn scraper ──────────────────────────────────────────────────────────

def load_cookies() -> list:
    """Load LinkedIn session cookies from env var or file."""
    # Try environment variable first (Railway)
    cookies_env = os.environ.get("LINKEDIN_COOKIES", "")
    if cookies_env:
        return json.loads(cookies_env)
    # Fall back to local file (local dev)
    if os.path.exists(COOKIES_FILE):
        with open(COOKIES_FILE) as f:
            return json.load(f)
    raise Exception("No LinkedIn cookies found. Set LINKEDIN_COOKIES env var or run login_linkedin.py.")


async def scrape_linkedin_people(role: str, company: str, location: str,
                                  keyword: str, domain: str,
                                  max_results: int, jobs: dict, run_id: str):
    """Search LinkedIn for people using saved session cookies."""
    cookies = load_cookies()

    # Build search query — company first for relevance, then role
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
        page = await context.new_page()

        try:
            await page.goto(search_url, timeout=30000)
            await page.wait_for_timeout(3000)

            print(f"🔍 URL: {page.url}")

            # Check if still logged in
            if "login" in page.url or "authwall" in page.url:
                raise Exception("LinkedIn session expired — run login_linkedin.py again")

            # Get all profile links
            profile_links = await page.query_selector_all("a[href*='/in/']")
            print(f"🔍 Found {len(profile_links)} profile links")

            seen_urls  = set()
            seen_names = set()

            # Cap how many links we inspect to avoid slow processing
            max_links_to_check = max_results * 8
            for link in profile_links[:max_links_to_check]:
                if len(results) >= max_results:
                    break
                try:
                    href = await link.get_attribute("href")
                    text = (await link.inner_text()).strip()

                    if not href or not text:
                        continue

                    # Clean URL — remove query params
                    clean_url = "https://www.linkedin.com" + href.split("?")[0] if href.startswith("/") else href.split("?")[0]

                    # Skip non-profile links and duplicates
                    if "/in/" not in clean_url:
                        continue
                    if clean_url in seen_urls:
                        continue
                    seen_urls.add(clean_url)

                    # Parse name and title from text
                    name, title = parse_profile_text(text)

                    if not name or len(name) < 3:
                        continue
                    if name.lower() in seen_names:
                        continue
                    seen_names.add(name.lower())

                    # Skip navigation/UI links
                    if any(x in name.lower() for x in ["linkedin", "sign in", "join", "notification", "search"]):
                        continue

                    # Verify company name appears in profile text (person actually works there)
                    if company:
                        company_words = [w.lower() for w in company.split() if len(w) > 2]
                        text_lower    = text.lower()
                        if not any(w in text_lower for w in company_words):
                            print(f"⏭️ Skipping {name} — company '{company}' not found in profile text")
                            continue

                    # Email finding
                    email_data = {"email": "", "confidence": "none", "verified": False}
                    if domain:
                        first, last = parse_name(name)
                        email_data  = find_email(first, last, domain)

                    person = {
                        "full_name":    name,
                        "job_title":    title,
                        "company":      company,
                        "email":        email_data["email"],
                        "confidence":   email_data["confidence"],
                        "linkedin_url": clean_url,
                        "location":     location,
                    }
                    results.append(person)
                    print(f"🔍 Found: {name} — {title} — {email_data['email']} ({email_data['confidence']})")

                    if run_id in jobs:
                        jobs[run_id]["found"] = len(results)

                    # Only need first valid person per company — stop immediately
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
                jobs=jobs, run_id=run_id
            )
            all_results.extend(results)
            if run_id in jobs:
                jobs[run_id]["found"] = len(all_results)
        except Exception as e:
            print(f"⚠️ Bulk search failed for {company}: {e}")
            continue
    return all_results