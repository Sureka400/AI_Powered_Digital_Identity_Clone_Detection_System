import os
from deepface import DeepFace


class FaceService:

    @staticmethod
    def verify(img1_path, img2_path):

        result = DeepFace.verify(
            img1_path=img1_path,
            img2_path=img2_path,
            model_name="VGG-Face",
            detector_backend="opencv",
            enforce_detection=False,
            align=True,
        )

        return {
            "verified": bool(result["verified"]),
            "similarity": round(result["confidence"], 2),
            "distance": round(result["distance"], 4),
            "threshold": float(result["threshold"]),
            "model": "VGG-Face",
        }