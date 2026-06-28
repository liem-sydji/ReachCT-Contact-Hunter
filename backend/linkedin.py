"""
ReachCT — linkedin.py

People search: company_type + city + country
  → LinkedIn People search with location filter (UI autocomplete)
  → click each profile → name from h1, current company+role from Experience
  → Mailmeteor email finder for email
  Returns: full_name, job_title, email, company, linkedin_url

Companies search: intern_title + city + country
  → LinkedIn Jobs with f_E=1 (Internship) + location filter
  → each listing: internship name, company → company LinkedIn page → website → email
  Returns: internship, company, linkedin_url, email, company_website, city, country
"""

import os
import re
import json
from urllib.parse import quote_plus

from playwright.async_api import async_playwright

COOKIES_FILE = os.path.join(os.path.dirname(__file__), "linkedin_cookies.json")

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_cookies() -> list:
    """Load LinkedIn session cookies from env var or file."""
    cookies_env = os.environ.get("LINKEDIN_COOKIES", "")
    if cookies_env:
        return json.loads(cookies_env)
    if os.path.exists(COOKIES_FILE):
        with open(COOKIES_FILE) as f:
            return json.load(f)
    raise Exception("No LinkedIn cookies found. Set LINKEDIN_COOKIES env var or run login_linkedin.py.")


def smart_trim_title(title: str, max_len: int = 50) -> str:
    """Trim a job title at the last word boundary before max_len."""
    if len(title) <= max_len:
        return title
    cut = title[:max_len]
    last_space = cut.rfind(" ")
    # Don't cut too aggressively — fall back to hard cut only if no space found in latter half
    if last_space > max_len // 2:
        return cut[:last_space]
    return cut


async def extract_current_experience(page) -> tuple:
    """
    Parse the profile page body to find the current job (date range containing 'Present').
    LinkedIn text structure around a current role:
        ...
        Job Title
        Company · Employment type
        Jan 2024 - Present · 6 mos
        ...
    Returns (company, job_title). Company and title are two lines above the "Present" date line.
    """
    try:
        body_text = await page.inner_text("body")
        lines = [l.strip() for l in body_text.split("\n") if l.strip()]

        for i, line in enumerate(lines):
            # Date line pattern: contains "Present" in any supported locale AND a month/year marker
            if not re.search(r'present|actualidad|heute|aujourd.hui|attuale|heden|nuvarande|现在|今', line, re.IGNORECASE):
                continue
            if not re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})', line, re.IGNORECASE):
                continue
            if i < 2:
                continue

            company_line = lines[i - 1]
            title_line   = lines[i - 2]

            # Strip employment type from company line: "Acme Corp · Full-time" → "Acme Corp"
            company = re.split(r'\s*[·•]\s*', company_line)[0].strip()

            # Strip connection indicators from title line
            title = re.split(r'\s*[·•]\s*', title_line)[0].strip()

            # Sanity check — skip if either looks like a date or noise token
            noise = {"full-time", "part-time", "contract", "freelance", "internship", "present"}
            if title.lower() in noise or company.lower() in noise:
                continue
            if re.match(r'^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})', title, re.IGNORECASE):
                continue

            if len(title) > 2 and len(company) > 2:
                return company, smart_trim_title(title)

        return None, None
    except Exception as e:
        print(f"⚠️ Experience extraction error: {e}")
        return None, None


