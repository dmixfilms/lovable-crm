from pydantic import BaseModel
from typing import Optional, List


class ImportJobRequest(BaseModel):
    keywords: List[str] = None
    suburbs: List[str] = None
    limit: int = 30
    radius_meters: int = 5000
