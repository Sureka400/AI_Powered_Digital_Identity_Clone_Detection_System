def calculate_trust_score(
    profile_fake,
    spammer,
    username_similarity,
    bio_similarity,
    face_similarity,
    face_verified
):

    score = 100

    if profile_fake:
        score -= 30

    if spammer:
        score -= 20

    if username_similarity > 80:
        score -= 15

    if bio_similarity > 80:
        score -= 10

    if face_similarity > 80:
        score -= 20

    if face_verified:
        score -= 5

    score = max(score, 0)

    if score >= 75:
        status = "Trusted"

    elif score >= 50:
        status = "Suspicious"

    else:
        status = "Clone"

    return {
        "trust_score": score,
        "status": status
    }