async def get_email_from_mailmeteor(page, linkedin_url: str) -> str:
    """
    Open Mailmeteor's LinkedIn email finder, type the profile URL, and return
    the email found. Uses human-like interaction to avoid bot detection.
    """
    try:
        await page.goto("https://mailmeteor.com/tools/linkedin-email-finder", timeout=30000)
        await page.wait_for_timeout(3000)

        # Find the input — placeholder is "Please enter a valid LinkedIn profile URL."
        input_el = None
        for selector in [
            "input[placeholder*='LinkedIn' i]",
            "input[placeholder*='profile URL' i]",
            "input[type='url']",
            "input[type='text']",
            "input:not([type='hidden']):not([type='checkbox']):not([type='radio'])",
        ]:
            candidate_el = await page.query_selector(selector)
            if candidate_el and await candidate_el.is_visible():
                input_el = candidate_el
                break

        if not input_el:
            print(f"⚠️ Mailmeteor: input field not found for {linkedin_url}")
            return None

        # Human-like: click, clear, type with delays
        await input_el.click()
        await page.wait_for_timeout(300)
        await input_el.fill("")
        await page.keyboard.type(linkedin_url, delay=40)
        await page.wait_for_timeout(600)

        # Find the "FIND EMAIL" button — try multiple tag types since it may be a div/a
        clicked = False
        for selector in [
            "button[type='submit']",
            "input[type='submit']",
            "button",           # any visible button on the page
            "[role='button']",
        ]:
            els = await page.query_selector_all(selector)
            for el in els:
                if not await el.is_visible():
                    continue
                text = (await el.inner_text()).strip().upper()
                if "FIND" in text or "SEARCH" in text or "GET" in text or "SUBMIT" in text:
                    await el.click()
                    clicked = True
                    break
            if clicked:
                break

        if not clicked:
            print("⚠️ Mailmeteor: submit button not found — pressing Enter")
            await input_el.press("Enter")

        # Wait for result — poll for an email pattern in the page text (up to 25s)
        email_found = None
        for _ in range(25):
            await page.wait_for_timeout(1000)
            body = await page.inner_text("body")
            match = re.search(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b', body)
            if match:
                candidate = match.group(0).lower()
                if "mailmeteor" not in candidate and "example" not in candidate and "sentry" not in candidate:
                    email_found = candidate
                    break
            # Stop waiting early if a "no results" message appears
            if re.search(r'no (result|email|match)|not found|couldn.t find', body, re.IGNORECASE):
                break

        return email_found

    except Exception as e:
        print(f"⚠️ Mailmeteor error for {linkedin_url}: {e}")
        return None


async def scrape_email_from_website(page, website_url: str) -> str:
    """Visit a company website and return the first email found."""
    try:
        await page.goto(website_url, timeout=15000, wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)

        # Check mailto: links first — most reliable
        for link in await page.query_selector_all("a[href^='mailto:']"):
            href = await link.get_attribute("href")
            if href:
                email = href.replace("mailto:", "").split("?")[0].strip().lower()
                if "@" in email:
                    return email

        # Fallback: regex over visible body text
        body = await page.inner_text("body")
        match = re.search(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b', body)
        if match:
            return match.group(0).lower()

        return None
    except Exception as e:
        print(f"⚠️ Website scrape error for {website_url}: {e}")
        return None


async def _wait_and_click_by_text(page, text: str, timeout: int = 10000) -> bool:
    """
    Wait until a button with the given text is rendered in the DOM (has innerText),
    then click it via JS evaluation. Avoids the timing race where LinkedIn injects
    button text after initial render.
    """
    try:
        await page.wait_for_function(
            f"() => !!Array.from(document.querySelectorAll('button')).find("
            f"b => b.innerText && b.innerText.toLowerCase().includes('{text.lower()}'))",
            timeout=timeout,
        )
    except Exception:
        return False

    clicked = await page.evaluate(f"""() => {{
        const btn = Array.from(document.querySelectorAll('button')).find(
            b => b.innerText && b.innerText.toLowerCase().includes('{text.lower()}')
        );
        if (btn) {{ btn.click(); return true; }}
        return false;
    }}""")
    return bool(clicked)


async def _get_geo_urn(page, location_query: str) -> str:
    """
    Resolve a free-text location to LinkedIn's geoUrn via the Voyager typeahead API.
    Must be called from a page already on linkedin.com (so session cookies are in scope).
    Returns a JSON-array string like '["105088894"]', or '' on failure.
    """
    try:
        result = await page.evaluate("""async (location) => {
            const cookie = document.cookie.split('; ')
                .find(c => c.startsWith('JSESSIONID='));
            const csrf = cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
            const url = 'https://www.linkedin.com/voyager/api/typeahead/hitsV2?keywords='
                + encodeURIComponent(location) + '&origin=OTHER&q=type&type=GEO';
            try {
                const resp = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'csrf-token': csrf,
                        'x-restli-protocol-version': '2.0.0',
                    }
                });
                if (!resp.ok) return null;
                return await resp.json();
            } catch(e) { return null; }
        }""", location_query)

        if not result:
            return ""

        for hit in result.get("elements", []):
            for val in hit.get("hitInfo", {}).values():
                if isinstance(val, dict):
                    urn = val.get("targetUrn", "")
                    if "urn:li:geo:" in urn:
                        geo_id = urn.split("urn:li:geo:")[-1]
                        return f'["{geo_id}"]'
    except Exception as e:
        print(f"⚠️ geoUrn lookup failed: {e}")
    return ""


async def _apply_location_filter_people(page, location_query: str):
    """
    On a LinkedIn People search page, open the Locations filter, type the
    location, and click the first autocomplete suggestion.
    Uses wait_for_function so we don't race LinkedIn's async render.
    """
    if not location_query:
        return

    # Wait until the Locations button actually has text (LinkedIn renders async)
    clicked = await _wait_and_click_by_text(page, "locations", timeout=10000)
    if not clicked:
        print("⚠️ Locations filter button not found — skipping location filter")
        return

    # Wait for the location input to appear inside the filter panel
    try:
        await page.wait_for_function(
            "() => !!document.querySelector("
            "\"input[placeholder*='location' i], input[placeholder*='Add a location' i], "
            "input[aria-label*='location' i]\")",
            timeout=5000,
        )
    except Exception:
        print("⚠️ Location input not found inside filter panel")
        return

    loc_input = await page.query_selector(
        "input[placeholder*='Add a location' i], "
        "input[placeholder*='location' i], "
        "input[aria-label*='location' i]"
    )
    if not loc_input:
        print("⚠️ Location input not found inside filter panel")
        return

    await loc_input.fill(location_query)
    await page.wait_for_timeout(2000)

    # Click the first autocomplete suggestion
    clicked_suggestion = await page.evaluate("""() => {
        const opt = document.querySelector(
            "div[role='option'], li[role='option'], "
            "[data-view-name='typeahead-item'], .basic-typeahead__selectable"
        );
        if (opt) { opt.click(); return true; }
        return false;
    }""")
    if not clicked_suggestion:
        await loc_input.press("Enter")
    await page.wait_for_timeout(1000)

    # Click Show results / Apply / Done
    await page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button')).find(
            b => b.innerText && /show results|apply|done/i.test(b.innerText)
        );
        if (btn) btn.click();
    }""")
    await page.wait_for_timeout(3000)


async def _apply_location_filter_jobs(page, location_query: str):
    """
    On a LinkedIn Jobs results page, fill the location input in the top search bar
    and click the first autocomplete suggestion LinkedIn offers.
    """
    if not location_query:
        return

    loc_input = None
    for selector in [
        "input[id*='jobs-search-box-location']",
        "input[aria-label*='City, state, or zip code' i]",
        "input[aria-label*='location' i]",
        "input[placeholder*='City' i]",
    ]:
        loc_input = await page.query_selector(selector)
        if loc_input:
            break

    if not loc_input:
        print("⚠️ Jobs location input not found — skipping location filter")
        return

    await loc_input.triple_click()
    await loc_input.fill(location_query)
    await page.wait_for_timeout(2000)

    first_suggestion = None
    for selector in [
        "div[role='option']:first-child",
        "li[role='option']:first-child",
        ".basic-typeahead__selectable:first-child",
        "[data-view-name='typeahead-item']:first-child",
    ]:
        first_suggestion = await page.query_selector(selector)
        if first_suggestion:
            break

    if first_suggestion:
        await first_suggestion.click()
    else:
        await loc_input.press("Enter")

    await page.wait_for_timeout(2000)


async def _apply_experience_level_internship(page):
    """
    On a LinkedIn Jobs results page, click the Experience level filter pill,
    select Internship, then click Show results.
    """
    # Click the Experience level filter pill
    exp_btn = None
    for selector in [
        "button:has-text('Experience level')",
        "button[aria-label*='Experience level' i]",
    ]:
        exp_btn = await page.query_selector(selector)
        if exp_btn:
            break

    if not exp_btn:
        print("⚠️ Experience level filter pill not found")
        return

    await exp_btn.click()
    await page.wait_for_timeout(1000)

    # Check the Internship option — LinkedIn renders these as label+checkbox pairs
    internship_opt = None
    for selector in [
        "label:has-text('Internship')",
        "span:has-text('Internship')",
        "li:has-text('Internship')",
    ]:
        internship_opt = await page.query_selector(selector)
        if internship_opt:
            break

    if not internship_opt:
        print("⚠️ Internship option not found in Experience level dropdown")
        return

    await internship_opt.click()
    await page.wait_for_timeout(500)

    # Click Show results / Apply
    for selector in [
        "button:has-text('Show results')",
        "button:has-text('Apply')",
        "button:has-text('Done')",
    ]:
        show_btn = await page.query_selector(selector)
        if show_btn:
            await show_btn.click()
            await page.wait_for_timeout(2000)
            break


# ── People Search ─────────────────────────────────────────────────────────────

async def scrape_linkedin_people(company_type: str, city: str, country: str,
                                  max_results: int, jobs: dict, run_id: str) -> list:
    """
    Search LinkedIn for people by company_type + location.

    Flow:
    1. Go to LinkedIn People search URL with keywords + location
    2. Scroll to trigger lazy-loaded cards
    3. Extract name, role, URL directly from the search results page via JS
    4. For each person open Mailmeteor to find their email
    """
    cookies = load_cookies()
    results = []
    location_query = f"{city}, {country}".strip(", ") if city or country else ""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=USER_AGENTS[0],
            viewport={"width": 1280, "height": 800},
        )
        await context.add_cookies(cookies)

        search_page = await context.new_page()
        email_page  = await context.new_page()

        try:
            base_url = (
                f"https://www.linkedin.com/search/results/people/"
                f"?keywords={quote_plus(company_type)}&origin=FACETED_SEARCH"
            )
            print(f"🔍 People search: {company_type} | {location_query}")
            await search_page.goto(base_url, timeout=30000)
            await search_page.wait_for_timeout(2000)

            if "login" in search_page.url or "authwall" in search_page.url:
                raise Exception("LinkedIn session expired — run login_linkedin.py again")

            # Resolve location → geoUrn and re-navigate with it embedded in the URL.
            # LinkedIn ignores plain &location= text; only &geoUrn=["id"] works.
            search_url = base_url
            if location_query:
                print(f"🌍 Resolving geoUrn for: {location_query}")
                geo_urn = await _get_geo_urn(search_page, location_query)
                if geo_urn:
                    search_url = base_url + f"&geoUrn={quote_plus(geo_urn)}"
                    print(f"✅ geoUrn resolved: {geo_urn}")
                    await search_page.goto(search_url, timeout=30000)
                    await search_page.wait_for_timeout(3000)
                else:
                    print("⚠️ geoUrn lookup failed — results will not be filtered by location")

            # Scroll to trigger lazy-loaded result cards
            try:
                await search_page.wait_for_selector("a[href*='/in/']", timeout=10000)
            except Exception:
                pass
            await search_page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.5)")
            await search_page.wait_for_timeout(1500)
            await search_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await search_page.wait_for_timeout(1500)
            await search_page.evaluate("window.scrollTo(0, 0)")
            await search_page.wait_for_timeout(500)

            print(f"📄 Current URL after load: {search_page.url}")

            # Diagnostic: how many raw /in/ links exist on the page before any filtering?
            raw_link_count = await search_page.evaluate(
                "() => document.querySelectorAll('a[href*=\"/in/\"]').length"
            )
            print(f"🔗 Raw /in/ links on page: {raw_link_count}")
            if raw_link_count == 0:
                print("⚠️ Page has no /in/ links — possible: cookies expired, paywall, or page did not render results")

            # Extract name, role and URL from each result card in one JS pass.
            # Query a[href*="/in/"] directly (the old code proved this selector finds 24+
            # results on the SERP). Filter to person-card links via span[aria-hidden="true"]
            # child — nav/header links lack that span. Climb up the DOM for the subtitle.
            raw_people = await search_page.evaluate("""() => {
                const results = [];
                const seen = new Set();

                document.querySelectorAll('a[href*="/in/"]').forEach(link => {
                    const url = (link.href || '').split('?')[0];
                    if (!url.includes('/in/') || seen.has(url)) return;

                    // Skip obviously non-profile slugs ("/in/me", empty, 1-char)
                    const slug = url.split('/in/').pop().replace(/\\/$/, '');
                    if (!slug || slug.length < 2 || slug === 'me') return;

                    const ariaSpan = link.querySelector('span[aria-hidden="true"]');
                    let name, subtitleFromLink = '';

                    if (ariaSpan) {
                        // Clean card: span[aria-hidden] holds just the display name
                        name = ariaSpan.innerText.replace(/\\s+/g, ' ').trim();
                    } else {
                        // Expanded card: all text is inside the <a> as one blob.
                        // Pattern: "Name • 2nd|3rd+ Role at Company City, Country Connect…"
                        const raw = link.innerText;
                        const bulletIdx = raw.indexOf(' \\u2022 ');   // ' • '
                        if (bulletIdx > 0) {
                            name = raw.substring(0, bulletIdx).replace(/\\s+/g, ' ').trim();
                            const afterBullet = raw.substring(bulletIdx + 3).trim();
                            // Strip leading connection degree token (1st / 2nd / 3rd+)
                            const degreeMatch = afterBullet.match(/^(1st|2nd|3rd\\+?)\\s*/);
                            const afterDegree = degreeMatch
                                ? afterBullet.substring(degreeMatch[0].length)
                                : afterBullet;
                            // Stop before action buttons / extra card content
                            const stopAt = afterDegree.search(
                                / (Connect|Follow|Message|Visit my website|\\d+[KMk]?\\s*(followers|connections))/
                            );
                            subtitleFromLink = (stopAt > 0
                                ? afterDegree.substring(0, stopAt)
                                : afterDegree.split('\\n')[0]
                            ).replace(/\\s+/g, ' ').trim();
                        } else {
                            name = raw.replace(/\\s+/g, ' ').trim();
                        }
                    }

                    if (!name || name.length < 2) return;
                    if (/linkedin|sign in|join now|view.*profile|dismiss/i.test(name)) return;

                    seen.add(url);

                    // For ariaSpan cards, climb DOM to find the subtitle element.
                    // For fallback cards, subtitleFromLink already has it parsed above.
                    let subtitle = subtitleFromLink;
                    if (!subtitle) {
                        let el = link;
                        for (let i = 0; i < 8; i++) {
                            el = el.parentElement;
                            if (!el || el === document.body) break;
                            const subEl = el.querySelector('.entity-result__primary-subtitle') ||
                                          el.querySelector('[class*="primary-subtitle"]') ||
                                          el.querySelector('[class*="subtitle"]:not([class*="secondary"])');
                            if (subEl) {
                                subtitle = subEl.innerText.replace(/\\s+/g, ' ').trim();
                                break;
                            }
                        }
                    }

                    results.push({ name, subtitle, url });
                });

                return results;
            }""")

            print(f"🔍 {len(raw_people)} people extracted from search results")

            for entry in raw_people[:max_results]:
                if run_id in jobs and jobs[run_id].get("status") == "cancelling":
                    break

                name     = entry.get("name", "").strip()
                subtitle = entry.get("subtitle", "").strip()
                url      = entry.get("url", "")
                if not name or not url:
                    continue

                # Parse role and company from subtitle
                # Formats seen: "Role at Company", "Role | Company", "Role · Company", "Role"
                role    = subtitle
                company = None
                for sep in [" at ", " | ", " · "]:
                    if sep in subtitle:
                        parts   = subtitle.split(sep, 1)
                        role    = parts[0].strip()
                        company = parts[1].split(",")[0].strip()
                        break

                print(f"📧 Getting email for {name} ({role})…")
                email = await get_email_from_mailmeteor(email_page, url)

                person = {
                    "full_name":     name,
                    "company_type":  company_type,  # search query shown as "Company Type" column
                    "profile_title": role or None,  # their actual role shown as "Role" column
                    "company":       company or None,
                    "email":         email,
                    "linkedin_url":  url,
                }
                results.append(person)
                print(f"✅ {name} — {role} at {company} — {email or 'no email'}")

                if run_id in jobs:
                    jobs[run_id]["found"] = len(results)

        finally:
            await browser.close()

    return results


# ── Companies (Internship) Search ─────────────────────────────────────────────

async def scrape_linkedin_companies(intern_title: str, city: str, country: str,
                                     max_results: int, jobs: dict, run_id: str) -> list:
    """
    Search LinkedIn for internship listings, then find each company's website and email.

    Flow (mirrors the manual process):
    1. Go to LinkedIn main search for intern_title
    2. Click the Jobs filter pill
    3. Click Experience level → select Internship → Show results
    4. Fill location in the top search bar, click first autocomplete suggestion
    5. For each listing: extract internship name, company, listing URL
    6. Visit the company LinkedIn page → find website link
    7. Scrape website for email
    """
    cookies = load_cookies()
    results = []
    location_query = f"{city}, {country}".strip(", ") if city or country else ""

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=USER_AGENTS[0],
            viewport={"width": 1280, "height": 800},
        )
        await context.add_cookies(cookies)

        jobs_page    = await context.new_page()
        company_page = await context.new_page()
        website_page = await context.new_page()

        try:
            # Step 1: Go directly to LinkedIn Jobs with f_E=1 (Internship) + location in URL.
            # LinkedIn resolves the location string server-side — equivalent to the UI filter.
            params = f"keywords={quote_plus(intern_title)}&f_E=1"
            if location_query:
                params += f"&location={quote_plus(location_query)}"
            search_url = f"https://www.linkedin.com/jobs/search/?{params}"
            print(f"🔍 Internship search: {intern_title} | {location_query}")
            await jobs_page.goto(search_url, timeout=30000)
            await jobs_page.wait_for_timeout(3000)

            if "login" in jobs_page.url or "authwall" in jobs_page.url:
                raise Exception("LinkedIn session expired — run login_linkedin.py again")

            # Wait for job title links to be rendered (content loads async)
            try:
                await jobs_page.wait_for_selector("a[href*='/jobs/view/']", timeout=8000)
            except Exception:
                pass
            await jobs_page.wait_for_timeout(1000)

            # Step 3: Extract all job data via JS evaluation — avoids stale/empty ElementHandles.
            # Use aria-label for clean titles (avoids "with verification" badge text).
            # Company extraction tries multiple selectors with fallbacks.
            raw_listings = await jobs_page.evaluate("""() => {
                const seen = new Set();
                const results = [];
                document.querySelectorAll('a[href*="/jobs/view/"]').forEach(titleLink => {
                    const url = titleLink.href.split('?')[0];
                    if (seen.has(url)) return;
                    seen.add(url);

                    // Strip "with verification" badge from both aria-label and innerText
                    const rawTitle = titleLink.getAttribute('aria-label') || titleLink.innerText || '';
                    const title = rawTitle.replace(/\\s*with verification\\s*/gi, ' ').replace(/\\s+/g, ' ').trim();
                    if (title.length < 2) return;

                    const card = titleLink.closest('li') || titleLink.parentElement;
                    let company = '', companyUrl = '';

                    if (card) {
                        // Try explicit /company/ href link first
                        const coLink = card.querySelector('a[href*="/company/"]');
                        if (coLink) {
                            company    = coLink.innerText.replace(/\\s+/g, ' ').trim();
                            companyUrl = coLink.href.split('?')[0];
                        }
                        // Fallback: subtitle / description elements
                        if (!company) {
                            const sub = card.querySelector(
                                '.job-card-container__primary-description,' +
                                '.artdeco-entity-lockup__subtitle,' +
                                '[class*="subtitle"],' +
                                'h4'
                            );
                            if (sub) company = sub.innerText.replace(/\\s+/g, ' ').trim();
                        }
                    }

                    results.push({ title, url, company, companyUrl });
                });
                return results;
            }""")

            print(f"🔍 {len(raw_listings)} internship listings found")

            for idx, listing_data in enumerate(raw_listings[:max_results]):
                if run_id in jobs and jobs[run_id].get("status") == "cancelling":
                    break

                try:
                    raw_title       = listing_data.get("title", "")
                    internship_name = re.sub(r"\s*with verification\s*", " ", raw_title, flags=re.IGNORECASE).strip()
                    listing_url     = listing_data.get("url", "")
                    company_name    = listing_data.get("company", "").strip()
                    company_li_url  = listing_data.get("companyUrl", "")

                    if not internship_name:
                        continue

                    # If no company LinkedIn URL from the card, visit the job detail page to get it
                    if not company_li_url and listing_url:
                        try:
                            await company_page.goto(listing_url, timeout=15000, wait_until="domcontentloaded")
                            await company_page.wait_for_timeout(1500)
                            co_link = await company_page.query_selector("a[href*='/company/']")
                            if co_link:
                                href = await co_link.get_attribute("href")
                                if href:
                                    company_li_url = (
                                        "https://www.linkedin.com" + href.split("?")[0]
                                        if href.startswith("/") else href.split("?")[0]
                                    )
                                if not company_name:
                                    company_name = (await co_link.inner_text()).strip()
                        except Exception as e:
                            print(f"⚠️ Job detail fetch failed: {e}")

                    print(f"📋 [{idx+1}/{min(len(raw_listings), max_results)}] {internship_name} @ {company_name or '(unknown)'}")

                    # Step 4: Find company website from their LinkedIn page
                    company_website = ""
                    email           = ""

                    if company_li_url:
                        await company_page.goto(company_li_url, timeout=20000, wait_until="domcontentloaded")
                        await company_page.wait_for_timeout(2000)

                        # Option A: "Visit website" or "Learn more" as a visible direct button
                        # on the company header (appears between "+ Follow" and the 3-dots button)
                        for text in ["Visit website", "Learn more"]:
                            el = await company_page.query_selector(f"a:has-text('{text}')")
                            if el and await el.is_visible():
                                href = (await el.get_attribute("href") or "").strip()
                                # Must be an external URL, not a LinkedIn internal link
                                if href and "linkedin.com" not in href:
                                    company_website = href
                                    break

                        # Option B: "Visit website" or "Learn more" is only in the 3-dots dropdown
                        # (this happens when the second button is "Message" instead)
                        if not company_website:
                            dots_btn = None
                            for sel in [
                                "button[aria-label*='More actions' i]",
                                "button[aria-label*='More options' i]",
                                "button[aria-label*='more' i]",
                            ]:
                                candidate = await company_page.query_selector(sel)
                                if candidate and await candidate.is_visible():
                                    dots_btn = candidate
                                    break

                            if dots_btn:
                                await dots_btn.click()
                                await company_page.wait_for_timeout(800)

                                for text in ["Visit website", "Learn more"]:
                                    el = await company_page.query_selector(f"a:has-text('{text}')")
                                    if el and await el.is_visible():
                                        href = (await el.get_attribute("href") or "").strip()
                                        if href and "linkedin.com" not in href:
                                            company_website = href
                                            break

                    # Step 5: Scrape email from company website
                    if company_website:
                        print(f"🌐 Scraping {company_website} for email…")
                        email = await scrape_email_from_website(website_page, company_website)

                    result = {
                        "internship":      internship_name,
                        "internship_type": intern_title,
                        "company":         company_name or None,
                        "linkedin_url":    listing_url,
                        "email":           email or None,
                        "company_website": company_website or None,
                        "city":            city or None,
                        "country":         country or None,
                    }
                    results.append(result)
                    print(f"✅ {internship_name} — {company_name} — {email or 'no email'}")

                    if run_id in jobs:
                        jobs[run_id]["found"] = len(results)

                except Exception as e:
                    print(f"⚠️ Listing error: {e}")
                    continue

        finally:
            await browser.close()

    return results
