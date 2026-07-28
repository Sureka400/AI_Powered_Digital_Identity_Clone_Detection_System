from fastapi import APIRouter, UploadFile, File
from schemas.face_schema import FaceResponse
from services.face_service import FaceService
import shutil
import os

router = APIRouter(
    prefix="/face",
    tags=["Face Verification"]
)


@router.post("/verify", response_model=FaceResponse)
async def verify_face(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):

    os.makedirs("temp", exist_ok=True)

    image1_path = f"temp/{image1.filename}"
    image2_path = f"temp/{image2.filename}"

    with open(image1_path, "wb") as buffer:
        shutil.copyfileobj(image1.file, buffer)

    with open(image2_path, "wb") as buffer:
        shutil.copyfileobj(image2.file, buffer)

    result = FaceService.verify(image1_path, image2_path)

    os.remove(image1_path)
    os.remove(image2_path)

    return FaceResponse(
        verified=result["verified"],
        distance=result["distance"],
        threshold=result["threshold"]
    )