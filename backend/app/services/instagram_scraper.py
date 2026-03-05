"""
Instagram Scraper Service with Session Reuse
Allows manual login once, then reuses session for all searches
"""
import asyncio
import re
import os
import json
from pathlib import Path
from difflib import SequenceMatcher
from playwright.async_api import async_playwright, BrowserContext
from typing import Optional, List, Dict, Any

# Session storage path
SESSION_DIR = Path("/tmp/instagram_sessions")
SESSION_DIR.mkdir(exist_ok=True)
SESSION_FILE = SESSION_DIR / "instagram_session.json"
CONTEXT_FILE = SESSION_DIR / "instagram_context"

def similar(a: str, b: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text"""
    patterns = [
        r'\+?55\s?[\d\s\-\(\)]{10,}',  # Brazilian phone with country code
        r'\(?[\d]{2}\)?[\s\-]?[\d]{4,5}[\s\-]?[\d]{4}',  # Brazilian phone formats
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None

async def authenticate_instagram(headless=False):
    """
    Open Instagram and let user login manually
    Saves the session for future use
    """
    print(f"🔐 Opening Instagram for manual login...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()

        print(f"📱 Navigate to: https://www.instagram.com/")
        print(f"⏳ Login manually in the browser window...")
        print(f"⏰ Close the browser when done logging in")

        await page.goto("https://www.instagram.com/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(2000)

        # Wait for user to close browser or navigate to home
        # Check every 2 seconds if still on login page or if user is authenticated
        max_wait_time = 600  # 10 minutes max
        wait_count = 0

        while wait_count < max_wait_time:
            try:
                # Check if user has logged in (look for main feed indicator)
                is_logged_in = await page.query_selector('[aria-label="Home"]')
                if is_logged_in:
                    print(f"✅ Login detected!")
                    break
                await page.wait_for_timeout(2000)
                wait_count += 2
            except Exception as e:
                # Browser closed or navigation error - that's fine
                print(f"Browser check: {str(e)}")
                break

        # Save the session/context
        print(f"💾 Saving session...")
        try:
            await context.storage_state(path=str(SESSION_FILE))
            print(f"✅ Session saved!")
        except Exception as e:
            print(f"⚠️ Could not save session: {str(e)}")

        try:
            await browser.close()
        except:
            pass

        return True

async def search_instagram_with_session(
    business_name: str,
    original_address: str
) -> Dict[str, Any]:
    """
    Search Instagram using saved session (user already logged in)
    Returns best match or list of candidates
    """

    # Check if session exists
    if not SESSION_FILE.exists():
        return {
            'success': False,
            'instagram_url': None,
            'phone': None,
            'bio': None,
            'address': None,
            'address_match': False,
            'similarity_score': 0,
            'candidates': [],
            'error': '❌ Instagram session not found. Need to login first. Click "Initialize Instagram Login" button.'
        }

    print(f"🔄 Using saved Instagram session for: {business_name}")

    async with async_playwright() as p:
        browser = None
        try:
            # Launch browser in non-headless mode to avoid bot detection
            browser = await p.chromium.launch(
                headless=False,  # Show browser window to avoid detection
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
            )

            # Load saved session (cookies, auth tokens, etc)
            print(f"🔑 Loading saved session...")
            context = await browser.new_context(
                storage_state=str(SESSION_FILE),
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            )
            page = await context.new_page()
            print(f"✓ Session loaded")

            # Go to Instagram search with retry
            print(f"🌐 Opening Instagram search...")
            max_retries = 2
            for attempt in range(max_retries):
                try:
                    await page.goto("https://www.instagram.com/explore/", wait_until="domcontentloaded", timeout=40000)
                    await page.wait_for_timeout(5000)  # Wait longer for full render
                    print(f"✓ Explore page loaded")
                    break
                except Exception as e:
                    if attempt < max_retries - 1:
                        print(f"⚠️ Timeout attempt {attempt + 1}, retrying...")
                        await page.wait_for_timeout(3000)
                    else:
                        print(f"❌ Instagram not responding after {max_retries} attempts")
                        raise Exception(f"Instagram timeout: {str(e)}")

            # Use direct search URL instead of filling form
            # This bypasses the need to find the search box
            print(f"📝 Searching for: {business_name}")
            search_url = f"https://www.instagram.com/web/search/topsearch/?query={business_name}"
            print(f"🔗 Using direct search URL...")

            try:
                await page.goto(search_url, wait_until="networkidle", timeout=15000)
                await page.wait_for_timeout(2000)
                print(f"✓ Search results loaded via direct URL")
            except Exception as e:
                print(f"⚠️ Direct search failed, trying explore page search...")
                # Fallback: try to use explore page search
                await page.goto("https://www.instagram.com/explore/", wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(2000)

                # Try clicking on search and typing
                search_box = None
                selectors = ['input[aria-label="Search input"]', 'input[placeholder*="Search"]']
                for selector in selectors:
                    search_box = await page.query_selector(selector)
                    if search_box:
                        break

                if search_box:
                    await search_box.fill(business_name)
                    await page.wait_for_timeout(2000)
                else:
                    raise Exception("Could not find search box")

            print(f"✓ Searching for profiles...")

            # Wait for search results
            try:
                await page.wait_for_selector('a[href^="/@"]', timeout=5000)
                print(f"✓ Results loaded")
            except:
                print(f"❌ No results found for: {business_name}")
                raise Exception("No search results found")

            # Get all profile results (first 5)
            profile_links = await page.query_selector_all('a[href^="/@"]')
            print(f"✓ Found {len(profile_links)} profiles")

            if not profile_links:
                raise Exception("No profiles found in results")

            candidates = []
            best_match = None
            best_score = 0

            # Check first 5 results
            for i, link in enumerate(profile_links[:5]):
                profile_url = await link.get_attribute('href')
                if not profile_url:
                    continue

                try:
                    print(f"  📍 Checking profile {i+1}...")
                    # Navigate to profile
                    await page.goto(f"https://www.instagram.com{profile_url}", wait_until="networkidle", timeout=10000)
                    await page.wait_for_timeout(1000)

                    # Extract bio
                    bio_selector = 'h1 + div span, [data-testid="bio"] span'
                    bio_elements = await page.query_selector_all(bio_selector)
                    bio = ""
                    for elem in bio_elements:
                        text = await elem.text_content()
                        if text:
                            bio += text + " "

                    bio = bio.strip()
                    print(f"    Bio: {bio[:60]}...")

                    # Extract phone
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

                            address_keywords = ['rua', 'av', 'avenida', 'pça', 'praça', 'rod', 'rodovia', 'estrada', 'street', 'ave', 'blvd', 'r.', 'alameda']
                            if any(keyword in line.lower() for keyword in address_keywords):
                                sim = similar(line, original_address)
                                if sim > similarity_score:
                                    similarity_score = sim
                                    extracted_address = line

                                if sim >= 0.65:  # 65% threshold
                                    address_match = True
                                    print(f"    ✅ Address match found! (Similarity: {sim:.0%})")
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

                    # Keep track of best match
                    if address_match and similarity_score > best_score:
                        best_match = candidate
                        best_score = similarity_score

                except Exception as e:
                    print(f"    ❌ Error checking profile {i}: {str(e)}")
                    continue

            await context.close()
            await browser.close()

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
                    'error': f'Found {len(candidates)} profiles but no address match. Please verify manually.'
                }
            else:
                return {
                    'success': False,
                    'instagram_url': None,
                    'phone': None,
                    'bio': None,
                    'address': None,
                    'address_match': False,
                    'similarity_score': 0,
                    'candidates': [],
                    'error': 'No profiles found'
                }

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            if browser:
                await browser.close()
            return {
                'success': False,
                'instagram_url': None,
                'phone': None,
                'bio': None,
                'address': None,
                'address_match': False,
                'similarity_score': 0,
                'candidates': [],
                'error': str(e)
            }

# Legacy function - now uses session
async def search_instagram_auto(business_name: str, original_address: str) -> Dict[str, Any]:
    """Legacy function - delegates to session-based search"""
    return await search_instagram_with_session(business_name, original_address)
