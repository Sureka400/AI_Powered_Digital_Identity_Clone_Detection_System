from pydantic import BaseModel
from typing import List


class RecommendationRequest(BaseModel):
    status: str
    trust_score: float = 50
    risk: str = "Unknown"
    profile_fake: bool = False
    spammer: bool = False
    username_similarity: float = 0
    bio_similarity: float = 0
    face_similarity: float = 0
    face_verified: bool = False
    original_username: str = "Unknown"
    clone_username: str = "Unknown"


class RecommendationItem(BaseModel):
    title: str
    description: str
    priority: str
    action: str


class RecommendationResponse(BaseModel):
    recommendations: List[RecommendationItem]
