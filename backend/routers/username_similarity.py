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


@router.post("/similarity", response_model=UsernameResponse)
async def username_similarity(data: UsernameRequest):

    result = UsernameService.compare(
        data.username1,
        data.username2
    )

    return UsernameResponse(
        username_similarity=result["username_similarity"],
        match=result["match"]
    )