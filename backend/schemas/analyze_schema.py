from typing import Optional

from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    profile_fake: bool
    spammer: bool
    username_similarity: float
    bio_similarity: float
    face_similarity: float
    face_verified: bool
    original_username: Optional[str] = None
    clone_username: Optional[str] = None
    # The signed-in analyst's email, supplied by the frontend session.
    alert_email: Optional[str] = None


class AnalyzeResponse(BaseModel):
    trust_score: float
    status: str
    risk: str
    alert_sent: bool = False
    alert_error: Optional[str] = None
