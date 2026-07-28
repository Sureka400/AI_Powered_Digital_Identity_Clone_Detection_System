from pydantic import BaseModel
from typing import List


class RecommendationRequest(BaseModel):
    status: str


class RecommendationResponse(BaseModel):
    recommendations: List[str]