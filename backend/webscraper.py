"""
ReachCT — webscraper.py
Scrape emails and phone numbers from a list of company website URLs.

Flow:
1. Visit homepage
2. Find contact/about pages
3. Extract emails and phone numbers from all visited pages
4. Return first valid email found (with phone, if any)
"""

import re
import json
import random
import asyncio
from urllib.parse import urljoin, urlparse
from playwright.async_api import async_playwright

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]

# Pages most likely to have contact emails
CONTACT_KEYWORDS = [
    "contact", "contacto", "kontakt", "kontakty",
    "about", "sobre", "uber", "equipo", "team",
    "impressum", "imprint", "legal",
    "reach", "touch", "write",
]

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
SKIP_EMAIL_DOMAINS = {"example.com", "domain.com", "email.com", "youremail.com",
                      "sentry.io", "wixpress.com", "squarespace.com"}

# Phone matching for arbitrary website text is riskier than for Maps listings (which are
# short, isolated strings) — full page HTML/text is full of prices, dates, GPS coordinates,
# SKUs, etc. There's no way to know a bare match like "8260-1786" is a phone number and not
# a product code from its shape alone (country formats vary too much to require "+" or 3+
# groups outright) — extract_phones() below gates ambiguous shapes on nearby label context
# ("Tel:", "Phone", ...) instead.
PHONE_RE = re.compile(
    r"(?<!\d)(?:"
    r"\+\d{7,15}"                                              # +46735514590
    r"|\(\d{1,4}\)[\s.\-]?\d{2,4}(?:[\s.\-]\d{2,4}){0,3}"       # (030) 1234567
    r"|(?:\+\d{1,3}[\s.\-])?\d{2,4}(?:[\s.\-]\d{2,4}){1,4}"     # 030 123 4567, or bare 030-1234567
    r")(?!\d)"
)
# Catches "2020-01-15" style dates that would otherwise pass as a formatted phone number
DATE_LIKE_RE = re.compile(r"^(19|20)\d{2}[\s.\-]\d{1,2}[\s.\-]\d{1,2}$")
# Label words that precede a real phone number — used to confirm otherwise-ambiguous
# bare matches (no "+", no parens, fewer than 3 digit groups) instead of rejecting them outright
PHONE_CONTEXT_RE = re.compile(
    r"\b(tel|tlf|tfno|fax|phone|mobile|cell|whatsapp|call|tel[eé]fono|telefon|kontakt)\b",
    re.IGNORECASE,
)
PHONE_CONTEXT_WINDOW = 40  # chars to look back from a match for a label keyword

# Map common country-code TLDs to country names (fallback when JSON-LD has no address)
TLD_COUNTRY = {
    "es": "Spain",       "de": "Germany",     "fr": "France",
    "it": "Italy",       "nl": "Netherlands", "be": "Belgium",
    "pt": "Portugal",    "pl": "Poland",      "se": "Sweden",
    "no": "Norway",      "dk": "Denmark",     "fi": "Finland",
    "ch": "Switzerland", "at": "Austria",     "cz": "Czech Republic",
    "hu": "Hungary",     "ro": "Romania",     "gr": "Greece",
    "tr": "Turkey",      "ru": "Russia",      "uk": "United Kingdom",
    "ie": "Ireland",     "mx": "Mexico",      "br": "Brazil",
    "ar": "Argentina",   "co": "Colombia",    "cl": "Chile",
    "pe": "Peru",        "au": "Australia",   "nz": "New Zealand",
    "ca": "Canada",      "jp": "Japan",       "cn": "China",
    "in": "India",       "za": "South Africa",
}

# International calling codes by country name — keyed to match TLD_COUNTRY's values, and
# only ever looked up from a country the user explicitly typed in (see format_phone below).
# A site's TLD is not a reliable stand-in: most companies use generic .com/.io domains
# regardless of where they're actually based.
COUNTRY_CALLING_CODE = {
    "Spain": "34",       "Germany": "49",      "France": "33",
    "Italy": "39",       "Netherlands": "31",  "Belgium": "32",
    "Portugal": "351",   "Poland": "48",       "Sweden": "46",
    "Norway": "47",      "Denmark": "45",      "Finland": "358",
    "Switzerland": "41", "Austria": "43",      "Czech Republic": "420",
    "Hungary": "36",     "Romania": "40",      "Greece": "30",
    "Turkey": "90",      "Russia": "7",        "United Kingdom": "44",
    "Ireland": "353",    "Mexico": "52",       "Brazil": "55",
    "Argentina": "54",   "Colombia": "57",     "Chile": "56",
    "Peru": "51",        "Australia": "61",    "New Zealand": "64",
    "Canada": "1",       "Japan": "81",        "China": "86",
    "India": "91",       "South Africa": "27",
}

JSONLD_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)


def clean_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    return url.rstrip("/")


def extract_emails(text: str) -> list:
    found = EMAIL_RE.findall(text)
    clean = []
    seen  = set()
    for e in found:
        e = e.lower().strip(".")
        domain = e.split("@")[-1]
        if domain in SKIP_EMAIL_DOMAINS:
            continue
        if e in seen:
            continue
        seen.add(e)
        clean.append(e)
    return clean


