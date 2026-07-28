from fastapi import APIRouter
from schemas.profile_schema import ProfileRequest, ProfileResponse
from services.profile_service import ProfileService

router = APIRouter(
    prefix="/profile",
    tags=["Fake Profile Detection"]
)


@router.post("/predict", response_model=ProfileResponse)
async def predict_profile(data: ProfileRequest):

    result = ProfileService.predict(data.model_dump())

    return ProfileResponse(
        prediction=result["prediction"],
        result=result["result"]
    )