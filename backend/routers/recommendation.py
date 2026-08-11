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
        status=data.status,
        trust_score=data.trust_score,
        risk=data.risk,
        profile_fake=data.profile_fake,
        spammer=data.spammer,
        username_similarity=data.username_similarity,
        bio_similarity=data.bio_similarity,
        face_similarity=data.face_similarity,
        face_verified=data.face_verified,
        original_username=data.original_username,
        clone_username=data.clone_username,
    )

    return RecommendationResponse(
        recommendations=result["recommendations"]
    )