from pydantic import BaseModel


class UsernameRequest(BaseModel):
    username1: str
    username2: str


class UsernameResponse(BaseModel):
    username_similarity: float
    match: bool