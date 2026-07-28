from pydantic import BaseModel


class ReportRequest(BaseModel):
    profile_name: str
    trust_score: float
    clone_probability: float
    status: str
    recommendation: str