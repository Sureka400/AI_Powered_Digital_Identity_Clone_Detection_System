from deepface import DeepFace


def verify_face(image1: str, image2: str):

    result = DeepFace.verify(
        img1_path=image1,
        img2_path=image2,
        model_name="VGG-Face",
        enforce_detection=False
    )

    return {
        "verified": result["verified"],
        "distance": result["distance"],
        "threshold": result["threshold"]
    }