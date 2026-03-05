"""
Instagram Search Service
Uses Instagram API to search and extract profile data
"""
import asyncio
import json
import re
from difflib import SequenceMatcher
from playwright.async_api import async_playwright
from typing import Optional, List, Dict, Any
from app.services.instagram_session_manager import InstagramSessionManager

def similar(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def extract_phone(text: str) -> Optional[str]:
    patterns = [
        r'\+?55\s?[\d\s\-\(\)]{10,}',
        r'\(?[\d]{2}\)?[\s\-]?[\d]{4,5}[\s\-]?[\d]{4}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None

async def authenticate_instagram_interactive():
    """Open Instagram browser for manual login, saves session"""
    print(f"🔐 Opening Instagram for manual login...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()

        print(f"📱 Navigate to Instagram and login...")
        print(f"⏰ Once you're logged in, close the browser window")

        await page.goto("https://www.instagram.com/", wait_until="networkidle", timeout=30000)

        # Wait for login
        max_wait = 300
        wait_time = 0

        while wait_time < max_wait:
            try:
                home_button = await page.query_selector('[aria-label="Home"]')
                if home_button:
                    print(f"✅ Login detected!")
                    break

                await page.wait_for_timeout(2000)
                wait_time += 2
            except:
                break

        # Save session
        print(f"💾 Saving session...")
        try:
            storage_state = await context.storage_state()
            InstagramSessionManager.save_session(storage_state)
            print(f"✅ Session saved! You can now search leads without logging in again.")
        except Exception as e:
            print(f"❌ Error saving session: {str(e)}")

        try:
            await browser.close()
        except:
            pass

async def search_instagram(
    business_name: str,
    original_address: str
) -> Dict[str, Any]:
    """Search Instagram using saved session - parses JSON API response"""

    # Check if session exists
    if not InstagramSessionManager.has_session_file():
        return {
            'success': False,
            'error': '❌ No Instagram session found. Click "🔐 Conectar Instagram" first to login.'
        }

    # Load session
    session_data = InstagramSessionManager.load_session()
    if not session_data:
        return {
            'success': False,
            'error': 'Could not load session data'
        }

    print(f"🔍 Searching for: {business_name}")

    async with async_playwright() as p:
        browser = None
        try:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
            )

            # Load saved session
            context = await browser.new_context(storage_state=session_data)
            page = await context.new_page()

            print(f"🌐 Opening Instagram...")
            await page.goto("https://www.instagram.com/explore/", wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(2000)

            # Search using Instagram API endpoint
            print(f"📝 Searching for profiles...")
            search_url = f"https://www.instagram.com/web/search/topsearch/?query={business_name}"
            await page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(2000)

            # Instagram returns JSON - get page content
            html_content = await page.content()

            # Extract JSON from <pre> tag or body
            json_text = None
            pre_element = await page.query_selector('pre')
            if pre_element:
                json_text = await pre_element.text_content()
            else:
                json_text = html_content

            print(f"📄 Response length: {len(json_text)} chars")

            if not json_text or not json_text.strip().startswith('{'):
                await context.close()
                await browser.close()
                return {
                    'success': False,
                    'error': f'No results found for "{business_name}"'
                }

            try:
                search_results = json.loads(json_text)
                users = search_results.get('users', [])
                print(f"✓ Found {len(users)} users")

                if not users:
                    await context.close()
                    await browser.close()
                    return {
                        'success': False,
                        'error': f'No profiles found for "{business_name}"'
                    }

                candidates = []
                best_match = None
                best_score = 0

                for i, item in enumerate(users[:5]):
                    try:
                        user_data = item.get('user', {})
                        username = user_data.get('username', '')
                        full_name = user_data.get('full_name', '')
                        bio = user_data.get('biography', '')

                        print(f"  Profile {i+1}: @{username} - {full_name}")

                        phone = extract_phone(bio) if bio else None

                        # Check if NAME matches (priority filter)
                        name_match = similar(full_name.lower(), business_name.lower()) >= 0.60
                        username_match = similar(username.lower(), business_name.lower()) >= 0.60

                        # Accept if: (name matches) OR (has location info in bio)
                        address_match = False
                        similarity_score = 0

                        if name_match or username_match:
                            # NAME matches! Accept it
                            address_match = True
                            similarity_score = 0.90
                            extracted_address = bio if bio else f"@{username}"
                            print(f"    ✅ NAME MATCH!")

                        elif bio and len(bio) > 5:
                            # No name match, but check for location in bio
                            # Accept if has any location keywords
                            location_keywords = ['rua', 'av', 'avenida', 'street', 'ave', 'rd', 'blvd', 'chatswood', 'camperdown', 'sydney', 'nsw']
                            has_location = any(kw in bio.lower() for kw in location_keywords)

                            if has_location:
                                # Has location info, likely a business
                                address_match = True
                                similarity_score = 0.75
                                extracted_address = bio.split('\n')[0]
                                print(f"    ✅ HAS LOCATION INFO")

                        # Try to extract phone if available
                        if bio:
                            bio_phone = extract_phone(bio)
                            if bio_phone and not phone:
                                phone = bio_phone
                                print(f"    📱 Phone found: {bio_phone}")

                        profile_url = f"https://www.instagram.com/{username}/"
                        candidate = {
                            'instagram_url': profile_url,
                            'bio': bio,
                            'phone': phone,
                            'address': extracted_address,
                            'address_match': address_match,
                            'similarity_score': similarity_score,
                            'username': username,
                        }

                        candidates.append(candidate)

                        if address_match and similarity_score > best_score:
                            best_match = candidate
                            best_score = similarity_score

                    except Exception as e:
                        print(f"    Error: {str(e)}")
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
                        'candidates': candidates,
                        'error': f'Found {len(candidates)} profiles but no address match'
                    }
                else:
                    return {
                        'success': False,
                        'error': 'No profiles found'
                    }

            except json.JSONDecodeError as e:
                await context.close()
                await browser.close()
                return {
                    'success': False,
                    'error': f'Failed to parse response: {str(e)}'
                }

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            if browser:
                try:
                    await browser.close()
                except:
                    pass

            if "auth" in str(e).lower() or "401" in str(e):
                InstagramSessionManager.save_state("needs_login", "Session expired")

            return {
                'success': False,
                'error': str(e)
            }
