def calculate_trust_score(
    profile_fake,
    spammer,
    username_similarity,
    bio_similarity,
    face_similarity,
    face_verified
):

    score = 100

    # Fake profile is a strong signal
    if profile_fake:
        score -= 35

    # Spammer behavior
    if spammer:
        score -= 20

    # High username similarity suggests clone
    if username_similarity > 80:
        score -= 15
    elif username_similarity > 60:
        score -= 8

    # High bio similarity suggests clone
    if bio_similarity > 80:
        score -= 10
    elif bio_similarity > 60:
        score -= 5

    # High face similarity suggests same person (potential clone using same face)
    if face_similarity > 80:
        score -= 20
    elif face_similarity > 60:
        score -= 10

    # Face verified means DeepFace confirmed it's the same person
    if face_verified:
        score -= 5

    score = max(score, 0)

    if score >= 75:
        status = "Trusted"
        risk = "Low"
    elif score >= 50:
        status = "Suspicious"
        risk = "Moderate"
    elif score >= 25:
        status = "Likely Clone"
        risk = "High"
    else:
        status = "Clone"
        risk = "Extreme"

    return {
        "trust_score": score,
        "status": status,
        "risk": risk
    }