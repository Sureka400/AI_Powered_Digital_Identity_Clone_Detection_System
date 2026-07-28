from fastapi import APIRouter
from services.history_service import HistoryService

router = APIRouter(
    prefix="/history",
    tags=["Analysis History"]
)


@router.get("/")
async def get_history():

    history = HistoryService.get()

    return {
        "count": len(history),
        "history": history
    }