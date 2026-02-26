import httpx
import asyncio
from typing import Optional, List, Dict
from urllib.parse import urlparse
from app.config import settings


class GooglePlacesService:
    """Service for searching businesses via Google Places API"""

    BASE_URL = "https://maps.googleapis.com/maps/api"

    def __init__(self):
        self.api_key = settings.google_places_api_key

    async def search_businesses(
        self,
        keyword: str,
        location: str = "Sydney, NSW, Australia",
        radius: int = 5000,
        limit: int = 30,
    ) -> List[Dict]:
        """
        Search for businesses matching keyword in a location.
        Returns list of places with name, place_id, formatted_address, photos, types.
        """
        if not self.api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY not configured")

        results = []
        next_page_token = None

        async with httpx.AsyncClient(timeout=30.0) as client:
            while len(results) < limit:
                params = {
                    "query": f"{keyword} in {location}",
                    "key": self.api_key,
                    "language": "en",
                }
                if next_page_token:
                    params["pagetoken"] = next_page_token

                try:
                    resp = await client.get(f"{self.BASE_URL}/place/textsearch/json", params=params)
                    resp.raise_for_status()
                    data = resp.json()

                    if data.get("status") != "OK":
                        # Rate limited or error
                        print(f"Google Places API error: {data.get('status')}")
                        break

                    results.extend(data.get("results", []))
                    next_page_token = data.get("next_page_token")

                    if not next_page_token:
                        break

                    # Wait a bit before using next_page_token
                    await asyncio.sleep(2)

                except httpx.RequestError as e:
                    print(f"Request error: {e}")
                    break

        return results[:limit]

    async def get_place_details(self, place_id: str) -> Optional[Dict]:
        """
        Fetch full details for a place: website, phone, address components.
        """
        if not self.api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY not configured")

        params = {
            "place_id": place_id,
            "key": self.api_key,
            "fields": "name,formatted_address,website,formatted_phone_number,address_components,types,rating,user_ratings_total",
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(f"{self.BASE_URL}/place/details/json", params=params)
                resp.raise_for_status()
                data = resp.json()

                if data.get("status") == "OK":
                    return data.get("result")
                else:
                    print(f"Google Places Details error: {data.get('status')}")
                    return None

        except httpx.RequestError as e:
            print(f"Request error: {e}")
            return None

    def map_to_lead_dict(self, place: Dict, details: Optional[Dict] = None) -> Dict:
        """Map Google Places response to Lead schema"""
        if not details:
            details = {}

        # Extract suburb from address components
        suburb = self._extract_suburb(details.get("address_components", []))

        # Extract domain from website
        website_url = details.get("website")
        website_domain = None
        if website_url:
            try:
                parsed = urlparse(website_url)
                website_domain = parsed.netloc
            except:
                pass

        return {
            "business_name": place.get("name", ""),
            "google_place_id": place.get("place_id"),
            "address": details.get("formatted_address"),
            "suburb": suburb,
            "website_url": website_url,
            "website_domain": website_domain,
            "phone": details.get("formatted_phone_number"),
            "industry_category": place.get("types", ["other"])[0],
            "google_maps_url": f"https://maps.google.com/maps/place/?q=place_id:{place.get('place_id')}",
            "rating": str(details.get("rating")) if details.get("rating") else None,
            "reviews_count": str(details.get("user_ratings_total")) if details.get("user_ratings_total") else None,
        }

    def _extract_suburb(self, address_components: List[Dict]) -> Optional[str]:
        """Extract suburb/locality from address components"""
        for comp in address_components:
            if "locality" in comp.get("types", []):
                return comp.get("long_name")
        return None