def _separator_chars(raw: str) -> set:
    """Distinct separator "kinds" used in a match — all whitespace counts as one kind."""
    seps = set()
    for ch in raw:
        if ch.isspace():
            seps.add(" ")
        elif ch in ".-":
            seps.add(ch)
    return seps


def _has_phone_context(text: str, start: int) -> bool:
    window = text[max(0, start - PHONE_CONTEXT_WINDOW):start]
    return bool(PHONE_CONTEXT_RE.search(window))


def extract_phones(text: str) -> list:
    found = []
    seen  = set()
    for m in PHONE_RE.finditer(text):
        raw    = m.group().strip()
        digits = re.sub(r"\D", "", raw)
        if not (7 <= len(digits) <= 15):
            continue
        if len(set(digits)) <= 1:          # e.g. "0000000000"
            continue
        if DATE_LIKE_RE.match(raw):
            continue
        # Real formatted numbers use one separator style throughout. Mixing kinds
        # (e.g. "36.008 100.512", "2026-03-02 14") means two unrelated numbers —
        # GPS coordinates, a date plus a time — sitting next to each other in text.
        # These are rejected outright, regardless of any nearby label.
        if len(_separator_chars(raw)) > 1:
            continue
        # "255 255 255" (RGB triplet) etc. — identical repeated groups aren't a phone,
        # also rejected outright.
        groups = [g for g in re.split(r"[\s.\-()]+", raw) if g]
        if len(groups) > 1 and len(set(groups)) == 1:
            continue
        # A bare 2-group number with no "+" or parens is as plausibly a price/SKU/id
        # as a phone — country formats vary too much to reject it on shape alone, so
        # it only counts if a phone-label keyword appears just before it in the text.
        unambiguous = raw.startswith("+") or "(" in raw or len(groups) >= 3
        if not unambiguous and not _has_phone_context(text, m.start()):
            continue
        if raw in seen:
            continue
        seen.add(raw)
        found.append(raw)
    return found


def find_contact_links(links: list, base_url: str) -> list:
    """Find links that are likely contact/about pages."""
    contact_links = []
    for href in links:
        if not href:
            continue
        href_lower = href.lower()
        if any(kw in href_lower for kw in CONTACT_KEYWORDS):
            # Make absolute
            if href.startswith("http"):
                contact_links.append(href)
            elif href.startswith("/"):
                contact_links.append(urljoin(base_url, href))
    return list(dict.fromkeys(contact_links))[:3]  # max 3 contact pages


def extract_address_from_jsonld(html_content: str) -> tuple:
    """Parse JSON-LD structured data for addressLocality and addressCountry."""
    for match in JSONLD_RE.finditer(html_content):
        try:
            data  = json.loads(match.group(1))
            items = data if isinstance(data, list) else [data]
            for item in items:
                addr = item.get("address") or (
                    item.get("location", {}).get("address", {})
                    if isinstance(item.get("location"), dict) else {}
                )
                if isinstance(addr, dict):
                    city    = addr.get("addressLocality", "").strip()
                    country = addr.get("addressCountry", "").strip()
                    if city or country:
                        return city, country
        except Exception:
            continue
    return "", ""


def country_from_tld(url: str) -> str:
    tld = urlparse(url).netloc.split(".")[-1].lower()
    return TLD_COUNTRY.get(tld, "")


def format_phone(raw: str, country: str = "") -> str:
    """Normalize a scraped number to a consistent "+<countrycode><digits>" form.

    Already-international numbers ("+46735514590") are just stripped of separators.
    A bare local number only gets a country code prepended when `country` was
    explicitly supplied by the user for this scrape — there's no reliable way to guess
    it otherwise, since most companies use generic .com/.io domains regardless of where
    they're actually based. Without a known country, the number is left as scraped.
    """
    if not raw:
        return ""
    if raw.strip().startswith("+"):
        return "+" + re.sub(r"\D", "", raw)

    cc = COUNTRY_CALLING_CODE.get(country) if country else None
    if not cc:
        return raw.strip()

    digits = re.sub(r"\D", "", raw)
    if digits.startswith("0"):
        digits = digits[1:]
    return f"+{cc}{digits}"


async def extract_company_name(page) -> str:
    """Extract company name from page title or og:site_name meta tag."""
    try:
        # Try og:site_name first (most accurate)
        og = await page.query_selector("meta[property='og:site_name']")
        if og:
            name = await og.get_attribute("content")
            if name and name.strip():
                return name.strip()

        # Try og:title
        og_title = await page.query_selector("meta[property='og:title']")
        if og_title:
            name = await og_title.get_attribute("content")
            if name and name.strip():
                # Clean common suffixes like "Home | CompanyName" → "CompanyName"
                parts = re.split(r"[|\-–]", name)
                return parts[-1].strip() if len(parts) > 1 else parts[0].strip()

        # Fall back to page title
        title = await page.title()
        if title:
            parts = re.split(r"[|\-–]", title)
            return parts[-1].strip() if len(parts) > 1 else parts[0].strip()
    except Exception:
        pass
    return ""


