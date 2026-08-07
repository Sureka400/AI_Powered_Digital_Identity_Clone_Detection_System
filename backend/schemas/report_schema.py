from typing import Optional
from pydantic import BaseModel


class ReportRequest(BaseModel):
    # Core fields (keep backward compatibility)
    profile_name: Optional[str]
    trust_score: Optional[float]
    clone_probability: Optional[float]
    status: Optional[str]
    recommendation: Optional[str]

    # Extended metadata accepted from frontend
    id: Optional[str]
    username: Optional[str]
    original_username: Optional[str]
    clone_username: Optional[str]
    face_similarity: Optional[float]
    bio_similarity: Optional[float]
    decision: Optional[str]
    decision_label: Optional[str]
    risk_level: Optional[str]

    class Config:
        extra = 'allow'