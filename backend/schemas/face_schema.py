from pydantic import BaseModel


class FaceResponse(BaseModel):
    verified: bool
    distance: float
    threshold: float