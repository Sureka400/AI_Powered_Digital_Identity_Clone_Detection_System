from typing import Optional
from pydantic import BaseModel


class ReportRequest(BaseModel):
    # Core fields (keep backward compatibility)
    profile_name: Optional[str] = None
    trust_score: Optional[float] = None
    clone_probability: Optional[float] = None
    status: Optional[str] = None
    recommendation: Optional[str] = None

    # Extended metadata accepted from frontend
    id: Optional[str] = None
    username: Optional[str] = None
    original_username: Optional[str] = None
    clone_username: Optional[str] = None
    face_similarity: Optional[float] = None
    bio_similarity: Optional[float] = None
    decision: Optional[str] = None
    decision_label: Optional[str] = None
    risk_level: Optional[str] = None

    class Config:
        extra = 'allow'
