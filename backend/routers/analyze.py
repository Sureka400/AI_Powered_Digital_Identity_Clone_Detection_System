from datetime import datetime

from fastapi import APIRouter
from schemas.analyze_schema import AnalyzeRequest, AnalyzeResponse
from services.analyze_service import AnalyzeService
from services.history_service import HistoryService

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

    decision_label = "Clone" if data.profile_fake else "Genuine"
    history_entry = {
        "id": datetime.now().strftime("INV-%Y%m%d%H%M%S"),
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "original_username": data.original_username or "original",
        "clone_username": data.clone_username or "clone",
        "profile_fake": data.profile_fake,
        "spammer": data.spammer,
        "decision": decision_label,
        "decision_label": decision_label,
        "trust_score": result["trust_score"],
        "risk_level": result.get("status", "Unknown"),
        "status": result.get("status", "Unknown"),
        "face_verified": data.face_verified,
        "face_similarity": data.face_similarity,
        "bio_similarity": data.bio_similarity,
        "username_similarity": data.username_similarity,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    HistoryService.save(history_entry)

    return AnalyzeResponse(
        trust_score=result["trust_score"],
        status=result["status"],
        risk=result.get("risk", "Low")
    )