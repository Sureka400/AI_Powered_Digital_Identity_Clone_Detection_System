from fastapi import APIRouter
from pydantic import BaseModel
from services.bio_service import BioService

router = APIRouter(
    prefix="/bio",
    tags=["Bio Similarity"]
)


class BioRequest(BaseModel):
    bio1: str
    bio2: str


class BioResponse(BaseModel):
    bio_similarity: float
    match: bool


@router.post("/similarity", response_model=BioResponse)
async def compare_bio(data: BioRequest):

    result = BioService.compare(
        data.bio1,
        data.bio2
    )

    return BioResponse(
        bio_similarity=result["bio_similarity"],
        match=result["match"]
    )