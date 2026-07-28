from fastapi import APIRouter
from schemas.spammer_schema import SpammerRequest, SpammerResponse
from services.spammer_service import SpammerService

router = APIRouter(
    prefix="/spammer",
    tags=["Fake Spammer Detection"]
)


@router.post("/predict", response_model=SpammerResponse)
async def predict_spammer(data: SpammerRequest):

    result = SpammerService.predict(data.model_dump())

    return SpammerResponse(
        prediction=result["prediction"],
        result=result["result"]
    )