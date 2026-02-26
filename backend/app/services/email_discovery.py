import httpx
import re
from bs4 import BeautifulSoup
from typing import List, Optional


EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")


class EmailDiscoveryService:
    """Service for discovering email addresses from websites"""

    def __init__(self):
        self.timeout = 10.0
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }

    async def discover_emails(self, website_url: str) -> List[str]:
        """
        Scrape a website to find email addresses.
        Checks: homepage, /contact, /contact-us, /about pages.
        """
        if not website_url:
            return []

        pages_to_try = [
            website_url.rstrip("/"),
            website_url.rstrip("/") + "/contact",
            website_url.rstrip("/") + "/contact-us",
            website_url.rstrip("/") + "/about",
        ]

        found_emails = set()

        async with httpx.AsyncClient(
            follow_redirects=True, timeout=self.timeout, headers=self.headers
        ) as client:
            for url in pages_to_try:
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        emails = self._extract_emails(resp.text)
                        found_emails.update(emails)

                except Exception as e:
                    # Silently fail on individual pages
                    continue

        # Filter out non-personal emails and duplicates
        filtered = self._filter_emails(list(found_emails))
        return filtered[:5]  # Return max 5 emails

    def _extract_emails(self, html: str) -> List[str]:
        """Extract email addresses from HTML content"""
        emails = set()

        # Parse HTML
        try:
            soup = BeautifulSoup(html, "html.parser")
            text = soup.get_text()

            # Find emails in visible text
            emails.update(EMAIL_REGEX.findall(text))

            # Find emails in mailto links
            for a_tag in soup.find_all("a", href=True):
                href = a_tag.get("href", "")
                if href.startswith("mailto:"):
                    email = href.replace("mailto:", "").split("?")[0].strip()
                    if email:
                        emails.add(email)

        except Exception as e:
            pass

        return list(emails)

    def _filter_emails(self, emails: List[str]) -> List[str]:
        """Filter out common non-personal emails"""
        skip_keywords = [
            "noreply",
            "no-reply",
            "example.com",
            "sentry.io",
            "localhost",
            "@test",
            "placeholder",
        ]

        filtered = []
        for email in emails:
            if not any(skip in email.lower() for skip in skip_keywords):
                filtered.append(email)

        return filtered
