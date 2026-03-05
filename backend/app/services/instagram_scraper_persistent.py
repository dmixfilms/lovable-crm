"""
Instagram Scraper with Persistent Browser Session
Keeps browser open for multiple searches without re-login
"""
import asyncio
import re
from difflib import SequenceMatcher
from playwright.async_api import async_playwright, Browser, BrowserContext
from typing import Optional, List, Dict, Any

# Global variables to keep browser session alive
PERSISTENT_BROWSER: Optional[Browser] = None
PERSISTENT_CONTEXT: Optional[BrowserContext] = None

def similar(a: str, b: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    patterns = [
        r'\+?55\s?[\d\s\-\(\)]{10,}',
        r'\(?[\d]{2}\)?[\s\-]?[\d]{4,5}[\s\-]?[\d]{4}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None

async def init_persistent_browser():
    """Initialize persistent browser - called once by user"""
    global PERSISTENT_BROWSER, PERSISTENT_CONTEXT

    print(f"🔐 Opening Instagram browser...")

    p = await async_playwright().start()
    PERSISTENT_BROWSER = await p.chromium.launch(
        headless=False,
        args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
    )

    PERSISTENT_CONTEXT = await PERSISTENT_BROWSER.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    )

    page = await PERSISTENT_CONTEXT.new_page()
    await page.goto("https://www.instagram.com/", wait_until="networkidle", timeout=30000)

    print(f"📱 Login manually in the browser...")
    print(f"✅ Once logged in, you can search multiple leads without logging in again!")

    return True

async def search_with_persistent_session(
    business_name: str,
    original_address: str
) -> Dict[str, Any]:
    """Search Instagram using persistent browser session"""
    global PERSISTENT_CONTEXT

    if PERSISTENT_CONTEXT is None:
        return {
            'success': False,
            'error': 'Browser not initialized. Click "🔐 Connect Instagram" first.'
        }

    try:
        print(f"🔍 Searching for: {business_name}")

        # Create new page from persistent context (inherits login)
        page = await PERSISTENT_CONTEXT.new_page()

        # Go to search
        print(f"🌐 Opening Instagram search...")
        search_url = f"https://www.instagram.com/web/search/topsearch/?query={business_name}"

        try:
            await page.goto(search_url, wait_until="networkidle", timeout=15000)
            print(f"✓ Search loaded")
        except:
            # Fallback to explore
            await page.goto("https://www.instagram.com/explore/", wait_until="domcontentloaded", timeout=15000)

        await page.wait_for_timeout(2000)

        # Look for profile links - try multiple selectors
        print(f"🔎 Finding profiles...")
        profile_links = None
        selectors = [
            'a[href^="/@"]',  # Standard profile links
            'a[href*="/"]',   # Any profile-like link
            'button[type="button"]',  # Profile buttons
            'div[role="button"] a',  # Clickable profile divs
            'a[title]',  # Links with title (usually profiles)
        ]

        for selector in selectors:
            profile_links = await page.query_selector_all(selector)
            if profile_links:
                print(f"✓ Found {len(profile_links)} items with selector: {selector}")
                if len(profile_links) > 2:  # If found reasonable number
                    break
            else:
                print(f"  (0 items with: {selector})")

        if not profile_links or len(profile_links) == 0:
            # Debug: get page content
            content = await page.content()
            print(f"📄 Page HTML (first 2000 chars):")
            print(content[:2000])

            await page.close()
            return {
                'success': False,
                'error': f'No profiles found for "{business_name}". Check backend logs for page structure.'
            }

        candidates = []
        best_match = None
        best_score = 0

        # Check first 5 profiles
        for i, link in enumerate(profile_links[:5]):
            try:
                profile_url = await link.get_attribute('href')
                if not profile_url:
                    continue

                print(f"  📍 Profile {i+1}: {profile_url}")

                # Click the link to open profile
                await link.click()
                await page.wait_for_timeout(3000)  # Wait for profile to load

                # Navigate to profile URL directly (more reliable)
                await page.goto(f"https://www.instagram.com{profile_url}", wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(2000)

                # Extract bio - try multiple selectors
                bio = ""
                selectors = [
                    'h1 + div span',
                    '[data-testid="bio"] span',
                    'section span',
                    'div[role="main"] span',
                ]

                for selector in selectors:
                    bio_elements = await page.query_selector_all(selector)
                    if bio_elements:
                        for elem in bio_elements:
                            text = await elem.text_content()
                            if text and len(text) > 5:  # Skip short text
                                bio += text + " "

                bio = bio.strip()
                print(f"    Bio: {bio[:80] if bio else 'Empty'}...")
                phone = extract_phone(bio)

                # Check address match
                address_match = False
                similarity_score = 0
                extracted_address = None

                if bio:
                    lines = bio.split('\n')
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue

                        address_keywords = ['rua', 'av', 'avenida', 'pça', 'praça', 'rod', 'rodovia', 'estrada', 'street', 'ave']
                        if any(keyword in line.lower() for keyword in address_keywords):
                            sim = similar(line, original_address)
                            if sim > similarity_score:
                                similarity_score = sim
                                extracted_address = line

                            if sim >= 0.65:
                                address_match = True
                                print(f"    ✅ Match found! ({sim:.0%})")
                                break

                insta_url = f"https://www.instagram.com{profile_url}"

                candidate = {
                    'instagram_url': insta_url,
                    'bio': bio,
                    'phone': phone,
                    'address': extracted_address,
                    'address_match': address_match,
                    'similarity_score': similarity_score,
                    'username': profile_url.strip('/@/')
                }

                candidates.append(candidate)

                if address_match and similarity_score > best_score:
                    best_match = candidate
                    best_score = similarity_score

            except Exception as e:
                print(f"    Error: {str(e)}")
                continue

        await page.close()

        # Return results
        if best_match:
            print(f"✅ Perfect match found!")
            return {
                'success': True,
                'instagram_url': best_match['instagram_url'],
                'phone': best_match['phone'],
                'bio': best_match['bio'],
                'address': best_match['address'],
                'address_match': True,
                'similarity_score': best_match['similarity_score'],
                'candidates': candidates,
                'error': None
            }
        elif candidates:
            print(f"⚠️ Found {len(candidates)} profiles but no address match")
            return {
                'success': False,
                'instagram_url': None,
                'phone': None,
                'bio': None,
                'address': None,
                'address_match': False,
                'similarity_score': 0,
                'candidates': candidates,
                'error': f'Found {len(candidates)} profiles but no address match'
            }
        else:
            return {
                'success': False,
                'error': 'No profiles found'
            }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
