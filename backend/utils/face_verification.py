import os
import traceback

# Suppress excessive TensorFlow/oneDNN logs
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

from deepface import DeepFace


def verify_face(image1: str, image2: str):
    """
    Verify whether two face images belong to the same person using VGG-Face.

    DeepFace uses the VGG-Face model (a VGGNet-based CNN trained for face
    recognition) to extract 2622-dimensional facial embeddings from each
    image. The two embeddings are compared using cosine distance, and a
    match is declared when the distance is below the model's threshold
    (0.68 for VGG-Face with cosine metric).

    Args:
        image1: Absolute path to the first image.
        image2: Absolute path to the second image.

    Returns:
        dict with keys:
            verified (bool)   — True if the two faces match
            distance (float)  — cosine distance between embeddings
            threshold (float) — VGG-Face verification threshold
            similarity (float)— 0-100 similarity percentage (100 = identical)
            model (str)       — model name used
    """

    # Validate inputs exist
    if not os.path.exists(image1):
        raise FileNotFoundError(f"Image not found: {image1}")
    if not os.path.exists(image2):
        raise FileNotFoundError(f"Image not found: {image2}")

    try:
        result = DeepFace.verify(
            img1_path=image1,
            img2_path=image2,
            model_name="VGG-Face",
            detector_backend="opencv",
            enforce_detection=False,
            align=True,
        )

        distance = float(result["distance"])
        threshold = float(result["threshold"])

        # Convert distance to a 0-100 similarity score.
        # distance == 0  -> 100% similar
        # distance >= threshold -> 0% similar
        similarity = max(0.0, min(100.0, (1 - distance / threshold) * 100))

        return {
            "verified": bool(result["verified"]),
            "distance": distance,
            "threshold": threshold,
            "similarity": round(similarity, 2),
            "model": "VGG-Face",
        }

    except Exception as e:
        traceback.print_exc()
        raise RuntimeError(f"DeepFace verification error: {str(e)}") from e