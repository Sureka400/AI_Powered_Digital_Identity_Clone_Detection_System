from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.face_schema import FaceResponse
import shutil
import os
import uuid

router = APIRouter(
    prefix="/face",
    tags=["Face Verification"]
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMP_DIR = os.path.join(BASE_DIR, "temp")


@router.post("/verify", response_model=FaceResponse)
async def verify_face(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...)
):

    os.makedirs(TEMP_DIR, exist_ok=True)

    ext1 = os.path.splitext(image1.filename or "img1.jpg")[1] or ".jpg"
    ext2 = os.path.splitext(image2.filename or "img2.jpg")[1] or ".jpg"

    image1_path = os.path.join(
        TEMP_DIR,
        f"face1_{uuid.uuid4().hex}{ext1}"
    )

    image2_path = os.path.join(
        TEMP_DIR,
        f"face2_{uuid.uuid4().hex}{ext2}"
    )

    try:
        with open(image1_path, "wb") as buffer:
            shutil.copyfileobj(image1.file, buffer)

        with open(image2_path, "wb") as buffer:
            shutil.copyfileobj(image2.file, buffer)

        # Load DeepFace/FaceService only when this endpoint is called.
        from services.face_service import FaceService

        result = FaceService.verify(
            image1_path,
            image2_path
        )

        return FaceResponse(
            verified=result["verified"],
            distance=result["distance"],
            threshold=result["threshold"],
            similarity=result.get("similarity", 0.0),
            model=result.get("model", "VGG-Face"),
        )

    except Exception as e:
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Face verification failed: {str(e)}"
        )

    finally:
        for path in (image1_path, image2_path):
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass