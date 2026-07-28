from utils.trust_score import calculate_trust_score


class AnalyzeService:

    @staticmethod
    def analyze(
        profile_fake,
        spammer,
        username_similarity,
        bio_similarity,
        face_similarity,
        face_verified,
    ):

        return calculate_trust_score(
            profile_fake,
            spammer,
            username_similarity,
            bio_similarity,
            face_similarity,
            face_verified,
        )