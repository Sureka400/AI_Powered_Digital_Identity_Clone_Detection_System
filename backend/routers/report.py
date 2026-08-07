from fastapi import APIRouter
from schemas.report_schema import ReportRequest
from services.report_service import ReportService
from fastapi.responses import FileResponse
import os

router = APIRouter(
    prefix="/report",
    tags=["PDF Report"]
)


@router.post("/")
async def generate_report(data: ReportRequest):

    filename = ReportService.generate(data.model_dump())
    return FileResponse(
        path=filename,
        media_type="application/pdf",
        filename=os.path.basename(filename)
    )