def explain_prediction(
    profile_fake,
    spammer,
    username_similarity,
    bio_similarity,
    face_similarity,
    face_verified
):

    reasons = []

    if profile_fake:
        reasons.append("Profile model classified this account as Fake.")

    if spammer:
        reasons.append("Spammer detection model identified suspicious behaviour.")

    if username_similarity > 80:
        reasons.append(
            f"Username similarity is high ({username_similarity:.2f}%)."
        )

    if bio_similarity > 80:
        reasons.append(
            f"Bio similarity is high ({bio_similarity:.2f}%)."
        )

    if face_similarity > 80:
        reasons.append(
            f"Face similarity is high ({face_similarity:.2f}%)."
        )

    if face_verified:
        reasons.append(
            "DeepFace verified that both faces belong to the same person."
        )

    if not reasons:
        reasons.append("No significant clone indicators were detected.")

    return reasons