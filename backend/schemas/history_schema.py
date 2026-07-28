from pydantic import BaseModel
from typing import Optional


class HistoryItem(BaseModel):
    username: Optional[str] = None
    trust_score: float
    status: str
    analyzed_at: str