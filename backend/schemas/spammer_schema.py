from pydantic import BaseModel
from typing import Optional


class SpammerRequest(BaseModel):
    edge_followed_by: float
    edge_follow: float
    username_length: int
    username_has_number: int
    full_name_has_number: int
    full_name_length: int
    is_private: int
    is_joined_recently: int
    has_channel: int
    is_business_account: int
    has_guides: int
    has_external_url: int


class SpammerResponse(BaseModel):
    prediction: int
    result: str
    confidence: Optional[float] = None
    spammer_probability: Optional[float] = None