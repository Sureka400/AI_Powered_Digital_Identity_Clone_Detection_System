from utils.recommendation import generate_recommendation


class RecommendationService:

    @staticmethod
    def recommend(status):

        recommendations = generate_recommendation(status)

        return {
            "recommendations": recommendations
        }