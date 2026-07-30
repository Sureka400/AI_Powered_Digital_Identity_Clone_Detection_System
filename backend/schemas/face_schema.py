from pydantic import BaseModel


class FaceResponse(BaseModel):
    verified: bool
    distance: float
    threshold: float
    similarity: float = 0.0
    model: str = "VGG-Face"