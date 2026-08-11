from fastapi import APIRouter
from schemas.explain_schema import ExplainRequest, ExplainResponse
from services.explain_service import ExplainService

router = APIRouter(
    prefix="/explain",
    tags=["Explainable AI"]
)

@router.post("/", response_model=ExplainResponse)
async def explain_prediction(data: ExplainRequest):

    result = ExplainService.explain(
        profile_fake=data.profile_fake,
        spammer=data.spammer,
        username_similarity=data.username_similarity,
        bio_similarity=data.bio_similarity,
        face_similarity=data.face_similarity,
        face_verified=data.face_verified,
    )

    return ExplainResponse(
        reasons=result["reasons"]
    )