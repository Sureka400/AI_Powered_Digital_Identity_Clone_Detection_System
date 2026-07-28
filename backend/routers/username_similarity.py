from fastapi import APIRouter
from pydantic import BaseModel
from services.username_service import UsernameService

router = APIRouter(
    prefix="/username",
    tags=["Username Similarity"]
)


class UsernameRequest(BaseModel):
    username1: str
    username2: str


class UsernameResponse(BaseModel):
    username_similarity: float
    match: bool

