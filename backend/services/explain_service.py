from utils.explainability import explain_prediction


class ExplainService:

    @staticmethod
    def explain(
        profile_fake,
        spammer,
        username_similarity,
        bio_similarity,
        face_similarity,
        face_verified,
    ):

        reasons = explain_prediction(
            profile_fake,
            spammer,
            username_similarity,
            bio_similarity,
            face_similarity,
            face_verified,
        )

        return {
            "reasons": reasons
        }