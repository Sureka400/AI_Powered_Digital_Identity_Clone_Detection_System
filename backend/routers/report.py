from fastapi import APIRouter
from schemas.report_schema import ReportRequest
from services.report_service import ReportService
from fastapi.responses import FileResponse
import os

router = APIRouter(
    prefix="/report",
    tags=["PDF Report"]
)


@router.post("")
async def generate_report(data: ReportRequest):

    # Omit missing optional values so the PDF can use its clear "Not available"
    # labels instead of rendering Python's None value.
    filename = ReportService.generate(data.model_dump(exclude_none=True))
    return FileResponse(
        path=filename,
        media_type="application/pdf",
        filename=os.path.basename(filename)
    )
