from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    profile_fake: bool
    spammer: bool
    username_similarity: float
    bio_similarity: float
    face_similarity: float
    face_verified: bool


class AnalyzeResponse(BaseModel):
    trust_score: float
    status: str
    risk: str