"""
Instagram Validator Service
Validates Instagram profile and extracts business info
"""
import re
from difflib import SequenceMatcher
from typing import Optional, Dict, Any
import requests

def similar(a: str, b: str) -> float:
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

def extract_username(instagram_url: str) -> Optional[str]:
    """Extract Instagram username from URL"""
    patterns = [
        r'instagram\.com/([a-zA-Z0-9_.]+)',
        r'@([a-zA-Z0-9_.]+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, instagram_url)
        if match:
            return match.group(1)

    return instagram_url.strip()

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

def validate_instagram_profile(
    instagram_input: str,
    original_address: str
) -> Dict[str, Any]:
    """
    Validate Instagram profile and extract business info
    Accepts: full URL or username (@username or username)

    Returns: {
        'success': bool,
        'username': str,
        'profile_url': str,
        'bio': Optional[str],
        'phone': Optional[str],
        'address': Optional[str],
        'address_match': bool,
        'similarity_score': float,
        'error': Optional[str]
    }
    """

    try:
        # Extract username
        username = extract_username(instagram_input)
        if not username:
            return {
                'success': False,
                'username': None,
                'profile_url': None,
                'bio': None,
                'phone': None,
                'address': None,
                'address_match': False,
                'similarity_score': 0,
                'error': 'Invalid Instagram URL or username'
            }

        # Clean username
        username = username.lstrip('@').strip()

        # Build profile URL
        profile_url = f"https://www.instagram.com/{username}/"

        # Try to fetch profile info
        # Note: Instagram blocks scraping, but we can try to get the public data
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(profile_url, headers=headers, timeout=5)

            if response.status_code != 200:
                return {
                    'success': False,
                    'username': username,
                    'profile_url': profile_url,
                    'bio': None,
                    'phone': None,
                    'address': None,
                    'address_match': False,
                    'similarity_score': 0,
                    'error': f'Profile not found or private (Status: {response.status_code})'
                }

            # Extract bio from page (Instagram stores it in JSON)
            bio_match = re.search(r'"biography":"([^"]*)"', response.text)
            bio = bio_match.group(1).replace('\\n', '\n') if bio_match else ""

            # Extract phone from bio
            phone = extract_phone(bio)

            # Look for address in bio
            address = None
            address_match = False
            similarity_score = 0

            if bio:
                lines = bio.split('\n')
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Check for address-like content
                    address_keywords = ['rua', 'av', 'avenida', 'pça', 'praça', 'rod', 'rodovia', 'estrada', 'street', 'ave', 'blvd', 'r.', 'avenida', 'alameda']
                    if any(keyword in line.lower() for keyword in address_keywords):
                        similarity = similar(line, original_address)
                        if similarity > similarity_score:
                            similarity_score = similarity
                            address = line

                        if similarity >= 0.6:  # 60% threshold
                            address_match = True
                            break

            return {
                'success': True,
                'username': username,
                'profile_url': profile_url,
                'bio': bio,
                'phone': phone,
                'address': address,
                'address_match': address_match,
                'similarity_score': similarity_score,
                'error': None
            }

        except requests.exceptions.RequestException as e:
            # Instagram might be blocking the request
            # Return partial success (at least the URL is valid)
            return {
                'success': False,
                'username': username,
                'profile_url': profile_url,
                'bio': None,
                'phone': None,
                'address': None,
                'address_match': False,
                'similarity_score': 0,
                'error': 'Could not fetch Instagram profile (may be private or Instagram is blocking requests). URL saved: ' + profile_url
            }

    except Exception as e:
        return {
            'success': False,
            'username': None,
            'profile_url': None,
            'bio': None,
            'phone': None,
            'address': None,
            'address_match': False,
            'similarity_score': 0,
            'error': str(e)
        }