async def find_tel_link(page) -> str:
    """First usable number from any `a[href^='tel:']` on the current page."""
    tel_links = await page.query_selector_all("a[href^='tel:']")
    for link in tel_links:
        href = await link.get_attribute("href")
        if not href:
            continue
        candidate = href.replace("tel:", "").split("?")[0].strip()
        digits    = re.sub(r"\D", "", candidate)
        if 7 <= len(digits) <= 15:
            return candidate
    return ""


async def scrape_website_contact(page, url: str,
                                  user_city: str = "", user_country: str = "") -> tuple:
    """Visit a website and extract the first email, a phone number, company name, city, and country.

    If user_city/user_country are given, they're used as-is and address extraction is
    skipped for that field — the caller has already told us where the company is.
    """
    company_name = ""
    city         = ""
    country      = ""
    phone        = ""

    def resolve_address(extracted_city, extracted_country):
        return (user_city or extracted_city), (user_country or extracted_country)

    try:
        await page.goto(url, timeout=20000, wait_until="domcontentloaded")
        await page.wait_for_timeout(random.randint(800, 1500))

        company_name = await extract_company_name(page)

        content = await page.content()
        if user_city and user_country:
            city, country = user_city, user_country
        else:
            city, country = resolve_address(*extract_address_from_jsonld(content))

        phones = extract_phones(content)
        if phones:
            phone = phones[0]
        if not phone:
            phone = await find_tel_link(page)

        emails = extract_emails(content)
        if emails:
            return emails[0], format_phone(phone, user_country), company_name, city, country

        # Also check mailto: links
        mailto_links = await page.query_selector_all("a[href^='mailto:']")
        for link in mailto_links:
            href = await link.get_attribute("href")
            if href:
                email = href.replace("mailto:", "").split("?")[0].strip()
                if email and "@" in email:
                    return email, format_phone(phone, user_country), company_name, city, country

        # Try contact pages
        all_links = await page.query_selector_all("a[href]")
        hrefs = []
        for link in all_links:
            href = await link.get_attribute("href")
            if href:
                hrefs.append(href)

        contact_urls = find_contact_links(hrefs, url)

        for contact_url in contact_urls:
            try:
                await page.goto(contact_url, timeout=15000, wait_until="domcontentloaded")
                await page.wait_for_timeout(random.randint(500, 1000))

                content = await page.content()
                if not (user_city and user_country) and not city and not country:
                    city, country = resolve_address(*extract_address_from_jsonld(content))

                if not phone:
                    phones = extract_phones(content)
                    if phones:
                        phone = phones[0]
                    else:
                        phone = await find_tel_link(page)

                emails = extract_emails(content)
                if emails:
                    return emails[0], format_phone(phone, user_country), company_name, city, country

                # Check mailto links on contact page
                mailto_links = await page.query_selector_all("a[href^='mailto:']")
                for link in mailto_links:
                    href = await link.get_attribute("href")
                    if href:
                        email = href.replace("mailto:", "").split("?")[0].strip()
                        if email and "@" in email:
                            return email, format_phone(phone, user_country), company_name, city, country
            except Exception:
                continue

    except Exception as e:
        print(f"⚠️ Error scraping {url}: {e}")

    return "", format_phone(phone, user_country), company_name, city, country


async def scrape_url_list(urls: list, company_type: str,
                           jobs: dict, run_id: str,
                           user_city: str = "", user_country: str = "") -> dict:
    """
    Scrape a list of URLs for emails and phone numbers.
    If user_city/user_country are provided, they're saved as-is for every company
    instead of being extracted from each site.
    Returns: { found: [...], skipped: [...] }
    """
    found   = []
    skipped = []
    user_city    = (user_city or "").strip()
    user_country = (user_country or "").strip()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent=random.choice(USER_AGENTS),
            locale="en-US",
        )
        page = await context.new_page()

        for idx, raw_url in enumerate(urls):
            url = clean_url(raw_url)
            if run_id in jobs:
                jobs[run_id]["processing"] = url
                jobs[run_id]["index"]      = idx + 1
                jobs[run_id]["total"]      = len(urls)

            print(f"🌐 Scraping {idx+1}/{len(urls)}: {url}")

            email, phone, company_name, city, country = await scrape_website_contact(
                page, url, user_city, user_country
            )

            if email:
                if not company_name:
                    domain       = urlparse(url).netloc.replace("www.", "")
                    company_name = domain.split(".")[0].replace("-", " ").replace("_", " ").title()
                if not country and not user_country:
                    country = country_from_tld(url)

                result = {
                    "name":         company_name,
                    "email":        email or None,
                    "phone":        phone or None,
                    "website":      url,
                    "city":         city or None,
                    "country":      country or None,
                    "company_type": company_type,
                    "maps_url":     None,
                }
                found.append(result)
                print(f"✅ Found: {email} at {url}")
            else:
                skipped.append(url)
                print(f"⏭️  No email: {url}")

            if run_id in jobs:
                jobs[run_id]["found"]   = len(found)
                jobs[run_id]["skipped"] = len(skipped)

        await browser.close()

    return {"found": found, "skipped": skipped}
