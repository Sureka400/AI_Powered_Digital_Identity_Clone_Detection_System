from pydantic import BaseModel


class ExplainRequest(BaseModel):
    profile_fake: bool
    spammer: bool
    username_similarity: float
    bio_similarity: float
    face_similarity: float
    face_verified: bool


class ExplainResponse(BaseModel):
    reasons: str
