import os
import re

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse

from schemas.report_schema import ReportRequest
from services.report_service import ReportService

router = APIRouter(
    prefix="/report",
    tags=["PDF Report"]
)


def _download_filename(report_id: str | None) -> str:
    """Create a display filename; it is never used as a filesystem path."""
    safe_id = re.sub(r"[^A-Za-z0-9_-]", "_", report_id or "investigation")
    return f"Digital_Identity_Security_Report_{safe_id}.pdf"


def _remove_file(path: str) -> None:
    """Remove a one-time generated report after FileResponse has been sent."""
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


@router.post("")
async def generate_report(data: ReportRequest, background_tasks: BackgroundTasks):

    # Omit missing optional values so the PDF can use its clear "Not available"
    # labels instead of rendering Python's None value.
    filename = ReportService.generate(data.model_dump(exclude_none=True))
    background_tasks.add_task(_remove_file, filename)
    return FileResponse(
        path=filename,
        media_type="application/pdf",
        filename=_download_filename(data.id),
        headers={
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
        background=background_tasks,
    )
