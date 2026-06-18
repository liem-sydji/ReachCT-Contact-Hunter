"""
ReachCT — login_linkedin.py
Run this LOCALLY to log into LinkedIn and save session cookies.

Usage:
    python login_linkedin.py
    python login_linkedin.py --test "HR Manager Barcelona"
"""

import asyncio
import argparse
import json
import os
from dotenv import load_dotenv
load_dotenv()

from playwright.async_api import async_playwright

COOKIES_FILE = "linkedin_cookies.json"


async def login():
    print("🔐 Opening LinkedIn login page...")
    print("   Log in manually in the browser window.")
    print("   Complete any verification codes yourself.")
    print("   Once you see your LinkedIn feed, come back here and press Enter.")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--start-maximized"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800},
            # Disable all timeouts
        )
        page = await context.new_page()

        # Just open the login page — you do the rest
        await page.goto("https://www.linkedin.com/login")

        print("\n👆 Browser is open — log in manually now.")
        print("   Take your time — enter verification code, etc.")
        input("\n⏳ Press Enter ONLY after you can see your LinkedIn feed...\n")

        # Save cookies
        cookies = await context.cookies()
        with open(COOKIES_FILE, "w") as f:
            json.dump(cookies, f, indent=2)

        print(f"✅ {len(cookies)} cookies saved to {COOKIES_FILE}")
        await browser.close()


async def test_search(query: str):
    if not os.path.exists(COOKIES_FILE):
        print(f"❌ No cookies file — run login first: python login_linkedin.py")
        return

    with open(COOKIES_FILE) as f:
        cookies = json.load(f)

    print(f"🔍 Testing LinkedIn search: {query}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        await context.add_cookies(cookies)
        page = await context.new_page()

        from urllib.parse import quote_plus
        search_url = f"https://www.linkedin.com/search/results/people/?keywords={quote_plus(query)}&origin=GLOBAL_SEARCH_HEADER"
        print(f"🔍 Visiting: {search_url}")

        await page.goto(search_url, timeout=60000)
        await page.wait_for_timeout(3000)

        print(f"🔍 Title: {await page.title()}")
        print(f"🔍 URL:   {page.url}")

        # Wait longer for JS to render
        await page.wait_for_timeout(3000)

        # Dump all text to find the right selector
        body = await page.inner_text("body")

        # Parse results directly from page text — LinkedIn changes selectors often
        # Look for profile links instead
        profile_links = await page.query_selector_all("a[href*='/in/']")
        print(f"🔍 Found {len(profile_links)} profile links")

        seen = set()
        for link in profile_links[:10]:
            try:
                href  = await link.get_attribute("href")
                text  = (await link.inner_text()).strip()
                if not href or not text or text in seen or len(text) < 3:
                    continue
                if any(x in text.lower() for x in ["linkedin", "sign", "log", "join", "notification"]):
                    continue
                seen.add(text)
                print(f"  → {text} | {href.split('?')[0]}")
            except:
                continue

        if not seen:
            print("⚠️  No profile links found")
            print(f"Page preview: {body[:500]}")

        input("\nPress Enter to close browser...")
        await browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", help="Test search query", default="")
    args = parser.parse_args()

    if args.test:
        asyncio.run(test_search(args.test))
    else:
        asyncio.run(login())