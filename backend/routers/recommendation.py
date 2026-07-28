from fastapi import APIRouter
from schemas.recommendation_schema import (
    RecommendationRequest,
    RecommendationResponse,
)
from services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendation",
    tags=["AI Recommendation"]
)


@router.post("/", response_model=RecommendationResponse)
async def get_recommendation(data: RecommendationRequest):

    result = RecommendationService.recommend(
        status=data.status
    )

    return RecommendationResponse(
        recommendations=result["recommendations"]
    )