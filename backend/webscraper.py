"""
ReachCT — webscraper.py
Scrape emails from a list of company website URLs.

Flow:
1. Visit homepage
2. Find contact/about pages
3. Extract emails from all visited pages
4. Return first valid email found
"""

import re
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


async def scrape_website_email(page, url: str) -> tuple:
    """Visit a website and extract the first email + company name found."""
    company_name = ""
    try:
        await page.goto(url, timeout=20000, wait_until="domcontentloaded")
        await page.wait_for_timeout(random.randint(800, 1500))

        # Get company name from homepage
        company_name = await extract_company_name(page)

        # Extract emails from homepage
        content = await page.content()
        emails  = extract_emails(content)
        if emails:
            return emails[0], company_name

        # Also check mailto: links
        mailto_links = await page.query_selector_all("a[href^='mailto:']")
        for link in mailto_links:
            href = await link.get_attribute("href")
            if href:
                email = href.replace("mailto:", "").split("?")[0].strip()
                if email and "@" in email:
                    return email, company_name

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
                emails  = extract_emails(content)
                if emails:
                    return emails[0], company_name

                # Check mailto links on contact page
                mailto_links = await page.query_selector_all("a[href^='mailto:']")
                for link in mailto_links:
                    href = await link.get_attribute("href")
                    if href:
                        email = href.replace("mailto:", "").split("?")[0].strip()
                        if email and "@" in email:
                            return email, company_name
            except Exception:
                continue

    except Exception as e:
        print(f"⚠️ Error scraping {url}: {e}")

    return "", company_name


async def scrape_url_list(urls: list, company_type: str,
                           jobs: dict, run_id: str) -> dict:
    """
    Scrape a list of URLs for emails.
    Returns: { found: [...], skipped: [...] }
    """
    found   = []
    skipped = []

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

            email, company_name = await scrape_website_email(page, url)

            if email:
                # Fall back to domain name if no company name found
                if not company_name:
                    domain       = urlparse(url).netloc.replace("www.", "")
                    company_name = domain.split(".")[0].replace("-", " ").replace("_", " ").title()

                result = {
                    "name":         company_name,
                    "email":        email,
                    "phone":        "",
                    "website":      url,
                    "city":         "",
                    "country":      "",
                    "company_type": company_type,
                    "maps_url":     "",
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
