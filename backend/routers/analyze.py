from fastapi import APIRouter
from schemas.analyze_schema import AnalyzeRequest, AnalyzeResponse
from services.analyze_service import AnalyzeService

router = APIRouter(
    prefix="/analyze",
    tags=["Trust Score Analysis"]
)


@router.post("/", response_model=AnalyzeResponse)
async def analyze_profile(data: AnalyzeRequest):

    result = AnalyzeService.analyze(
        profile_fake=data.profile_fake,
        spammer=data.spammer,
        username_similarity=data.username_similarity,
        bio_similarity=data.bio_similarity,
        face_similarity=data.face_similarity,
        face_verified=data.face_verified,
    )

    return AnalyzeResponse(
        trust_score=result["trust_score"],
        status=result["status"],
        risk=result.get("risk", "Low")
    )