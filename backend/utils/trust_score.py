def calculate_trust_score(
    profile_fake,
    spammer,
    username_similarity,
    bio_similarity,
    face_similarity,
    face_verified
):

    score = 100

    # Fake profile is a strong signal.
    if profile_fake:
        score -= 30

    # Spammer behavior is a weaker risk signal.
    if spammer:
        score -= 5

    # Username similarity penalties.
    if username_similarity > 90:
        score -= 20
    elif username_similarity > 75:
        score -= 10
    elif username_similarity > 60:
        score -= 5

    # Bio similarity penalties.
    if bio_similarity > 90:
        score -= 20
    elif bio_similarity > 75:
        score -= 10
    elif bio_similarity > 60:
        score -= 5

    # Face similarity is strong evidence.
    if face_similarity > 90:
        score -= 30
    elif face_similarity > 80:
        score -= 20
    elif face_similarity > 70:
        score -= 10

    # Face verified is a strong sign of identity overlap.
    if face_verified:
        score -= 15

    score = max(score, 0)

    if score >= 75:
        status = "Genuine"
        risk = "Low"
    elif score >= 50:
        status = "Suspicious"
        risk = "Moderate"
    else:
        status = "Clone Detected"
        risk = "High"

    return {
        "trust_score": score,
        "status": status,
        "risk": risk
    }