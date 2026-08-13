from fastapi import APIRouter, Query
from services.history_service import HistoryService

router = APIRouter(
    prefix="/history",
    tags=["Analysis History"]
)


@router.get("/")
async def get_history(analyst_email: str | None = Query(default=None)):

    history = HistoryService.get(analyst_email=analyst_email)

    return {
        "count": len(history),
        "history": history
    }
